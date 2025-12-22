// Watchlist API

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';

// In-memory storage (resets on cold start - use Vercel KV for persistence)
let watchlistStore = new Map();

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
      const watchlist = watchlistStore.get(userId) || getDefaultWatchlist();
      return res.status(200).json({ 
        watchlist,
        count: watchlist.length,
        limit: 10
      });
    }

    if (req.method === 'POST') {
      const { username, platform = 'farcaster', fid } = req.body || {};

      if (!username && !fid) {
        return res.status(400).json({ error: 'Username required' });
      }

      let watchlist = watchlistStore.get(userId) || [];

      if (watchlist.length >= 10) {
        return res.status(400).json({ error: 'Watchlist full (max 10)' });
      }

      const cleanUsername = (username || '').replace('@', '').toLowerCase();
      if (watchlist.some(w => w.username?.toLowerCase() === cleanUsername)) {
        return res.status(400).json({ error: 'Already in watchlist' });
      }

      // Fetch user from Neynar
      let userData = { username: cleanUsername, platform };
      
      try {
        const neynarRes = await fetch(
          `https://api.neynar.com/v1/farcaster/user-by-username?username=${cleanUsername}`,
          {
            headers: {
              'accept': 'application/json',
              'api_key': NEYNAR_API_KEY
            }
          }
        );
        
        if (neynarRes.ok) {
          const data = await neynarRes.json();
          const user = data.result?.user;
          if (user) {
            userData = {
              fid: user.fid,
              username: user.username,
              displayName: user.displayName,
              avatar: user.pfp?.url,
              followers: formatCount(user.followerCount),
              platform: 'farcaster'
            };
          }
        }
      } catch (err) {
        console.error('Neynar fetch error:', err.message);
      }

      const newItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        addedAt: new Date().toISOString(),
        lastActive: 'Just added'
      };

      watchlist.push(newItem);
      watchlistStore.set(userId, watchlist);

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

      let watchlist = watchlistStore.get(userId) || [];
      watchlist = watchlist.filter(item => item.id !== id);
      watchlistStore.set(userId, watchlist);

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

function getDefaultWatchlist() {
  return [
    {
      id: 'default-1',
      fid: 3,
      username: 'dwr.eth',
      displayName: 'Dan Romero',
      platform: 'farcaster',
      followers: '245K',
      lastActive: '2 min ago'
    },
    {
      id: 'default-2',
      fid: 5650,
      username: 'vitalik.eth',
      displayName: 'Vitalik Buterin',
      platform: 'farcaster',
      followers: '892K',
      lastActive: '15 min ago'
    }
  ];
}

function formatCount(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
