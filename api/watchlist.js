// Watchlist API with Redis

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';
const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.query.userId || 'demo-user';

  try {
    if (req.method === 'GET') {
      const watchlist = await getWatchlist(userId);
      return res.status(200).json({ 
        watchlist,
        count: watchlist.length,
        limit: 10
      });
    }

    if (req.method === 'POST') {
      const { username, platform = 'farcaster' } = req.body || {};

      if (!username) {
        return res.status(400).json({ error: 'Username required' });
      }

      let watchlist = await getWatchlist(userId);

      if (watchlist.length >= 10) {
        return res.status(400).json({ error: 'Watchlist full (max 10)' });
      }

      const cleanUsername = (username || '').replace('@', '').toLowerCase();
      if (watchlist.some(w => w.username?.toLowerCase() === cleanUsername)) {
        return res.status(400).json({ error: 'Already in watchlist' });
      }

      // Fetch user from Neynar (v2 API)
      let userData = { username: cleanUsername, platform };
      
      try {
        // Search for user
        const searchRes = await fetch(
          `https://api.neynar.com/v2/farcaster/user/search?q=${cleanUsername}&limit=1`,
          {
            headers: {
              'accept': 'application/json',
              'api_key': NEYNAR_API_KEY
            }
          }
        );
        
        if (searchRes.ok) {
          const data = await searchRes.json();
          const user = data.result?.users?.[0];
          if (user) {
            userData = {
              fid: user.fid,
              username: user.username,
              displayName: user.display_name,
              avatar: user.pfp_url,
              followers: formatCount(user.follower_count),
              platform: 'farcaster'
            };
          }
        }
      } catch (err) {
        console.error('Neynar search error:', err.message);
      }

      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        addedAt: new Date().toISOString(),
        lastActive: 'Just added'
      };

      watchlist.push(newItem);
      await saveWatchlist(userId, watchlist);

      // Save initial following
      if (userData.fid) {
        saveInitialFollowing(userData.fid);
      }

      return res.status(201).json({ 
        message: 'Added',
        item: newItem,
        count: watchlist.length
      });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID required' });
      }

      let watchlist = await getWatchlist(userId);
      watchlist = watchlist.filter(item => item.id !== id);
      await saveWatchlist(userId, watchlist);

      return res.status(200).json({ 
        message: 'Removed',
        count: watchlist.length
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Watchlist error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getWatchlist(userId) {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) {
    return getDefaultWatchlist();
  }

  try {
    const response = await fetch(`${UPSTASH_REDIS_URL}/get/watchlist:${userId}`, {
      headers: { 'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}` }
    });
    
    if (!response.ok) return getDefaultWatchlist();
    
    const data = await response.json();
    
    if (data.result) {
      let parsed = data.result;
      while (typeof parsed === 'string') {
        try { parsed = JSON.parse(parsed); } catch { break; }
      }
      if (Array.isArray(parsed)) return parsed;
    }
    
    return getDefaultWatchlist();
  } catch (err) {
    console.error('Redis GET error:', err);
    return getDefaultWatchlist();
  }
}

async function saveWatchlist(userId, watchlist) {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) return false;

  try {
    await fetch(`${UPSTASH_REDIS_URL}/set/watchlist:${userId}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(watchlist)
    });
    return true;
  } catch (err) {
    console.error('Redis SET error:', err);
    return false;
  }
}

async function saveInitialFollowing(fid) {
  if (!UPSTASH_REDIS_URL || !UPSTASH_REDIS_TOKEN) return;

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=150`,
      {
        headers: {
          'accept': 'application/json',
          'api_key': NEYNAR_API_KEY
        }
      }
    );

    if (!response.ok) return;

    const data = await response.json();
    const following = (data.users || []).map(u => ({
      fid: u.fid,
      username: u.username
    }));

    await fetch(`${UPSTASH_REDIS_URL}/set/following:${fid}?ex=86400`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(following)
    });
  } catch (err) {
    console.error('Save following error:', err);
  }
}

function getDefaultWatchlist() {
  return [
    { id: 'default-1', fid: 3, username: 'dwr', displayName: 'Dan Romero', platform: 'farcaster', followers: '612K', lastActive: '2 min ago' },
    { id: 'default-2', fid: 5650, username: 'vitalik.eth', displayName: 'Vitalik Buterin', platform: 'farcaster', followers: '420K', lastActive: '15 min ago' }
  ];
}

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return Math.floor(num / 1000) + 'K';
  return num.toString();
}
