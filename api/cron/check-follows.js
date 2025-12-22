// Cron Job - Check for follow changes every 5 minutes
// Vercel Cron: Add to vercel.json

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';
const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  // Verify cron secret (optional security)
  const authHeader = req.headers.authorization;
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log('🔄 Cron: Checking for follow changes...');

  try {
    // Get all watchlists from Redis
    const watchlists = await getAllWatchlists();
    const changes = [];

    for (const [userId, watchlist] of Object.entries(watchlists)) {
      for (const account of watchlist) {
        if (!account.fid) continue;

        try {
          // Get current following
          const currentFollowing = await getFollowing(account.fid);
          const currentFids = new Set(currentFollowing.map(u => u.fid));

          // Get previous following from Redis
          const prevKey = `following:${account.fid}`;
          const prevFollowing = await redisGet(prevKey) || [];
          const prevFids = new Set(prevFollowing.map(u => u.fid));

          // Find new follows
          const newFollows = currentFollowing.filter(u => !prevFids.has(u.fid));
          
          // Find unfollows
          const unfollows = prevFollowing.filter(u => !currentFids.has(u.fid));

          // Record changes
          for (const followed of newFollows) {
            changes.push({
              type: 'follow',
              actor: account,
              target: followed,
              userId,
              timestamp: new Date().toISOString()
            });
          }

          for (const unfollowed of unfollows) {
            changes.push({
              type: 'unfollow',
              actor: account,
              target: unfollowed,
              userId,
              timestamp: new Date().toISOString()
            });
          }

          // Update Redis with current following
          await redisSet(prevKey, currentFollowing, 86400); // 24h TTL

        } catch (err) {
          console.error(`Error checking fid ${account.fid}:`, err.message);
        }
      }
    }

    // Store notifications for users
    if (changes.length > 0) {
      console.log(`📢 Found ${changes.length} changes`);
      
      for (const change of changes) {
        await storeNotification(change);
      }
    }

    return res.status(200).json({ 
      success: true, 
      checked: Object.keys(watchlists).length,
      changes: changes.length
    });

  } catch (error) {
    console.error('Cron error:', error);
    return res.status(500).json({ error: 'Cron failed' });
  }
}

// Get following list from Neynar
async function getFollowing(fid) {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=150`,
    {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    }
  );

  if (!response.ok) return [];

  const data = await response.json();
  return (data.users || []).map(u => ({
    fid: u.fid,
    username: u.username,
    displayName: u.display_name,
    avatar: u.pfp_url
  }));
}

// Redis helpers using Upstash REST API
async function redisGet(key) {
  if (!UPSTASH_REDIS_URL) return null;
  
  try {
    const response = await fetch(`${UPSTASH_REDIS_URL}/get/${key}`, {
      headers: { 'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}` }
    });
    const data = await response.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch {
    return null;
  }
}

async function redisSet(key, value, ttl = 3600) {
  if (!UPSTASH_REDIS_URL) return;
  
  try {
    await fetch(`${UPSTASH_REDIS_URL}/set/${key}?ex=${ttl}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(value)
    });
  } catch (err) {
    console.error('Redis set error:', err);
  }
}

async function getAllWatchlists() {
  if (!UPSTASH_REDIS_URL) {
    // Return demo watchlist if no Redis
    return {
      'demo-user': [
        { fid: 3, username: 'dwr.eth' },
        { fid: 5650, username: 'vitalik.eth' }
      ]
    };
  }

  try {
    // Get all watchlist keys
    const response = await fetch(`${UPSTASH_REDIS_URL}/keys/watchlist:*`, {
      headers: { 'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}` }
    });
    const data = await response.json();
    const keys = data.result || [];

    const watchlists = {};
    for (const key of keys) {
      const userId = key.replace('watchlist:', '');
      watchlists[userId] = await redisGet(key) || [];
    }

    return watchlists;
  } catch {
    return {};
  }
}

async function storeNotification(change) {
  const key = `notifications:${change.userId}`;
  const notifications = await redisGet(key) || [];
  
  notifications.unshift({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...change,
    read: false
  });

  // Keep only last 50 notifications
  await redisSet(key, notifications.slice(0, 50), 604800); // 7 days TTL
}

