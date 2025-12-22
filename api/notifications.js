// Notifications API - Get user notifications

const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.query.userId || 'demo-user';

  try {
    if (req.method === 'GET') {
      // Get notifications
      const notifications = await getNotifications(userId);
      const unreadCount = notifications.filter(n => !n.read).length;

      return res.status(200).json({ 
        notifications,
        unreadCount
      });
    }

    if (req.method === 'POST') {
      // Mark as read
      const { notificationId, markAllRead } = req.body || {};

      if (markAllRead) {
        await markAllAsRead(userId);
        return res.status(200).json({ message: 'All marked as read' });
      }

      if (notificationId) {
        await markAsRead(userId, notificationId);
        return res.status(200).json({ message: 'Marked as read' });
      }

      return res.status(400).json({ error: 'Invalid request' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Notifications error:', error);
    return res.status(500).json({ error: 'Server error', notifications: [] });
  }
}

async function getNotifications(userId) {
  if (!UPSTASH_REDIS_URL) {
    // Return demo notifications
    return [
      {
        id: 'demo-1',
        type: 'follow',
        actor: { username: 'dwr.eth', fid: 3 },
        target: { username: 'vitalik.eth', fid: 5650 },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        read: false
      },
      {
        id: 'demo-2',
        type: 'unfollow',
        actor: { username: 'vitalik.eth', fid: 5650 },
        target: { username: 'test', fid: 123 },
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true
      }
    ];
  }

  try {
    const response = await fetch(`${UPSTASH_REDIS_URL}/get/notifications:${userId}`, {
      headers: { 'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}` }
    });
    const data = await response.json();
    return data.result ? JSON.parse(data.result) : [];
  } catch {
    return [];
  }
}

async function markAsRead(userId, notificationId) {
  const notifications = await getNotifications(userId);
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  await saveNotifications(userId, updated);
}

async function markAllAsRead(userId) {
  const notifications = await getNotifications(userId);
  const updated = notifications.map(n => ({ ...n, read: true }));
  await saveNotifications(userId, updated);
}

async function saveNotifications(userId, notifications) {
  if (!UPSTASH_REDIS_URL) return;

  try {
    await fetch(`${UPSTASH_REDIS_URL}/set/notifications:${userId}?ex=604800`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${UPSTASH_REDIS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notifications)
    });
  } catch (err) {
    console.error('Save notifications error:', err);
  }
}

