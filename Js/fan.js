// Fan Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    // Initialize AOS animations
    AOS.init({
        duration: 800,
        once: true,
        offset: 100
    });
    
    // Load sample data
    loadSampleData();
    
    // Initialize music player
    initializeMusicPlayer();
    
    // Initialize genre filtering
    initializeGenreFiltering();
    
    // Animate stats counters
    animateStats();
    
    // Setup navigation
    setupNavigation();
    
    // Setup logout
    setupLogout();
});

// Global variables
let globalAudioPlayer = null;
let isPlaying = false;
let currentSongIndex = 0;
let currentVolume = 0.7;

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('afroUser') || 'null');
    
    if (!user || !user.isLoggedIn) {
        // For testing: create a demo user if not logged in
        const demoUser = {
            email: 'john@example.com',
            name: 'John Smith',
            isLoggedIn: true,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('afroUser', JSON.stringify(demoUser));
        return true; // Allow access for testing
        
        // Original redirect code (commented out for testing)
        // window.location.href = 'auth/login.html';
        // return false;
    }
    
    // Update welcome message
    const welcomeElement = document.querySelector('.welcome-content h1');
    if (welcomeElement && user.name) {
        welcomeElement.textContent = `Welcome back, ${user.name.split(' ')[0]}!`;
    }
    
    // Update profile dropdown
    const profileAvatar = document.querySelector('.profile-avatar');
    const profileName = document.querySelector('.profile-dropdown .dropdown-toggle span');
    
    if (profileAvatar && user.name) {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        profileAvatar.textContent = initials;
    }
    
    if (profileName && user.name) {
        profileName.textContent = user.name;
    }
    
    return true;
}

// Setup logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                // Clear user session
                localStorage.removeItem('afroUser');
                // Stop music if playing
                if (globalAudioPlayer) {
                    globalAudioPlayer.pause();
                }
                // Redirect to login page
                window.location.href = 'auth/login.html';
            }
        });
    }
}

// Sample data for the dashboard
const sampleData = {
    artists: [
        {
            id: 1,
            name: "Manu Dibango Legacy",
            genre: "Makossa",
            followers: "150K",
            songs: 45,
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: true,
            bio: "Carrying forward the legendary Makossa sound of Manu Dibango, blending traditional rhythms with modern production.",
            location: "Douala, Cameroon",
            joined: "2018",
            topSongs: ["Soul Makossa", "African Soul", "Makossa Revival"],
            social: {
                facebook: "manudibangolegacy",
                instagram: "manudibangolegacy",
                twitter: "mdibangolegacy"
            }
        },
        {
            id: 2,
            name: "Bikutsi Queens",
            genre: "Bikutsi",
            followers: "85K",
            songs: 28,
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: false,
            bio: "All-female group reviving traditional Bikutsi music with contemporary influences and powerful vocals.",
            location: "Yaoundé, Cameroon",
            joined: "2020",
            topSongs: ["Bikutsi Rhythm", "Queen's Dance", "Forest Echoes"],
            social: {
                facebook: "bikutisiqueens",
                instagram: "bikutsi_queens",
                twitter: "bikutsi_queens"
            }
        },
        {
            id: 3,
            name: "Yaoundé Vibes",
            genre: "Afrobeat",
            followers: "210K",
            songs: 62,
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: true,
            bio: "Urban Afrobeat collective creating the soundtrack to modern Cameroonian city life.",
            location: "Yaoundé, Cameroon",
            joined: "2019",
            topSongs: ["City Lights", "Urban Pulse", "Night Drive"],
            social: {
                facebook: "yaoundevibes",
                instagram: "yaounde_vibes",
                twitter: "yaoundevibes"
            }
        },
        {
            id: 4,
            name: "Bamenda Roots",
            genre: "Traditional",
            followers: "95K",
            songs: 37,
            image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: false,
            bio: "Preserving and celebrating traditional Cameroonian music from the Northwest region.",
            location: "Bamenda, Cameroon",
            joined: "2021",
            topSongs: ["Mountain Song", "Ancestral Drums", "Grassfields Melody"],
            social: {
                facebook: "bamendaroots",
                instagram: "bamenda_roots",
                twitter: "bamendaroots"
            }
        },
        {
            id: 5,
            name: "Douala Beats",
            genre: "Assiko",
            followers: "120K",
            songs: 41,
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: false,
            bio: "Contemporary Assiko band blending traditional rhythms with modern sounds from the coastal city of Douala.",
            location: "Douala, Cameroon",
            joined: "2022",
            topSongs: ["Coastal Vibes", "Port City Groove", "Ocean Breeze"],
            social: {
                facebook: "doualabeats",
                instagram: "douala_beats",
                twitter: "doualabeats"
            }
        },
        {
            id: 6,
            name: "New Gen Collective",
            genre: "Afrobeat",
            followers: "75K",
            songs: 22,
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: false,
            bio: "Young musicians creating innovative Afrobeat fusion with global influences.",
            location: "Yaoundé, Cameroon",
            joined: "2023",
            topSongs: ["African Sunrise", "New Wave", "Future Sounds"],
            social: {
                facebook: "newgencollective",
                instagram: "newgen_collective",
                twitter: "newgen_collective"
            }
        },
        {
            id: 7,
            name: "Gospel Voices",
            genre: "Gospel",
            followers: "110K",
            songs: 58,
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: true,
            bio: "Inspirational gospel choir spreading messages of hope through traditional and contemporary gospel music.",
            location: "Buea, Cameroon",
            joined: "2019",
            topSongs: ["Heaven's Choir", "Faith Revival", "Graceful Melodies"],
            social: {
                facebook: "gospelvoicescm",
                instagram: "gospel_voices",
                twitter: "gospelvoicescm"
            }
        },
        {
            id: 8,
            name: "Urban Flow",
            genre: "Hip Hop",
            followers: "95K",
            songs: 33,
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            isFollowing: false,
            bio: "Cameroonian hip hop collective telling urban stories through authentic rap and beats.",
            location: "Douala, Cameroon",
            joined: "2020",
            topSongs: ["City Stories", "Urban Legends", "Street Wisdom"],
            social: {
                facebook: "urbanflowcameroon",
                instagram: "urban_flow_cm",
                twitter: "urbanflow_cm"
            }
        }
    ],
    
    topCharts: [
        {
            id: 1,
            rank: 1,
            title: "Soul Makossa",
            artist: "Manu Dibango Legacy",
            plays: "2.5M",
            duration: "4:32",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 2,
            rank: 2,
            title: "Bikutsi Rhythm",
            artist: "Bikutsi Queens",
            plays: "1.8M",
            duration: "3:45",
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 3,
            rank: 3,
            title: "City Lights",
            artist: "Yaoundé Vibes",
            plays: "3.2M",
            duration: "3:58",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 4,
            rank: 4,
            title: "Mountain Song",
            artist: "Bamenda Roots",
            plays: "950K",
            duration: "5:12",
            image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 5,
            rank: 5,
            title: "Coastal Vibes",
            artist: "Douala Beats",
            plays: "1.5M",
            duration: "4:15",
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        }
    ],
    
    playlists: [
        {
            id: 1,
            name: "Morning Makossa",
            count: 24,
            icon: "fas fa-sun",
            color: "#FF6B35"
        },
        {
            id: 2,
            name: "Workout Bikutsi",
            count: 18,
            icon: "fas fa-dumbbell",
            color: "#2E8B57"
        },
        {
            id: 3,
            name: "Chill Afrobeat",
            count: 32,
            icon: "fas fa-couch",
            color: "#4A6CF7"
        },
        {
            id: 4,
            name: "Party Mix",
            count: 45,
            icon: "fas fa-glass-cheers",
            color: "#FFA726"
        }
    ],
    
    events: [
        {
            id: 1,
            day: "15",
            month: "OCT",
            title: "Yaoundé Music Festival",
            location: "Yaoundé Conference Center",
            time: "6:00 PM",
            image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            description: "Annual music festival featuring the best of Cameroonian music across all genres."
        },
        {
            id: 2,
            day: "22",
            month: "OCT",
            title: "Bikutsi Night Live",
            location: "Douala Cultural Center",
            time: "8:00 PM",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            description: "An evening dedicated to traditional Bikutsi music with performances from top artists."
        },
        {
            id: 3,
            day: "28",
            month: "OCT",
            title: "Makossa Masters Concert",
            location: "Buea Town Green",
            time: "7:30 PM",
            image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            description: "Celebrate the masters of Makossa music in this special outdoor concert."
        }
    ],
    
    recommendedSongs: [
        {
            id: 1,
            title: "African Sunrise",
            artist: "New Gen Collective",
            duration: "3:45",
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 2,
            title: "Forest Drums",
            artist: "Bamenda Roots",
            duration: "4:20",
            image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 3,
            title: "City Pulse",
            artist: "Yaoundé Vibes",
            duration: "3:58",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        }
    ],
    
    recentlyPlayed: [
        {
            id: 1,
            title: "Soul Makossa",
            artist: "Manu Dibango Legacy",
            time: "2 hours ago",
            image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 2,
            title: "Bikutsi Rhythm",
            artist: "Bikutsi Queens",
            time: "5 hours ago",
            image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 3,
            title: "City Lights",
            artist: "Yaoundé Vibes",
            time: "1 day ago",
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        },
        {
            id: 4,
            title: "Mountain Song",
            artist: "Bamenda Roots",
            time: "2 days ago",
            image: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
        }
    ]
};

function loadSampleData() {
    // Load featured artists
    loadFeaturedArtists();
    
    // Load top charts
    loadTopCharts();
    
    // Load playlists
    loadPlaylists();
    
    // Load events
    loadEvents();
    
    // Load recommended songs
    loadRecommendedSongs();
    
    // Load recently played
    loadRecentlyPlayed();
}

function loadFeaturedArtists() {
    const container = document.getElementById('featuredArtists');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.artists.slice(0, 4).forEach(artist => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';
        
        col.innerHTML = `
            <div class="artist-card" data-genre="${artist.genre.toLowerCase()}">
                <div class="artist-image">
                    <img src="${artist.image}" alt="${artist.name}">
                    <div class="artist-overlay">
                        <div>
                            <h5 class="artist-name mb-0">${artist.name}</h5>
                            <p class="artist-genre mb-0">${artist.genre}</p>
                        </div>
                    </div>
                    <button class="follow-btn ${artist.isFollowing ? 'following' : ''}" data-artist-id="${artist.id}">
                        <i class="fas fa-${artist.isFollowing ? 'check' : 'plus'}"></i>
                    </button>
                </div>
                <div class="artist-info">
                    <div class="artist-stats">
                        <span><i class="fas fa-users me-1"></i> ${artist.followers}</span>
                        <span><i class="fas fa-music me-1"></i> ${artist.songs} songs</span>
                    </div>
                    <button class="btn btn-sm w-100 mt-3 view-profile-btn" data-artist-id="${artist.id}">
                        View Profile
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
    
    // Add event listeners for view profile buttons
    setTimeout(() => {
        document.querySelectorAll('.view-profile-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const artistId = parseInt(this.dataset.artistId);
                showArtistProfile(artistId);
            });
        });
    }, 100);
}

function loadTopCharts() {
    const container = document.getElementById('topCharts');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.topCharts.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-card';
        
        songElement.innerHTML = `
            <div class="song-number">${song.rank}</div>
            <div class="song-thumbnail">
                <img src="${song.image}" alt="${song.title}">
            </div>
            <div class="song-details">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-actions">
                <button class="btn-song-action play-song" data-song-id="${song.id}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn-song-action like-song" data-song-id="${song.id}">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        `;
        
        container.appendChild(songElement);
    });
}

function loadPlaylists() {
    const container = document.getElementById('myPlaylists');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.playlists.forEach(playlist => {
        const col = document.createElement('div');
        col.className = 'col-12 mb-3';
        
        col.innerHTML = `
            <div class="playlist-card">
                <div class="playlist-image" style="background: ${playlist.color}">
                    <i class="${playlist.icon}"></i>
                </div>
                <div class="playlist-info">
                    <div class="playlist-title">${playlist.name}</div>
                    <div class="playlist-count">${playlist.count} songs</div>
                    <button class="btn btn-sm w-100 play-playlist">
                        <i class="fas fa-play me-1"></i> Play Now
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(col);
    });
}

function loadEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.events.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-card mb-3';
        
        eventElement.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="event-date">
                    <div class="event-day">${event.day}</div>
                    <div class="event-month">${event.month}</div>
                </div>
                <div class="flex-grow-1">
                    <div class="event-title">${event.title}</div>
                    <div class="event-location">
                        <i class="fas fa-map-marker-alt me-1"></i> ${event.location}
                    </div>
                    <div class="event-location">
                        <i class="fas fa-clock me-1"></i> ${event.time}
                    </div>
                </div>
                <button class="btn btn-sm add-to-calendar" data-event-id="${event.id}">
                    <i class="fas fa-calendar-plus"></i>
                </button>
            </div>
        `;
        
        container.appendChild(eventElement);
    });
}

function loadRecommendedSongs() {
    const container = document.getElementById('recommendedSongs');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.recommendedSongs.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-card mb-2';
        
        songElement.innerHTML = `
            <div class="song-thumbnail">
                <img src="${song.image}" alt="${song.title}">
            </div>
            <div class="song-details">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="song-actions">
                <button class="btn-song-action play-song" data-song-id="${song.id}">
                    <i class="fas fa-play"></i>
                </button>
                <span class="text-muted ms-2">${song.duration}</span>
            </div>
        `;
        
        container.appendChild(songElement);
    });
}

function loadRecentlyPlayed() {
    const container = document.getElementById('recentlyPlayed');
    if (!container) return;
    
    container.innerHTML = '';
    
    sampleData.recentlyPlayed.forEach(song => {
        const songElement = document.createElement('div');
        songElement.className = 'song-card mb-2';
        
        songElement.innerHTML = `
            <div class="song-thumbnail">
                <img src="${song.image}" alt="${song.title}">
            </div>
            <div class="song-details">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
                <small class="text-muted">${song.time}</small>
            </div>
            <div class="song-actions">
                <button class="btn-song-action play-song" data-song-id="${song.id}">
                    <i class="fas fa-play"></i>
                </button>
                <button class="btn-song-action replay-song" data-song-id="${song.id}">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        `;
        
        container.appendChild(songElement);
    });
}

function initializeMusicPlayer() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumePopup = document.getElementById('volumePopup');
    const volumeSlider = document.getElementById('volumeSlider');
    
    // Initialize global audio player
    if (!globalAudioPlayer) {
        globalAudioPlayer = new Audio();
        globalAudioPlayer.volume = currentVolume;
        globalAudioPlayer.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
        
        // Setup audio events
        globalAudioPlayer.addEventListener('timeupdate', updateProgress);
        globalAudioPlayer.addEventListener('ended', playNextSong);
        globalAudioPlayer.addEventListener('loadedmetadata', function() {
            updateTotalTime();
        });
    }
    
    // Songs list
    const songs = [
        { title: "Soul Makossa", artist: "Manu Dibango Legacy", duration: "4:32" },
        { title: "Bikutsi Rhythm", artist: "Bikutsi Queens", duration: "3:45" },
        { title: "City Lights", artist: "Yaoundé Vibes", duration: "3:58" }
    ];
    
    // Update player info
    function updatePlayerInfo() {
        const song = songs[currentSongIndex];
        document.querySelector('.song-info h5').textContent = song.title;
        document.querySelector('.song-info p').textContent = `${song.artist} • 2.5M plays`;
    }
    
    // Update total time
    function updateTotalTime() {
        if (globalAudioPlayer.duration) {
            const totalTime = document.getElementById('totalTime');
            const minutes = Math.floor(globalAudioPlayer.duration / 60);
            const seconds = Math.floor(globalAudioPlayer.duration % 60);
            totalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Toggle play/pause
    function togglePlayPause() {
        if (globalAudioPlayer.paused) {
            globalAudioPlayer.play().then(() => {
                isPlaying = true;
                playPauseBtn.querySelector('i').className = 'fas fa-pause';
                showNotification(`Now playing: ${songs[currentSongIndex].title}`, 'success');
            }).catch(e => {
                console.error('Play error:', e);
                showNotification('Error playing audio. Please click play again.', 'warning');
            });
        } else {
            globalAudioPlayer.pause();
            isPlaying = false;
            playPauseBtn.querySelector('i').className = 'fas fa-play';
            showNotification('Music paused', 'info');
        }
    }
    
    // Play next song
    function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        updatePlayerInfo();
        globalAudioPlayer.play().then(() => {
            isPlaying = true;
            playPauseBtn.querySelector('i').className = 'fas fa-pause';
        });
    }
    
    // Play previous song
    function playPrevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        updatePlayerInfo();
        globalAudioPlayer.play().then(() => {
            isPlaying = true;
            playPauseBtn.querySelector('i').className = 'fas fa-pause';
        });
    }
    
    // Update progress bar
    function updateProgress() {
        if (globalAudioPlayer.duration) {
            const percent = (globalAudioPlayer.currentTime / globalAudioPlayer.duration) * 100;
            progress.style.width = `${percent}%`;
            
            // Update current time
            const currentTime = document.getElementById('currentTime');
            const minutes = Math.floor(globalAudioPlayer.currentTime / 60);
            const seconds = Math.floor(globalAudioPlayer.currentTime % 60);
            currentTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
    
    // Progress bar click
    progressBar.addEventListener('click', function(e) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        if (globalAudioPlayer.duration) {
            globalAudioPlayer.currentTime = percent * globalAudioPlayer.duration;
        }
    });
    
    // Volume control
    volumeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        volumePopup.classList.toggle('show');
    });
    
    volumeSlider.addEventListener('input', function(e) {
        currentVolume = parseFloat(e.target.value);
        globalAudioPlayer.volume = currentVolume;
        
        // Update volume icon
        let volumeIcon = 'fa-volume-up';
        if (currentVolume === 0) {
            volumeIcon = 'fa-volume-mute';
        } else if (currentVolume < 0.5) {
            volumeIcon = 'fa-volume-down';
        }
        volumeBtn.querySelector('i').className = `fas ${volumeIcon}`;
    });
    
    // Close volume popup when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!volumePopup.contains(e.target) && !volumeBtn.contains(e.target)) {
            volumePopup.classList.remove('show');
        }
    });
    
    // Event listeners
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNextSong);
    prevBtn.addEventListener('click', playPrevSong);
    
    // Initialize
    updatePlayerInfo();
    
    // Add event listeners for play buttons
    document.addEventListener('click', function(e) {
        if (e.target.closest('.play-song')) {
            const btn = e.target.closest('.play-song');
            const songCard = btn.closest('.song-card');
            if (songCard) {
                const title = songCard.querySelector('.song-title').textContent;
                const artist = songCard.querySelector('.song-artist').textContent;
                
                // Update player
                document.querySelector('.song-info h5').textContent = title;
                document.querySelector('.song-info p').textContent = `${artist} • 2.5M plays`;
                
                // Play audio
                if (globalAudioPlayer) {
                    globalAudioPlayer.play().then(() => {
                        isPlaying = true;
                        playPauseBtn.querySelector('i').className = 'fas fa-pause';
                        showNotification(`Now playing: ${title}`, 'success');
                    });
                }
            }
        }
        
        if (e.target.closest('.play-playlist')) {
            const playlistCard = e.target.closest('.playlist-card');
            if (playlistCard) {
                const playlistName = playlistCard.querySelector('.playlist-title').textContent;
                
                // Play audio
                if (globalAudioPlayer) {
                    globalAudioPlayer.play().then(() => {
                        isPlaying = true;
                        playPauseBtn.querySelector('i').className = 'fas fa-pause';
                        showNotification(`Playing playlist: ${playlistName}`, 'success');
                    });
                }
            }
        }
        
        if (e.target.closest('.replay-song')) {
            if (globalAudioPlayer) {
                globalAudioPlayer.currentTime = 0;
                globalAudioPlayer.play().then(() => {
                    isPlaying = true;
                    playPauseBtn.querySelector('i').className = 'fas fa-pause';
                    showNotification('Replaying song', 'info');
                });
            }
        }
    });
}

function initializeGenreFiltering() {
    const genreTags = document.querySelectorAll('.genre-tag');
    
    genreTags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Remove active class from all tags
            genreTags.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tag
            this.classList.add('active');
            
            // Get selected genre
            const selectedGenre = this.dataset.genre;
            
            // Filter content based on genre
            filterContentByGenre(selectedGenre);
        });
    });
}

function filterContentByGenre(genre) {
    const allArtistCards = document.querySelectorAll('.artist-card');
    const allSongCards = document.querySelectorAll('.song-card');
    
    if (genre === 'all') {
        // Show all
        allArtistCards.forEach(card => card.style.display = 'block');
        allSongCards.forEach(card => card.style.display = 'flex');
    } else {
        // Filter by genre
        allArtistCards.forEach(card => {
            if (card.dataset.genre === genre) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Note: Song cards don't have genre data in current implementation
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const dropdownLinks = document.querySelectorAll('.dropdown-item[data-section]');
    const sections = document.querySelectorAll('.section-content');
    const dashboardSection = document.getElementById('dashboardSection');
    
    // Function to show a section
    function showSection(sectionId) {
        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Hide dashboard
        if (dashboardSection) {
            dashboardSection.style.display = 'none';
        }
        
        // Remove active class from all nav links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Show selected section
        const selectedSection = document.getElementById(sectionId + 'Section');
        if (selectedSection) {
            selectedSection.style.display = 'block';
            
            // Load section data if needed
            loadSectionData(sectionId);
        } else if (sectionId === 'dashboard') {
            // Show dashboard
            if (dashboardSection) {
                dashboardSection.style.display = 'block';
            }
        }
        
        // Update active nav link
        const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    // Load data for specific sections
    function loadSectionData(sectionId) {
        switch(sectionId) {
            case 'browse':
                loadBrowseSection();
                break;
            case 'playlists':
                loadPlaylistsSection();
                break;
            case 'artists':
                loadArtistsSection();
                break;
            case 'events':
                loadEventsSection();
                break;
        }
    }
    
    // Load sections data
    function loadBrowseSection() {
        const container = document.getElementById('browseResults');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Sample browse data
        const browseSongs = [
            {
                id: 1,
                title: "Soul Makossa",
                artist: "Manu Dibango Legacy",
                genre: "Makossa",
                duration: "4:32",
                plays: "2.5M",
                image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
            },
            {
                id: 2,
                title: "Bikutsi Rhythm",
                artist: "Bikutsi Queens",
                genre: "Bikutsi",
                duration: "3:45",
                plays: "1.8M",
                image: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
            },
            {
                id: 3,
                title: "City Lights",
                artist: "Yaoundé Vibes",
                genre: "Afrobeat",
                duration: "3:58",
                plays: "3.2M",
                image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
            }
        ];
        
        browseSongs.forEach(song => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            
            col.innerHTML = `
                <div class="song-grid-card">
                    <div class="song-grid-thumbnail">
                        <img src="${song.image}" alt="${song.title}">
                    </div>
                    <h6 class="mb-1">${song.title}</h6>
                    <p class="text-muted mb-2">${song.artist}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge" style="background: var(--secondary-color);">${song.genre}</span>
                        <span class="text-muted">${song.duration}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <button class="btn btn-sm play-song" data-song-id="${song.id}">
                            <i class="fas fa-play"></i> Play
                        </button>
                        <button class="btn btn-sm like-song" data-song-id="${song.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
    }
    
    function loadPlaylistsSection() {
        const allContainer = document.getElementById('allPlaylists');
        if (!allContainer) return;
        
        allContainer.innerHTML = '';
        
        // Extended playlist data
        const extendedPlaylists = [
            ...sampleData.playlists,
            {
                id: 5,
                name: "Focus Mix",
                count: 28,
                icon: "fas fa-brain",
                color: "#9C27B0"
            },
            {
                id: 6,
                name: "Road Trip",
                count: 36,
                icon: "fas fa-car",
                color: "#2196F3"
            }
        ];
        
        extendedPlaylists.forEach(playlist => {
            const col = document.createElement('div');
            col.className = 'col-md-3 mb-4';
            
            col.innerHTML = `
                <div class="playlist-card">
                    <div class="playlist-image" style="background: ${playlist.color}">
                        <i class="${playlist.icon}"></i>
                    </div>
                    <div class="playlist-info">
                        <div class="playlist-title">${playlist.name}</div>
                        <div class="playlist-count">${playlist.count} songs</div>
                        <button class="btn btn-sm w-100 play-playlist">
                            <i class="fas fa-play me-1"></i> Play Now
                        </button>
                    </div>
                </div>
            `;
            
            allContainer.appendChild(col);
        });
    }
    
    function loadArtistsSection() {
        const container = document.getElementById('allArtists');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Use all artists from sampleData
        sampleData.artists.forEach(artist => {
            const col = document.createElement('div');
            col.className = 'col-md-4 mb-4';
            
            col.innerHTML = `
                <div class="artist-card">
                    <div class="artist-image">
                        <img src="${artist.image}" alt="${artist.name}">
                        <div class="artist-overlay">
                            <div>
                                <h5 class="artist-name mb-0">${artist.name}</h5>
                                <p class="artist-genre mb-0">${artist.genre}</p>
                            </div>
                        </div>
                        <button class="follow-btn ${artist.isFollowing ? 'following' : ''}" data-artist-id="${artist.id}">
                            <i class="fas fa-${artist.isFollowing ? 'check' : 'plus'}"></i>
                        </button>
                    </div>
                    <div class="artist-info">
                        <div class="artist-stats">
                            <span><i class="fas fa-users me-1"></i> ${artist.followers}</span>
                            <span><i class="fas fa-music me-1"></i> ${artist.songs} songs</span>
                        </div>
                        <button class="btn btn-sm w-100 mt-3 view-profile-btn" data-artist-id="${artist.id}">
                            View Profile
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
        
        // Add event listeners for view profile buttons
        setTimeout(() => {
            document.querySelectorAll('.view-profile-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const artistId = parseInt(this.dataset.artistId);
                    showArtistProfile(artistId);
                });
            });
        }, 100);
    }
    
    function loadEventsSection() {
        const container = document.getElementById('upcomingEventsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Extended events data
        const extendedEvents = [
            ...sampleData.events,
            {
                id: 4,
                day: "05",
                month: "NOV",
                title: "Douala Music Awards",
                location: "Douala Grand Arena",
                time: "7:00 PM",
                image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                description: "Annual awards ceremony celebrating the best in Cameroonian music."
            }
        ];
        
        extendedEvents.forEach(event => {
            const col = document.createElement('div');
            col.className = 'col-12';
            
            col.innerHTML = `
                <div class="event-large-card">
                    <div class="event-banner">
                        <img src="${event.image}" alt="${event.title}">
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="event-date">
                            <div class="event-day">${event.day}</div>
                            <div class="event-month">${event.month}</div>
                        </div>
                        <div class="flex-grow-1 ms-3">
                            <div class="event-title">${event.title}</div>
                            <div class="event-location">
                                <i class="fas fa-map-marker-alt me-1"></i> ${event.location}
                            </div>
                            <div class="event-location">
                                <i class="fas fa-clock me-1"></i> ${event.time}
                            </div>
                        </div>
                        <button class="btn btn-primary add-to-calendar" data-event-id="${event.id}">
                            <i class="fas fa-calendar-plus me-1"></i> Add to Calendar
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(col);
        });
    }
    
    // Event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            showSection(sectionId);
        });
    });
    
    dropdownLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.dataset.section;
            showSection(sectionId);
        });
    });
    
    // Add event listeners for other buttons
    document.addEventListener('click', function(e) {
        // Follow artist button
        if (e.target.closest('.follow-btn')) {
            const btn = e.target.closest('.follow-btn');
            const icon = btn.querySelector('i');
            
            if (btn.classList.contains('following')) {
                btn.classList.remove('following');
                icon.className = 'fas fa-plus';
                updateStats('artistsFollowed', -1);
                showNotification('Unfollowed artist', 'info');
            } else {
                btn.classList.add('following');
                icon.className = 'fas fa-check';
                updateStats('artistsFollowed', 1);
                showNotification('Now following artist', 'success');
            }
        }
        
        // Like song button
        if (e.target.closest('.like-song')) {
            const btn = e.target.closest('.like-song');
            const icon = btn.querySelector('i');
            
            if (icon.classList.contains('fas')) {
                icon.className = 'far fa-heart';
                updateStats('songsLiked', -1);
                showNotification('Removed from liked songs', 'info');
            } else {
                icon.className = 'fas fa-heart';
                updateStats('songsLiked', 1);
                showNotification('Added to liked songs', 'success');
            }
        }
        
        // Add to calendar button
        if (e.target.closest('.add-to-calendar')) {
            const btn = e.target.closest('.add-to-calendar');
            const eventId = parseInt(btn.dataset.eventId);
            handleAddToCalendar(eventId);
        }
        
        // Explore button
        if (e.target.closest('.welcome-banner .btn')) {
            e.preventDefault();
            showNotification('Exploring new music...', 'info');
            // Navigate to browse section
            const browseLink = document.querySelector('.nav-link[data-section="browse"]');
            if (browseLink) browseLink.click();
        }
        
        // Create playlist (plus button)
        if (e.target.closest('.view-all .fa-plus')) {
            e.preventDefault();
            const playlistName = prompt('Enter playlist name:');
            if (playlistName) {
                showNotification(`Playlist "${playlistName}" created!`, 'success');
                updateStats('playlistsCreated', 1);
            }
        }
        
        // Clear history
        if (e.target.closest('.view-all') && e.target.closest('.view-all').textContent.includes('Clear History')) {
            e.preventDefault();
            if (confirm('Are you sure you want to clear your recently played history?')) {
                document.getElementById('recentlyPlayed').innerHTML = '<p class="text-muted text-center py-4">No recently played songs</p>';
                showNotification('Recently played history cleared', 'info');
            }
        }
    });
    
    // Other button listeners
    document.getElementById('applyFilters')?.addEventListener('click', function() {
        showNotification('Filters applied successfully!', 'success');
    });
    
    document.getElementById('createPlaylistBtn')?.addEventListener('click', function() {
        const playlistName = prompt('Enter playlist name:');
        if (playlistName) {
            showNotification(`Playlist "${playlistName}" created!`, 'success');
        }
    });
    
    document.getElementById('editProfileBtn')?.addEventListener('click', function() {
        showNotification('Edit profile feature coming soon!', 'info');
    });
    
    document.getElementById('saveSettingsBtn')?.addEventListener('click', function() {
        showNotification('Settings saved successfully!', 'success');
    });
    
    document.getElementById('deleteAccountBtn')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            showNotification('Account deletion requested. You will receive a confirmation email.', 'warning');
        }
    });
    
    document.getElementById('exportDataBtn')?.addEventListener('click', function() {
        showNotification('Preparing your data for export...', 'info');
    });
    
    document.getElementById('addToLibraryBtn')?.addEventListener('click', function() {
        showNotification('Browse music to add to your library', 'info');
        const browseLink = document.querySelector('.nav-link[data-section="browse"]');
        if (browseLink) browseLink.click();
    });
}

function updateStats(statId, change) {
    const statElement = document.getElementById(statId);
    if (!statElement) return;
    
    let currentValue = parseInt(statElement.textContent.replace(/[^0-9]/g, ''));
    currentValue += change;
    statElement.textContent = currentValue;
    
    // Animate the update
    statElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        statElement.style.transform = 'scale(1)';
    }, 300);
}

function animateStats() {
    const stats = [
        { id: 'artistsFollowed', target: 24, duration: 1500 },
        { id: 'songsLiked', target: 156, duration: 2000 },
        { id: 'playlistsCreated', target: 8, duration: 1000 },
        { id: 'hoursListened', target: 245, duration: 2500 }
    ];
    
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (!element) return;
        
        const start = 0;
        const end = stat.target;
        const duration = stat.duration;
        const startTime = Date.now();
        
        const updateCounter = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            let currentValue = Math.floor(progress * end);
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification-alert');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification-alert`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        backdrop-filter: blur(10px);
        background: ${type === 'success' ? 'rgba(46, 139, 87, 0.9)' : type === 'info' ? 'rgba(66, 133, 244, 0.9)' : 'rgba(255, 107, 53, 0.9)'};
        border: none;
        color: white;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-triangle'} me-2"></i>
            <div>${message}</div>
            <button type="button" class="btn-close btn-close-white ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// FIXED: Artist Profile Function
function showArtistProfile(artistId) {
    const artist = sampleData.artists.find(a => a.id === artistId);
    if (!artist) {
        showNotification('Artist information not available', 'warning');
        return;
    }
    
    const modalContent = document.getElementById('artistProfileContent');
    modalContent.innerHTML = `
        <div class="artist-profile-content">
            <div class="artist-profile-header">
                <img src="${artist.image}" alt="${artist.name}" class="artist-profile-image">
                <h3>${artist.name}</h3>
                <p class="text-muted">${artist.genre} • ${artist.location}</p>
            </div>
            
            <div class="artist-profile-stats">
                <div class="artist-stat-item">
                    <div class="artist-stat-value">${artist.followers}</div>
                    <div class="artist-stat-label">Followers</div>
                </div>
                <div class="artist-stat-item">
                    <div class="artist-stat-value">${artist.songs}</div>
                    <div class="artist-stat-label">Songs</div>
                </div>
                <div class="artist-stat-item">
                    <div class="artist-stat-value">${artist.joined}</div>
                    <div class="artist-stat-label">Joined</div>
                </div>
            </div>
            
            <div class="mb-4">
                <h5>About</h5>
                <p>${artist.bio}</p>
            </div>
            
            <div class="mb-4">
                <h5>Top Songs</h5>
                <div class="d-flex flex-wrap gap-2">
                    ${artist.topSongs.map(song => `
                        <span class="badge" style="background: var(--secondary-color);">${song}</span>
                    `).join('')}
                </div>
            </div>
            
            <div class="mb-4">
                <h5>Connect</h5>
                <div class="d-flex gap-3">
                    ${artist.social.facebook ? `
                        <a href="https://facebook.com/${artist.social.facebook}" target="_blank" class="btn btn-outline-primary btn-sm">
                            <i class="fab fa-facebook-f me-1"></i> Facebook
                        </a>
                    ` : ''}
                    ${artist.social.instagram ? `
                        <a href="https://instagram.com/${artist.social.instagram}" target="_blank" class="btn btn-outline-danger btn-sm">
                            <i class="fab fa-instagram me-1"></i> Instagram
                        </a>
                    ` : ''}
                    ${artist.social.twitter ? `
                        <a href="https://twitter.com/${artist.social.twitter}" target="_blank" class="btn btn-outline-info btn-sm">
                            <i class="fab fa-twitter me-1"></i> Twitter
                        </a>
                    ` : ''}
                </div>
            </div>
            
            <div class="text-center">
                <button class="btn btn-primary me-2 play-artist-btn" data-artist-id="${artist.id}">
                    <i class="fas fa-play me-1"></i> Play Artist
                </button>
                <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Close
                </button>
            </div>
        </div>
    `;
    
    // Add event listener for play artist button
    modalContent.querySelector('.play-artist-btn')?.addEventListener('click', function() {
        showNotification(`Now playing ${artist.name}`, 'success');
        // Play audio
        if (globalAudioPlayer) {
            globalAudioPlayer.play().then(() => {
                isPlaying = true;
                document.getElementById('playPauseBtn').querySelector('i').className = 'fas fa-pause';
            }).catch(e => {
                console.error('Play error:', e);
                showNotification('Error playing audio. Please click play again.', 'warning');
            });
        }
    });
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('artistProfileModal'));
    modal.show();
}

function handleAddToCalendar(eventId) {
    const event = sampleData.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Create modal for calendar options
    const modalContent = document.getElementById('calendarModalContent');
    modalContent.innerHTML = `
        <div class="p-3">
            <h6>${event.title}</h6>
            <p><i class="fas fa-calendar me-2"></i> ${event.day} ${event.month}</p>
            <p><i class="fas fa-clock me-2"></i> ${event.time}</p>
            <p><i class="fas fa-map-marker-alt me-2"></i> ${event.location}</p>
            
            <div class="mt-4">
                <p class="mb-2">Choose calendar option:</p>
                <div class="d-grid gap-2">
                    <button class="btn btn-primary" onclick="downloadCalendarFile(${eventId})">
                        <i class="fas fa-download me-2"></i> Download .ics File
                    </button>
                    <button class="btn btn-outline-primary" onclick="showNotification('Google Calendar integration would open here', 'info')">
                        <i class="fab fa-google me-2"></i> Add to Google Calendar
                    </button>
                    <button class="btn btn-outline-secondary" onclick="showNotification('Outlook Calendar integration would open here', 'info')">
                        <i class="fas fa-envelope me-2"></i> Add to Outlook
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    const calendarModal = new bootstrap.Modal(document.getElementById('calendarModal'));
    calendarModal.show();
}

function downloadCalendarFile(eventId) {
    const event = sampleData.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Simple .ics file content
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AfroRhythm//Event Calendar//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART:20231015T180000
DTEND:20231015T200000
LOCATION:${event.location}
DESCRIPTION:${event.description}
END:VEVENT
END:VCALENDAR`;
    
    // Create download link
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification(`${event.title} added to your calendar!`, 'success');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('calendarModal'));
    if (modal) {
        modal.hide();
    }
}

// Make functions available globally
window.downloadCalendarFile = downloadCalendarFile;