import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

// Initialize Farcaster SDK
sdk.actions.ready();

// Mock Data
const mockEvents = [
    {
        id: 1,
        type: 'follow',
        actor: { username: 'vitalik.eth', avatar: '🧑‍💻', platform: 'farcaster' },
        target: { username: 'jesse.base', avatar: '🔵', bio: 'Building @base' },
        time: '2 min ago',
        aiAnalysis: 'Jesse is leading Base L2 development. Vitalik likely interested in Ethereum L2 scaling progress and Base ecosystem growth.'
    },
    {
        id: 2,
        type: 'unfollow',
        actor: { username: 'elonmusk', avatar: '🚀', platform: 'twitter' },
        target: { username: 'nytimes', avatar: '📰', bio: 'News outlet' },
        time: '15 min ago',
        aiAnalysis: 'Ongoing tensions between Elon and mainstream media. This unfollow aligns with his recent criticism of legacy news organizations.'
    },
    {
        id: 3,
        type: 'mutual',
        actor: { username: 'dwr.eth', avatar: '🟣', platform: 'farcaster' },
        target: { username: 'balajis.eth', avatar: '🌐', bio: 'Network State author' },
        time: '32 min ago',
        aiAnalysis: 'Both are prominent figures in crypto social. Mutual follow suggests potential collaboration on decentralized social protocols.'
    },
    {
        id: 4,
        type: 'follow',
        actor: { username: 'a16z', avatar: '💼', platform: 'twitter' },
        target: { username: 'farcaster', avatar: '🟣', bio: 'Decentralized social protocol' },
        time: '1 hour ago',
        aiAnalysis: 'a16z is a major Farcaster investor. Following the main account signals continued support and visibility for their portfolio company.'
    },
    {
        id: 5,
        type: 'follow',
        actor: { username: 'cz_binance', avatar: '💛', platform: 'twitter' },
        target: { username: 'ethereum', avatar: '💎', bio: 'Ethereum Foundation' },
        time: '2 hours ago',
        aiAnalysis: 'CZ showing support for Ethereum ecosystem. Could indicate Binance plans for increased ETH integration or staking services.'
    }
];

const mockWatchlist = [
    { id: 1, username: 'vitalik.eth', platform: 'farcaster', followers: '892K', lastActive: '2 min ago' },
    { id: 2, username: 'elonmusk', platform: 'twitter', followers: '180M', lastActive: '15 min ago' },
    { id: 3, username: 'dwr.eth', platform: 'farcaster', followers: '245K', lastActive: '32 min ago' }
];

const mockTrends = [
    { rank: 1, username: 'jesse.base', follows: 47, platform: 'farcaster' },
    { rank: 2, username: 'farcaster', follows: 38, platform: 'twitter' },
    { rank: 3, username: 'base', follows: 31, platform: 'twitter' },
    { rank: 4, username: 'coinbase', follows: 28, platform: 'twitter' },
    { rank: 5, username: 'ethereum', follows: 24, platform: 'twitter' }
];

const suggestedAccounts = [
    '@vitalik.eth', '@elonmusk', '@dwr.eth', '@cz_binance', 
    '@a16z', '@coinbase', '@base', '@farcaster'
];

// State
let state = {
    events: [...mockEvents],
    watchlist: [...mockWatchlist],
    trends: [...mockTrends],
    activeTab: 'feed'
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
const addAccountBtn = document.getElementById('addAccountBtn');
const closeModal = document.getElementById('closeModal');
const closeDetail = document.getElementById('closeDetail');
const confirmAdd = document.getElementById('confirmAdd');
const usernameInput = document.getElementById('usernameInput');
const platformSelect = document.getElementById('platformSelect');
const suggestedList = document.getElementById('suggestedList');
const refreshBtn = document.getElementById('refreshBtn');
const detailContent = document.getElementById('detailContent');

// Initialize
function init() {
    renderFeed();
    renderWatchlist();
    renderTrends();
    renderSuggested();
    updateStats();
    setupEventListeners();
    simulateLiveUpdates();
}

// Render Functions
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
                <span class="event-time">🕐 ${event.time}</span>
                <span class="event-type ${event.type}">
                    ${event.type === 'follow' ? '🟢 Follow' : event.type === 'unfollow' ? '🔴 Unfollow' : '🤝 Mutual'}
                </span>
            </div>
            <div class="event-content">
                <div class="avatar">${event.actor.avatar}</div>
                <div class="event-info">
                    <div class="event-title">
                        <span class="username">@${event.actor.username}</span>
                        <span class="arrow">${event.type === 'unfollow' ? '✕' : '→'}</span>
                        <span class="username">@${event.target.username}</span>
                        <span class="platform-badge ${event.actor.platform}">${event.actor.platform === 'twitter' ? '𝕏' : '🟣'}</span>
                    </div>
                    <div class="event-subtitle">${event.target.bio}</div>
                </div>
            </div>
            <div class="event-ai">
                <div class="event-ai-label">🤖 AI Analysis</div>
                ${event.aiAnalysis}
            </div>
        </div>
    `).join('');

    // Add click listeners
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
            <div class="watchlist-avatar">${getPlatformEmoji(item.platform)}</div>
            <div class="watchlist-info">
                <div class="watchlist-name">@${item.username}</div>
                <div class="watchlist-meta">${item.followers} followers • ${item.lastActive}</div>
            </div>
            <div class="watchlist-actions">
                <button class="watch-btn notify" data-id="${item.id}">🔔</button>
                <button class="watch-btn delete" data-id="${item.id}">🗑️</button>
            </div>
        </div>
    `).join('');

    // Add delete listeners
    document.querySelectorAll('.watch-btn.delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromWatchlist(btn.dataset.id);
        });
    });
}

function renderTrends() {
    trendsList.innerHTML = state.trends.map(trend => `
        <div class="trend-item">
            <div class="trend-rank">${trend.rank}</div>
            <div class="trend-info">
                <div class="trend-name">@${trend.username}</div>
                <div class="trend-meta">${trend.platform === 'twitter' ? '𝕏 Twitter' : '🟣 Farcaster'}</div>
            </div>
            <div class="trend-count">+${trend.follows} follows</div>
        </div>
    `).join('');
}

function renderSuggested() {
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

// Event Listeners
function setupEventListeners() {
    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Modal controls
    addAccountBtn.addEventListener('click', () => openModal(addModal));
    closeModal.addEventListener('click', () => closeModalFn(addModal));
    closeDetail.addEventListener('click', () => closeModalFn(detailModal));
    
    // Close modal on backdrop click
    [addModal, detailModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModalFn(modal);
        });
    });

    // Add account
    confirmAdd.addEventListener('click', addAccount);

    // Refresh
    refreshBtn.addEventListener('click', refresh);

    // Input enter key
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addAccount();
    });
}

// Tab switching
function switchTab(tabName) {
    state.activeTab = tabName;
    
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    sections.forEach(section => {
        section.classList.toggle('active', section.id === tabName);
    });
}

// Modal functions
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

// Add account to watchlist
function addAccount() {
    const username = usernameInput.value.trim().replace('@', '');
    const platform = platformSelect.value;
    
    if (!username) {
        showToast('Please enter a username');
        return;
    }

    if (state.watchlist.length >= 10) {
        showToast('Watchlist full! Upgrade to Pro for more slots.');
        return;
    }

    if (state.watchlist.some(w => w.username.toLowerCase() === username.toLowerCase())) {
        showToast('Already in your watchlist');
        return;
    }

    const newItem = {
        id: Date.now(),
        username,
        platform,
        followers: Math.floor(Math.random() * 900 + 100) + 'K',
        lastActive: 'Just added'
    };

    state.watchlist.push(newItem);
    renderWatchlist();
    closeModalFn(addModal);
    showToast(`@${username} added to watchlist!`);
}

// Remove from watchlist
function removeFromWatchlist(id) {
    state.watchlist = state.watchlist.filter(w => w.id !== parseInt(id));
    renderWatchlist();
    showToast('Removed from watchlist');
}

// Show event detail
function showEventDetail(id) {
    const event = state.events.find(e => e.id === parseInt(id));
    if (!event) return;

    detailContent.innerHTML = `
        <div class="event-card ${event.type}" style="border: none;">
            <div class="event-header">
                <span class="event-time">🕐 ${event.time}</span>
                <span class="event-type ${event.type}">
                    ${event.type === 'follow' ? '🟢 Follow' : event.type === 'unfollow' ? '🔴 Unfollow' : '🤝 Mutual'}
                </span>
            </div>
            <div class="event-content" style="margin-bottom: 16px;">
                <div class="avatar" style="width: 56px; height: 56px; font-size: 24px;">${event.actor.avatar}</div>
                <div class="event-info">
                    <div class="event-title" style="font-size: 17px;">
                        <span class="username">@${event.actor.username}</span>
                    </div>
                    <div class="event-subtitle">${event.actor.platform === 'twitter' ? '𝕏 Twitter' : '🟣 Farcaster'}</div>
                </div>
            </div>
            <div style="text-align: center; margin: 16px 0; font-size: 24px;">
                ${event.type === 'unfollow' ? '✕' : '⬇️'}
            </div>
            <div class="event-content" style="margin-bottom: 16px;">
                <div class="avatar" style="width: 56px; height: 56px; font-size: 24px;">${event.target.avatar}</div>
                <div class="event-info">
                    <div class="event-title" style="font-size: 17px;">
                        <span class="username">@${event.target.username}</span>
                    </div>
                    <div class="event-subtitle">${event.target.bio}</div>
                </div>
            </div>
            <div class="event-ai" style="margin-top: 20px;">
                <div class="event-ai-label">🤖 AI Analysis</div>
                ${event.aiAnalysis}
            </div>
        </div>
    `;

    openModal(detailModal);
}

// Refresh
function refresh() {
    refreshBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        refreshBtn.style.transform = 'rotate(0deg)';
    }, 500);
    
    showToast('Feed refreshed');
}

// Simulate live updates
function simulateLiveUpdates() {
    const newEvents = [
        {
            type: 'follow',
            actor: { username: 'naval', avatar: '🧘', platform: 'twitter' },
            target: { username: 'balajis', avatar: '🌐', bio: 'Network State' },
            aiAnalysis: 'Naval and Balaji share similar views on technology, wealth, and decentralization. Both are angel investors with focus on crypto.'
        },
        {
            type: 'follow',
            actor: { username: 'pmarca', avatar: '🥚', platform: 'twitter' },
            target: { username: 'base', avatar: '🔵', bio: 'Ethereum L2 by Coinbase' },
            aiAnalysis: 'Marc Andreessen following Base aligns with a16z investment in Coinbase and interest in Ethereum scaling solutions.'
        },
        {
            type: 'mutual',
            actor: { username: 'brian_armstrong', avatar: '💰', platform: 'farcaster' },
            target: { username: 'vitalik.eth', avatar: '🧑‍💻', bio: 'Ethereum co-founder' },
            aiAnalysis: 'Coinbase CEO and Ethereum founder mutual follow signals continued collaboration between Coinbase and Ethereum ecosystem.'
        }
    ];

    setInterval(() => {
        if (Math.random() > 0.7) {
            const randomEvent = newEvents[Math.floor(Math.random() * newEvents.length)];
            const event = {
                ...randomEvent,
                id: Date.now(),
                time: 'Just now'
            };
            
            state.events.unshift(event);
            if (state.events.length > 20) state.events.pop();
            
            updateStats();
            if (state.activeTab === 'feed') {
                renderFeed();
            }
        }
    }, 15000);
}

// Toast notification
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

// Helper
function getPlatformEmoji(platform) {
    return platform === 'twitter' ? '𝕏' : platform === 'farcaster' ? '🟣' : '📷';
}

// Start app
init();

