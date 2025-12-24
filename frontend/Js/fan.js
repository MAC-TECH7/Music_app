// ========== GLOBAL VARIABLES ==========
let globalAudioPlayer = null;
let isPlaying = false;
let currentSongIndex = 0;
let currentVolume = 0.7;
let currentUser = null;
let userFavorites = { songs: [], artists: [], playlists: [] };
let userFollowing = [];
let userPlaylists = [];
let listeningHistory = [];
let likedPlaylists = [];

// ========== SAMPLE DATA ==========
const sampleSongs = [
    { id: 1, title: 'Soul Makossa', artist: 'Manu Dibango Legacy', genre: 'Makossa', duration: '4:32', plays: 245000, coverColor: '#FF6B35' },
    { id: 2, title: 'Bikutsi Rhythm', artist: 'Bikutsi Queens', genre: 'Bikutsi', duration: '3:45', plays: 189000, coverColor: '#2E8B57' },
    { id: 3, title: 'City Lights', artist: 'Yaoundé Vibes', genre: 'Afrobeat', duration: '5:12', plays: 156000, coverColor: '#4A6CF7' },
    { id: 4, title: 'Mountain Song', artist: 'Bamenda Roots', genre: 'Traditional', duration: '4:08', plays: 134000, coverColor: '#8B4513' },
    { id: 5, title: 'Coastal Vibes', artist: 'Douala Beats', genre: 'Assiko', duration: '3:58', plays: 112000, coverColor: '#9C27B0' },
    { id: 6, title: 'African Sunrise', artist: 'New Gen Collective', genre: 'Afrobeat', duration: '4:45', plays: 98000, coverColor: '#2196F3' }
];

const sampleArtists = [
    { id: 1, name: 'Manu Dibango Legacy', followers: 45000, monthlyListeners: 245000, genre: 'Makossa' },
    { id: 2, name: 'Bikutsi Queens', followers: 32000, monthlyListeners: 189000, genre: 'Bikutsi' },
    { id: 3, name: 'Yaoundé Vibes', followers: 28000, monthlyListeners: 156000, genre: 'Afrobeat' },
    { id: 4, name: 'Bamenda Roots', followers: 25000, monthlyListeners: 134000, genre: 'Traditional' },
    { id: 5, name: 'Douala Beats', followers: 22000, monthlyListeners: 112000, genre: 'Assiko' }
];

const samplePlaylists = [
    { 
        id: 101, 
        name: 'Morning Makossa', 
        description: 'Start your day with classic Makossa rhythms', 
        creator: 'AfroRhythm',
        songs: [1, 2, 3],
        plays: 12500,
        likes: 890,
        isPublic: true,
        createdAt: '2023-01-15',
        coverColor: '#FF6B35',
        tags: ['morning', 'makossa', 'classic']
    },
    { 
        id: 102, 
        name: 'Workout Bikutsi', 
        description: 'High-energy Bikutsi beats for your workout', 
        creator: 'AfroRhythm',
        songs: [2, 4, 5],
        plays: 9800,
        likes: 650,
        isPublic: true,
        createdAt: '2023-02-20',
        coverColor: '#2E8B57',
        tags: ['workout', 'energy', 'bikutsi']
    },
    { 
        id: 103, 
        name: 'Chill Afrobeat', 
        description: 'Relax and unwind with smooth Afrobeat vibes', 
        creator: 'AfroRhythm',
        songs: [3, 6, 1],
        plays: 15600,
        likes: 1120,
        isPublic: true,
        createdAt: '2023-03-10',
        coverColor: '#4A6CF7',
        tags: ['chill', 'relax', 'afrobeat']
    },
    { 
        id: 104, 
        name: 'Party Mix', 
        description: 'The ultimate party playlist with Cameroon\'s best', 
        creator: 'AfroRhythm',
        songs: [1, 2, 3, 4, 5, 6],
        plays: 23400,
        likes: 1870,
        isPublic: true,
        createdAt: '2023-04-05',
        coverColor: '#9C27B0',
        tags: ['party', 'dance', 'mix']
    }
];

// ========== MAIN INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log("🎵 AfroRhythm Dashboard Initializing...");
    
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Initialize AOS animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
    
    // Load user data
    loadUserData();
    
    // Setup navigation FIRST - this is critical
    setupNavigation();
    
    // Initialize music player
    initializeMusicPlayer();
    
    // Setup user interactions
    setupUserInteractions();
    
    // Setup notifications
    setupNotifications();
    
    // Setup search
    setupSearch();
    
    // Initialize current view
    initializeCurrentView();
    
    console.log("✅ Dashboard fully initialized!");
});

// ========== AUTHENTICATION ==========
function checkAuth() {
    console.log("🔐 Checking authentication...");
    const user = JSON.parse(localStorage.getItem('afroUser') || 'null');
    
    if (!user || !user.isLoggedIn) {
        console.log("⚠️ No user found, creating demo user...");
        // For testing: create a demo user if not logged in
        const demoUser = {
            email: 'john@example.com',
            name: 'John Smith',
            isLoggedIn: true,
            loginTime: new Date().toISOString(),
            memberSince: '2023',
            avatarColor: '#FF6B35'
        };
        localStorage.setItem('afroUser', JSON.stringify(demoUser));
        currentUser = demoUser;
        return true; // Allow access for testing
    }
    
    currentUser = user;
    console.log(`✅ User authenticated: ${user.name}`);
    
    // Update welcome message
    const welcomeElement = document.getElementById('welcomeMessage');
    if (welcomeElement && user.name) {
        const firstName = user.name.split(' ')[0];
        const greetings = ['Welcome back', 'Hello', 'Hi', 'Great to see you'];
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        welcomeElement.textContent = `${randomGreeting}, ${firstName}!`;
    }
    
    // Update profile dropdown
    updateUserProfileUI();
    
    return true;
}

function updateUserProfileUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (currentUser) {
        if (userAvatar && currentUser.name) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            userAvatar.textContent = initials;
            
            // Set avatar color
            if (currentUser.avatarColor) {
                userAvatar.style.background = currentUser.avatarColor;
            }
        }
        
        if (userName && currentUser.name) {
            userName.textContent = currentUser.name;
        }
        
        if (userEmail && currentUser.email) {
            userEmail.textContent = currentUser.email;
        }
    }
}

// ========== USER DATA MANAGEMENT ==========
function loadUserData() {
    console.log("💾 Loading user data...");
    const savedData = localStorage.getItem('afroUserData');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            userFavorites = data.favorites || { songs: [], artists: [], playlists: [] };
            userFollowing = data.following || [];
            userPlaylists = data.playlists || [];
            listeningHistory = data.history || [];
            likedPlaylists = data.likedPlaylists || [];
            console.log("✅ User data loaded from localStorage");
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }
    
    // Initialize with sample data if empty
    if (userPlaylists.length === 0) {
        userPlaylists = [
            {
                id: 1,
                name: 'My Makossa Mix',
                description: 'Classic makossa tracks for every mood',
                creator: 'You',
                songs: [1, 2],
                plays: 245,
                likes: 45,
                isPublic: true,
                createdAt: new Date().toISOString(),
                coverColor: '#FF6B35',
                tags: ['makossa', 'classic', 'personal']
            },
            {
                id: 2,
                name: 'Cameroon Classics',
                description: 'Timeless Cameroonian music collection',
                creator: 'You',
                songs: [1, 3, 4],
                plays: 189,
                likes: 32,
                isPublic: false,
                createdAt: new Date().toISOString(),
                coverColor: '#2E8B57',
                tags: ['classic', 'collection', 'cameroon']
            }
        ];
        saveUserData();
        console.log("📝 Created default playlists");
    }
    
    // Update UI
    updateQuickStats();
}

function saveUserData() {
    const data = {
        favorites: userFavorites,
        following: userFollowing,
        playlists: userPlaylists,
        history: listeningHistory,
        likedPlaylists: likedPlaylists
    };
    localStorage.setItem('afroUserData', JSON.stringify(data));
}

// ========== NAVIGATION SYSTEM ==========
function setupNavigation() {
    console.log("🔗 Setting up navigation...");
    
    // Get all navigation items
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const dashboardViews = document.querySelectorAll('.dashboard-view');
    
    console.log(`Found ${navItems.length} navigation items`);
    console.log(`Found ${dashboardViews.length} dashboard views`);
    
    // Function to switch views
    function switchDashboardView(viewId) {
        console.log(`🔄 Switching to view: ${viewId}`);
        
        // Remove active class from all nav items
        navItems.forEach(nav => {
            nav.classList.remove('active');
        });
        
        // Add active class to clicked nav item
        const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if (activeNav) {
            activeNav.classList.add('active');
        }
        
        // Hide all views
        dashboardViews.forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(`${viewId}-view`);
        if (targetView) {
            targetView.classList.add('active');
            console.log(`✅ Now showing: ${viewId}-view`);
            
            // Load content for this view
            loadViewContent(viewId);
        } else {
            console.error(`❌ View not found: ${viewId}-view`);
        }
        
        // Scroll to top of content area
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.scrollTop = 0;
        }
        
        // Close mobile sidebar if open
        const sidebar = document.getElementById('sidebar');
        if (sidebar && window.innerWidth <= 992) {
            sidebar.classList.remove('active');
        }
    }
    
    // Add click event listeners to all navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const viewId = this.getAttribute('data-view');
            console.log(`🖱️ Navigation clicked: ${viewId}`);
            switchDashboardView(viewId);
        });
    });
    
    // Add event listeners to "View All" links
    const viewAllLinks = document.querySelectorAll('.view-all[data-view]');
    viewAllLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const viewId = this.getAttribute('data-view');
            if (viewId) {
                console.log(`🔗 View all clicked: ${viewId}`);
                switchDashboardView(viewId);
            }
        });
    });
    
    // Setup mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const menuToggle2 = document.getElementById('menuToggle2');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }
    
    if (menuToggle2 && sidebar) {
        menuToggle2.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar && sidebar.classList.contains('active') && window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !e.target.closest('.menu-toggle')) {
                sidebar.classList.remove('active');
            }
        }
    });
    
    console.log("✅ Navigation setup complete");
}

// ========== VIEW CONTENT LOADERS ==========
function loadViewContent(viewId) {
    console.log(`📂 Loading content for: ${viewId}`);
    
    switch(viewId) {
        case 'discover':
            loadDiscoverView();
            break;
        case 'browse':
            loadBrowseView();
            break;
        case 'genres':
            loadGenresView();
            break;
        case 'mymusic':
            loadMyMusicView();
            break;
        case 'playlists':
            loadPlaylistsView();
            break;
        case 'history':
            loadHistoryView();
            break;
        case 'following':
            loadFollowingView();
            break;
        case 'notifications':
            loadNotificationsView();
            break;
        case 'profile':
            loadProfileView();
            break;
        case 'settings':
            loadSettingsView();
            break;
        default:
            console.log(`⚠️ Unknown view: ${viewId}`);
    }
}

// ========== INDIVIDUAL VIEW LOADERS ==========

// Discover View
function loadDiscoverView() {
    console.log("🔍 Loading discover view...");
    
    // Load all sections
    loadTrendingSongs();
    loadGenreChips();
    loadRecentlyPlayed();
    loadRecommendedPlaylists();
    loadFavoriteArtists();
    
    // Update quick stats
    updateQuickStats();
    
    console.log("✅ Discover view loaded");
}

function loadTrendingSongs() {
    const trendingSongs = document.getElementById('trendingSongs');
    if (!trendingSongs) return;
    
    trendingSongs.innerHTML = '';
    
    sampleSongs.forEach(song => {
        const isFavorite = userFavorites.songs.includes(song.id);
        const songCard = createSongCard(song, isFavorite);
        trendingSongs.appendChild(songCard);
    });
}

function createSongCard(song, isFavorite = false) {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
        <div class="song-cover" style="background: ${song.coverColor || 'var(--primary-color)'};">
            <i class="fas fa-music"></i>
        </div>
        <div class="song-info">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
        </div>
        <div class="song-meta">
            <span>${song.plays.toLocaleString()} plays</span>
            <span>${song.duration}</span>
        </div>
        <div class="song-actions">
            <button class="action-btn play-btn" data-song-id="${song.id}" title="Play">
                <i class="fas fa-play"></i>
            </button>
            <button class="action-btn favorite-btn ${isFavorite ? 'favorited' : ''}" data-song-id="${song.id}" title="${isFavorite ? 'Unfavorite' : 'Favorite'}">
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <button class="action-btn add-to-playlist-btn" data-song-id="${song.id}" title="Add to playlist">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `;
    return card;
}

function loadGenreChips() {
    const genreChips = document.getElementById('genreChips');
    if (!genreChips) return;
    
    const genres = ['All', 'Makossa', 'Bikutsi', 'Afrobeat', 'Traditional', 'Assiko', 'Gospel', 'Hip Hop'];
    
    genreChips.innerHTML = genres.map(genre => `
        <button class="genre-chip ${genre === 'All' ? 'active' : ''}" data-genre="${genre.toLowerCase()}">
            ${genre}
        </button>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.genre-chip').forEach(chip => {
        chip.addEventListener('click', function() {
            document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const genre = this.getAttribute('data-genre');
            showNotification(`Showing ${genre} music`, 'info');
        });
    });
}

function loadRecentlyPlayed() {
    const recentlyPlayed = document.getElementById('recentlyPlayed');
    if (!recentlyPlayed) return;
    
    if (listeningHistory.length === 0) {
        recentlyPlayed.innerHTML = `
            <div class="recent-song" style="min-width: 100%; text-align: center; padding: 40px;">
                <p>No recent plays. Start listening to build your history!</p>
            </div>
        `;
        return;
    }
    
    recentlyPlayed.innerHTML = '';
    
    // Show last 3 played songs
    listeningHistory.slice(0, 3).forEach(item => {
        const song = sampleSongs.find(s => s.id === item.songId);
        if (!song) return;
        
        const timeAgo = getTimeAgo(new Date(item.timestamp));
        const recentSong = document.createElement('div');
        recentSong.className = 'recent-song';
        recentSong.innerHTML = `
            <div class="recent-cover" style="background: ${song.coverColor || 'var(--primary-color)'};">
                <i class="fas fa-music"></i>
            </div>
            <div class="recent-info">
                <h5>${song.title}</h5>
                <p>${song.artist} • ${timeAgo}</p>
            </div>
            <button class="action-btn play-btn" data-song-id="${song.id}" title="Play">
                <i class="fas fa-play"></i>
            </button>
        `;
        recentlyPlayed.appendChild(recentSong);
    });
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function loadRecommendedPlaylists() {
    const recommendedPlaylists = document.getElementById('recommendedPlaylists');
    if (!recommendedPlaylists) return;
    
    recommendedPlaylists.innerHTML = '';
    
    // Combine sample playlists with user playlists
    const allPlaylists = [...samplePlaylists, ...userPlaylists.slice(0, 2)];
    
    allPlaylists.forEach(playlist => {
        const playlistCard = createEnhancedPlaylistCard(playlist);
        recommendedPlaylists.appendChild(playlistCard);
    });
}

function createEnhancedPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.setAttribute('data-playlist-id', playlist.id);
    
    // Calculate playlist stats
    const songCount = playlist.songs?.length || 0;
    const totalDuration = calculatePlaylistDuration(playlist);
    const isUserPlaylist = userPlaylists.some(p => p.id === playlist.id);
    const isLiked = likedPlaylists.includes(playlist.id);
    
    // Get cover color or use default
    const coverColor = playlist.coverColor || getRandomColor();
    
    card.innerHTML = `
        <div class="playlist-cover" style="background: ${coverColor};">
            <i class="fas fa-music"></i>
            <div class="playlist-overlay">
                <button class="play-playlist-btn" data-playlist-id="${playlist.id}" title="Play playlist">
                    <i class="fas fa-play"></i>
                </button>
            </div>
            <span class="playlist-count">${songCount} song${songCount !== 1 ? 's' : ''}</span>
            ${isUserPlaylist ? '<span class="playlist-badge">Your Playlist</span>' : ''}
        </div>
        <div class="playlist-info">
            <h4>${playlist.name}</h4>
            <p class="playlist-description">${playlist.description || 'Your personal playlist'}</p>
            <div class="playlist-meta">
                <span class="playlist-creator">
                    <i class="fas fa-user"></i> ${playlist.creator || 'You'}
                </span>
                <span class="playlist-songs">
                    <i class="fas fa-music"></i> ${songCount} songs
                </span>
            </div>
            <div class="playlist-footer">
                <span class="playlist-duration">
                    <i class="fas fa-clock"></i> ${totalDuration}
                </span>
                <span class="playlist-plays">
                    <i class="fas fa-headphones"></i> ${(playlist.plays || 0).toLocaleString()} plays
                </span>
            </div>
        </div>
        <div class="playlist-actions">
            <button class="playlist-action-btn play-btn" data-playlist-id="${playlist.id}" title="Play playlist">
                <i class="fas fa-play"></i>
            </button>
            <button class="playlist-action-btn like-btn ${isLiked ? 'liked' : ''}" data-playlist-id="${playlist.id}" title="${isLiked ? 'Unlike playlist' : 'Like playlist'}">
                <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <button class="playlist-action-btn more-btn" data-playlist-id="${playlist.id}" title="More options">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </div>
    `;
    
    // Add hover effect for cover
    const cover = card.querySelector('.playlist-cover');
    const overlay = card.querySelector('.playlist-overlay');
    
    cover.addEventListener('mouseenter', () => {
        overlay.style.opacity = '1';
    });
    
    cover.addEventListener('mouseleave', () => {
        overlay.style.opacity = '0';
    });
    
    // Add event listeners
    const playBtn = card.querySelector('.play-playlist-btn');
    const playActionBtn = card.querySelector('.playlist-action-btn.play-btn');
    const likeBtn = card.querySelector('.playlist-action-btn.like-btn');
    const moreBtn = card.querySelector('.playlist-action-btn.more-btn');
    
    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playPlaylist(playlist.id);
        });
    }
    
    if (playActionBtn) {
        playActionBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playPlaylist(playlist.id);
        });
    }
    
    if (likeBtn) {
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlaylistLike(playlist.id);
        });
    }
    
    if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showPlaylistOptions(playlist.id);
        });
    }
    
    // Clicking on card plays the playlist
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.playlist-action-btn') && !e.target.closest('.play-playlist-btn')) {
            viewPlaylistDetails(playlist.id);
        }
    });
    
    return card;
}

function calculatePlaylistDuration(playlist) {
    if (!playlist.songs || playlist.songs.length === 0) {
        return '0:00';
    }
    
    // For demo purposes, calculate a random duration
    const totalMinutes = playlist.songs.length * 3.5; // Average 3.5 minutes per song
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function getRandomColor() {
    const colors = [
        '#FF6B35', '#2E8B57', '#4A6CF7', '#8B4513', 
        '#9C27B0', '#2196F3', '#FFA726', '#4CAF50',
        '#E91E63', '#00BCD4', '#8BC34A', '#FF5722'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function loadFavoriteArtists() {
    const favoriteArtists = document.getElementById('favoriteArtists');
    if (!favoriteArtists) return;
    
    if (userFollowing.length === 0) {
        favoriteArtists.innerHTML = `
            <div class="artist-card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>Follow artists to see them here!</p>
                <button class="follow-btn" style="width: auto; margin-top: 20px;" onclick="switchDashboardView('browse')">
                    Discover Artists
                </button>
            </div>
        `;
        return;
    }
    
    favoriteArtists.innerHTML = '';
    
    userFollowing.slice(0, 4).forEach(artistId => {
        const artist = sampleArtists.find(a => a.id === artistId);
        if (!artist) return;
        
        const artistCard = document.createElement('div');
        artistCard.className = 'artist-card';
        artistCard.innerHTML = `
            <div class="artist-avatar" style="background: ${getRandomColor()};">${artist.name.charAt(0)}</div>
            <h4>${artist.name}</h4>
            <p>${artist.followers.toLocaleString()} followers</p>
            <button class="follow-btn following" data-artist-id="${artist.id}">
                Following
            </button>
        `;
        favoriteArtists.appendChild(artistCard);
    });
}

// Browse View
function loadBrowseView() {
    console.log("🔍 Loading browse view...");
    const browseSongs = document.getElementById('browseSongs');
    if (!browseSongs) return;
    
    browseSongs.innerHTML = '';
    
    sampleSongs.forEach(song => {
        const isFavorite = userFavorites.songs.includes(song.id);
        const songCard = createSongCard(song, isFavorite);
        browseSongs.appendChild(songCard);
    });
    
    // Setup browse search
    const browseSearch = document.getElementById('browseSearch');
    if (browseSearch) {
        browseSearch.addEventListener('input', function() {
            const query = this.value.toLowerCase().trim();
            const songs = document.querySelectorAll('#browseSongs .song-card');
            
            songs.forEach(song => {
                const title = song.querySelector('h4').textContent.toLowerCase();
                const artist = song.querySelector('p').textContent.toLowerCase();
                
                if (title.includes(query) || artist.includes(query)) {
                    song.style.display = 'block';
                } else {
                    song.style.display = 'none';
                }
            });
        });
    }
}

// Genres View
function loadGenresView() {
    console.log("🎵 Loading genres view...");
    const genresGrid = document.getElementById('genresGrid');
    if (!genresGrid) return;
    
    const genres = [
        { name: 'Makossa', icon: 'fas fa-music', color: '#FF6B35', count: 245 },
        { name: 'Bikutsi', icon: 'fas fa-drum', color: '#2E8B57', count: 189 },
        { name: 'Afrobeat', icon: 'fas fa-headphones', color: '#4A6CF7', count: 156 },
        { name: 'Traditional', icon: 'fas fa-guitar', color: '#8B4513', count: 134 },
        { name: 'Assiko', icon: 'fas fa-drumstick-bite', color: '#9C27B0', count: 112 },
        { name: 'Gospel', icon: 'fas fa-pray', color: '#2196F3', count: 98 },
        { name: 'Hip Hop', icon: 'fas fa-microphone', color: '#FFA726', count: 87 },
        { name: 'Highlife', icon: 'fas fa-glass-cheers', color: '#4CAF50', count: 76 }
    ];
    
    genresGrid.innerHTML = genres.map(genre => `
        <div class="song-card" data-genre="${genre.name.toLowerCase()}">
            <div class="song-cover" style="background: ${genre.color};">
                <i class="${genre.icon}"></i>
            </div>
            <div class="song-info">
                <h4>${genre.name}</h4>
                <p>${genre.count} songs</p>
            </div>
            <button class="action-btn" onclick="filterByGenre('${genre.name.toLowerCase()}')" title="Browse ${genre.name}">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `).join('');
}

// My Music View
function loadMyMusicView() {
    console.log("🎶 Loading my music view...");
    loadMyFavoriteSongs();
    loadMyPlaylists();
}

function loadMyFavoriteSongs() {
    const myFavoriteSongs = document.getElementById('myFavoriteSongs');
    if (!myFavoriteSongs) return;
    
    if (userFavorites.songs.length === 0) {
        myFavoriteSongs.innerHTML = `
            <div class="song-card create-card" style="grid-column: 1 / -1; text-align: center;">
                <div class="create-icon">
                    <i class="fas fa-heart"></i>
                </div>
                <h4>No favorite songs yet</h4>
                <p>Start liking songs to build your collection</p>
                <button class="follow-btn" style="width: auto; margin-top: 20px;" onclick="switchDashboardView('discover')">
                    Discover Songs
                </button>
            </div>
        `;
        return;
    }
    
    myFavoriteSongs.innerHTML = '';
    
    userFavorites.songs.forEach(songId => {
        const song = sampleSongs.find(s => s.id === songId);
        if (!song) return;
        
        const songCard = createSongCard(song, true);
        myFavoriteSongs.appendChild(songCard);
    });
}

function loadMyPlaylists() {
    const myPlaylists = document.getElementById('myPlaylists');
    if (!myPlaylists) return;
    
    myPlaylists.innerHTML = '';
    
    // Add create playlist card
    const createCard = document.createElement('div');
    createCard.className = 'playlist-card create-card';
    createCard.id = 'createNewPlaylistCard';
    createCard.innerHTML = `
        <div class="create-icon">
            <i class="fas fa-plus"></i>
        </div>
        <h4>Create New Playlist</h4>
        <p>Start building your collection</p>
    `;
    myPlaylists.appendChild(createCard);
    
    // Add user's playlists
    if (userPlaylists.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'playlist-card';
        emptyState.style.gridColumn = '1 / -1';
        emptyState.style.textAlign = 'center';
        emptyState.style.padding = '40px';
        emptyState.innerHTML = `
            <i class="fas fa-music" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
            <h4>No playlists yet</h4>
            <p>Create your first playlist to get started</p>
        `;
        myPlaylists.appendChild(emptyState);
    } else {
        userPlaylists.forEach(playlist => {
            const playlistCard = createEnhancedPlaylistCard(playlist);
            myPlaylists.appendChild(playlistCard);
        });
    }
}

// Playlists View
function loadPlaylistsView() {
    console.log("📋 Loading playlists view...");
    const allPlaylists = document.getElementById('allPlaylists');
    if (!allPlaylists) return;
    
    allPlaylists.innerHTML = '';
    
    // Add create playlist card
    const createCard = document.createElement('div');
    createCard.className = 'playlist-card create-card';
    createCard.id = 'createNewPlaylistCard2';
    createCard.innerHTML = `
        <div class="create-icon">
            <i class="fas fa-plus"></i>
        </div>
        <h4>Create New Playlist</h4>
        <p>Start building your collection</p>
    `;
    allPlaylists.appendChild(createCard);
    
    // Combine sample playlists with user playlists
    const allPlaylistsData = [...samplePlaylists, ...userPlaylists];
    
    allPlaylistsData.forEach(playlist => {
        const playlistCard = createEnhancedPlaylistCard(playlist);
        allPlaylists.appendChild(playlistCard);
    });
}

// History View
function loadHistoryView() {
    console.log("🕒 Loading history view...");
    const listeningHistoryEl = document.getElementById('listeningHistory');
    if (!listeningHistoryEl) return;
    
    if (listeningHistory.length === 0) {
        listeningHistoryEl.innerHTML = `
            <div class="song-card" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <i class="fas fa-history" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h4>No listening history</h4>
                <p>Start playing songs to build your history</p>
                <button class="follow-btn" style="width: auto; margin-top: 20px;" onclick="switchDashboardView('discover')">
                    Discover Music
                </button>
            </div>
        `;
        return;
    }
    
    listeningHistoryEl.innerHTML = '';
    
    listeningHistory.forEach(item => {
        const song = sampleSongs.find(s => s.id === item.songId);
        if (!song) return;
        
        const timeAgo = getTimeAgo(new Date(item.timestamp));
        
        const historyCard = document.createElement('div');
        historyCard.className = 'song-card';
        historyCard.innerHTML = `
            <div class="song-cover" style="background: ${song.coverColor || 'var(--primary-color)'};">
                <i class="fas fa-music"></i>
            </div>
            <div class="song-info">
                <h4>${song.title}</h4>
                <p>${song.artist}</p>
            </div>
            <div class="song-meta">
                <span>${timeAgo}</span>
                <span>${song.duration}</span>
            </div>
            <div class="song-actions">
                <button class="action-btn play-btn" data-song-id="${song.id}" title="Play">
                    <i class="fas fa-play"></i>
                </button>
                <button class="action-btn" onclick="removeFromHistory(${song.id})" title="Remove from history">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        listeningHistoryEl.appendChild(historyCard);
    });
}

// Following View
function loadFollowingView() {
    console.log("👥 Loading following view...");
    loadFollowingArtists();
    loadArtistActivity();
}

function loadFollowingArtists() {
    const followingArtists = document.getElementById('followingArtists');
    if (!followingArtists) return;
    
    if (userFollowing.length === 0) {
        followingArtists.innerHTML = `
            <div class="artist-card" style="grid-column: 1 / -1; text-align: center; padding: 60px;">
                <i class="fas fa-user-friends" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h4>Not following any artists</h4>
                <p>Follow artists to stay updated with their latest music</p>
                <button class="follow-btn" style="width: auto; margin-top: 20px;" onclick="switchDashboardView('browse')">
                    Discover Artists
                </button>
            </div>
        `;
        return;
    }
    
    followingArtists.innerHTML = '';
    
    userFollowing.forEach(artistId => {
        const artist = sampleArtists.find(a => a.id === artistId);
        if (!artist) return;
        
        const artistCard = document.createElement('div');
        artistCard.className = 'artist-card';
        artistCard.innerHTML = `
            <div class="artist-avatar" style="background: ${getRandomColor()};">${artist.name.charAt(0)}</div>
            <h4>${artist.name}</h4>
            <p>${artist.followers.toLocaleString()} followers</p>
            <button class="follow-btn unfollow-btn" data-artist-id="${artist.id}">
                Unfollow
            </button>
        `;
        followingArtists.appendChild(artistCard);
    });
}

function loadArtistActivity() {
    const artistActivity = document.getElementById('artistActivity');
    if (!artistActivity) return;
    
    if (userFollowing.length === 0) {
        artistActivity.innerHTML = `
            <div class="activity-item" style="text-align: center; padding: 40px;">
                <p>Follow artists to see their activity here</p>
            </div>
        `;
        return;
    }
    
    artistActivity.innerHTML = '';
    
    // Sample activity
    const activities = [
        { artist: 'Manu Dibango Legacy', action: 'released a new song', item: 'Soul Revival', time: '2 hours ago', icon: 'fas fa-music' },
        { artist: 'Bikutsi Queens', action: 'is performing live at', item: 'Yaoundé Music Festival', time: '1 day ago', icon: 'fas fa-calendar-alt' },
        { artist: 'Yaoundé Vibes', action: 'added to playlist', item: 'Cameroon Classics', time: '3 days ago', icon: 'fas fa-list' }
    ];
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <p><strong>${activity.artist}</strong> ${activity.action} <strong>"${activity.item}"</strong></p>
                <div class="activity-meta">
                    <span class="activity-time">${activity.time}</span>
                    <span class="activity-action">View</span>
                </div>
            </div>
        `;
        artistActivity.appendChild(activityItem);
    });
}

// Notifications View
function loadNotificationsView() {
    console.log("🔔 Loading notifications view...");
    const allNotifications = document.getElementById('allNotifications');
    if (!allNotifications) return;
    
    allNotifications.innerHTML = `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-music"></i>
            </div>
            <div class="activity-content">
                <p><strong>Manu Dibango Legacy</strong> released a new song <strong>"Soul Revival"</strong></p>
                <div class="activity-meta">
                    <span class="activity-time">2 hours ago</span>
                    <span class="activity-action">Listen Now</span>
                </div>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-calendar-alt"></i>
            </div>
            <div class="activity-content">
                <p><strong>Yaoundé Music Festival</strong> starts this weekend. Get your tickets now!</p>
                <div class="activity-meta">
                    <span class="activity-time">1 day ago</span>
                    <span class="activity-action">View Event</span>
                </div>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-user-plus"></i>
            </div>
            <div class="activity-content">
                <p><strong>New Gen Collective</strong> just joined AfroRhythm. Welcome them!</p>
                <div class="activity-meta">
                    <span class="activity-time">3 days ago</span>
                    <span class="activity-action">Follow</span>
                </div>
            </div>
        </div>
    `;
}

// Profile View
function loadProfileView() {
    console.log("👤 Loading profile view...");
    const profileTotalPlays = document.getElementById('profileTotalPlays');
    const profileSongsLiked = document.getElementById('profileSongsLiked');
    const profileArtistsFollowed = document.getElementById('profileArtistsFollowed');
    const profileHoursListened = document.getElementById('profileHoursListened');
    
    if (profileTotalPlays) profileTotalPlays.textContent = `${(listeningHistory.length * 3).toLocaleString()} plays`;
    if (profileSongsLiked) profileSongsLiked.textContent = `${userFavorites.songs.length} songs`;
    if (profileArtistsFollowed) profileArtistsFollowed.textContent = `${userFollowing.length} artists`;
    if (profileHoursListened) profileHoursListened.textContent = `${Math.floor(listeningHistory.length * 0.2)} hours`;
    
    // Update profile info
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const memberSince = document.getElementById('memberSince');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (currentUser) {
        if (profileName) profileName.textContent = currentUser.name || 'User';
        if (profileEmail) profileEmail.textContent = currentUser.email || 'user@example.com';
        if (memberSince) memberSince.textContent = currentUser.memberSince || '2023';
        if (profileAvatar && currentUser.name) {
            const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            profileAvatar.textContent = initials;
            if (currentUser.avatarColor) {
                profileAvatar.style.background = currentUser.avatarColor;
            }
        }
    }
}

// Settings View
function loadSettingsView() {
    console.log("⚙️ Loading settings view...");
    document.querySelectorAll('#settings-view .song-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const title = this.querySelector('h4').textContent;
            showNotification(`${title} settings would open here`, 'info');
        });
    });
}

// ========== PLAYLIST FUNCTIONS ==========
function playPlaylist(playlistId) {
    const playlist = [...userPlaylists, ...samplePlaylists].find(p => p.id === playlistId);
    
    if (!playlist) {
        showNotification('Playlist not found', 'error');
        return;
    }
    
    if (!playlist.songs || playlist.songs.length === 0) {
        showNotification('Playlist is empty', 'warning');
        return;
    }
    
    // Play first song in playlist
    const firstSongId = playlist.songs[0];
    const song = sampleSongs.find(s => s.id === firstSongId);
    
    if (song) {
        playSong(firstSongId);
        showNotification(`Playing "${playlist.name}" playlist`, 'info');
        
        // Increment playlist plays
        playlist.plays = (playlist.plays || 0) + 1;
        saveUserData();
    }
}

function togglePlaylistLike(playlistId) {
    const playlist = [...userPlaylists, ...samplePlaylists].find(p => p.id === playlistId);
    if (!playlist) return;
    
    const index = likedPlaylists.indexOf(playlistId);
    const btn = document.querySelector(`.like-btn[data-playlist-id="${playlistId}"]`);
    const heartIcon = btn?.querySelector('i');
    
    if (index === -1) {
        // Like playlist
        likedPlaylists.push(playlistId);
        playlist.likes = (playlist.likes || 0) + 1;
        
        if (btn) btn.classList.add('liked');
        if (heartIcon) heartIcon.className = 'fas fa-heart';
        
        showNotification(`Added "${playlist.name}" to liked playlists`, 'success');
    } else {
        // Unlike playlist
        likedPlaylists.splice(index, 1);
        playlist.likes = Math.max(0, (playlist.likes || 1) - 1);
        
        if (btn) btn.classList.remove('liked');
        if (heartIcon) heartIcon.className = 'far fa-heart';
        
        showNotification(`Removed "${playlist.name}" from liked playlists`, 'info');
    }
    
    saveUserData();
    updateQuickStats();
}

function showPlaylistOptions(playlistId) {
    const playlist = [...userPlaylists, ...samplePlaylists].find(p => p.id === playlistId);
    if (!playlist) return;
    
    showNotification(`Options for "${playlist.name}"`, 'info');
}

function viewPlaylistDetails(playlistId) {
    const playlist = [...userPlaylists, ...samplePlaylists].find(p => p.id === playlistId);
    if (!playlist) return;
    
    showNotification(`Viewing details for "${playlist.name}"`, 'info');
}

// ========== USER INTERACTIONS ==========
function setupUserInteractions() {
    console.log("🖱️ Setting up user interactions...");
    
    // Delegate click events for better performance
    document.addEventListener('click', function(e) {
        // Favorite song buttons
        if (e.target.closest('.favorite-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.favorite-btn');
            const songId = parseInt(btn.getAttribute('data-song-id'));
            toggleFavoriteSong(songId, btn);
        }
        
        // Follow artist buttons
        if (e.target.closest('.follow-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.follow-btn');
            const artistId = parseInt(btn.getAttribute('data-artist-id'));
            toggleFollowArtist(artistId, btn);
        }
        
        // Play song buttons
        if (e.target.closest('.play-btn:not(.playlist-action-btn):not(.play-playlist-btn)')) {
            e.preventDefault();
            const btn = e.target.closest('.play-btn');
            const songId = parseInt(btn.getAttribute('data-song-id'));
            if (songId) playSong(songId);
        }
        
        // Add to playlist buttons
        if (e.target.closest('.add-to-playlist-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.add-to-playlist-btn');
            const songId = parseInt(btn.getAttribute('data-song-id'));
            showCreatePlaylistModal(songId);
        }
        
        // Create playlist buttons
        if (e.target.closest('#createPlaylistBtn, #createNewPlaylistCard, #createPlaylistBtn2, #createNewPlaylistCard2')) {
            e.preventDefault();
            showCreatePlaylistModal();
        }
        
        // Clear history button
        if (e.target.closest('#clearHistoryBtn, .clear-history-btn')) {
            e.preventDefault();
            clearListeningHistory();
        }
        
        // Edit profile button
        if (e.target.closest('#editProfileBtn')) {
            e.preventDefault();
            showEditProfileModal();
        }
        
        // Mark all notifications read
        if (e.target.closest('#markAllRead, #markAllNotificationsRead')) {
            e.preventDefault();
            showNotification('All notifications marked as read', 'info');
        }
    });
    
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    console.log("✅ User interactions setup complete");
}

function toggleFavoriteSong(songId, btn) {
    const songIndex = userFavorites.songs.indexOf(songId);
    const song = sampleSongs.find(s => s.id === songId);
    
    if (songIndex === -1) {
        userFavorites.songs.push(songId);
        btn.classList.add('favorited');
        const heartIcon = btn.querySelector('i');
        if (heartIcon) heartIcon.className = 'fas fa-heart';
        
        showNotification(`Added "${song?.title}" to favorites!`, 'success');
    } else {
        userFavorites.songs.splice(songIndex, 1);
        btn.classList.remove('favorited');
        const heartIcon = btn.querySelector('i');
        if (heartIcon) heartIcon.className = 'far fa-heart';
        
        showNotification(`Removed "${song?.title}" from favorites`, 'info');
    }
    
    saveUserData();
    updateQuickStats();
}

function toggleFollowArtist(artistId, btn) {
    const artistIndex = userFollowing.indexOf(artistId);
    const artist = sampleArtists.find(a => a.id === artistId);
    
    if (artistIndex === -1) {
        userFollowing.push(artistId);
        btn.classList.add('following');
        btn.textContent = 'Following';
        
        showNotification(`Now following ${artist?.name}!`, 'success');
    } else {
        userFollowing.splice(artistIndex, 1);
        btn.classList.remove('following');
        btn.textContent = 'Follow';
        
        showNotification(`Unfollowed ${artist?.name}`, 'info');
    }
    
    saveUserData();
    updateQuickStats();
}

function playSong(songId) {
    const song = sampleSongs.find(s => s.id === songId);
    if (song) {
        addToHistory(songId);
        updateNowPlayingUI(song);
        
        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) {
            isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            simulatePlayback();
        }
        
        showNotification(`Now playing: ${song.title}`, 'info');
    }
}

function updateNowPlayingUI(song) {
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingArtist = document.getElementById('nowPlayingArtist');
    const nowPlayingCover = document.querySelector('.now-playing-cover');
    
    if (nowPlayingTitle) nowPlayingTitle.textContent = song.title;
    if (nowPlayingArtist) nowPlayingArtist.textContent = song.artist;
    if (nowPlayingCover) {
        nowPlayingCover.style.background = song.coverColor || 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
        nowPlayingCover.innerHTML = `<i class="fas fa-music"></i>`;
    }
}

function addToHistory(songId) {
    const existingIndex = listeningHistory.findIndex(item => item.songId === songId);
    
    if (existingIndex !== -1) {
        listeningHistory.splice(existingIndex, 1);
    }
    
    listeningHistory.unshift({
        songId: songId,
        timestamp: new Date().toISOString(),
        playedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    if (listeningHistory.length > 50) {
        listeningHistory = listeningHistory.slice(0, 50);
    }
    
    saveUserData();
}

function clearListeningHistory() {
    if (listeningHistory.length === 0) {
        showNotification('Your listening history is already empty', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your listening history?')) {
        listeningHistory = [];
        saveUserData();
        showNotification('Listening history cleared', 'info');
        
        if (document.getElementById('history-view')?.classList.contains('active')) {
            loadHistoryView();
        }
        
        updateQuickStats();
    }
}

// ========== MODAL FUNCTIONS ==========
function showCreatePlaylistModal(songId = null) {
    showNotification('Create playlist feature would open here', 'info');
}

function showEditProfileModal() {
    showNotification('Edit profile feature would open here', 'info');
}

// ========== QUICK STATS ==========
function updateQuickStats() {
    // Sidebar stats
    const favoriteCount = document.getElementById('favoriteCount');
    const playlistCount = document.getElementById('playlistCount');
    const followingCount = document.getElementById('followingCount');
    const notificationCount = document.getElementById('notificationCount');
    
    if (favoriteCount) favoriteCount.textContent = userFavorites.songs.length;
    if (playlistCount) playlistCount.textContent = userPlaylists.length;
    if (followingCount) followingCount.textContent = userFollowing.length;
    if (notificationCount) notificationCount.textContent = '2'; // Static for now
    
    // Hero stats
    const dailyPlays = document.getElementById('dailyPlays');
    const newReleases = document.getElementById('newReleases');
    const trendingArtists = document.getElementById('trendingArtists');
    
    if (dailyPlays) dailyPlays.textContent = Math.floor(Math.random() * 100) + 200;
    if (newReleases) newReleases.textContent = Math.floor(Math.random() * 10) + 5;
    if (trendingArtists) trendingArtists.textContent = Math.floor(Math.random() * 5) + 5;
    
    // Total stats
    const totalPlays = document.getElementById('totalPlays');
    const totalLikes = document.getElementById('totalLikes');
    const totalHours = document.getElementById('totalHours');
    
    if (totalPlays) totalPlays.textContent = (listeningHistory.length * 3).toLocaleString();
    if (totalLikes) totalLikes.textContent = userFavorites.songs.length;
    if (totalHours) totalHours.textContent = Math.floor(listeningHistory.length * 0.2);
}

// ========== MUSIC PLAYER ==========
function initializeMusicPlayer() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    if (!playPauseBtn) return;
    
    playPauseBtn.addEventListener('click', function() {
        const nowPlayingTitle = document.getElementById('nowPlayingTitle');
        if (nowPlayingTitle && nowPlayingTitle.textContent === 'Not Playing') {
            showNotification('Select a song to play', 'info');
            return;
        }
        
        isPlaying = !isPlaying;
        const icon = this.querySelector('i');
        
        if (isPlaying) {
            icon.className = 'fas fa-pause';
            simulatePlayback();
        } else {
            icon.className = 'fas fa-play';
        }
    });
    
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            if (progressFill) {
                progressFill.style.width = `${percent * 100}%`;
                updatePlaybackTime(percent);
            }
        });
    }
}

function simulatePlayback() {
    if (!isPlaying) return;
    
    let progress = 0;
    const interval = setInterval(() => {
        if (!isPlaying) {
            clearInterval(interval);
            return;
        }
        
        progress += 0.5;
        if (progress > 100) {
            progress = 0;
            isPlaying = false;
            const playBtn = document.getElementById('playPauseBtn');
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
            clearInterval(interval);
            showNotification('Song finished', 'info');
        }
        
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
        
        updatePlaybackTime(progress / 100);
    }, 500);
}

function updatePlaybackTime(percent) {
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    if (currentTimeEl && totalTimeEl) {
        const totalSeconds = 245; // 4:05 song
        const currentSeconds = Math.floor(percent * totalSeconds);
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalSecondsRemainder = totalSeconds % 60;
        totalTimeEl.textContent = `${totalMinutes}:${totalSecondsRemainder.toString().padStart(2, '0')}`;
    }
}

// ========== NOTIFICATIONS ==========
function setupNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
    }
}

// ========== SEARCH ==========
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    showNotification(`Search results for "${query}" would show here`, 'info');
                    this.value = '';
                }
            }
        });
    }
}

// ========== NOTIFICATION SYSTEM ==========
function showNotification(message, type = 'info') {
    console.log(`📢 Notification: ${message} (${type})`);
    
    // Create notification toast
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#007bff'};
        color: ${type === 'warning' ? '#212529' : 'white'};
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'warning' ? 'fa-exclamation-triangle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Add CSS for animation if not already present
    if (!document.querySelector('#notification-animation')) {
        const style = document.createElement('style');
        style.id = 'notification-animation';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========== INITIALIZE CURRENT VIEW ==========
function initializeCurrentView() {
    console.log("🎯 Initializing current view...");
    
    // Start with discover view (default)
    const defaultView = 'discover';
    loadViewContent(defaultView);
    
    console.log("✅ Current view initialized");
}

// ========== LOGOUT ==========
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('afroUser');
        window.location.href = 'index.html';
    }
}

// ========== GLOBAL WINDOW FUNCTIONS ==========
window.switchDashboardView = function(viewId) {
    // Get all navigation items
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    const dashboardViews = document.querySelectorAll('.dashboard-view');
    
    // Remove active class from all nav items
    navItems.forEach(nav => nav.classList.remove('active'));
    
    // Add active class to clicked nav item
    const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // Hide all views
    dashboardViews.forEach(view => view.classList.remove('active'));
    
    // Show selected view
    const targetView = document.getElementById(viewId + '-view');
    if (targetView) {
        targetView.classList.add('active');
        loadViewContent(viewId);
    }
};

window.filterByGenre = function(genre) {
    showNotification(`Showing ${genre} music`, 'info');
    switchDashboardView('browse');
};

window.removeFromHistory = function(songId) {
    const index = listeningHistory.findIndex(item => item.songId === songId);
    if (index !== -1) {
        listeningHistory.splice(index, 1);
        saveUserData();
        if (document.getElementById('history-view')?.classList.contains('active')) {
            loadHistoryView();
        }
        showNotification('Removed from history', 'info');
        updateQuickStats();
    }
};

window.logout = logout;

console.log("✅ fan.js loaded successfully with complete navigation!");