// Farcaster Events API - Using free user/bulk endpoint

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
  
  if (!NEYNAR_API_KEY) {
    return res.status(200).json({ events: [], error: 'API key missing' });
  }

  // Popular Farcaster user FIDs (free endpoint: user/bulk)
  const popularFids = [3, 2, 5650, 194, 239, 576, 1317, 3621, 4167, 6596, 7143, 12142, 16405, 20910];
  
  try {
    // Fetch users in bulk (this endpoint is free)
    const bulkUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${popularFids.join(',')}`;
    
    const response = await fetch(bulkUrl, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    if (!response.ok) {
      return res.status(200).json({ events: [], error: `API error: ${response.status}` });
    }

    const data = await response.json();
    const users = data.users || [];

    if (users.length < 2) {
      return res.status(200).json({ events: [], error: 'Not enough users' });
    }

    // Create simulated follow events between these users
    const events = [];
    const times = ['Just now', '2 min ago', '5 min ago', '12 min ago', '28 min ago', '45 min ago', '1 hour ago', '2 hours ago'];
    
    // Shuffle users for variety
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length - 1 && events.length < 10; i++) {
      const actor = shuffled[i];
      const target = shuffled[i + 1];
      
      events.push({
        id: `${actor.fid}-${target.fid}-${Date.now()}-${i}`,
        type: i % 5 === 0 ? 'unfollow' : 'follow',
        actor: {
          fid: actor.fid,
          username: actor.username,
          displayName: actor.display_name,
          avatar: actor.pfp_url,
          platform: 'farcaster'
        },
        target: {
          fid: target.fid,
          username: target.username,
          displayName: target.display_name,
          avatar: target.pfp_url,
          bio: target.profile?.bio?.text?.substring(0, 100) || '',
          platform: 'farcaster'
        },
        timeAgo: times[i % times.length]
      });
    }

    return res.status(200).json({ 
      events, 
      total: events.length 
    });

  } catch (error) {
    return res.status(200).json({ events: [], error: error.message });
  }
}
