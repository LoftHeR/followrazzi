// Farcaster Follow Events API - Simplified

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS';
  const events = [];
  const errors = [];

  // Test with single FID first
  const testFid = 3;

  try {
    // Step 1: Get user
    const userUrl = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${testFid}`;
    const userRes = await fetch(userUrl, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    if (!userRes.ok) {
      errors.push({ step: 'user', status: userRes.status, url: userUrl });
      return res.status(200).json({ events, errors, debug: 'user fetch failed' });
    }

    const userData = await userRes.json();
    const user = userData.users?.[0];

    if (!user) {
      errors.push({ step: 'user', error: 'no user in response', data: userData });
      return res.status(200).json({ events, errors, debug: 'no user' });
    }

    // Step 2: Get following
    const followUrl = `https://api.neynar.com/v2/farcaster/following?fid=${testFid}&limit=10`;
    const followRes = await fetch(followUrl, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    if (!followRes.ok) {
      errors.push({ step: 'following', status: followRes.status });
      return res.status(200).json({ events, errors, debug: 'following fetch failed', user: user.username });
    }

    const followData = await followRes.json();
    const following = followData.users || [];

    // Build events
    for (let i = 0; i < following.length; i++) {
      const f = following[i];
      // Handle nested user object
      const target = f.user || f;
      
      events.push({
        id: `${testFid}-${target.fid || i}-${Date.now()}`,
        type: 'follow',
        actor: {
          fid: user.fid,
          username: user.username,
          displayName: user.display_name,
          avatar: user.pfp_url
        },
        target: {
          fid: target.fid,
          username: target.username,
          displayName: target.display_name,
          avatar: target.pfp_url,
          bio: target.profile?.bio?.text || ''
        },
        timeAgo: ['2 min ago', '5 min ago', '12 min ago', '25 min ago', '1 hour ago'][i % 5]
      });
    }

    return res.status(200).json({ 
      events,
      total: events.length,
      debug: { user: user.username, followingCount: following.length }
    });

  } catch (error) {
    return res.status(200).json({ 
      events, 
      errors: [{ message: error.message, stack: error.stack }],
      debug: 'exception'
    });
  }
}
