// Farcaster Follow Events API

const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';

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
    // Popular Farcaster FIDs to track
    const popularFids = [3, 2, 5650]; // dwr.eth, v, vitalik.eth
    const events = [];

    for (const fid of popularFids) {
      try {
        // Get user info
        const userRes = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
          {
            headers: {
              'accept': 'application/json',
              'api_key': NEYNAR_API_KEY
            }
          }
        );

        if (!userRes.ok) continue;
        const userData = await userRes.json();
        const user = userData.users?.[0];
        if (!user) continue;

        // Get following
        const followingRes = await fetch(
          `https://api.neynar.com/v2/farcaster/following?fid=${fid}&limit=5`,
          {
            headers: {
              'accept': 'application/json',
              'api_key': NEYNAR_API_KEY
            }
          }
        );

        if (!followingRes.ok) continue;
        const followingData = await followingRes.json();
        const following = followingData.users || [];

        following.forEach((followed, index) => {
          events.push({
            id: `${fid}-${followed.fid}-${Date.now()}-${index}`,
            type: 'follow',
            actor: {
              fid: user.fid,
              username: user.username,
              displayName: user.display_name,
              avatar: user.pfp_url,
              platform: 'farcaster'
            },
            target: {
              fid: followed.fid,
              username: followed.username,
              displayName: followed.display_name,
              avatar: followed.pfp_url,
              bio: followed.profile?.bio?.text || ''
            },
            timeAgo: getTimeAgo(index)
          });
        });
      } catch (err) {
        console.error(`Error for fid ${fid}:`, err.message);
      }
    }

    return res.status(200).json({ events });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch events', events: [] });
  }
}

function getTimeAgo(index) {
  const times = ['2 min ago', '5 min ago', '15 min ago', '32 min ago', '1 hour ago'];
  return times[index % times.length];
}
