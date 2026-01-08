// ========== GLOBAL VARIABLES ==========
console.log("🚀 Js/fan.js loaded");
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
let notifications = [];
let audioContext = null;
let audioElement = null;
let currentPlaylist = null;

// Data loaded from backend (with default fallback)
let sampleSongs = [
    { id: 1, title: 'Soul Makossa', artist: 'Manu Dibango Legacy', genre: 'Makossa', duration: '4:32', plays: 245000, coverColor: '#FF6B35', audioUrl: '#' },
    { id: 2, title: 'Bikutsi Rhythm', artist: 'Bikutsi Queens', genre: 'Bikutsi', duration: '3:45', plays: 189000, coverColor: '#2E8B57', audioUrl: '#' },
    { id: 3, title: 'City Lights', artist: 'Yaoundé Vibes', genre: 'Afrobeat', duration: '5:12', plays: 156000, coverColor: '#4A6CF7', audioUrl: '#' },
    { id: 4, title: 'Mountain Song', artist: 'Bamenda Roots', genre: 'Traditional', duration: '4:08', plays: 134000, coverColor: '#8B4513', audioUrl: '#' },
    { id: 5, title: 'Coastal Vibes', artist: 'Douala Beats', genre: 'Assiko', duration: '3:58', plays: 112000, coverColor: '#9C27B0', audioUrl: '#' },
    { id: 6, title: 'African Sunrise', artist: 'New Gen Collective', genre: 'Afrobeat', duration: '4:45', plays: 98000, coverColor: '#2196F3', audioUrl: '#' }
];

let sampleArtists = [
    { id: 1, name: 'Manu Dibango Legacy', followers: 45000, monthlyListeners: 245000, genre: 'Makossa', bio: 'Keeping the legacy of Makossa music alive', avatarColor: '#FF6B35' },
    { id: 2, name: 'Bikutsi Queens', followers: 32000, monthlyListeners: 189000, genre: 'Bikutsi', bio: 'Revolutionary Bikutsi all-female group', avatarColor: '#2E8B57' },
    { id: 3, name: 'Yaoundé Vibes', followers: 28000, monthlyListeners: 156000, genre: 'Afrobeat', bio: 'Modern Afrobeat from the capital', avatarColor: '#4A6CF7' },
    { id: 4, name: 'Bamenda Roots', followers: 25000, monthlyListeners: 134000, genre: 'Traditional', bio: 'Traditional Cameroonian music', avatarColor: '#8B4513' },
    { id: 5, name: 'Douala Beats', followers: 22000, monthlyListeners: 112000, genre: 'Assiko', bio: 'Coastal rhythms and beats', avatarColor: '#9C27B0' }
];

// Static playlist definitions referencing song IDs (will be resolved after songs load)
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
document.addEventListener('DOMContentLoaded', function () {
    console.log("🎵 AfroRhythm Fan Dashboard Initializing...");

    // Check authentication
    if (!checkAuth()) {
        return;
    }

    // Check protocol
    if (window.location.protocol === 'file:') {
        console.warn("⚠️ Running from file system. Backend features will not work. Please access via localhost (e.g., http://localhost/Music_app/fan.html)");
        showNotification("Running from file system. Backend unavailable.", "warning");
    }

    console.log("🚀 Initializing Fan Dashboard...");

    // Load songs and artists from backend
    loadBackendData().then(async () => {
        console.log("✅ Backend data loaded successfully");

        // Attempt to load user data if logged in
        if (checkAuth()) {
            await loadUserData();
        } else {
            console.log("ℹ️ No user logged in, skipping user-specific data load");
        }
    }).catch(err => {
        console.error('❌ Backend load failed, using fallback data:', err);
        showNotification("Backend unavailable. Using offline mode.", "warning");
        // Fallback data is already in place (restored in previous step)
    }).finally(() => {
        // Initialize UI regardless of data source
        setupNavigation();
        initializeMusicPlayer();
        setupUserInteractions();
        setupNotifications();
        setupSearch();
        loadViewContent('discover');
        initializeAudio();
        updateUserProfileUI();
        updateQuickStats();

        console.log("✅ Fan Dashboard fully initialized!");
    });
});

// Fetch songs and artists from backend APIs
async function loadBackendData() {
    console.log("📡 Fetching data from backend...");

    // Define endpoints - assumes script is running at root/fan.html or similar
    const songsUrl = 'backend/api/songs.php';
    const artistsUrl = 'backend/api/artists.php';

    console.log(`fetching: ${songsUrl}`);
    console.log(`fetching: ${artistsUrl}`);

    try {
        const [songsRes, artistsRes] = await Promise.all([
            fetch(songsUrl),
            fetch(artistsUrl)
        ]);

        if (!songsRes.ok) throw new Error(`Songs API error: ${songsRes.status} ${songsRes.statusText}`);
        if (!artistsRes.ok) throw new Error(`Artists API error: ${artistsRes.status} ${artistsRes.statusText}`);

        const songsJson = await songsRes.json();
        const artistsJson = await artistsRes.json();

        if (!songsJson.success) throw new Error(songsJson.message || 'Songs API returned failure');
        if (!artistsJson.success) throw new Error(artistsJson.message || 'Artists API returned failure');

        console.log(`✅ Loaded ${songsJson.data.length} songs from backend`);
        console.log(`✅ Loaded ${artistsJson.data.length} artists from backend`);

        // Map backend songs
        if (songsJson.data && songsJson.data.length > 0) {
            sampleSongs = songsJson.data.map(song => ({
                id: parseInt(song.id),
                title: song.title,
                artist: song.artist_name || 'Unknown Artist',
                genre: song.genre || 'Unknown',
                duration: song.duration || '0:00',
                plays: parseInt(song.plays) || 0,
                coverColor: getTimeBasedColor(song.id), // Dynamic color
                audioUrl: song.file_path || '#' // Ensure this path is reachable from frontend
            }));
        }

        // Map backend artists
        if (artistsJson.data && artistsJson.data.length > 0) {
            sampleArtists = artistsJson.data.map(artist => ({
                id: parseInt(artist.id),
                name: artist.name,
                followers: parseInt(artist.followers) || 0,
                monthlyListeners: parseInt(artist.followers) * 5 || 0, // Mock calc
                genre: artist.genre || 'Unknown',
                bio: artist.bio || 'No biography available',
                avatarColor: getTimeBasedColor(artist.id + 100)
            }));
        }

        return true;
    } catch (error) {
        console.error("fetch error detail:", error);
        throw error; // Re-throw to trigger fallback
    }
}

// Helper to generate consistent colors
function getTimeBasedColor(seed) {
    const colors = ['#FF6B35', '#2E8B57', '#4A6CF7', '#8B4513', '#9C27B0', '#2196F3', '#E91E63', '#FFA000'];
    return colors[seed % colors.length];
}

// ========== AUTHENTICATION ==========
async function checkAuth() {
    console.log("🔐 Checking authentication...");

    try {
        const response = await fetch('backend/api/session.php', {
            method: 'GET',
            credentials: 'include' // Include cookies for session
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                currentUser = data.data.user;
                console.log(`✅ User authenticated: ${currentUser.name}`);
                return true;
            }
        }

        // If we get here, user is not authenticated
        const loginUrl = '/AfroRythm/auth/login.html';

        console.log("⚠️ User not authenticated.");
        console.log("🔄 Redirecting to login:", loginUrl);

        window.location.href = loginUrl;
        return false;

    } catch (error) {
        console.error("❌ Authentication check failed:", error);

        const loginUrl = '/AfroRythm/auth/login.html';

        console.log("⚠️ Auth check failed, redirecting to login:", loginUrl);
        window.location.href = loginUrl;
        return false;
    }
}

function updateUserProfileUI() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');

    if (currentUser) {
        const initials = currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'FU';

        if (userAvatar) {
            userAvatar.textContent = initials;
            if (currentUser.avatarColor) {
                userAvatar.style.background = currentUser.avatarColor;
            }
        }

        if (userName) userName.textContent = currentUser.name || 'Fan User';
        if (userEmail) userEmail.textContent = currentUser.email || 'fan@example.com';

        if (profileAvatar) {
            profileAvatar.textContent = initials;
            if (currentUser.avatarColor) {
                profileAvatar.style.background = currentUser.avatarColor;
            }
        }

        if (profileName) profileName.textContent = currentUser.name || 'Fan User';
        if (profileEmail) profileEmail.textContent = currentUser.email || 'fan@example.com';

        const memberSince = document.getElementById('memberSince');
        if (memberSince) memberSince.textContent = currentUser.memberSince || '2023';
    }
}

// ========== USER DATA MANAGEMENT ==========
async function loadUserData() {
    console.log("💾 Loading user data from backend...");

    if (!currentUser || !currentUser.id) {
        console.warn("⚠️ No user ID found, skipping backend data load");
        return;
    }

    const userId = currentUser.id;

    try {
        // Load all user data in parallel
        const [favoritesRes, followsRes, playlistsRes, historyRes, notificationsRes] = await Promise.all([
            fetch(`backend/api/favorites.php?user_id=${userId}`),
            fetch(`backend/api/follows.php?user_id=${userId}`),
            fetch(`backend/api/playlists.php?user_id=${userId}`),
            fetch(`backend/api/history.php?user_id=${userId}&limit=50`),
            fetch(`backend/api/notifications.php?user_id=${userId}`)
        ]);

        // Process favorites
        if (favoritesRes.ok) {
            const favoritesJson = await favoritesRes.json();
            if (favoritesJson.success) {
                userFavorites.songs = favoritesJson.data.map(fav => fav.song_id);
                console.log(`✅ Loaded ${userFavorites.songs.length} favorite songs`);
            }
        }

        // Process follows
        if (followsRes.ok) {
            const followsJson = await followsRes.json();
            if (followsJson.success) {
                userFollowing = followsJson.data.map(follow => follow.artist_id);
                console.log(`✅ Loaded ${userFollowing.length} followed artists`);
            }
        }

        // Process playlists
        if (playlistsRes.ok) {
            const playlistsJson = await playlistsRes.json();
            if (playlistsJson.success) {
                userPlaylists = playlistsJson.data.map(playlist => ({
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description || '',
                    creator: playlist.creator_name || 'You',
                    songs: [], // Will be loaded when playlist is opened
                    song_count: playlist.song_count || 0,
                    isPublic: playlist.is_public == 1,
                    createdAt: playlist.created_at,
                    coverColor: '#FF6B35'
                }));
                console.log(`✅ Loaded ${userPlaylists.length} playlists`);
            }
        }

        // Process listening history
        if (historyRes.ok) {
            const historyJson = await historyRes.json();
            if (historyJson.success) {
                listeningHistory = historyJson.data.map(item => ({
                    id: item.id,
                    songId: item.song_id,
                    timestamp: item.played_at,
                    playedAt: new Date(item.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }));
                console.log(`✅ Loaded ${listeningHistory.length} history items`);
            }
        }

        // Process notifications
        if (notificationsRes.ok) {
            const notificationsJson = await notificationsRes.json();
            if (notificationsJson.success) {
                notifications = notificationsJson.data.map(notif => ({
                    id: notif.id,
                    message: notif.message,
                    read: notif.is_read == 1,
                    timestamp: notif.created_at
                }));
                console.log(`✅ Loaded ${notifications.length} notifications`);
            }
        }

        // Update notifications badge
        updateNotificationsBadge();

        console.log("✅ All user data loaded from backend");
    } catch (error) {
        console.error('Error loading user data from backend:', error);
        // Fallback to empty arrays
        userFavorites = { songs: [], artists: [], playlists: [] };
        userFollowing = [];
        userPlaylists = [];
        listeningHistory = [];
        notifications = [];
    }
}

function generateDefaultNotifications() {
    return [
        {
            id: 1,
            type: 'new_release',
            title: 'New Song Released',
            message: 'Manu Dibango Legacy released "Soul Revival"',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            read: false,
            artistId: 1,
            songId: 1
        },
        {
            id: 2,
            type: 'concert',
            title: 'Upcoming Concert',
            message: 'Yaoundé Music Festival starts this weekend',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            read: false
        },
        {
            id: 3,
            type: 'artist_joined',
            title: 'New Artist Joined',
            message: 'New Gen Collective just joined AfroRhythm',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            read: true,
            artistId: 6
        },
        {
            id: 4,
            type: 'playlist_update',
            title: 'Playlist Updated',
            message: 'New songs added to "Morning Makossa"',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            read: true,
            playlistId: 101
        }
    ];
}

// Note: saveUserData() is deprecated - data is now saved directly to backend via API calls
// Keeping for backward compatibility but it does nothing
function saveUserData() {
    // Data is now saved directly to backend via API calls
    // This function is kept for backward compatibility
}

// ========== NAVIGATION SYSTEM ==========
function setupNavigation() {
    console.log("🔗 Setting up navigation...");

    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const menuToggle2 = document.getElementById('menuToggle2');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }

    if (menuToggle2 && sidebar) {
        menuToggle2.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function (e) {
        if (sidebar && sidebar.classList.contains('active') && window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !e.target.closest('.menu-toggle')) {
                sidebar.classList.remove('active');
            }
        }
    });

    // Navigation click handlers
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const viewId = this.getAttribute('data-view');
            console.log(`🖱️ Navigation clicked: ${viewId}`);
            switchDashboardView(viewId);
        });
    });

    // View All buttons
    const viewAllButtons = document.querySelectorAll('.view-all[data-view]');
    viewAllButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const viewId = this.getAttribute('data-view');
            if (viewId) {
                switchDashboardView(viewId);
            }
        });
    });

    console.log("✅ Navigation setup complete");
}

function switchDashboardView(viewId) {
    console.log(`🔄 Switching to view: ${viewId}`);

    // Hide all views
    document.querySelectorAll('.dashboard-view').forEach(view => {
        view.classList.remove('active');
    });

    // Show selected view
    const targetView = document.getElementById(`${viewId}-view`);
    if (targetView) {
        targetView.classList.add('active');

        // Load content for this view
        loadViewContent(viewId);
    }

    // Update active nav item
    document.querySelectorAll('.nav-item[data-view]').forEach(nav => {
        nav.classList.remove('active');
    });

    const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }

    // Close mobile sidebar
    const sidebar = document.getElementById('sidebar');
    if (sidebar && window.innerWidth <= 992) {
        sidebar.classList.remove('active');
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Make it available globally
window.switchDashboardView = switchDashboardView;

// ========== VIEW CONTENT LOADERS ==========
function loadViewContent(viewId) {
    console.log(`📂 Loading content for: ${viewId}`);

    switch (viewId) {
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

    // Update stats
    updateQuickStats();
}

// ========== DISCOVER VIEW ==========
function loadDiscoverView() {
    console.log("🔍 Loading discover view...");

    // Load trending songs
    const trendingSongs = document.getElementById('trendingSongs');
    if (trendingSongs) {
        trendingSongs.innerHTML = '';
        sampleSongs.forEach(song => {
            const isFavorite = userFavorites.songs.includes(song.id);
            const songCard = createSongCard(song, isFavorite);
            trendingSongs.appendChild(songCard);
        });
    }

    // Load genre chips
    const genreChips = document.getElementById('genreChips');
    if (genreChips) {
        const genres = ['All', 'Makossa', 'Bikutsi', 'Afrobeat', 'Traditional', 'Assiko', 'Gospel', 'Hip Hop'];
        genreChips.innerHTML = genres.map(genre => `
            <button class="genre-chip ${genre === 'All' ? 'active' : ''}" data-genre="${genre.toLowerCase()}">
                ${genre}
            </button>
        `).join('');

        // Add click handlers
        document.querySelectorAll('.genre-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                const genre = this.getAttribute('data-genre');
                filterSongsByGenre(genre);
            });
        });
    }

    // Load recently played
    const recentlyPlayed = document.getElementById('recentlyPlayed');
    if (recentlyPlayed) {
        loadRecentlyPlayed();
    }

    // Load recommended playlists
    const recommendedPlaylists = document.getElementById('recommendedPlaylists');
    if (recommendedPlaylists) {
        recommendedPlaylists.innerHTML = '';
        const allPlaylists = [...samplePlaylists, ...userPlaylists.slice(0, 2)];
        allPlaylists.forEach(playlist => {
            recommendedPlaylists.appendChild(createPlaylistCard(playlist));
        });
    }

    // Load favorite artists
    const favoriteArtists = document.getElementById('favoriteArtists');
    if (favoriteArtists) {
        loadFavoriteArtists();
    }
}

function filterSongsByGenre(genre) {
    if (genre === 'all') {
        // Show all songs
        document.querySelectorAll('.song-card').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }

    // Filter songs by genre
    document.querySelectorAll('.song-card').forEach(card => {
        const songId = parseInt(card.querySelector('.play-btn')?.getAttribute('data-song-id'));
        if (songId) {
            const song = sampleSongs.find(s => s.id === songId);
            if (song && song.genre.toLowerCase() === genre) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
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
    } else {
        recentlyPlayed.innerHTML = '';
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
    } else {
        favoriteArtists.innerHTML = '';
        userFollowing.slice(0, 4).forEach(artistId => {
            const artist = sampleArtists.find(a => a.id === artistId);
            if (!artist) return;

            const artistCard = document.createElement('div');
            artistCard.className = 'artist-card';
            artistCard.innerHTML = `
                <div class="artist-avatar" style="background: ${artist.avatarColor || getRandomColor()};">${artist.name.charAt(0)}</div>
                <h4>${artist.name}</h4>
                <p>${artist.followers.toLocaleString()} followers</p>
                <button class="follow-btn following" data-artist-id="${artist.id}">
                    Following
                </button>
            `;
            favoriteArtists.appendChild(artistCard);
        });
    }
}

// ========== BROWSE VIEW ==========
function loadBrowseView() {
    console.log("🔍 Loading browse view...");
    const browseSongs = document.getElementById('browseSongs');
    if (!browseSongs) return;

    browseSongs.innerHTML = '';

    sampleSongs.forEach(song => {
        const isFavorite = userFavorites.songs.includes(song.id);
        browseSongs.appendChild(createSongCard(song, isFavorite));
    });

    // Setup browse search with real filtering
    const browseSearch = document.getElementById('browseSearch');
    if (browseSearch) {
        browseSearch.addEventListener('input', function () {
            filterSongsBySearch(this.value.toLowerCase().trim());
        });
    }
}

function filterSongsBySearch(query) {
    const songs = document.querySelectorAll('#browseSongs .song-card');

    if (!query) {
        // Show all songs if search is empty
        songs.forEach(song => {
            song.style.display = 'block';
        });
        return;
    }

    songs.forEach(song => {
        const title = song.querySelector('h4').textContent.toLowerCase();
        const artist = song.querySelector('p').textContent.toLowerCase();
        const songId = parseInt(song.querySelector('.play-btn')?.getAttribute('data-song-id'));

        if (songId) {
            const songData = sampleSongs.find(s => s.id === songId);
            const genre = songData?.genre.toLowerCase() || '';

            if (title.includes(query) || artist.includes(query) || genre.includes(query)) {
                song.style.display = 'block';
            } else {
                song.style.display = 'none';
            }
        }
    });
}

// ========== GENRES VIEW ==========
function loadGenresView() {
    console.log("🎵 Loading genres view...");
    const genresGrid = document.getElementById('genresGrid');
    if (!genresGrid) return;

    const genres = [
        { name: 'Makossa', icon: 'fas fa-music', color: '#FF6B35', count: 245, description: 'Rhythmic dance music from Douala' },
        { name: 'Bikutsi', icon: 'fas fa-drum', color: '#2E8B57', count: 189, description: 'Traditional Beti dance music' },
        { name: 'Afrobeat', icon: 'fas fa-headphones', color: '#4A6CF7', count: 156, description: 'Modern African rhythms' },
        { name: 'Traditional', icon: 'fas fa-guitar', color: '#8B4513', count: 134, description: 'Heritage Cameroonian music' },
        { name: 'Assiko', icon: 'fas fa-drumstick-bite', color: '#9C27B0', count: 112, description: 'Urban dance music' },
        { name: 'Gospel', icon: 'fas fa-pray', color: '#2196F3', count: 98, description: 'Christian inspirational music' },
        { name: 'Hip Hop', icon: 'fas fa-microphone', color: '#FFA726', count: 87, description: 'Urban rap and hip hop' },
        { name: 'Highlife', icon: 'fas fa-glass-cheers', color: '#4CAF50', count: 76, description: 'West African guitar music' }
    ];

    genresGrid.innerHTML = genres.map(genre => `
        <div class="song-card" data-genre="${genre.name.toLowerCase()}">
            <div class="song-cover" style="background: ${genre.color};">
                <i class="${genre.icon}"></i>
            </div>
            <div class="song-info">
                <h4>${genre.name}</h4>
                <p>${genre.count} songs • ${genre.description}</p>
            </div>
            <button class="action-btn" onclick="exploreGenre('${genre.name.toLowerCase()}')" title="Explore ${genre.name}">
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `).join('');
}

// ========== MY MUSIC VIEW ==========
function loadMyMusicView() {
    console.log("🎶 Loading my music view...");

    // Load favorite songs
    const myFavoriteSongs = document.getElementById('myFavoriteSongs');
    if (myFavoriteSongs) {
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
        } else {
            myFavoriteSongs.innerHTML = '';
            userFavorites.songs.forEach(songId => {
                const song = sampleSongs.find(s => s.id === songId);
                if (!song) return;
                myFavoriteSongs.appendChild(createSongCard(song, true));
            });
        }
    }

    // Load my playlists
    const myPlaylists = document.getElementById('myPlaylists');
    if (myPlaylists) {
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
                myPlaylists.appendChild(createPlaylistCard(playlist));
            });
        }
    }
}

// ========== PLAYLISTS VIEW ==========
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
        allPlaylists.appendChild(createPlaylistCard(playlist));
    });
}

// ========== HISTORY VIEW ==========
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

// ========== FOLLOWING VIEW ==========
function loadFollowingView() {
    console.log("👥 Loading following view...");

    // Load followed artists
    const followingArtists = document.getElementById('followingArtists');
    if (followingArtists) {
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
        } else {
            followingArtists.innerHTML = '';
            userFollowing.forEach(artistId => {
                const artist = sampleArtists.find(a => a.id === artistId);
                if (!artist) return;

                const artistCard = document.createElement('div');
                artistCard.className = 'artist-card';
                artistCard.innerHTML = `
                    <div class="artist-avatar" style="background: ${artist.avatarColor || getRandomColor()};">${artist.name.charAt(0)}</div>
                    <h4>${artist.name}</h4>
                    <p>${artist.followers.toLocaleString()} followers</p>
                    <button class="follow-btn unfollow-btn" data-artist-id="${artist.id}">
                        Unfollow
                    </button>
                `;
                followingArtists.appendChild(artistCard);
            });
        }
    }

    // Load artist activity
    const artistActivity = document.getElementById('artistActivity');
    if (artistActivity) {
        loadArtistActivity();
    }
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
    } else {
        artistActivity.innerHTML = '';

        // Get activities from followed artists
        const activities = [];

        userFollowing.forEach(artistId => {
            const artist = sampleArtists.find(a => a.id === artistId);
            if (!artist) return;

            // Generate some sample activities
            const activityTypes = [
                {
                    type: 'new_release',
                    icon: 'fas fa-music',
                    action: 'released a new song',
                    getItem: () => {
                        const songs = sampleSongs.filter(s => s.artist.includes(artist.name));
                        return songs.length > 0 ? songs[0].title : 'New Track';
                    }
                },
                {
                    type: 'concert',
                    icon: 'fas fa-calendar-alt',
                    action: 'is performing live at',
                    getItem: () => `${artist.name} Live Concert`
                },
                {
                    type: 'social',
                    icon: 'fas fa-share-alt',
                    action: 'shared a new video',
                    getItem: () => 'Studio Session'
                }
            ];

            const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            const timeAgo = getRandomTimeAgo();

            activities.push({
                artist: artist.name,
                action: randomActivity.action,
                item: randomActivity.getItem(),
                time: timeAgo,
                icon: randomActivity.icon,
                artistId: artist.id
            });
        });

        // Sort by time (newest first) and take top 5
        activities.sort((a, b) => {
            const timeA = getTimeFromString(a.time);
            const timeB = getTimeFromString(b.time);
            return timeB - timeA;
        }).slice(0, 5).forEach(activity => {
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
                        <span class="activity-action" onclick="viewArtist(${activity.artistId})">View Artist</span>
                    </div>
                </div>
            `;
            artistActivity.appendChild(activityItem);
        });
    }
}

function getRandomTimeAgo() {
    const times = [
        '2 hours ago',
        '1 day ago',
        '3 days ago',
        '1 week ago',
        '2 weeks ago'
    ];
    return times[Math.floor(Math.random() * times.length)];
}

function getTimeFromString(timeStr) {
    const now = new Date();
    if (timeStr.includes('hour')) {
        const hours = parseInt(timeStr);
        return new Date(now.getTime() - hours * 60 * 60 * 1000);
    } else if (timeStr.includes('day')) {
        const days = parseInt(timeStr);
        return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    } else if (timeStr.includes('week')) {
        const weeks = parseInt(timeStr);
        return new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
    }
    return now;
}

// ========== NOTIFICATIONS VIEW ==========
function loadNotificationsView() {
    console.log("🔔 Loading notifications view...");
    const allNotifications = document.getElementById('allNotifications');
    if (!allNotifications) return;

    allNotifications.innerHTML = '';

    if (notifications.length === 0) {
        allNotifications.innerHTML = `
            <div class="activity-item" style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <i class="fas fa-bell-slash" style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;"></i>
                <h4>No notifications</h4>
                <p>You're all caught up!</p>
            </div>
        `;
        return;
    }

    // Sort notifications by timestamp (newest first)
    const sortedNotifications = [...notifications].sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
    );

    sortedNotifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.className = `activity-item ${notification.read ? '' : 'unread'}`;
        notificationItem.innerHTML = `
            <div class="activity-icon">
                <i class="${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="activity-content">
                <p><strong>${notification.title}</strong><br>${notification.message}</p>
                <div class="activity-meta">
                    <span class="activity-time">${getTimeAgo(new Date(notification.timestamp))}</span>
                    <span class="activity-action" onclick="handleNotificationClick(${notification.id})">
                        ${getNotificationAction(notification.type)}
                    </span>
                </div>
            </div>
        `;
        allNotifications.appendChild(notificationItem);
    });
}

function getNotificationIcon(type) {
    switch (type) {
        case 'new_release': return 'fas fa-music';
        case 'concert': return 'fas fa-calendar-alt';
        case 'artist_joined': return 'fas fa-user-plus';
        case 'playlist_update': return 'fas fa-list';
        case 'social': return 'fas fa-share-alt';
        default: return 'fas fa-bell';
    }
}

function getNotificationAction(type) {
    switch (type) {
        case 'new_release': return 'Listen';
        case 'concert': return 'View Event';
        case 'artist_joined': return 'Follow';
        case 'playlist_update': return 'View Playlist';
        default: return 'View';
    }
}

async function updateNotificationsBadge() {
    if (!currentUser || !currentUser.id) {
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`backend/api/notifications.php?user_id=${currentUser.id}&unread_only=true`);
        const data = await response.json();

        const unreadCount = data.unread_count || 0;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating notification badge:', error);
        // Fallback to local count
        const unreadCount = notifications.filter(n => !n.read).length;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }
}

// ========== PROFILE VIEW ==========
function loadProfileView() {
    console.log("👤 Loading profile view...");

    // Update profile stats
    const profileTotalPlays = document.getElementById('profileTotalPlays');
    const profileSongsLiked = document.getElementById('profileSongsLiked');
    const profileArtistsFollowed = document.getElementById('profileArtistsFollowed');
    const profileHoursListened = document.getElementById('profileHoursListened');

    if (profileTotalPlays) profileTotalPlays.textContent = `${(listeningHistory.length * 3).toLocaleString()} plays`;
    if (profileSongsLiked) profileSongsLiked.textContent = `${userFavorites.songs.length} songs`;
    if (profileArtistsFollowed) profileArtistsFollowed.textContent = `${userFollowing.length} artists`;
    if (profileHoursListened) profileHoursListened.textContent = `${Math.floor(listeningHistory.length * 0.2)} hours`;

    // Load listening trends
    loadListeningTrends();
}

function loadListeningTrends() {
    const listeningTrends = document.getElementById('listeningTrends');
    if (!listeningTrends) return;

    // Calculate genre distribution from listening history
    const genreCounts = {};
    listeningHistory.forEach(item => {
        const song = sampleSongs.find(s => s.id === item.songId);
        if (song) {
            genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
        }
    });

    // Create trend visualization
    let trendsHTML = '<div style="margin-top: 20px;">';
    trendsHTML += '<h4 style="margin-bottom: 15px;">Your Listening Trends</h4>';

    if (Object.keys(genreCounts).length === 0) {
        trendsHTML += '<p style="color: var(--text-secondary);">No listening data yet</p>';
    } else {
        const totalPlays = Object.values(genreCounts).reduce((a, b) => a + b, 0);

        Object.entries(genreCounts).forEach(([genre, count]) => {
            const percentage = Math.round((count / totalPlays) * 100);
            trendsHTML += `
                <div style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>${genre}</span>
                        <span>${percentage}%</span>
                    </div>
                    <div style="height: 8px; background: var(--bg-tertiary); border-radius: 4px; overflow: hidden;">
                        <div style="width: ${percentage}%; height: 100%; background: var(--primary-color);"></div>
                    </div>
                </div>
            `;
        });
    }

    trendsHTML += '</div>';
    listeningTrends.innerHTML = trendsHTML;
}

// ========== SETTINGS VIEW ==========
function loadSettingsView() {
    console.log("⚙️ Loading settings view...");

    // Setup settings cards with real functionality
    const settingsCards = document.querySelectorAll('#settings-view .song-card');
    settingsCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function () {
            const title = this.querySelector('h4').textContent;
            openSettingsModal(title);
        });
    });
}

function openSettingsModal(settingType) {
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
    `;

    // Create modal content based on setting type
    let modalContent = '';
    switch (settingType) {
        case 'Account Settings':
            modalContent = createAccountSettingsModal();
            break;
        case 'Notifications':
            modalContent = createNotificationSettingsModal();
            break;
        case 'Playback':
            modalContent = createPlaybackSettingsModal();
            break;
        case 'Privacy & Security':
            modalContent = createPrivacySettingsModal();
            break;
        default:
            modalContent = createDefaultSettingsModal(settingType);
    }

    modalOverlay.innerHTML = modalContent;

    // Add close functionality
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });

    document.body.appendChild(modalOverlay);
}

function createAccountSettingsModal() {
    return `
        <div class="settings-modal" style="background: var(--bg-secondary); border-radius: var(--radius-xl); padding: var(--spacing-xl); max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h3>Account Settings</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="display: flex; align-items: center; gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
                <div class="user-avatar" style="width: 80px; height: 80px; font-size: 24px;" id="modalAvatar">${currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'FU'}</div>
                <div>
                    <h4>${currentUser?.name || 'Fan User'}</h4>
                    <p>${currentUser?.email || 'fan@example.com'}</p>
                    <p><i class="fas fa-crown" style="color: #FFD700;"></i> ${currentUser?.subscription || 'Premium'} Member</p>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Display Name</label>
                    <input type="text" value="${currentUser?.name || ''}" id="displayName" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); color: var(--text-primary);">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Email</label>
                    <input type="email" value="${currentUser?.email || ''}" id="userEmailInput" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); color: var(--text-primary);">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Avatar Color</label>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${['#FF6B35', '#2E8B57', '#4A6CF7', '#8B4513', '#9C27B0', '#2196F3'].map(color => `
                            <button onclick="updateAvatarColor('${color}')" style="width: 40px; height: 40px; border-radius: 50%; background: ${color}; border: ${currentUser?.avatarColor === color ? '3px solid white' : '2px solid transparent'}; cursor: pointer;"></button>
                        `).join('')}
                    </div>
                </div>
                
                <div style="margin-top: var(--spacing-lg);">
                    <button onclick="saveAccountSettings()" style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-md); width: 100%; cursor: pointer; font-weight: 600;">
                        Save Changes
                    </button>
                </div>
                
                <div style="margin-top: var(--spacing-xl); border-top: 1px solid rgba(255,255,255,0.1); padding-top: var(--spacing-lg);">
                    <h4 style="margin-bottom: var(--spacing-md);">Danger Zone</h4>
                    <button onclick="deleteAccount()" style="background: #dc3545; color: white; border: none; padding: 12px 24px; border-radius: var(--radius-md); width: 100%; cursor: pointer;">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ========== CARD CREATION FUNCTIONS ==========
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

function createPlaylistCard(playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.setAttribute('data-playlist-id', playlist.id);

    const songCount = playlist.songs?.length || 0;
    const totalDuration = calculatePlaylistDuration(playlist);
    const isUserPlaylist = userPlaylists.some(p => p.id === playlist.id);
    const isLiked = likedPlaylists.includes(playlist.id);
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

    return card;
}

// ========== UTILITY FUNCTIONS ==========
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

function calculatePlaylistDuration(playlist) {
    if (!playlist.songs || playlist.songs.length === 0) {
        return '0:00';
    }

    const totalMinutes = playlist.songs.length * 3.5;
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

// ========== USER INTERACTIONS ==========
function setupUserInteractions() {
    console.log("🖱️ Setting up user interactions...");

    // Stats Toggle
    const statsToggleBtn = document.getElementById('statsToggleBtn');
    if (statsToggleBtn) {
        statsToggleBtn.addEventListener('click', function () {
            const content = document.getElementById('quickStatsContent');
            const icon = document.getElementById('statsToggleIcon');

            if (content.style.display === 'none') {
                content.style.display = 'block';
                content.style.animation = 'fadeIn 0.3s ease';
                if (icon) icon.style.transform = 'rotate(180deg)';

                // Scroll to bottom to show stats
                const sidebar = document.querySelector('.sidebar-nav');
                if (sidebar) sidebar.scrollTop = sidebar.scrollHeight;
            } else {
                content.style.display = 'none';
                if (icon) icon.style.transform = 'rotate(0deg)';
            }
        });
    }

    // Event delegation for dynamic elements
    document.addEventListener('click', function (e) {
        // Favorite song buttons
        if (e.target.closest('.favorite-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.favorite-btn');
            const songId = parseInt(btn.getAttribute('data-song-id'));
            toggleFavoriteSong(songId, btn);
        }

        // Follow artist buttons
        if (e.target.closest('.follow-btn:not(.unfollow-btn)')) {
            e.preventDefault();
            const btn = e.target.closest('.follow-btn');
            const artistId = parseInt(btn.getAttribute('data-artist-id'));
            toggleFollowArtist(artistId, btn);
        }

        // Unfollow artist buttons
        if (e.target.closest('.unfollow-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.unfollow-btn');
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

        // Play playlist buttons
        if (e.target.closest('.play-playlist-btn, .playlist-action-btn.play-btn')) {
            e.preventDefault();
            const btn = e.target.closest('[data-playlist-id]');
            const playlistId = parseInt(btn.getAttribute('data-playlist-id'));
            if (playlistId) playPlaylist(playlistId);
        }

        // Like playlist buttons
        if (e.target.closest('.like-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.like-btn');
            const playlistId = parseInt(btn.getAttribute('data-playlist-id'));
            if (playlistId) togglePlaylistLike(playlistId, btn);
        }

        // Add to playlist buttons
        if (e.target.closest('.add-to-playlist-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.add-to-playlist-btn');
            const songId = parseInt(btn.getAttribute('data-song-id'));
            if (songId) showAddToPlaylistModal(songId);
        }

        // More options buttons
        if (e.target.closest('.more-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.more-btn');
            const playlistId = parseInt(btn.getAttribute('data-playlist-id'));
            if (playlistId) showPlaylistOptions(playlistId, btn);
        }

        // Create playlist buttons
        if (e.target.closest('#createPlaylistBtn, #createNewPlaylistCard, #createPlaylistBtn2, #createNewPlaylistCard2')) {
            e.preventDefault();
            showCreatePlaylistModal();
        }

        // Clear history button
        if (e.target.closest('#clearHistoryBtn')) {
            e.preventDefault();
            clearListeningHistory();
        }

        // Edit profile button
        if (e.target.closest('#editProfileBtn')) {
            e.preventDefault();
            openSettingsModal('Account Settings');
        }

        // Mark all notifications read
        if (e.target.closest('#markAllNotificationsRead')) {
            e.preventDefault();
            markAllNotificationsRead();
        }

        // Play all favorites button
        if (e.target.closest('[data-action="play-all-favorites"]')) {
            e.preventDefault();
            playAllFavorites();
        }
    });

    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Setup notification button
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showNotificationDropdown();
        });
    }

    console.log("✅ User interactions setup complete");
}

// ========== AUDIO PLAYER FUNCTIONS ==========
function initializeAudio() {
    // Create audio element for playback simulation
    audioElement = new Audio();
    audioElement.volume = currentVolume;

    // Setup volume control
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeLevel = document.querySelector('.volume-level');
    const volumeBtn = document.querySelector('.volume-btn');

    if (volumeSlider && volumeLevel) {
        volumeSlider.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            currentVolume = Math.max(0, Math.min(1, percent));
            volumeLevel.style.width = `${currentVolume * 100}%`;
            if (audioElement) {
                audioElement.volume = currentVolume;
            }

            // Update volume icon
            if (volumeBtn) {
                const icon = volumeBtn.querySelector('i');
                if (currentVolume === 0) {
                    icon.className = 'fas fa-volume-mute';
                } else if (currentVolume < 0.5) {
                    icon.className = 'fas fa-volume-down';
                } else {
                    icon.className = 'fas fa-volume-up';
                }
            }
        });
    }

    // Setup next/previous buttons
    const prevBtn = document.querySelector('.control-btn:nth-child(1)');
    const nextBtn = document.querySelector('.control-btn:nth-child(3)');

    if (prevBtn) {
        prevBtn.addEventListener('click', playPreviousSong);
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', playNextSong);
    }
}

function initializeMusicPlayer() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');

    if (!playPauseBtn) return;

    playPauseBtn.addEventListener('click', function () {
        const nowPlayingTitle = document.getElementById('nowPlayingTitle');
        if (nowPlayingTitle && nowPlayingTitle.textContent === 'Not Playing') {
            // If nothing is playing, play a random song
            const randomSong = sampleSongs[Math.floor(Math.random() * sampleSongs.length)];
            playSong(randomSong.id);
            return;
        }

        togglePlayPause();
    });

    if (progressBar) {
        progressBar.addEventListener('click', function (e) {
            const rect = this.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const progressFill = document.getElementById('progressFill');
            if (progressFill) {
                progressFill.style.width = `${percent * 100}%`;
                updatePlaybackTime(percent);
            }
        });
    }
}

function togglePlayPause() {
    if (!audioElement) return;

    isPlaying = !isPlaying;
    const playBtn = document.getElementById('playPauseBtn');

    if (playBtn) {
        const icon = playBtn.querySelector('i');
        if (isPlaying) {
            icon.className = 'fas fa-pause';
            // Start or resume real audio playback
            if (audioElement.paused) {
                audioElement.play().catch(error => {
                    console.error('Playback failed:', error);
                    showNotification('Playback failed. Please try again.', 'danger');
                    isPlaying = false;
                    icon.className = 'fas fa-play';
                });
            }
        } else {
            icon.className = 'fas fa-play';
            // Pause real audio playback
            audioElement.pause();
        }
    }
}

function startRealPlayback(song) {
    if (!audioElement) {
        console.error('Audio element not initialized');
        return;
    }

    // Stop any current playback
    audioElement.pause();
    audioElement.currentTime = 0;

    // Set the audio source
    if (song.audioUrl && song.audioUrl !== '#') {
        audioElement.src = song.audioUrl;
        audioElement.load();

        // Set up event listeners
        audioElement.onloadedmetadata = function () {
            console.log('Audio loaded, duration:', audioElement.duration);
            updateTotalTime(audioElement.duration);
        };

        audioElement.ontimeupdate = function () {
            if (!isNaN(audioElement.duration)) {
                const progress = (audioElement.currentTime / audioElement.duration) * 100;
                updateProgressBar(progress);
                updateCurrentTime(audioElement.currentTime);
            }
        };

        audioElement.onended = function () {
            isPlaying = false;
            const playBtn = document.getElementById('playPauseBtn');
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';

            // Auto-play next song
            if (currentPlaylist) {
                playNextInPlaylist();
            } else {
                playNextSong();
            }
        };

        audioElement.onerror = function () {
            console.error('Audio playback error');
            showNotification('Unable to play this song. File may be corrupted or missing.', 'danger');
            isPlaying = false;
            const playBtn = document.getElementById('playPauseBtn');
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
        };

        // Start playback
        audioElement.play().catch(error => {
            console.error('Playback failed:', error);
            showNotification('Playback failed. Please try again.', 'danger');
        });

    } else {
        // Fallback to simulation if no audio file
        console.warn('No audio file available, using simulation');
        simulatePlayback();
    }
}

function updateProgressBar(percent) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
}

function updateCurrentTime(currentSeconds) {
    const currentTimeEl = document.getElementById('currentTime');
    if (currentTimeEl) {
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = Math.floor(currentSeconds % 60);
        currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function updateTotalTime(totalSeconds) {
    const totalTimeEl = document.getElementById('totalTime');
    if (totalTimeEl && !isNaN(totalSeconds)) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        totalTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
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

            // Auto-play next song if available
            if (currentPlaylist) {
                playNextInPlaylist();
            } else {
                playNextSong();
            }
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
        const totalSeconds = 245;
        const currentSeconds = Math.floor(percent * totalSeconds);
        const minutes = Math.floor(currentSeconds / 60);
        const seconds = currentSeconds % 60;
        currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalSecondsRemainder = totalSeconds % 60;
        totalTimeEl.textContent = `${totalMinutes}:${totalSecondsRemainder.toString().padStart(2, '0')}`;
    }
}

// ========== CORE FUNCTIONALITIES ==========
async function toggleFavoriteSong(songId, btn) {
    if (!currentUser || !currentUser.id) {
        showNotification('Please log in to favorite songs', 'warning');
        return;
    }

    const song = sampleSongs.find(s => s.id === songId);
    const isFavorited = userFavorites.songs.includes(songId);

    try {
        if (!isFavorited) {
            // Add to favorites
            const response = await fetch('backend/api/favorites.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    song_id: songId
                })
            });

            const data = await response.json();

            if (data.success) {
                userFavorites.songs.push(songId);
                btn.classList.add('favorited');
                const heartIcon = btn.querySelector('i');
                if (heartIcon) heartIcon.className = 'fas fa-heart';

                showNotification(`Added "${song?.title}" to favorites!`, 'success');

                // Add notification for frequently favorited songs
                if (userFavorites.songs.length % 5 === 0) {
                    await createNotification(`You've favorited ${userFavorites.songs.length} songs!`);
                }
            } else {
                showNotification(data.message || 'Failed to add to favorites', 'error');
            }
        } else {
            // Remove from favorites
            const response = await fetch('backend/api/favorites.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    song_id: songId
                })
            });

            const data = await response.json();

            if (data.success) {
                userFavorites.songs = userFavorites.songs.filter(id => id !== songId);
                btn.classList.remove('favorited');
                const heartIcon = btn.querySelector('i');
                if (heartIcon) heartIcon.className = 'far fa-heart';

                showNotification(`Removed "${song?.title}" from favorites`, 'info');
            } else {
                showNotification(data.message || 'Failed to remove from favorites', 'error');
            }
        }

        updateQuickStats();
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showNotification('Error updating favorites', 'error');
    }
}

async function toggleFollowArtist(artistId, btn) {
    if (!currentUser || !currentUser.id) {
        showNotification('Please log in to follow artists', 'warning');
        return;
    }

    const artist = sampleArtists.find(a => a.id === artistId);
    const isFollowing = userFollowing.includes(artistId);

    try {
        if (!isFollowing) {
            // Follow artist
            const response = await fetch('backend/api/follows.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    artist_id: artistId
                })
            });

            const data = await response.json();

            if (data.success) {
                userFollowing.push(artistId);
                if (btn.classList.contains('unfollow-btn')) {
                    btn.classList.remove('unfollow-btn');
                }
                btn.classList.add('following');
                btn.textContent = 'Following';

                showNotification(`Now following ${artist?.name}!`, 'success');

                // Create notification
                await createNotification(`You're now following ${artist?.name}`);

                // Update artist followers count in local data
                const artistIndex = sampleArtists.findIndex(a => a.id === artistId);
                if (artistIndex !== -1) {
                    sampleArtists[artistIndex].followers = (sampleArtists[artistIndex].followers || 0) + 1;
                }
            } else {
                showNotification(data.message || 'Failed to follow artist', 'error');
            }
        } else {
            // Unfollow artist
            const response = await fetch('backend/api/follows.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    artist_id: artistId
                })
            });

            const data = await response.json();

            if (data.success) {
                userFollowing = userFollowing.filter(id => id !== artistId);
                btn.classList.remove('following');
                if (btn.classList.contains('unfollow-btn')) {
                    btn.classList.remove('unfollow-btn');
                }
                btn.textContent = 'Follow';

                showNotification(`Unfollowed ${artist?.name}`, 'info');

                // Update artist followers count in local data
                const artistIndex = sampleArtists.findIndex(a => a.id === artistId);
                if (artistIndex !== -1) {
                    sampleArtists[artistIndex].followers = Math.max(0, (sampleArtists[artistIndex].followers || 0) - 1);
                }
            } else {
                showNotification(data.message || 'Failed to unfollow artist', 'error');
            }
        }

        updateQuickStats();
    } catch (error) {
        console.error('Error toggling follow:', error);
        showNotification('Error updating follow status', 'error');
    }
}

async function playSong(songId) {
    const song = sampleSongs.find(s => s.id === songId);
    if (song) {
        // Add to history (async, but don't wait - fire and forget)
        addToHistory(songId).catch(err => console.error('Error adding to history:', err));

        updateNowPlayingUI(song);

        const playBtn = document.getElementById('playPauseBtn');
        if (playBtn) {
            isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            startRealPlayback(song); // Use real playback instead of simulation
        }

        showNotification(`Now playing: ${song.title}`, 'info');

        // Reset playlist context
        currentPlaylist = null;
        currentSongIndex = sampleSongs.findIndex(s => s.id === songId);
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

async function addToHistory(songId) {
    if (!currentUser || !currentUser.id) {
        // Still track locally if not logged in
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
        updateQuickStats();
        return;
    }

    try {
        // Add to backend listening history (also updates song play count)
        const response = await fetch('backend/api/history.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                song_id: songId
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update local history
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

            // Update song play count in local data
            const songIndex = sampleSongs.findIndex(s => s.id === songId);
            if (songIndex !== -1) {
                sampleSongs[songIndex].plays = (sampleSongs[songIndex].plays || 0) + 1;
            }

            updateQuickStats();
        }
    } catch (error) {
        console.error('Error adding to history:', error);
        // Fallback to local tracking
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
        updateQuickStats();
    }
}

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

    // Set current playlist context
    currentPlaylist = playlist;

    // Play first song in playlist
    const firstSongId = playlist.songs[0];
    const song = sampleSongs.find(s => s.id === firstSongId);

    if (song) {
        playSong(firstSongId);
        showNotification(`Playing "${playlist.name}" playlist`, 'info');

        // Increment playlist plays
        playlist.plays = (playlist.plays || 0) + 1;
        saveUserData();

        // Update current song index in playlist context
        currentSongIndex = 0;
    }
}

function playNextInPlaylist() {
    if (!currentPlaylist || !currentPlaylist.songs) return;

    currentSongIndex = (currentSongIndex + 1) % currentPlaylist.songs.length;
    const nextSongId = currentPlaylist.songs[currentSongIndex];
    const song = sampleSongs.find(s => s.id === nextSongId);

    if (song) {
        playSong(nextSongId);
    }
}

function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % sampleSongs.length;
    const nextSong = sampleSongs[currentSongIndex];
    playSong(nextSong.id);
}

function playPreviousSong() {
    currentSongIndex = currentSongIndex > 0 ? currentSongIndex - 1 : sampleSongs.length - 1;
    const prevSong = sampleSongs[currentSongIndex];
    playSong(prevSong.id);
}

function playAllFavorites() {
    if (userFavorites.songs.length === 0) {
        showNotification('No favorite songs to play', 'warning');
        return;
    }

    // Create a temporary playlist from favorites
    const favoritesPlaylist = {
        id: -1,
        name: 'My Favorites',
        songs: [...userFavorites.songs],
        plays: 0
    };

    currentPlaylist = favoritesPlaylist;
    currentSongIndex = 0;

    const firstSongId = userFavorites.songs[0];
    playSong(firstSongId);
    showNotification('Playing all favorite songs', 'info');
}

function togglePlaylistLike(playlistId, btn) {
    const playlist = [...userPlaylists, ...samplePlaylists].find(p => p.id === playlistId);
    if (!playlist) return;

    const index = likedPlaylists.indexOf(playlistId);
    const heartIcon = btn?.querySelector('i');

    if (index === -1) {
        likedPlaylists.push(playlistId);
        playlist.likes = (playlist.likes || 0) + 1;

        if (btn) btn.classList.add('liked');
        if (heartIcon) heartIcon.className = 'fas fa-heart';

        showNotification(`Added "${playlist.name}" to liked playlists`, 'success');

        addNotification({
            type: 'playlist_like',
            title: 'Playlist Liked',
            message: `You liked "${playlist.name}"`,
            timestamp: new Date().toISOString(),
            read: false,
            playlistId: playlistId
        });
    } else {
        likedPlaylists.splice(index, 1);
        playlist.likes = Math.max(0, (playlist.likes || 1) - 1);

        if (btn) btn.classList.remove('liked');
        if (heartIcon) heartIcon.className = 'far fa-heart';

        showNotification(`Removed "${playlist.name}" from liked playlists`, 'info');
    }

    saveUserData();
    updateQuickStats();
}

function showAddToPlaylistModal(songId) {
    const song = sampleSongs.find(s => s.id === songId);
    if (!song) return;

    // Create modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
    `;

    modalOverlay.innerHTML = `
        <div class="settings-modal" style="background: var(--bg-secondary); border-radius: var(--radius-xl); padding: var(--spacing-xl); max-width: 400px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h3>Add to Playlist</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <p style="margin-bottom: var(--spacing-lg);">Add "${song.title}" to:</p>
            
            <div id="playlistSelection" style="max-height: 300px; overflow-y: auto; margin-bottom: var(--spacing-lg);">
                ${userPlaylists.map(playlist => `
                    <div style="padding: 10px; background: var(--bg-tertiary); margin-bottom: 5px; border-radius: var(--radius-md); cursor: pointer;"
                         onclick="addSongToPlaylist(${playlist.id}, ${songId})">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <strong>${playlist.name}</strong>
                                <p style="margin: 0; font-size: 12px; color: var(--text-secondary);">${playlist.songs.length} songs</p>
                            </div>
                            ${playlist.songs.includes(songId) ? '<i class="fas fa-check" style="color: var(--primary-color);"></i>' : ''}
                        </div>
                    </div>
                `).join('')}
                
                ${userPlaylists.length === 0 ? '<p style="text-align: center; color: var(--text-secondary);">No playlists yet</p>' : ''}
            </div>
            
            <button onclick="showCreatePlaylistModal(${songId})" style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-md); width: 100%; cursor: pointer; font-weight: 600;">
                <i class="fas fa-plus"></i> Create New Playlist
            </button>
        </div>
    `;

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });

    document.body.appendChild(modalOverlay);
}

async function addSongToPlaylist(playlistId, songId) {
    if (!currentUser || !currentUser.id) {
        showNotification('Please log in to add songs to playlists', 'warning');
        return;
    }

    try {
        const response = await fetch('backend/api/playlists.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlist_id: playlistId,
                song_id: songId
            })
        });

        const data = await response.json();

        if (data.success) {
            const song = sampleSongs.find(s => s.id === songId);
            const playlist = userPlaylists.find(p => p.id === playlistId);
            showNotification(`Added "${song?.title}" to "${playlist?.name || 'playlist'}"`, 'success');

            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }

            // Reload playlist if viewing it
            if (document.getElementById('playlists-view')?.classList.contains('active')) {
                loadPlaylistsView();
            }
        } else {
            showNotification(data.message || 'Failed to add song to playlist', 'error');
        }
    } catch (error) {
        console.error('Error adding song to playlist:', error);
        showNotification('Error adding song to playlist', 'error');
    }
}

function showCreatePlaylistModal(songId = null) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
    `;

    modalOverlay.innerHTML = `
        <div class="settings-modal" style="background: var(--bg-secondary); border-radius: var(--radius-xl); padding: var(--spacing-xl); max-width: 400px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h3>Create Playlist</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Playlist Name</label>
                    <input type="text" id="playlistName" placeholder="My Awesome Playlist" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); color: var(--text-primary);">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Description</label>
                    <textarea id="playlistDescription" placeholder="Describe your playlist..." rows="3" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); color: var(--text-primary); resize: vertical;"></textarea>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Privacy</label>
                    <div style="display: flex; gap: 10px;">
                        <label style="display: flex; align-items: center; gap: 5px;">
                            <input type="radio" name="privacy" value="public" checked>
                            <i class="fas fa-globe"></i> Public
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px;">
                            <input type="radio" name="privacy" value="private">
                            <i class="fas fa-lock"></i> Private
                        </label>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Cover Color</label>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${['#FF6B35', '#2E8B57', '#4A6CF7', '#8B4513', '#9C27B0', '#2196F3', '#FFA726', '#4CAF50'].map(color => `
                            <button onclick="document.getElementById('selectedColor').value = '${color}'; updateColorPreview('${color}')" style="width: 30px; height: 30px; border-radius: 50%; background: ${color}; border: 2px solid transparent; cursor: pointer;"></button>
                        `).join('')}
                    </div>
                    <input type="hidden" id="selectedColor" value="#FF6B35">
                    <div id="colorPreview" style="width: 100px; height: 100px; background: #FF6B35; border-radius: var(--radius-md); margin-top: 10px;"></div>
                </div>
                
                <div style="margin-top: var(--spacing-lg);">
                    <button onclick="createNewPlaylist(${songId})" style="background: var(--primary-color); color: white; border: none; padding: 12px 24px; border-radius: var(--radius-md); width: 100%; cursor: pointer; font-weight: 600;">
                        Create Playlist
                    </button>
                </div>
            </div>
        </div>
    `;

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });

    document.body.appendChild(modalOverlay);
}

function updateColorPreview(color) {
    const preview = document.getElementById('colorPreview');
    if (preview) {
        preview.style.background = color;
    }
}

async function createNewPlaylist(songId = null) {
    if (!currentUser || !currentUser.id) {
        showNotification('Please log in to create playlists', 'warning');
        return;
    }

    const name = document.getElementById('playlistName')?.value;
    if (!name) {
        showNotification('Please enter a playlist name', 'warning');
        return;
    }

    const description = document.getElementById('playlistDescription')?.value || '';
    const isPublic = document.querySelector('input[name="privacy"][value="public"]')?.checked || true;

    try {
        const response = await fetch('backend/api/playlists.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                name: name,
                description: description,
                is_public: isPublic,
                songs: songId ? [songId] : []
            })
        });

        const data = await response.json();

        if (data.success) {
            showNotification(`Created playlist "${name}"`, 'success');

            // Reload user playlists
            await loadUserData();

            // Close modal
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                document.body.removeChild(modal);
            }

            // Refresh playlists view if active
            if (document.getElementById('playlists-view')?.classList.contains('active')) {
                loadPlaylistsView();
            }

            if (document.getElementById('mymusic-view')?.classList.contains('active')) {
                loadMyMusicView();
            }
        } else {
            showNotification(data.message || 'Failed to create playlist', 'error');
        }
    } catch (error) {
        console.error('Error creating playlist:', error);
        showNotification('Error creating playlist', 'error');
    }
}

function showPlaylistOptions(playlistId, button) {
    const playlist = [...userPlaylists, ...samplePlaylists].find(p => p.id === playlistId);
    if (!playlist) return;

    // Create context menu
    const menu = document.createElement('div');
    menu.style.cssText = `
        position: absolute;
        background: var(--bg-secondary);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: var(--radius-md);
        padding: 5px 0;
        min-width: 150px;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    const rect = button.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.right = `${window.innerWidth - rect.right}px`;

    const isUserPlaylist = userPlaylists.some(p => p.id === playlistId);

    menu.innerHTML = `
        <button class="playlist-option" onclick="playPlaylist(${playlistId}); this.closest('div').remove()">
            <i class="fas fa-play"></i> Play
        </button>
        <button class="playlist-option" onclick="togglePlaylistLike(${playlistId}); this.closest('div').remove()">
            <i class="fas fa-heart"></i> ${likedPlaylists.includes(playlistId) ? 'Unlike' : 'Like'}
        </button>
        ${isUserPlaylist ? `
            <button class="playlist-option" onclick="editPlaylist(${playlistId}); this.closest('div').remove()">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button class="playlist-option" onclick="deletePlaylist(${playlistId}); this.closest('div').remove()">
                <i class="fas fa-trash"></i> Delete
            </button>
        ` : ''}
        <button class="playlist-option" onclick="sharePlaylist(${playlistId}); this.closest('div').remove()">
            <i class="fas fa-share"></i> Share
        </button>
    `;

    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 0);
}

function editPlaylist(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    showCreatePlaylistModal();

    // Pre-fill form with playlist data
    setTimeout(() => {
        const nameInput = document.getElementById('playlistName');
        const descInput = document.getElementById('playlistDescription');
        const colorInput = document.getElementById('selectedColor');
        const preview = document.getElementById('colorPreview');

        if (nameInput) nameInput.value = playlist.name;
        if (descInput) descInput.value = playlist.description || '';
        if (colorInput) colorInput.value = playlist.coverColor || getRandomColor();
        if (preview && playlist.coverColor) preview.style.background = playlist.coverColor;

        // Change create button to update button
        const createBtn = document.querySelector('.settings-modal button');
        if (createBtn) {
            createBtn.textContent = 'Update Playlist';
            createBtn.onclick = () => updatePlaylist(playlistId);
        }
    }, 100);
}

function updatePlaylist(playlistId) {
    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;

    const name = document.getElementById('playlistName')?.value;
    if (!name) {
        showNotification('Please enter a playlist name', 'warning');
        return;
    }

    playlist.name = name;
    playlist.description = document.getElementById('playlistDescription')?.value || '';
    playlist.coverColor = document.getElementById('selectedColor')?.value || playlist.coverColor;

    saveUserData();
    showNotification(`Updated playlist "${name}"`, 'success');

    // Close modal
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }

    // Refresh views
    if (document.getElementById('playlists-view')?.classList.contains('active')) {
        loadPlaylistsView();
    }
    if (document.getElementById('mymusic-view')?.classList.contains('active')) {
        loadMyMusicView();
    }
}

async function deletePlaylist(playlistId) {
    if (!currentUser || !currentUser.id) {
        showNotification('Please log in to delete playlists', 'warning');
        return;
    }

    const playlist = userPlaylists.find(p => p.id === playlistId);
    if (!playlist) {
        showNotification('Playlist not found', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
        try {
            const response = await fetch(`backend/api/playlists.php?id=${playlistId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                // Remove from local array
                const index = userPlaylists.findIndex(p => p.id === playlistId);
                if (index !== -1) {
                    userPlaylists.splice(index, 1);
                }

                showNotification(`Deleted playlist "${playlist.name}"`, 'info');

                // Refresh views
                if (document.getElementById('playlists-view')?.classList.contains('active')) {
                    loadPlaylistsView();
                }
                if (document.getElementById('mymusic-view')?.classList.contains('active')) {
                    loadMyMusicView();
                }
            } else {
                showNotification(data.message || 'Failed to delete playlist', 'error');
            }
        } catch (error) {
            console.error('Error deleting playlist:', error);
            showNotification('Error deleting playlist', 'error');
        }
    }
}

function sharePlaylist(playlistId) {
    const playlist = [...userPlaylists, ...samplePlaylists].find(p => p.id === playlistId);
    if (!playlist) return;

    // Create shareable link
    const shareUrl = `${window.location.origin}/playlist/${playlistId}`;

    // Create share modal
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(5px);
    `;

    modalOverlay.innerHTML = `
        <div class="settings-modal" style="background: var(--bg-secondary); border-radius: var(--radius-xl); padding: var(--spacing-xl); max-width: 400px; width: 90%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h3>Share Playlist</h3>
                <button onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; color: var(--text-secondary); font-size: 20px; cursor: pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div style="text-align: center; margin-bottom: var(--spacing-lg);">
                <div style="width: 80px; height: 80px; background: ${playlist.coverColor || getRandomColor()}; border-radius: var(--radius-md); margin: 0 auto var(--spacing-md); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-music" style="font-size: 24px; color: white;"></i>
                </div>
                <h4>${playlist.name}</h4>
                <p style="color: var(--text-secondary);">${playlist.songs?.length || 0} songs • By ${playlist.creator}</p>
            </div>
            
            <div style="margin-bottom: var(--spacing-lg);">
                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Share Link</label>
                <div style="display: flex; gap: 5px;">
                    <input type="text" value="${shareUrl}" readonly style="flex: 1; padding: 10px; background: var(--bg-tertiary); border: 1px solid rgba(255,255,255,0.1); border-radius: var(--radius-md); color: var(--text-primary);">
                    <button onclick="copyToClipboard('${shareUrl}')" style="background: var(--primary-color); color: white; border: none; padding: 10px 15px; border-radius: var(--radius-md); cursor: pointer;">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="shareToSocial('twitter', '${playlist.name}', '${shareUrl}')" style="background: #1DA1F2; color: white; border: none; padding: 10px 20px; border-radius: var(--radius-md); cursor: pointer;">
                    <i class="fab fa-twitter"></i> Twitter
                </button>
                <button onclick="shareToSocial('facebook', '${playlist.name}', '${shareUrl}')" style="background: #4267B2; color: white; border: none; padding: 10px 20px; border-radius: var(--radius-md); cursor: pointer;">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
            </div>
        </div>
    `;

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            document.body.removeChild(modalOverlay);
        }
    });

    document.body.appendChild(modalOverlay);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy link', 'error');
    });
}

function shareToSocial(platform, title, url) {
    let shareUrl;
    switch (platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out "${title}" on AfroRhythm!`)}&url=${encodeURIComponent(url)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        default:
            return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    showNotification(`Shared on ${platform}`, 'success');
}

async function clearListeningHistory() {
    if (!currentUser || !currentUser.id) {
        showNotification('Please log in to clear history', 'warning');
        return;
    }

    if (listeningHistory.length === 0) {
        showNotification('Your listening history is already empty', 'info');
        return;
    }

    if (confirm('Are you sure you want to clear your listening history?')) {
        try {
            const response = await fetch('backend/api/history.php', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id
                })
            });

            const data = await response.json();

            if (data.success) {
                listeningHistory = [];
                showNotification('Listening history cleared', 'info');

                if (document.getElementById('history-view')?.classList.contains('active')) {
                    loadHistoryView();
                }

                updateQuickStats();
            } else {
                showNotification(data.message || 'Failed to clear history', 'error');
            }
        } catch (error) {
            console.error('Error clearing history:', error);
            showNotification('Error clearing history', 'error');
        }
    }
}

// ========== NOTIFICATION SYSTEM ==========
function setupNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');

    if (notificationBtn) {
        notificationBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            showNotificationDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', function (e) {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown && dropdown.classList.contains('show') &&
            !e.target.closest('#notificationBtn') &&
            !e.target.closest('#notificationDropdown')) {
            dropdown.classList.remove('show');
        }
    });
}

function showNotificationDropdown() {
    const dropdown = document.getElementById('notificationDropdown');
    if (!dropdown) return;

    dropdown.classList.toggle('show');

    if (dropdown.classList.contains('show')) {
        loadNotificationDropdown();
    }
}

function loadNotificationDropdown() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    // Get unread notifications
    const unreadNotifications = notifications.filter(n => !n.read).slice(0, 5);

    if (unreadNotifications.length === 0) {
        notificationList.innerHTML = `
            <div style="padding: 20px; text-align: center; color: var(--text-secondary);">
                <i class="fas fa-bell-slash" style="font-size: 24px; margin-bottom: 10px;"></i>
                <p>No new notifications</p>
            </div>
        `;
        return;
    }

    notificationList.innerHTML = unreadNotifications.map(notification => `
        <div class="notification-item unread" onclick="handleNotificationClick(${notification.id})">
            <div class="notification-icon">
                <i class="${getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="notification-content">
                <p><strong>${notification.title}</strong><br>${notification.message}</p>
                <div class="notification-time">${getTimeAgo(new Date(notification.timestamp))}</div>
            </div>
        </div>
    `).join('');
}

function handleNotificationClick(notificationId) {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;

    // Mark as read
    notification.read = true;
    saveUserData();
    updateNotificationsBadge();

    // Handle notification action
    switch (notification.type) {
        case 'new_release':
            if (notification.songId) {
                playSong(notification.songId);
            }
            break;
        case 'artist_joined':
            if (notification.artistId) {
                switchDashboardView('browse');
            }
            break;
        case 'playlist_update':
            if (notification.playlistId) {
                playPlaylist(notification.playlistId);
            }
            break;
    }

    // Close dropdown
    const dropdown = document.getElementById('notificationDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }

    // Refresh notifications view if active
    if (document.getElementById('notifications-view')?.classList.contains('active')) {
        loadNotificationsView();
    }
}

async function markAllNotificationsRead() {
    if (!currentUser || !currentUser.id) {
        showNotification('Please log in to mark notifications as read', 'warning');
        return;
    }

    try {
        const response = await fetch('backend/api/notifications.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'mark_all_read',
                user_id: currentUser.id
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update local notifications
            notifications.forEach(notification => {
                notification.read = true;
            });

            updateNotificationsBadge();
            showNotification('All notifications marked as read', 'info');

            if (document.getElementById('notifications-view')?.classList.contains('active')) {
                loadNotificationsView();
            }
        } else {
            showNotification(data.message || 'Failed to mark notifications as read', 'error');
        }
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        showNotification('Error updating notifications', 'error');
    }
}

async function createNotification(message) {
    if (!currentUser || !currentUser.id) {
        return; // Skip if not logged in
    }

    try {
        const response = await fetch('backend/api/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                message: message
            })
        });

        const data = await response.json();

        if (data.success) {
            // Add to local notifications
            notifications.unshift({
                id: data.data.id,
                message: message,
                read: false,
                timestamp: new Date().toISOString()
            });

            updateNotificationsBadge();
        }
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// Legacy function for backward compatibility
function addNotification(notification) {
    notification.id = Date.now();
    notifications.unshift(notification);
    updateNotificationsBadge();

    // Also create in backend if user is logged in
    if (currentUser && currentUser.id) {
        createNotification(notification.message || notification.title);
    }
}

// ========== SEARCH FUNCTIONALITY ==========
function setupSearch() {
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    performSearch(query);
                    this.value = '';
                }
            }
        });
    }
}

function performSearch(query) {
    // Switch to browse view for search results
    switchDashboardView('browse');

    // Set search query and trigger filtering
    setTimeout(() => {
        const browseSearch = document.getElementById('browseSearch');
        if (browseSearch) {
            browseSearch.value = query;
            filterSongsBySearch(query);
        }

        showNotification(`Search results for "${query}"`, 'info');
    }, 100);
}

// ========== SETTINGS FUNCTIONS ==========
function updateAvatarColor(color) {
    if (!currentUser) return;

    currentUser.avatarColor = color;
    // Note: Avatar color changes are now stored server-side in session

    // Update avatar preview
    const modalAvatar = document.getElementById('modalAvatar');
    if (modalAvatar) {
        modalAvatar.style.background = color;
    }

    // Update main avatar
    updateUserProfileUI();

    showNotification('Avatar color updated', 'success');
}

function saveAccountSettings() {
    const displayName = document.getElementById('displayName')?.value;
    const email = document.getElementById('userEmailInput')?.value;

    if (!displayName || !email) {
        showNotification('Please fill in all fields', 'warning');
        return;
    }

    if (currentUser) {
        currentUser.name = displayName;
        currentUser.email = email;
        // Note: Account settings are now stored server-side in session

        updateUserProfileUI();
        showNotification('Account settings saved', 'success');

        // Close modal
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            document.body.removeChild(modal);
        }
    }
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        // Note: Account deletion should call API in future implementation
        // For now, just redirect to home
        window.location.href = 'index.html';
    }
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

    const unreadNotifications = notifications.filter(n => !n.read).length;
    if (notificationCount) {
        notificationCount.textContent = unreadNotifications;
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            if (unreadNotifications > 0) {
                badge.textContent = unreadNotifications;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // Total stats
    const totalPlays = document.getElementById('totalPlays');
    const totalLikes = document.getElementById('totalLikes');
    const totalHours = document.getElementById('totalHours');

    if (totalPlays) totalPlays.textContent = (listeningHistory.length * 3).toLocaleString();
    if (totalLikes) totalLikes.textContent = userFavorites.songs.length;
    if (totalHours) totalHours.textContent = Math.floor(listeningHistory.length * 0.2);

    // Hero stats
    const dailyPlays = document.getElementById('dailyPlays');
    const newReleases = document.getElementById('newReleases');
    const trendingArtists = document.getElementById('trendingArtists');

    if (dailyPlays) dailyPlays.textContent = Math.floor(Math.random() * 100) + 200;
    if (newReleases) newReleases.textContent = Math.floor(Math.random() * 10) + 5;
    if (trendingArtists) trendingArtists.textContent = Math.floor(Math.random() * 5) + 5;
}

// ========== LOGOUT ==========
async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const response = await fetch('backend/api/session.php', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                console.log("✅ Logged out successfully");
            } else {
                console.warn("⚠️ Logout API call failed, but proceeding with client-side cleanup");
            }
        } catch (error) {
            console.error("❌ Logout API call error:", error);
        }

        // Clear client-side data
        currentUser = null;
        userFavorites = { songs: [], artists: [], playlists: [] };
        userFollowing = [];
        userPlaylists = [];
        listeningHistory = [];

        // Redirect to home page
        window.location.href = 'index.html';
    }
}

// ========== GLOBAL WINDOW FUNCTIONS ==========
window.filterByGenre = function (genre) {
    showNotification(`Showing ${genre} music`, 'info');
    switchDashboardView('browse');

    setTimeout(() => {
        const browseSearch = document.getElementById('browseSearch');
        if (browseSearch) {
            browseSearch.value = genre;
            filterSongsBySearch(genre);
        }
    }, 100);
};

window.exploreGenre = function (genre) {
    filterByGenre(genre);
};

window.removeFromHistory = function (songId) {
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

window.viewArtist = function (artistId) {
    // In a real app, this would show artist details
    showNotification(`Viewing artist details`, 'info');
    // For now, just show a notification
};

window.logout = logout;


// ========== HELPER FUNCTIONS ==========
function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notificationContainer') || createNotificationContainer();
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;

    // Styling for notification (if not in CSS)
    notification.style.cssText = `
        background: var(--bg-secondary, #333);
        color: white;
        padding: 12px 20px;
        margin-top: 10px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border-left: 4px solid ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        animation: slideInRight 0.3s ease forwards;
        display: flex;
        align-items: center;
        min-width: 300px;
    `;

    notificationContainer.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function createNotificationContainer() {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    `;
    document.body.appendChild(container);
    return container;
}

// ========== MISSING SETTINGS MODALS ==========
function createNotificationSettingsModal() {
    return `
        <div class="settings-modal" style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; max-width: 500px; width: 90%;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h3>Notification Settings</h3>
                <button onclick="document.querySelector('.modal-overlay').remove()" style="background:none; border:none; color:white; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" checked style="accent-color: var(--primary-color);"> Email Notifications
                </label>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" checked style="accent-color: var(--primary-color);"> Push Notifications
                </label>
            </div>
            <button onclick="showNotification('Settings saved', 'success'); document.querySelector('.modal-overlay').remove()" style="background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:6px; width:100%; margin-top:10px; cursor:pointer;">Save Preferences</button>
        </div>
    `;
}

function createPlaybackSettingsModal() {
    return `
        <div class="settings-modal" style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; max-width: 500px; width: 90%;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h3>Playback Settings</h3>
                 <button onclick="document.querySelector('.modal-overlay').remove()" style="background:none; border:none; color:white; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display:block; margin-bottom:5px;">Quality</label>
                <select style="width:100%; padding:8px; background:var(--bg-tertiary); color:white; border:none; border-radius:4px;">
                    <option>High (320kbps)</option>
                    <option>Normal (128kbps)</option>
                    <option>Low (Data Saver)</option>
                </select>
            </div>
             <button onclick="showNotification('Playback settings saved', 'success'); document.querySelector('.modal-overlay').remove()" style="background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:6px; width:100%; margin-top:10px; cursor:pointer;">Save</button>
        </div>
    `;
}

function createPrivacySettingsModal() {
    return `
        <div class="settings-modal" style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; max-width: 500px; width: 90%;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h3>Privacy & Security</h3>
                 <button onclick="document.querySelector('.modal-overlay').remove()" style="background:none; border:none; color:white; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display:flex; align-items:center; gap:10px; cursor:pointer;">
                    <input type="checkbox" checked style="accent-color: var(--primary-color);"> Public Profile
                </label>
            </div>
             <button onclick="showNotification('Privacy settings updated', 'success'); document.querySelector('.modal-overlay').remove()" style="background:var(--primary-color); color:white; border:none; padding:10px 20px; border-radius:6px; width:100%; margin-top:10px; cursor:pointer;">Save</button>
        </div>
    `;
}

function createDefaultSettingsModal(title) {
    return `
        <div class="settings-modal" style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; max-width: 500px; width: 90%;">
             <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h3>${title}</h3>
                 <button onclick="document.querySelector('.modal-overlay').remove()" style="background:none; border:none; color:white; font-size:20px; cursor:pointer;"><i class="fas fa-times"></i></button>
            </div>
            <p>Settings for ${title} coming soon.</p>
        </div>
    `;
}

console.log("✅ fan.js loaded successfully with complete functionality!");