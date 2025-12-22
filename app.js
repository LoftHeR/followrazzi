import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

// Initialize Farcaster SDK
sdk.actions.ready();

// API Base URL
const API_BASE = '/api';

// State
let state = {
    events: [],
    watchlist: [],
    trends: [],
    notifications: [],
    unreadCount: 0,
    activeTab: 'feed',
    loading: true,
    userId: 'demo-user'
};

// DOM Elements
const feedList = document.getElementById('feedList');
const watchlistItems = document.getElementById('watchlistItems');
const trendsList = document.getElementById('trendsList');
const todayCount = document.getElementById('todayCount');
const watchCount = document.getElementById('watchCount');
const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.section');
const addModal = document.getElementById('addModal');
const detailModal = document.getElementById('detailModal');
const notificationsModal = document.getElementById('notificationsModal');
const addAccountBtn = document.getElementById('addAccountBtn');
const closeModal = document.getElementById('closeModal');
const closeDetail = document.getElementById('closeDetail');
const closeNotifications = document.getElementById('closeNotifications');
const confirmAdd = document.getElementById('confirmAdd');
const usernameInput = document.getElementById('usernameInput');
const platformSelect = document.getElementById('platformSelect');
const suggestedList = document.getElementById('suggestedList');
const refreshBtn = document.getElementById('refreshBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationBadge = document.getElementById('notificationBadge');
const notificationsList = document.getElementById('notificationsList');
const detailContent = document.getElementById('detailContent');

// Initialize
async function init() {
    setupEventListeners();
    renderSuggested();
    
    // Load all data
    await Promise.all([
        loadEvents(),
        loadWatchlist(),
        loadTrends(),
        loadNotifications()
    ]);
    
    state.loading = false;
    
    // Auto-refresh every 30 seconds
    setInterval(loadEvents, 30000);
    
    // Check notifications every 60 seconds
    setInterval(loadNotifications, 60000);
}

// API Functions
async function loadEvents() {
    try {
        showLoading(feedList);
        const response = await fetch(`${API_BASE}/events`);
        
        if (!response.ok) throw new Error('Failed to load events');
        
        const data = await response.json();
        state.events = data.events || [];
        renderFeed();
        updateStats();
    } catch (error) {
        console.error('Load events error:', error);
        state.events = getMockEvents();
        renderFeed();
        updateStats();
    }
}

async function loadWatchlist() {
    try {
        const response = await fetch(`${API_BASE}/watchlist?userId=${state.userId}`);
        
        if (!response.ok) throw new Error('Failed to load watchlist');
        
        const data = await response.json();
        state.watchlist = data.watchlist || [];
        renderWatchlist();
    } catch (error) {
        console.error('Load watchlist error:', error);
        state.watchlist = [];
        renderWatchlist();
    }
}

async function loadTrends() {
    try {
        const response = await fetch(`${API_BASE}/trends`);
        
        if (!response.ok) throw new Error('Failed to load trends');
        
        const data = await response.json();
        state.trends = data.trends || [];
        renderTrends();
    } catch (error) {
        console.error('Load trends error:', error);
        state.trends = getMockTrends();
        renderTrends();
    }
}

async function loadNotifications() {
    try {
        const response = await fetch(`${API_BASE}/notifications?userId=${state.userId}`);
        
        if (!response.ok) throw new Error('Failed to load notifications');
        
        const data = await response.json();
        state.notifications = data.notifications || [];
        state.unreadCount = data.unreadCount || 0;
        updateNotificationBadge();
    } catch (error) {
        console.error('Load notifications error:', error);
    }
}

async function addToWatchlist(username, platform) {
    try {
        const response = await fetch(`${API_BASE}/watchlist?userId=${state.userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username.replace('@', ''), platform })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            showToast(data.error || 'Failed to add');
            return false;
        }
        
        await loadWatchlist();
        showToast(`@${username.replace('@', '')} added! You'll be notified of their follows.`);
        return true;
    } catch (error) {
        console.error('Add to watchlist error:', error);
        showToast('Failed to add');
        return false;
    }
}

async function removeFromWatchlist(id) {
    try {
        const response = await fetch(`${API_BASE}/watchlist?userId=${state.userId}&id=${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to remove');
        
        await loadWatchlist();
        showToast('Removed from watchlist');
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        showToast('Failed to remove');
    }
}

async function markNotificationsRead() {
    try {
        await fetch(`${API_BASE}/notifications?userId=${state.userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAllRead: true })
        });
        
        state.notifications = state.notifications.map(n => ({ ...n, read: true }));
        state.unreadCount = 0;
        updateNotificationBadge();
        renderNotifications();
    } catch (error) {
        console.error('Mark read error:', error);
    }
}

// Render Functions
function showLoading(container) {
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
}

function renderFeed() {
    if (state.events.length === 0) {
        feedList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <div class="empty-state-text">No events yet.<br>Add accounts to your watchlist to see activity.</div>
            </div>
        `;
        return;
    }

    feedList.innerHTML = state.events.map(event => `
        <div class="event-card ${event.type}" data-id="${event.id}">
            <div class="event-header">
                <span class="event-time">🕐 ${event.timeAgo || event.time || 'Recently'}</span>
                <span class="event-type ${event.type}">
                    ${event.type === 'follow' ? '🟢 Follow' : event.type === 'unfollow' ? '🔴 Unfollow' : '🤝 Mutual'}
                </span>
            </div>
            <div class="event-content">
                <div class="avatar">${event.actor?.avatar ? `<img src="${event.actor.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '👤'}</div>
                <div class="event-info">
                    <div class="event-title">
                        <span class="username">@${event.actor?.username || 'unknown'}</span>
                        <span class="arrow">${event.type === 'unfollow' ? '✕' : '→'}</span>
                        <span class="username">@${event.target?.username || 'unknown'}</span>
                        <span class="platform-badge farcaster">🟣</span>
                    </div>
                    <div class="event-subtitle">${event.target?.bio || event.target?.displayName || ''}</div>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => showEventDetail(card.dataset.id));
    });
}

function renderWatchlist() {
    watchCount.textContent = state.watchlist.length;
    
    if (state.watchlist.length === 0) {
        watchlistItems.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">👀</div>
                <div class="empty-state-text">Your watchlist is empty.<br>Tap "Add" to start tracking accounts.</div>
            </div>
        `;
        return;
    }

    watchlistItems.innerHTML = state.watchlist.map(item => `
        <div class="watchlist-item" data-id="${item.id}">
            <div class="watchlist-avatar">${item.avatar ? `<img src="${item.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '🟣'}</div>
            <div class="watchlist-info">
                <div class="watchlist-name">@${item.username}</div>
                <div class="watchlist-meta">${item.followerCount || item.followers || '?'} followers • ${item.lastActive || 'Active'}</div>
            </div>
            <div class="watchlist-actions">
                <button class="watch-btn notify active" data-id="${item.id}">🔔</button>
                <button class="watch-btn delete" data-id="${item.id}">🗑️</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.watch-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromWatchlist(btn.dataset.id);
        });
    });
}

function renderTrends() {
    if (state.trends.length === 0) {
        trendsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📈</div>
                <div class="empty-state-text">Loading trends...</div>
            </div>
        `;
        return;
    }

    trendsList.innerHTML = state.trends.map(trend => `
        <div class="trend-item">
            <div class="trend-rank">${trend.rank}</div>
            <div class="trend-info">
                <div class="trend-name">@${trend.username}</div>
                <div class="trend-meta">${trend.displayName || ''} • 🟣 Farcaster</div>
            </div>
            <div class="trend-count">+${trend.recentFollows || '?'}</div>
        </div>
    `).join('');
}

function renderNotifications() {
    if (state.notifications.length === 0) {
        notificationsList.innerHTML = `
            <div class="notification-empty">
                <div style="font-size: 48px; margin-bottom: 16px;">🔕</div>
                <div>No notifications yet.<br>You'll be notified when accounts you follow make changes.</div>
            </div>
        `;
        return;
    }

    notificationsList.innerHTML = state.notifications.map(notif => `
        <div class="notification-item ${notif.type} ${notif.read ? '' : 'unread'}">
            <div class="notification-icon">${notif.type === 'follow' ? '🟢' : '🔴'}</div>
            <div class="notification-content">
                <div class="notification-text">
                    <strong>@${notif.actor?.username || 'Someone'}</strong> 
                    ${notif.type === 'follow' ? 'followed' : 'unfollowed'} 
                    <strong>@${notif.target?.username || 'someone'}</strong>
                </div>
                <div class="notification-time">${formatTime(notif.timestamp)}</div>
            </div>
        </div>
    `).join('');

    if (state.unreadCount > 0) {
        notificationsList.innerHTML += `
            <button class="mark-all-read" id="markAllRead">Mark all as read</button>
        `;
        document.getElementById('markAllRead')?.addEventListener('click', markNotificationsRead);
    }
}

function renderSuggested() {
    const suggestedAccounts = [
        '@dwr.eth', '@vitalik.eth', '@jesse.base', '@balajis', 
        '@v', '@coinbase', '@base', '@farcaster'
    ];
    
    suggestedList.innerHTML = suggestedAccounts.map(acc => `
        <button class="suggested-item">${acc}</button>
    `).join('');

    document.querySelectorAll('.suggested-item').forEach(item => {
        item.addEventListener('click', () => {
            usernameInput.value = item.textContent;
        });
    });
}

function updateStats() {
    todayCount.textContent = state.events.length;
}

function updateNotificationBadge() {
    notificationBadge.textContent = state.unreadCount;
    notificationBadge.setAttribute('data-count', state.unreadCount);
}

// Event Listeners
function setupEventListeners() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    addAccountBtn.addEventListener('click', () => openModal(addModal));
    closeModal.addEventListener('click', () => closeModalFn(addModal));
    closeDetail.addEventListener('click', () => closeModalFn(detailModal));
    closeNotifications.addEventListener('click', () => closeModalFn(notificationsModal));
    
    notificationBtn.addEventListener('click', () => {
        renderNotifications();
        openModal(notificationsModal);
    });

    [addModal, detailModal, notificationsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModalFn(modal);
        });
    });

    confirmAdd.addEventListener('click', handleAddAccount);
    refreshBtn.addEventListener('click', handleRefresh);

    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAddAccount();
    });
}

function switchTab(tabName) {
    state.activeTab = tabName;
    
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    sections.forEach(section => {
        section.classList.toggle('active', section.id === tabName);
    });
}

function openModal(modal) {
    modal.classList.add('active');
    if (modal === addModal) {
        usernameInput.value = '';
        usernameInput.focus();
    }
}

function closeModalFn(modal) {
    modal.classList.remove('active');
}

async function handleAddAccount() {
    const username = usernameInput.value.trim().replace('@', '');
    const platform = platformSelect.value;
    
    if (!username) {
        showToast('Please enter a username');
        return;
    }

    confirmAdd.disabled = true;
    confirmAdd.textContent = 'Adding...';
    
    const success = await addToWatchlist(username, platform);
    
    confirmAdd.disabled = false;
    confirmAdd.textContent = 'Add Account';
    
    if (success) {
        closeModalFn(addModal);
    }
}

async function handleRefresh() {
    refreshBtn.style.transform = 'rotate(360deg)';
    
    await Promise.all([loadEvents(), loadNotifications()]);
    
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);
    
    showToast('Feed refreshed');
}

function showEventDetail(id) {
    const event = state.events.find(e => e.id === id);
    if (!event) return;

    detailContent.innerHTML = `
        <div class="event-card ${event.type}" style="border: none;">
            <div class="event-header">
                <span class="event-time">🕐 ${event.timeAgo || event.time || 'Recently'}</span>
                <span class="event-type ${event.type}">
                    ${event.type === 'follow' ? '🟢 Follow' : event.type === 'unfollow' ? '🔴 Unfollow' : '🤝 Mutual'}
                </span>
            </div>
            <div class="event-content" style="margin-bottom: 16px;">
                <div class="avatar" style="width: 56px; height: 56px; font-size: 24px;">
                    ${event.actor?.avatar ? `<img src="${event.actor.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '👤'}
                </div>
                <div class="event-info">
                    <div class="event-title" style="font-size: 17px;">
                        <span class="username">@${event.actor?.username || 'unknown'}</span>
                    </div>
                    <div class="event-subtitle">${event.actor?.displayName || ''} • 🟣 Farcaster</div>
                </div>
            </div>
            <div style="text-align: center; margin: 16px 0; font-size: 24px;">
                ${event.type === 'unfollow' ? '✕' : '⬇️'}
            </div>
            <div class="event-content" style="margin-bottom: 16px;">
                <div class="avatar" style="width: 56px; height: 56px; font-size: 24px;">
                    ${event.target?.avatar ? `<img src="${event.target.avatar}" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '👤'}
                </div>
                <div class="event-info">
                    <div class="event-title" style="font-size: 17px;">
                        <span class="username">@${event.target?.username || 'unknown'}</span>
                    </div>
                    <div class="event-subtitle">${event.target?.bio || event.target?.displayName || ''}</div>
                </div>
            </div>
        </div>
    `;

    openModal(detailModal);
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function formatTime(timestamp) {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
}

function getMockEvents() {
    return [
        {
            id: '1',
            type: 'follow',
            actor: { username: 'dwr.eth', avatar: '', platform: 'farcaster' },
            target: { username: 'vitalik.eth', avatar: '', bio: 'Ethereum co-founder' },
            timeAgo: '5 min ago'
        }
    ];
}

function getMockTrends() {
    return [
        { rank: 1, username: 'dwr.eth', displayName: 'Dan Romero', recentFollows: 47 },
        { rank: 2, username: 'vitalik.eth', displayName: 'Vitalik Buterin', recentFollows: 38 }
    ];
}

// Start
init();
