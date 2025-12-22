// Watchlist API - stores user's tracked accounts
// Uses Vercel KV or falls back to in-memory (demo)

// In-memory storage for demo (resets on cold start)
// For production, use Vercel KV, Upstash Redis, or a database
let watchlistStore = new Map();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get user ID from query or header (in production, use proper auth)
  const userId = req.query.userId || req.headers['x-user-id'] || 'demo-user';

  try {
    switch (req.method) {
      case 'GET':
        return handleGet(req, res, userId);
      case 'POST':
        return handlePost(req, res, userId);
      case 'DELETE':
        return handleDelete(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Watchlist API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET - Retrieve watchlist
async function handleGet(req, res, userId) {
  const watchlist = watchlistStore.get(userId) || getDefaultWatchlist();
  
  // Enrich with live data from Neynar if possible
  const enrichedWatchlist = await enrichWatchlist(watchlist);
  
  return res.status(200).json({ 
    watchlist: enrichedWatchlist,
    count: enrichedWatchlist.length,
    limit: 10
  });
}

// POST - Add to watchlist
async function handlePost(req, res, userId) {
  const { username, platform = 'farcaster', fid } = req.body;

  if (!username && !fid) {
    return res.status(400).json({ error: 'Username or FID required' });
  }

  let watchlist = watchlistStore.get(userId) || [];

  // Check limit
  if (watchlist.length >= 10) {
    return res.status(400).json({ error: 'Watchlist full (max 10). Upgrade to Pro for more.' });
  }

  // Check duplicate
  const exists = watchlist.some(w => 
    w.username?.toLowerCase() === username?.toLowerCase() || w.fid === fid
  );
  
  if (exists) {
    return res.status(400).json({ error: 'Already in watchlist' });
  }

  // Fetch user data from Neynar if FID provided
  let userData = { username, platform, fid };
  
  if (fid || platform === 'farcaster') {
    try {
      const neynarData = await fetchFarcasterUser(username, fid);
      if (neynarData) {
        userData = {
          ...userData,
          fid: neynarData.fid,
          username: neynarData.username,
          displayName: neynarData.display_name,
          avatar: neynarData.pfp_url,
          followers: neynarData.follower_count,
          following: neynarData.following_count
        };
      }
    } catch (err) {
      console.error('Neynar fetch error:', err);
    }
  }

  const newItem = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...userData,
    addedAt: new Date().toISOString(),
    notificationsEnabled: true
  };

  watchlist.push(newItem);
  watchlistStore.set(userId, watchlist);

  return res.status(201).json({ 
    message: 'Added to watchlist',
    item: newItem,
    count: watchlist.length
  });
}

// DELETE - Remove from watchlist
async function handleDelete(req, res, userId) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Item ID required' });
  }

  let watchlist = watchlistStore.get(userId) || [];
  const initialLength = watchlist.length;
  
  watchlist = watchlist.filter(item => item.id !== id);
  
  if (watchlist.length === initialLength) {
    return res.status(404).json({ error: 'Item not found' });
  }

  watchlistStore.set(userId, watchlist);

  return res.status(200).json({ 
    message: 'Removed from watchlist',
    count: watchlist.length
  });
}

// Fetch Farcaster user from Neynar
async function fetchFarcasterUser(username, fid) {
  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';
  
  let url;
  if (fid) {
    url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
  } else {
    url = `https://api.neynar.com/v1/farcaster/user-by-username?username=${username}`;
  }

  const response = await fetch(url, {
    headers: {
      'accept': 'application/json',
      'api_key': NEYNAR_API_KEY
    }
  });

  if (!response.ok) return null;

  const data = await response.json();
  return data.users?.[0] || data.result?.user || null;
}

// Enrich watchlist with live follower counts
async function enrichWatchlist(watchlist) {
  // For demo, just return with mock "last active" times
  return watchlist.map(item => ({
    ...item,
    lastActive: getRandomTimeAgo(),
    followerCount: item.followers || Math.floor(Math.random() * 900 + 100) + 'K'
  }));
}

// Default watchlist for new users
function getDefaultWatchlist() {
  return [
    {
      id: 'default-1',
      fid: 3,
      username: 'dwr.eth',
      displayName: 'Dan Romero',
      platform: 'farcaster',
      avatar: '',
      followers: '245K',
      notificationsEnabled: true
    },
    {
      id: 'default-2',
      fid: 5650,
      username: 'vitalik.eth',
      displayName: 'Vitalik Buterin',
      platform: 'farcaster',
      avatar: '',
      followers: '892K',
      notificationsEnabled: true
    }
  ];
}

function getRandomTimeAgo() {
  const times = ['2 min ago', '15 min ago', '1 hour ago', '3 hours ago', 'Today'];
  return times[Math.floor(Math.random() * times.length)];
}

