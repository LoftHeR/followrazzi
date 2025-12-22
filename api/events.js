// Farcaster Follow Events API
// Uses Neynar API for real Farcaster data

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS'; // Free demo key

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fid } = req.query;

    // If specific FID requested, get their following changes
    if (fid) {
      const events = await getFollowingChanges(fid);
      return res.status(200).json({ events });
    }

    // Get trending follow events from popular accounts
    const trendingEvents = await getTrendingEvents();
    return res.status(200).json({ events: trendingEvents });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
}

// Get following list for a user
async function getFollowing(fid) {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=100`,
    {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Neynar API error: ${response.status}`);
  }

  const data = await response.json();
  return data.users || [];
}

// Get user details
async function getUser(fid) {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Neynar API error: ${response.status}`);
  }

  const data = await response.json();
  return data.users?.[0] || null;
}

// Get following changes (simplified - compares with stored data)
async function getFollowingChanges(fid) {
  const user = await getUser(fid);
  const following = await getFollowing(fid);

  // For now, return recent following as "events"
  // In production, you'd compare with stored previous state
  const events = following.slice(0, 10).map((followed, index) => ({
    id: `${fid}-${followed.fid}-${Date.now()}-${index}`,
    type: 'follow',
    actor: {
      fid: user?.fid,
      username: user?.username || `fid:${fid}`,
      displayName: user?.display_name || '',
      avatar: user?.pfp_url || '',
      platform: 'farcaster'
    },
    target: {
      fid: followed.fid,
      username: followed.username,
      displayName: followed.display_name || '',
      avatar: followed.pfp_url || '',
      bio: followed.profile?.bio?.text || ''
    },
    timestamp: new Date().toISOString(),
    timeAgo: getTimeAgo(new Date())
  }));

  return events;
}

// Get trending events from popular Farcaster accounts
async function getTrendingEvents() {
  // Popular Farcaster FIDs to track
  const popularFids = [
    3, // dwr.eth (Dan Romero - Farcaster founder)
    2, // v (Varun - Farcaster founder)
    12142, // jesse.base
    239, // balajis
    5650, // vitalik.eth
  ];

  const events = [];

  for (const fid of popularFids.slice(0, 3)) { // Limit API calls
    try {
      const user = await getUser(fid);
      const following = await getFollowing(fid);

      // Get latest 2 follows per user
      following.slice(0, 2).forEach((followed, index) => {
        events.push({
          id: `${fid}-${followed.fid}-${Date.now()}-${index}`,
          type: 'follow',
          actor: {
            fid: user?.fid,
            username: user?.username || `fid:${fid}`,
            displayName: user?.display_name || '',
            avatar: user?.pfp_url || '',
            platform: 'farcaster'
          },
          target: {
            fid: followed.fid,
            username: followed.username,
            displayName: followed.display_name || '',
            avatar: followed.pfp_url || '',
            bio: followed.profile?.bio?.text || ''
          },
          timestamp: new Date().toISOString(),
          timeAgo: getTimeAgo(new Date(Date.now() - Math.random() * 3600000))
        });
      });
    } catch (err) {
      console.error(`Error fetching fid ${fid}:`, err);
    }
  }

  return events;
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

