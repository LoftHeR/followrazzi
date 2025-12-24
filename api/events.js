// Farcaster Events API - Debug version

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
  const events = [];
  const debug = { apiKey: NEYNAR_API_KEY ? 'set' : 'missing' };

  if (!NEYNAR_API_KEY) {
    return res.status(200).json({ events: [], debug, error: 'API key missing' });
  }

  try {
    // Try power users endpoint
    const powerUrl = 'https://api.neynar.com/v2/farcaster/user/power?limit=10';
    debug.powerUrl = powerUrl;
    
    const powerRes = await fetch(powerUrl, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY
      }
    });

    debug.powerStatus = powerRes.status;

    if (!powerRes.ok) {
      const errorText = await powerRes.text();
      debug.powerError = errorText.substring(0, 200);
      return res.status(200).json({ events: [], debug });
    }

    const powerData = await powerRes.json();
    const users = powerData.users || [];
    debug.usersCount = users.length;

    // Create events from power users
    for (let i = 0; i < users.length - 1; i += 2) {
      const actor = users[i];
      const target = users[i + 1];
      
      events.push({
        id: `${actor.fid}-${target.fid}-${Date.now()}-${i}`,
        type: 'follow',
        actor: {
          fid: actor.fid,
          username: actor.username,
          displayName: actor.display_name,
          avatar: actor.pfp_url
        },
        target: {
          fid: target.fid,
          username: target.username,
          displayName: target.display_name,
          avatar: target.pfp_url,
          bio: target.profile?.bio?.text || ''
        },
        timeAgo: ['2 min ago', '8 min ago', '22 min ago', '45 min ago', '1 hour ago'][i % 5]
      });
    }

    return res.status(200).json({ events, total: events.length, debug });

  } catch (error) {
    debug.exception = error.message;
    return res.status(200).json({ events: [], debug });
  }
}
