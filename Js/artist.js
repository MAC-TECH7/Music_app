// Global functions
function showNotification(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    // Add to container
    toastContainer.appendChild(toast);

    // Show toast
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    // Remove after hide
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Authentication check
async function checkAuth() {
    console.log("🔐 Checking authentication...");

    try {
        const response = await fetch('../backend/api/session.php', {
            method: 'GET',
            credentials: 'include' // Include cookies for session
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data.user.type === 'artist') {
                console.log(`✅ Artist authenticated: ${data.data.user.name}`);
                return true;
            }
        }

        // If we get here, user is not authenticated or not an artist
        console.log("⚠️ Artist authentication failed, redirecting to login...");
        window.location.href = '../auth/login.html';
        return false;

    } catch (error) {
        console.error("❌ Authentication check failed:", error);
        console.log("⚠️ Auth check failed, redirecting to login...");
        window.location.href = '../auth/login.html';
        return false;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('Artist Dashboard JavaScript loaded successfully!');

    // Check authentication first
    if (!(await checkAuth())) {
        return; // checkAuth will redirect if not authenticated
    }

    // State management
    let currentView = 'dashboard';
    let currentPlan = 'Pro'; // Current subscription plan
    let uploadedSongs = []; // Store uploaded songs data (loaded from backend)
    
    // Mock Data for notifications and profile; songs will come from backend
    const mockData = {
        songs: [], // will be populated from backend
        notifications: [
            { id: 1, title: 'New Follower', message: '@musiclover123 started following you', time: '2 hours ago', read: false },
            { id: 2, title: 'Stream Milestone', message: 'Your song "Midnight Pulse" reached 100K plays', time: '1 day ago', read: false },
            { id: 3, title: 'Comment', message: 'New comment on "Dreamscape"', time: '2 days ago', read: true },
            { id: 4, title: 'Revenue Update', message: 'Monthly payout processed: $8,450', time: '3 days ago', read: true },
            { id: 5, title: 'Playlist Feature', message: 'Added to "Electronic Essentials" playlist', time: '1 week ago', read: true }
        ],
        stats: {
            totalPlays: '24.5M',
            totalLikes: '1.2M',
            totalDownloads: '450K',
            totalRevenue: '$245,820',
            monthlyRevenue: '$18,240',
            pendingPayouts: '$8,450',
            availableForWithdrawal: '$12,540'
        },
        profile: {
            name: 'Artist',
            bio: 'Update your bio in the profile section to tell fans about yourself.',
            avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
        }
    };

    // Load songs from backend first, then initialize dashboard
    loadArtistSongsFromBackend().then(() => {
        initializeDashboard();
    }).catch(err => {
        console.error('Error loading artist songs, using empty list:', err);
        uploadedSongs = [];
        mockData.songs = [];
        initializeDashboard();
    });

    async function loadArtistSongsFromBackend() {
        // User authentication is now handled by session check
        const res = await fetch('../backend/api/songs.php');
        const json = await res.json();
        if (!json.success) {
            throw new Error(json.message || 'Failed to load songs');
        }

        // Filter songs by artist when we know the artist ID; for now, show all active songs
        const songs = json.data.filter(song => song.status === 'active' || song.status === 'pending');

        uploadedSongs = songs.map(song => ({
            id: song.id,
            title: song.title,
            genre: song.genre || 'Unknown',
            date: song.uploaded_at ? song.uploaded_at.split(' ')[0] : '',
            plays: Number(song.plays || 0).toLocaleString(),
            likes: Number(song.likes || 0).toLocaleString(),
            downloads: '0',
            status: song.status,
            audioFile: song.file_path || null
        }));

        mockData.songs = uploadedSongs;
    }
    
    function initializeDashboard() {
        console.log('Initializing dashboard...');
        
        // Initialize sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function(e) {
                e.preventDefault();
                const wrapper = document.getElementById('wrapper');
                wrapper.classList.toggle('toggled');
            });
        }
        
        // Initialize logout buttons
        const logoutButtons = document.querySelectorAll('#logoutBtn, #topLogoutBtn');
        logoutButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    // Show loading
                    document.getElementById('main-content').innerHTML = `
                        <div class="text-center py-5">
                            <div class="loading-spinner mx-auto"></div>
                            <p class="mt-3 text-fix">Logging out...</p>
                        </div>
                    `;
                    
                    // Simulate logout
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }
            });
        });
        
        // Initialize navigation
        const navItems = document.querySelectorAll('.list-group-item[data-view]');
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Get view from data attribute
                const view = this.getAttribute('data-view');
                console.log('Loading view:', view);
                
                // Load the view
                loadView(view);
            });
        });
        
        // Initialize notification dropdown
        const notificationDropdown = document.getElementById('notificationDropdown');
        if (notificationDropdown) {
            notificationDropdown.addEventListener('click', function() {
                updateNotificationDropdown();
            });
        }
        
        // Load initial view
        loadView('dashboard');
    }
    
    // Function to load different views
    function loadView(view) {
        console.log('Loading view:', view);
        const mainContent = document.getElementById('main-content');
        if (!mainContent) {
            console.error('main-content element not found');
            return;
        }
        currentView = view;
        
        // Update page title
        document.title = getViewTitle(view) + ' - Artist Dashboard - Beats';
        
        // Show loading indicator
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="loading-spinner mx-auto"></div>
                <p class="mt-3 text-fix">Loading ${getViewTitle(view)}...</p>
            </div>
        `;
        
        // Simulate loading delay
        setTimeout(() => {
            try {
                console.log('Setting content for view:', view);
                // Load the actual content
                mainContent.innerHTML = getViewContent(view);
                
                // Re-attach event listeners for the new content
                reattachEventListeners(view);
                
                // Initialize any required components
                initializeViewComponents(view);
                console.log('View loaded successfully:', view);
            } catch (error) {
                console.error('Error loading view:', error);
                mainContent.innerHTML = `
                    <div class="text-center py-5">
                        <div class="text-danger">Error loading ${getViewTitle(view)}</div>
                        <p class="text-muted">Please try refreshing the page</p>
                        <small class="text-muted">${error.message}</small>
                    </div>
                `;
            }
        }, 0);
    }
    
    // Function to get view title
    function getViewTitle(view) {
        const titles = {
            'dashboard': 'Dashboard Overview',
            'profile': 'Profile Management',
            'music': 'Music Uploads',
            'analytics': 'Performance & Analytics',
            'revenue': 'Revenue & Royalties',
            'subscription': 'Subscription Plan',
            'notifications': 'Notifications'
        };
        return titles[view] || 'Artist Dashboard';
    }
    
    // Function to get view content
    function getViewContent(view) {
        switch(view) {
            case 'dashboard':
                return getDashboardContent();
            case 'profile':
                return getProfileContent();
            case 'music':
                return getMusicContent();
            case 'analytics':
                return getAnalyticsContent();
            case 'revenue':
                return getRevenueContent();
            case 'subscription':
                return getSubscriptionContent();
            case 'notifications':
                return getNotificationsContent();
            default:
                return getDashboardContent();
        }
    }
    
    // Initialize view-specific components
    function initializeViewComponents(view) {
        switch(view) {
            case 'music':
                initializeAudioPlayers();
                break;
            case 'profile':
                initializeProfileImageUpload();
                break;
            case 'subscription':
                initializePaymentOptions();
                break;
            case 'notifications':
                updateNotificationDropdown();
                break;
        }
    }
    
    // Content for different views
    function getDashboardContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0 text-fix">Welcome back, Nova!</h1>
                <div class="d-flex">
                    <button class="btn btn-outline-secondary me-2">
                        <i class="fas fa-download me-2"></i>Export Data
                    </button>
                    <button class="btn btn-primary" id="uploadMusicBtn">
                        <i class="fas fa-plus me-2"></i>Upload Music
                    </button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Total Plays</h6>
                                    <h3 class="mb-0">${mockData.stats.totalPlays}</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 12.5%</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-play-circle"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Total Likes</h6>
                                    <h3 class="mb-0">${mockData.stats.totalLikes}</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 8.3%</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-heart"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Downloads</h6>
                                    <h3 class="mb-0">450K</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 5.7%</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-download"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Current Revenue</h6>
                                    <h3 class="mb-0">${mockData.stats.monthlyRevenue}</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 24.7%</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-dollar-sign"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="row mb-4">
                <div class="col-lg-8 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0 text-fix">Monthly Streams</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-5">
                                    <i class="fas fa-chart-line fa-4x text-muted mb-3"></i>
                                    <h5 class="text-fix">Stream Analytics</h5>
                                    <p class="text-muted text-secondary-fix">January 2024: 2.4M streams (+18.7% from Dec)</p>
                                    <div class="d-flex justify-content-center mt-3">
                                        <div class="progress w-75">
                                            <div class="progress-bar" style="width: 75%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0 text-fix">Revenue Growth</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-4">
                                    <i class="fas fa-chart-pie fa-4x text-muted mb-3"></i>
                                    <h5 class="text-fix">Revenue Distribution</h5>
                                    <div class="mt-3">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="text-fix">Streaming</span>
                                            <span class="text-primary">65%</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span class="text-fix">Downloads</span>
                                            <span class="text-primary">25%</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span class="text-fix">Other</span>
                                            <span class="text-primary">10%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity & Quick Stats -->
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0 text-fix">Recent Activity</h5>
                        </div>
                        <div class="card-body">
                            <div class="activity-timeline">
                                ${getActivityTimeline()}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0 text-fix">Quick Stats</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6 mb-3">
                                    <div class="text-center p-3 bg-dark rounded">
                                        <div class="h4 mb-1 text-primary">48</div>
                                        <small class="text-muted text-secondary-fix">Total Songs</small>
                                    </div>
                                </div>
                                <div class="col-6 mb-3">
                                    <div class="text-center p-3 bg-dark rounded">
                                        <div class="h4 mb-1 text-success">2.4M</div>
                                        <small class="text-muted text-secondary-fix">Followers</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center p-3 bg-dark rounded">
                                        <div class="h4 mb-1 text-warning">86%</div>
                                        <small class="text-muted text-secondary-fix">Completion Rate</small>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="text-center p-3 bg-dark rounded">
                                        <div class="h4 mb-1 text-info">42</div>
                                        <small class="text-muted text-secondary-fix">Countries</small>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-4">
                                <h6 class="mb-3 text-fix">Performance Insight</h6>
                                <div class="alert alert-info">
                                    <i class="fas fa-lightbulb me-2"></i>
                                    <strong class="text-fix">Tip:</strong> Your most played song this month is "Midnight Pulse" with 245K plays
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getProfileContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Profile Management</h1>
                <button class="btn btn-primary" id="saveProfileBtn">
                    <i class="fas fa-save me-2"></i>Save Changes
                </button>
            </div>

            <div class="row">
                <div class="col-lg-4 mb-4">
                    <!-- Profile Card -->
                    <div class="card">
                        <div class="card-body text-center p-4">
                            <div class="profile-avatar mb-3">
                                <img src="${mockData.profile.avatar}" 
                                     alt="${mockData.profile.name}" class="rounded-circle" width="120" height="120" id="profileAvatar">
                                <button class="btn btn-sm btn-outline-primary mt-2" id="changeAvatarBtn">
                                    <i class="fas fa-camera me-1"></i>Change Photo
                                </button>
                                <div id="avatarUploadProgress" class="mt-2" style="display: none;">
                                    <div class="progress" style="height: 5px;">
                                        <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                                    </div>
                                    <small class="text-muted">Uploading...</small>
                                </div>
                            </div>
                            <h4 class="card-title" id="artistNameDisplay">${mockData.profile.name}</h4>
                            <p class="text-muted">Electronic Music Producer</p>
                            <div class="d-flex justify-content-center mb-3">
                                <div class="text-center mx-3">
                                    <div class="h5 mb-0">2.4M</div>
                                    <small class="text-muted">Followers</small>
                                </div>
                                <div class="text-center mx-3">
                                    <div class="h5 mb-0">48</div>
                                    <small class="text-muted">Songs</small>
                                </div>
                                <div class="text-center mx-3">
                                    <div class="h5 mb-0">124M</div>
                                    <small class="text-muted">Plays</small>
                                </div>
                            </div>
                            <div class="artist-verification mb-3">
                                <span class="badge bg-success">
                                    <i class="fas fa-check-circle me-1"></i>Pro Artist
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Social Links -->
                    <div class="card mt-4">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Social Media</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label">Instagram</label>
                                <input type="text" class="form-control" value="@novarhythm" id="instagramInput">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Twitter</label>
                                <input type="text" class="form-control" value="@novarhythm" id="twitterInput">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">YouTube</label>
                                <input type="text" class="form-control" value="NovaRhythmMusic" id="youtubeInput">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">TikTok</label>
                                <input type="text" class="form-control" value="@novarhythm" id="tiktokInput">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Spotify</label>
                                <input type="text" class="form-control" value="NovaRhythm" id="spotifyInput">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">SoundCloud</label>
                                <input type="text" class="form-control" value="novarhythm" id="soundcloudInput">
                            </div>
                            <div>
                                <h6 class="mb-2">Preview & Test Links</h6>
                                <div class="d-flex flex-wrap gap-2" id="socialPreview">
                                    <!-- Social media icons will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-8">
                    <!-- Profile Details Form -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Profile Information</h5>
                        </div>
                        <div class="card-body">
                            <form id="artistProfileForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Artist Name *</label>
                                        <input type="text" class="form-control" value="${mockData.profile.name}" id="artistNameInput" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Real Name</label>
                                        <input type="text" class="form-control" value="Alex Johnson" id="realNameInput">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Bio</label>
                                    <textarea class="form-control" rows="4" id="bioInput">${mockData.profile.bio}</textarea>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Location</label>
                                        <input type="text" class="form-control" value="Los Angeles, CA" id="locationInput">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Website</label>
                                        <input type="url" class="form-control" value="https://novarhythm.com" id="websiteInput">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Primary Genre *</label>
                                    <select class="form-select" id="genreSelect" required>
                                        <option selected>Electronic</option>
                                        <option>Ambient</option>
                                        <option>Synthwave</option>
                                        <option>House</option>
                                        <option>Techno</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Notification Settings -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Notification Settings</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-4">
                                <h6 class="mb-3">Email Notifications</h6>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="notifNewFollowers" checked>
                                    <label class="form-check-label" for="notifNewFollowers">
                                        New followers
                                    </label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="notifComments" checked>
                                    <label class="form-check-label" for="notifComments">
                                        New comments
                                    </label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="notifStreamMilestones" checked>
                                    <label class="form-check-label" for="notifStreamMilestones">
                                        Stream milestones
                                    </label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="notifRevenueUpdates" checked>
                                    <label class="form-check-label" for="notifRevenueUpdates">
                                        Revenue updates
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="notifMarketing" checked>
                                    <label class="form-check-label" for="notifMarketing">
                                        Marketing emails
                                    </label>
                                </div>
                            </div>
                            
                            <div>
                                <button class="btn btn-primary" id="saveNotificationSettings">
                                    <i class="fas fa-save me-2"></i>Save Notification Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getMusicContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Music Uploads</h1>
                <button class="btn btn-primary" id="uploadNewSongBtn">
                    <i class="fas fa-plus me-2"></i>Upload New Song
                </button>
            </div>

            <!-- Upload Form -->
            <div class="row mb-4" id="uploadForm" style="display: none;">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Upload New Song</h5>
                        </div>
                        <div class="card-body">
                            <form id="songUploadForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Song Title *</label>
                                        <input type="text" class="form-control" placeholder="Enter song title" id="songTitleInput" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Genre *</label>
                                        <select class="form-select" id="songGenreSelect" required>
                                            <option value="">Select genre</option>
                                            <option>Electronic</option>
                                            <option>Pop</option>
                                            <option>Rock</option>
                                            <option>Hip Hop</option>
                                            <option>R&B</option>
                                            <option>Ambient</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Description</label>
                                    <textarea class="form-control" rows="3" placeholder="Tell listeners about this song..." id="songDescription"></textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Audio File *</label>
                                    <div class="upload-area" id="audioUploadArea">
                                        <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                                        <h5>Drop audio file here or click to upload</h5>
                                        <p class="text-muted">MP3, WAV, FLAC up to 50MB</p>
                                        <input type="file" class="d-none" id="audioFileInput" accept="audio/*">
                                    </div>
                                    <div id="audioUploadProgress" class="mt-2" style="display: none;">
                                        <div class="progress" style="height: 5px;">
                                            <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                                        </div>
                                        <small class="text-muted">Uploading...</small>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="explicitContent">
                                    <label class="form-check-label" for="explicitContent">
                                        This song contains explicit content
                                    </label>
                                </div>
                                <div class="mb-3">
                                    <label for="coverArtInput" class="form-label">Cover Art (Optional)</label>
                                    <div class="upload-area border-dashed p-3 text-center" id="coverArtUploadArea" style="cursor: pointer; border: 2px dashed #dee2e6; border-radius: 8px;">
                                        <i class="fas fa-image fa-2x text-muted mb-2"></i>
                                        <h6>Click to upload cover art</h6>
                                        <p class="text-muted small">JPEG, PNG, GIF up to 5MB</p>
                                        <input type="file" class="d-none" id="coverArtInput" accept="image/*">
                                    </div>
                                    <div id="coverArtPreview" class="mt-2" style="display: none;">
                                        <img id="coverArtImg" class="img-thumbnail" style="max-width: 150px; max-height: 150px;">
                                        <button type="button" class="btn btn-sm btn-outline-danger ms-2" id="removeCoverArt">Remove</button>
                                    </div>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="rightsConfirm" required>
                                    <label class="form-check-label" for="rightsConfirm">
                                        I own all rights to this recording
                                    </label>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-outline-secondary me-2" id="cancelUploadBtn">
                                        Cancel
                                    </button>
                                    <button type="submit" class="btn btn-primary" id="submitUploadBtn">
                                        <i class="fas fa-upload me-2"></i>Upload Song
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Songs Table -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Your Songs</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Song Title</th>
                                            <th>Genre</th>
                                            <th>Upload Date</th>
                                            <th>Plays</th>
                                            <th>Likes</th>
                                            <th>Downloads</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="songsTableBody">
                                        ${getSongsTableRows()}
                                    </tbody>
                                </table>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <div class="text-muted">
                                    Showing ${uploadedSongs.length} of ${uploadedSongs.length + 43} songs
                                </div>
                                <nav>
                                    <ul class="pagination mb-0">
                                        <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
                                        <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                        <li class="page-item"><a class="page-link" href="#">2</a></li>
                                        <li class="page-item"><a class="page-link" href="#">3</a></li>
                                        <li class="page-item"><a class="page-link" href="#">Next</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getAnalyticsContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Performance & Analytics</h1>
                <div class="d-flex">
                    <div class="dropdown me-2">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Last 30 Days
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" data-period="7">Last 7 Days</a></li>
                            <li><a class="dropdown-item active" href="#" data-period="30">Last 30 Days</a></li>
                            <li><a class="dropdown-item" href="#" data-period="90">Last 90 Days</a></li>
                        </ul>
                    </div>
                    <button class="btn btn-primary">
                        <i class="fas fa-download me-2"></i>Export Report
                    </button>
                </div>
            </div>

            <!-- Detailed Stats -->
            <div class="row mb-4">
                <div class="col-md-3 col-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body text-center">
                            <h6 class="text-muted mb-2">Avg. Plays/Day</h6>
                            <h3 class="mb-0">8.2K</h3>
                            <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 12.3%</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body text-center">
                            <h6 class="text-muted mb-2">Completion Rate</h6>
                            <h3 class="mb-0">86%</h3>
                            <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 2.1%</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body text-center">
                            <h6 class="text-muted mb-2">Skip Rate</h6>
                            <h3 class="mb-0">14%</h3>
                            <span class="text-danger small"><i class="fas fa-arrow-down me-1"></i> 1.8%</span>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 col-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body text-center">
                            <h6 class="text-muted mb-2">Avg. Listen Time</h6>
                            <h3 class="mb-0">2:45</h3>
                            <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 5.2%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Performance Charts -->
            <div class="row mb-4">
                <div class="col-lg-8 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Song Performance</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-4">
                                    <i class="fas fa-chart-bar fa-4x text-muted mb-3"></i>
                                    <h5>Top Performing Songs</h5>
                                    <div class="mt-4">
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="flex-shrink-0 me-3">
                                                <div class="bg-primary rounded" style="width: 80%; height: 20px;"></div>
                                            </div>
                                            <div class="flex-grow-1">
                                                <small>Midnight Pulse - 245K plays</small>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="flex-shrink-0 me-3">
                                                <div class="bg-primary rounded" style="width: 65%; height: 20px;"></div>
                                            </div>
                                            <div class="flex-grow-1">
                                                <small>Dreamscape - 182K plays</small>
                                            </div>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <div class="flex-shrink-0 me-3">
                                                <div class="bg-primary rounded" style="width: 50%; height: 20px;"></div>
                                            </div>
                                            <div class="flex-grow-1">
                                                <small>Solar Flare - 158K plays</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Audience Demographics</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-4">
                                    <i class="fas fa-users fa-4x text-muted mb-3"></i>
                                    <h5>Audience Insights</h5>
                                    <div class="mt-3">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>18-24</span>
                                            <span class="text-primary">32%</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>25-34</span>
                                            <span class="text-primary">45%</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>35+</span>
                                            <span class="text-primary">23%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Insights Section -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Performance Insights</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="alert alert-info">
                                        <h6><i class="fas fa-lightbulb me-2"></i>Best Time to Post</h6>
                                        <p class="mb-0 small">Your audience is most active between 6-9 PM EST</p>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="alert alert-success">
                                        <h6><i class="fas fa-trophy me-2"></i>Top Song</h6>
                                        <p class="mb-0 small">"Midnight Pulse" gained 45K new plays this week</p>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="alert alert-warning">
                                        <h6><i class="fas fa-chart-line me-2"></i>Growth Opportunity</h6>
                                        <p class="mb-0 small">Try releasing more content on Fridays</p>
                                    </div>
                                </div>
                            </div>
                            <div class="mt-3">
                                <h6>Recommendations</h6>
                                <ul class="list-unstyled">
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Your most played song this month is "Midnight Pulse"</li>
                                    <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Engagement is highest when you post at 8 PM EST</li>
                                    <li><i class="fas fa-check text-success me-2"></i> Consider creating a playlist of your top 5 songs</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getRevenueContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Revenue & Royalties</h1>
                <button class="btn btn-primary" id="withdrawEarningsBtn" ${parseFloat(mockData.stats.availableForWithdrawal.replace(/[^0-9.-]+/g,"")) < 50 ? 'disabled' : ''}>
                    <i class="fas fa-money-check-alt me-2"></i>Withdraw Earnings
                </button>
            </div>

            <!-- Revenue Summary -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Total Earnings</h6>
                                    <h3 class="mb-0">${mockData.stats.totalRevenue}</h3>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-wallet"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">This Month</h6>
                                    <h3 class="mb-0">${mockData.stats.monthlyRevenue}</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 24.7%</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-calendar-alt"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Pending Payout</h6>
                                    <h3 class="mb-0">${mockData.stats.pendingPayouts}</h3>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Available for Withdrawal</h6>
                                    <h3 class="mb-0">${mockData.stats.availableForWithdrawal}</h3>
                                    ${parseFloat(mockData.stats.availableForWithdrawal.replace(/[^0-9.-]+/g,"")) < 50 ? 
                                    '<small class="text-warning">Min. $50 required</small>' : 
                                    '<span class="text-success small">Ready to withdraw</span>'}
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-money-bill-wave"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Revenue Chart -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Revenue Overview</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-4">
                                    <i class="fas fa-chart-line fa-4x text-muted mb-3"></i>
                                    <h5>Monthly Revenue</h5>
                                    <p class="text-muted">Steady growth of 18.7% month over month</p>
                                    <div class="d-flex justify-content-center mt-3">
                                        <div class="mx-3 text-center">
                                            <div class="h4 mb-0 text-success">$245K</div>
                                            <small class="text-muted">Total Revenue</small>
                                        </div>
                                        <div class="mx-3 text-center">
                                            <div class="h4 mb-0 text-primary">$18.2K</div>
                                            <small class="text-muted">Avg Monthly</small>
                                        </div>
                                        <div class="mx-3 text-center">
                                            <div class="h4 mb-0 text-warning">24.7%</div>
                                            <small class="text-muted">Growth Rate</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Withdrawal Section -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Withdraw Earnings</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label class="form-label">Available Balance</label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="text" class="form-control" value="${mockData.stats.availableForWithdrawal.replace('$', '')}" readonly>
                                            <button class="btn btn-outline-primary" type="button" id="withdrawAllBtn">Withdraw All</button>
                                        </div>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Withdrawal Amount *</label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="number" class="form-control" id="withdrawAmount" 
                                                   min="50" 
                                                   max="${parseFloat(mockData.stats.availableForWithdrawal.replace(/[^0-9.-]+/g,""))}" 
                                                   step="0.01"
                                                   placeholder="Enter amount">
                                        </div>
                                        <small class="text-muted">Minimum withdrawal: $50</small>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Payment Method</label>
                                        <select class="form-select" id="withdrawMethod">
                                            <option value="paypal">PayPal</option>
                                            <option value="bank">Bank Transfer</option>
                                            <option value="stripe">Credit/Debit Card</option>
                                        </select>
                                    </div>
                                    <button class="btn btn-primary" id="processWithdrawalBtn">
                                        <i class="fas fa-money-check-alt me-2"></i>Process Withdrawal
                                    </button>
                                </div>
                                <div class="col-md-4">
                                    <div class="alert alert-info">
                                        <h6><i class="fas fa-info-circle me-2"></i>Withdrawal Info</h6>
                                        <p class="small mb-1">• Processed within 3-5 business days</p>
                                        <p class="small mb-1">• $2 processing fee per transaction</p>
                                        <p class="small mb-1">• Minimum withdrawal: $50</p>
                                        <p class="small mb-0">• Maximum withdrawal: $10,000/day</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Royalties Breakdown -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Royalties Breakdown</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Source</th>
                                            <th>Streams/Plays</th>
                                            <th>Rate</th>
                                            <th>Earnings</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Beats Streaming</td>
                                            <td>2.4M</td>
                                            <td>$0.004/stream</td>
                                            <td>$9,600</td>
                                            <td><span class="badge bg-success">Paid</span></td>
                                        </tr>
                                        <tr>
                                            <td>Song Downloads</td>
                                            <td>8,240</td>
                                            <td>$0.99/download</td>
                                            <td>$8,157</td>
                                            <td><span class="badge bg-success">Paid</span></td>
                                        </tr>
                                        <tr>
                                            <td>YouTube Content ID</td>
                                            <td>450K</td>
                                            <td>$0.001/view</td>
                                            <td>$450</td>
                                            <td><span class="badge bg-warning">Pending</span></td>
                                        </tr>
                                        <tr>
                                            <td>Sync Licensing</td>
                                            <td>12</td>
                                            <td>$500/license</td>
                                            <td>$6,000</td>
                                            <td><span class="badge bg-success">Paid</span></td>
                                        </tr>
                                        <tr>
                                            <td>Merchandise Sales</td>
                                            <td>320</td>
                                            <td>$25/sale</td>
                                            <td>$8,000</td>
                                            <td><span class="badge bg-warning">Pending</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="mt-4">
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>Note:</strong> Payouts are processed on the 15th of each month. Minimum withdrawal amount is $50.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getSubscriptionContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Subscription Plan</h1>
                <button class="btn btn-primary" id="manageBillingBtn">
                    <i class="fas fa-credit-card me-2"></i>Manage Billing & Payments
                </button>
            </div>

            <!-- Current Plan -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 class="mb-1">Current Plan: <span class="text-primary">Pro Artist</span></h5>
                                    <p class="text-muted mb-0">Renews on February 15, 2024</p>
                                    <small class="text-success"><i class="fas fa-check-circle me-1"></i> Active</small>
                                </div>
                                <div>
                                    <h4 class="mb-0">$29.99<span class="text-muted small">/month</span></h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Plans Comparison -->
            <div class="row mb-4">
                <div class="col-lg-4 mb-4">
                    <div class="card plan-card">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Free</h5>
                            <h2 class="mb-3">$0<span class="text-muted small">/month</span></h2>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Upload up to 5 songs</li>
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Basic analytics</li>
                                <li class="mb-2"><i class="fas fa-times text-muted me-2"></i> <span class="text-muted">Advanced analytics</span></li>
                                <li class="mb-2"><i class="fas fa-times text-muted me-2"></i> <span class="text-muted">Priority support</span></li>
                                <li><i class="fas fa-times text-muted me-2"></i> <span class="text-muted">Custom artist page</span></li>
                            </ul>
                            <button class="btn btn-outline-primary w-100 ${currentPlan === 'Free' ? 'disabled' : ''}" data-plan="Free" data-price="0">
                                ${currentPlan === 'Free' ? 'Current Plan' : 'Select Free'}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="card plan-card featured">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Pro Artist</h5>
                            <h2 class="mb-3">$29.99<span class="text-muted small">/month</span></h2>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Unlimited uploads</li>
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Advanced analytics</li>
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Priority support</li>
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Custom artist page</li>
                                <li><i class="fas fa-check text-success me-2"></i> Higher revenue share (85%)</li>
                            </ul>
                            <button class="btn btn-primary w-100 ${currentPlan === 'Pro' ? 'disabled' : ''}" data-plan="Pro" data-price="29.99">
                                ${currentPlan === 'Pro' ? 'Current Plan' : 'Upgrade to Pro'}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="card plan-card">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Premium</h5>
                            <h2 class="mb-3">$49.99<span class="text-muted small">/month</span></h2>
                            <ul class="list-unstyled mb-4">
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Everything in Pro</li>
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Featured placements</li>
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Dedicated manager</li>
                                <li class="mb-2"><i class="fas fa-check text-success me-2"></i> Promotional campaigns</li>
                                <li><i class="fas fa-check text-success me-2"></i> Highest revenue share (90%)</li>
                            </ul>
                            <button class="btn btn-outline-primary w-100 ${currentPlan === 'Premium' ? 'disabled' : ''}" data-plan="Premium" data-price="49.99">
                                ${currentPlan === 'Premium' ? 'Current Plan' : 'Go Premium'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Billing Management -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Billing Information</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6>Payment Method</h6>
                                    <div class="d-flex align-items-center mb-3">
                                        <div class="me-3">
                                            <i class="fas fa-credit-card fa-2x text-muted"></i>
                                        </div>
                                        <div>
                                            <p class="mb-0">Visa ending in 4242</p>
                                            <small class="text-muted">Expires 12/25</small>
                                        </div>
                                    </div>
                                    <button class="btn btn-outline-primary btn-sm" id="updatePaymentMethodBtn">
                                        <i class="fas fa-edit me-2"></i>Update Payment Method
                                    </button>
                                </div>
                                <div class="col-md-6">
                                    <h6>Billing History</h6>
                                    <div class="table-responsive">
                                        <table class="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Jan 15, 2024</td>
                                                    <td>$29.99</td>
                                                    <td><span class="badge bg-success">Paid</span></td>
                                                </tr>
                                                <tr>
                                                    <td>Dec 15, 2023</td>
                                                    <td>$29.99</td>
                                                    <td><span class="badge bg-success">Paid</span></td>
                                                </tr>
                                                <tr>
                                                    <td>Nov 15, 2023</td>
                                                    <td>$29.99</td>
                                                    <td><span class="badge bg-success">Paid</span></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getNotificationsContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Notifications</h1>
                <div>
                    <button class="btn btn-outline-primary me-2" id="markAllReadBtn">
                        <i class="fas fa-check-double me-2"></i>Mark All as Read
                    </button>
                    <button class="btn btn-outline-secondary" id="clearNotificationsBtn">
                        <i class="fas fa-trash me-2"></i>Clear All
                    </button>
                </div>
            </div>

            <!-- Notification Settings -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Notification Settings</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="emailNotifications" checked>
                                        <label class="form-check-label" for="emailNotifications">
                                            Email Notifications
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="pushNotifications" checked>
                                        <label class="form-check-label" for="pushNotifications">
                                            Push Notifications
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="form-check form-switch">
                                        <input class="form-check-input" type="checkbox" id="smsNotifications">
                                        <label class="form-check-label" for="smsNotifications">
                                            SMS Notifications
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <button class="btn btn-primary" id="saveNotificationSettingsBtn">
                                <i class="fas fa-save me-2"></i>Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notifications List -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Recent Notifications</h5>
                        </div>
                        <div class="card-body">
                            <div id="notificationsList">
                                ${getNotificationsList()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Helper functions for generating content
    function getActivityTimeline() {
        const activities = [
            {time: '2 hours ago', action: 'Uploaded new song "Cosmic Drift"', type: 'upload'},
            {time: '1 day ago', action: 'Reached 100K streams on "Midnight Pulse"', type: 'milestone'},
            {time: '2 days ago', action: 'Gained 5,420 new followers', type: 'followers'},
            {time: '1 week ago', action: 'Payment of $8,450 processed', type: 'payment'},
            {time: '2 weeks ago', action: 'Featured on "Electronic Essentials" playlist', type: 'feature'}
        ];
        
        return activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    <i class="fas fa-${activity.type === 'upload' ? 'upload' : activity.type === 'milestone' ? 'trophy' : activity.type === 'followers' ? 'users' : activity.type === 'payment' ? 'dollar-sign' : 'star'}"></i>
                </div>
                <div class="activity-content">
                    <p class="mb-1">${activity.action}</p>
                    <small class="text-muted">${activity.time}</small>
                </div>
            </div>
        `).join('');
    }
    
    function getSongsTableRows() {
        return uploadedSongs.map(song => `
            <tr>
                <td>${song.id}</td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="song-cover me-3">
                            <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="${song.title}" class="rounded">
                        </div>
                        <div>
                            <div class="fw-bold">${song.title}</div>
                            <div class="text-muted small">${song.genre}</div>
                        </div>
                    </div>
                </td>
                <td>${song.genre}</td>
                <td>${song.date}</td>
                <td>${song.plays}</td>
                <td>${song.likes}</td>
                <td>${song.downloads}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 play-song-btn" data-id="${song.id}" data-title="${song.title}" data-genre="${song.genre}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary me-1 edit-song-btn" data-id="${song.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-song-btn" data-id="${song.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    function getNotificationsList() {
        return mockData.notifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'} mb-3 p-3 bg-dark rounded" data-id="${notification.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${notification.title}</h6>
                        <p class="mb-1">${notification.message}</p>
                        <small class="text-muted">${notification.time}</small>
                    </div>
                    <div>
                        ${!notification.read ? `
                            <button class="btn btn-sm btn-outline-primary mark-read-btn" data-id="${notification.id}">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-danger ms-1 delete-notification-btn" data-id="${notification.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    function updateNotificationDropdown() {
        const dropdownContainer = document.querySelector('.dropdown-notifications');
        if (!dropdownContainer) return;
        
        const unreadNotifications = mockData.notifications.filter(n => !n.read);
        const notificationCount = document.getElementById('notificationCount');
        const topNotificationCount = document.getElementById('topNotificationCount');
        
        if (notificationCount) notificationCount.textContent = unreadNotifications.length;
        if (topNotificationCount) topNotificationCount.textContent = unreadNotifications.length;
        
        if (unreadNotifications.length === 0) {
            dropdownContainer.innerHTML = `
                <div class="p-3 text-center">
                    <p class="text-muted mb-0">No new notifications</p>
                </div>
            `;
        } else {
            dropdownContainer.innerHTML = unreadNotifications.slice(0, 3).map(notification => `
                <a href="#" class="dropdown-item d-flex align-items-center py-2 border-bottom" data-id="${notification.id}">
                    <div class="flex-shrink-0 me-3">
                        <i class="fas fa-bell text-primary"></i>
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-0 small">${notification.title}</h6>
                        <p class="mb-0 small text-muted">${notification.message}</p>
                        <small class="text-muted">${notification.time}</small>
                    </div>
                </a>
            `).join('');
        }
    }
    
    // Initialize audio players
    function initializeAudioPlayers() {
        // Play song button
        document.querySelectorAll('.play-song-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const songTitle = this.getAttribute('data-title');
                const songGenre = this.getAttribute('data-genre');
                
                // Update modal content
                document.getElementById('playingSongTitle').textContent = songTitle;
                document.getElementById('playingSongGenre').textContent = songGenre;
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('audioPlayerModal'));
                modal.show();
                
                // Initialize audio player
                initializeAudioPlayer();
            });
        });
    }
    
    function initializeAudioPlayer() {
        let isPlaying = false;
        
        const playPauseBtn = document.getElementById('playPauseBtn');
        const playPauseIcon = document.getElementById('playPauseIcon');
        
        // Remove existing event listeners by cloning and replacing
        const newPlayPauseBtn = playPauseBtn.cloneNode(true);
        playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
        
        newPlayPauseBtn.addEventListener('click', function() {
            const songTitle = document.getElementById('playingSongTitle').textContent;
            
            if (!isPlaying) {
                // Start playing
                isPlaying = true;
                this.innerHTML = '<i class="fas fa-pause"></i>';
                showNotification(`Now playing "${songTitle}"`, 'success');
            } else {
                // Pause
                isPlaying = false;
                this.innerHTML = '<i class="fas fa-play"></i>';
                showNotification(`Paused "${songTitle}"`, 'info');
            }
        });
        
        // Volume controls
        const volumeBtn = document.getElementById('volumeBtn');
        const volumeSlider = document.getElementById('volumeSlider');
        const volumeContainer = volumeBtn.nextElementSibling;
        
        volumeBtn.addEventListener('click', function() {
            volumeContainer.style.display = volumeContainer.style.display === 'none' ? 'block' : 'none';
        });
        
        volumeSlider.addEventListener('input', function() {
            const icon = volumeBtn.querySelector('i');
            const volume = parseInt(this.value);
            
            if (volume === 0) {
                icon.className = 'fas fa-volume-mute';
            } else if (volume < 50) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        });
        
        // Download button
        document.getElementById('downloadBtn').addEventListener('click', function() {
            const songTitle = document.getElementById('playingSongTitle').textContent;
            showNotification(`Downloading "${songTitle}"...`, 'info');
        });
    }
    
    // Initialize profile image upload
    function initializeProfileImageUpload() {
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        const avatarFileInput = document.getElementById('avatarFileInput');
        const profileAvatar = document.getElementById('profileAvatar');
        const uploadProgress = document.getElementById('avatarUploadProgress');
        
        if (changeAvatarBtn) {
            // Create file input if it doesn't exist
            if (!avatarFileInput) {
                const input = document.createElement('input');
                input.type = 'file';
                input.id = 'avatarFileInput';
                input.accept = 'image/*';
                input.className = 'd-none';
                document.body.appendChild(input);
                
                input.addEventListener('change', function() {
                    if (this.files.length > 0) {
                        const file = this.files[0];
                        
                        // Validate file type
                        if (!file.type.match('image.*')) {
                            showNotification('Please select an image file', 'danger');
                            return;
                        }
                        
                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                            showNotification('Image size should be less than 5MB', 'danger');
                            return;
                        }
                        
                        // Show upload progress
                        if (uploadProgress) {
                            uploadProgress.style.display = 'block';
                            const progressBar = uploadProgress.querySelector('.progress-bar');
                            
                            // Simulate upload
                            let progress = 0;
                            const interval = setInterval(() => {
                                progress += 10;
                                progressBar.style.width = `${progress}%`;
                                
                                if (progress >= 100) {
                                    clearInterval(interval);
                                    
                                    // Create preview
                                    const reader = new FileReader();
                                    reader.onload = function(e) {
                                        // Update avatar
                                        profileAvatar.src = e.target.result;
                                        
                                        // Update top bar image
                                        const topBarImage = document.getElementById('topBarProfileImage');
                                        if (topBarImage) {
                                            topBarImage.src = e.target.result;
                                        }
                                        
                                        // Hide progress
                                        setTimeout(() => {
                                            if (uploadProgress) {
                                                uploadProgress.style.display = 'none';
                                                progressBar.style.width = '0%';
                                            }
                                            
                                            // Show success message
                                            showNotification('Profile photo updated successfully!', 'success');
                                        }, 500);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }, 100);
                        }
                    }
                });
                
                changeAvatarBtn.addEventListener('click', function() {
                    input.click();
                });
            }
        }
    }
    
    // Initialize payment options
    function initializePaymentOptions() {
        // Plan selection buttons
        document.querySelectorAll('.plan-card .btn').forEach(btn => {
            if (!btn.classList.contains('disabled')) {
                btn.addEventListener('click', function() {
                    const selectedPlan = this.getAttribute('data-plan');
                    const selectedPrice = this.getAttribute('data-price');
                    
                    // Update payment modal
                    document.getElementById('selectedPlanName').textContent = selectedPlan;
                    document.getElementById('selectedPlanPrice').textContent = selectedPrice;
                    
                    // Show payment modal
                    const modal = new bootstrap.Modal(document.getElementById('paymentModal'));
                    modal.show();
                });
            }
        });
        
        // Payment method toggle
        document.querySelectorAll('input[name="paymentMethod"]').forEach(method => {
            method.addEventListener('change', function() {
                const value = this.value;
                
                // Hide all forms
                document.getElementById('creditCardForm').style.display = 'none';
                document.getElementById('paypalInfo').style.display = 'none';
                document.getElementById('applePayInfo').style.display = 'none';
                
                // Show selected form
                if (value === 'creditCard') {
                    document.getElementById('creditCardForm').style.display = 'block';
                } else if (value === 'paypal') {
                    document.getElementById('paypalInfo').style.display = 'block';
                } else if (value === 'applePay') {
                    document.getElementById('applePayInfo').style.display = 'block';
                }
            });
        });
        
        // Process payment button
        const processPaymentBtn = document.getElementById('processPaymentBtn');
        if (processPaymentBtn) {
            processPaymentBtn.addEventListener('click', function() {
                const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
                let isValid = true;
                
                if (selectedMethod === 'creditCard') {
                    // Validate credit card details
                    const cardNumber = document.getElementById('cardNumber').value.trim();
                    const cardExpiry = document.getElementById('cardExpiry').value.trim();
                    const cardCVV = document.getElementById('cardCVV').value.trim();
                    const cardName = document.getElementById('cardName').value.trim();
                    
                    if (!cardNumber || cardNumber.length < 16) {
                        showNotification('Please enter a valid card number', 'danger');
                        isValid = false;
                    }
                    
                    if (!cardExpiry || !cardExpiry.match(/^\d{2}\/\d{2}$/)) {
                        showNotification('Please enter a valid expiry date (MM/YY)', 'danger');
                        isValid = false;
                    }
                    
                    if (!cardCVV || cardCVV.length < 3) {
                        showNotification('Please enter a valid CVV', 'danger');
                        isValid = false;
                    }
                    
                    if (!cardName) {
                        showNotification('Please enter cardholder name', 'danger');
                        isValid = false;
                    }
                }
                
                if (isValid) {
                    // Disable button and show processing
                    this.disabled = true;
                    const originalText = this.textContent;
                    this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
                    
                    // Simulate payment processing
                    setTimeout(() => {
                        this.disabled = false;
                        this.textContent = originalText;
                        
                        // Close modal
                        bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
                        
                        // Show success message
                        showNotification('Payment processed successfully!', 'success');
                    }, 2000);
                }
            });
        }
        
        // Manage billing button
        const manageBillingBtn = document.getElementById('manageBillingBtn');
        if (manageBillingBtn) {
            manageBillingBtn.addEventListener('click', function() {
                // Show manage billing modal
                const modal = new bootstrap.Modal(document.getElementById('manageBillingModal'));
                modal.show();
            });
        }
    }
    
    // Re-attach event listeners after content loads
    function reattachEventListeners(view) {
        // Common event listeners
        attachCommonListeners();
        
        // View-specific event listeners
        switch(view) {
            case 'dashboard':
                attachDashboardListeners();
                break;
            case 'profile':
                attachProfileListeners();
                break;
            case 'music':
                attachMusicListeners();
                break;
            case 'analytics':
                attachAnalyticsListeners();
                break;
            case 'revenue':
                attachRevenueListeners();
                break;
            case 'subscription':
                attachSubscriptionListeners();
                break;
            case 'notifications':
                attachNotificationsListeners();
                break;
        }
    }
    
    function attachCommonListeners() {
        // Save profile button
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', function() {
                // Get form values
                const artistName = document.getElementById('artistNameInput')?.value || mockData.profile.name;
                const bio = document.getElementById('bioInput')?.value || mockData.profile.bio;
                
                // Update mock data
                mockData.profile.name = artistName;
                mockData.profile.bio = bio;
                
                // Update display
                const nameDisplay = document.getElementById('artistNameDisplay');
                if (nameDisplay) nameDisplay.textContent = artistName;
                
                // Update top bar
                const topBarName = document.getElementById('topBarArtistName');
                if (topBarName) topBarName.textContent = artistName;
                
                showNotification('Profile updated successfully!', 'success');
            });
        }
        
        // Save notification settings in profile
        const saveNotificationSettings = document.getElementById('saveNotificationSettings');
        if (saveNotificationSettings) {
            saveNotificationSettings.addEventListener('click', function() {
                showNotification('Notification settings saved successfully!', 'success');
            });
        }
    }
    
    function attachDashboardListeners() {
        // Upload music button
        const uploadMusicBtn = document.getElementById('uploadMusicBtn');
        if (uploadMusicBtn) {
            uploadMusicBtn.addEventListener('click', function() {
                // Switch to music view and show upload modal
                loadView('music');
                setTimeout(() => {
                    const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));
                    uploadModal.show();
                }, 100);
            });
        }
        
        // Export data button - find by class and text content
        const buttons = document.querySelectorAll('button.btn-outline-secondary');
        const exportBtn = Array.from(buttons).find(btn => btn.textContent.includes('Export Data'));
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                showNotification('Data export started. You will receive an email when ready.', 'info');
            });
        }
    }
    
    function attachProfileListeners() {
        // Update social media preview when inputs change
        const socialInputs = ['instagramInput', 'twitterInput', 'youtubeInput', 'tiktokInput', 'spotifyInput', 'soundcloudInput'];
        socialInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', updateSocialPreview);
            }
        });
        
        // Initialize social preview
        updateSocialPreview();
    }
    
    function updateSocialPreview() {
        console.log('Updating social preview');
        const previewContainer = document.getElementById('socialPreview');
        if (!previewContainer) {
            console.error('socialPreview container not found');
            return;
        }
        
        const instagram = document.getElementById('instagramInput')?.value?.trim();
        const twitter = document.getElementById('twitterInput')?.value?.trim();
        const youtube = document.getElementById('youtubeInput')?.value?.trim();
        const tiktok = document.getElementById('tiktokInput')?.value?.trim();
        const spotify = document.getElementById('spotifyInput')?.value?.trim();
        const soundcloud = document.getElementById('soundcloudInput')?.value?.trim();
        
        console.log('Social values:', {instagram, twitter, youtube, tiktok, spotify, soundcloud});
        
        let html = '';
        
        if (instagram) {
            const handle = instagram.startsWith('@') ? instagram.substring(1) : instagram;
            html += `<a href="https://instagram.com/${handle}" target="_blank" class="social-icon instagram" title="Instagram"><i class="fab fa-instagram"></i></a>`;
        }
        if (twitter) {
            const handle = twitter.startsWith('@') ? twitter.substring(1) : twitter;
            html += `<a href="https://twitter.com/${handle}" target="_blank" class="social-icon twitter" title="Twitter"><i class="fab fa-twitter"></i></a>`;
        }
        if (youtube) {
            html += `<a href="https://youtube.com/${youtube.startsWith('@') ? '' : '@'}${youtube}" target="_blank" class="social-icon youtube" title="YouTube"><i class="fab fa-youtube"></i></a>`;
        }
        if (tiktok) {
            const handle = tiktok.startsWith('@') ? tiktok.substring(1) : tiktok;
            html += `<a href="https://tiktok.com/@${handle}" target="_blank" class="social-icon tiktok" title="TikTok"><i class="fab fa-tiktok"></i></a>`;
        }
        if (spotify) {
            html += `<a href="https://open.spotify.com/artist/${spotify}" target="_blank" class="social-icon spotify" title="Spotify"><i class="fab fa-spotify"></i></a>`;
        }
        if (soundcloud) {
            html += `<a href="https://soundcloud.com/${soundcloud}" target="_blank" class="social-icon soundcloud" title="SoundCloud"><i class="fab fa-soundcloud"></i></a>`;
        }
        
        console.log('Generated HTML:', html);
        previewContainer.innerHTML = html || '<small class="text-muted">No social media links set</small>';
    }
    
    function attachMusicListeners() {
        // Upload new song button
        const uploadNewSongBtn = document.getElementById('uploadNewSongBtn');
        const uploadForm = document.getElementById('uploadForm');
        
        if (uploadNewSongBtn && uploadForm) {
            uploadNewSongBtn.addEventListener('click', function() {
                uploadForm.style.display = uploadForm.style.display === 'none' ? 'block' : 'none';
            });
        }
        
        // Cancel upload button
        const cancelUploadBtn = document.getElementById('cancelUploadBtn');
        if (cancelUploadBtn && uploadForm) {
            cancelUploadBtn.addEventListener('click', function() {
                uploadForm.style.display = 'none';
                const songUploadForm = document.getElementById('songUploadForm');
                if (songUploadForm) songUploadForm.reset();
            });
        }
        
        // Audio upload area
        const audioUploadArea = document.getElementById('audioUploadArea');
        if (audioUploadArea) {
            audioUploadArea.addEventListener('click', function() {
                const audioFileInput = document.getElementById('audioFileInput');
                if (audioFileInput) audioFileInput.click();
            });
        }

        // Cover art upload area
        const coverArtUploadArea = document.getElementById('coverArtUploadArea');
        const coverArtInput = document.getElementById('coverArtInput');
        const coverArtPreview = document.getElementById('coverArtPreview');
        const coverArtImg = document.getElementById('coverArtImg');
        const removeCoverArtBtn = document.getElementById('removeCoverArt');

        if (coverArtUploadArea && coverArtInput) {
            coverArtUploadArea.addEventListener('click', function() {
                coverArtInput.click();
            });

            coverArtInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        coverArtImg.src = e.target.result;
                        coverArtPreview.style.display = 'block';
                        coverArtUploadArea.style.display = 'none';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (removeCoverArtBtn) {
            removeCoverArtBtn.addEventListener('click', function() {
                coverArtInput.value = '';
                coverArtPreview.style.display = 'none';
                coverArtUploadArea.style.display = 'block';
            });
        }
        
        // Song upload form
        const songUploadForm = document.getElementById('songUploadForm');
        if (songUploadForm) {
            songUploadForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                const songTitle = document.getElementById('songTitleInput')?.value;
                const songGenre = document.getElementById('songGenreSelect')?.value;
                const audioFileInput = document.getElementById('audioFileInput');
                const coverArtInput = document.getElementById('coverArtInput');

                if (!songTitle || !songGenre) {
                    showNotification('Please fill in all required fields', 'danger');
                    return;
                }

                if (!audioFileInput || !audioFileInput.files[0]) {
                    showNotification('Please select a song file to upload', 'danger');
                    return;
                }

                const submitBtn = document.getElementById('submitUploadBtn');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
                submitBtn.disabled = true;

                try {
                    // Create FormData for file upload
                    const formData = new FormData();
                    formData.append('upload_type', 'song');
                    formData.append('title', songTitle);
                    formData.append('genre', songGenre);
                    formData.append('song_file', audioFileInput.files[0]);

                    // Add cover art if provided
                    if (coverArtInput && coverArtInput.files[0]) {
                        formData.append('cover_art', coverArtInput.files[0]);
                    }

                    // Make API call to upload
                    const response = await fetch('../backend/api/upload.php', {
                        method: 'POST',
                        body: formData,
                        credentials: 'include'
                    });

                    const result = await response.json();

                    if (result.success) {
                        showNotification(`"${songTitle}" uploaded successfully! It will be available after review.`, 'success');

                        // Reset form and hide upload form
                        songUploadForm.reset();
                        if (uploadForm) uploadForm.style.display = 'none';

                        // Optionally refresh the songs list
                        // You might want to reload the page or refresh the songs table
                        setTimeout(() => {
                            window.location.reload(); // Simple refresh for now
                        }, 1500);

                    } else {
                        showNotification(result.message || 'Upload failed', 'danger');
                    }

                } catch (error) {
                    console.error('Upload error:', error);
                    showNotification('Upload failed. Please try again.', 'danger');
                } finally {
                    // Reset button
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
        }
        
        // Edit song buttons
        document.querySelectorAll('.edit-song-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = this.getAttribute('data-id');
                const song = uploadedSongs.find(s => s.id == songId);
                
                if (song) {
                    // Fill edit form
                    document.getElementById('editSongTitle').value = song.title;
                    document.getElementById('editSongGenre').value = song.genre;
                    document.getElementById('editSongId').value = songId;
                    
                    // Show modal
                    const modal = new bootstrap.Modal(document.getElementById('editSongModal'));
                    modal.show();
                }
            });
        });
        
        // Save song changes
        const saveSongChanges = document.getElementById('saveSongChanges');
        if (saveSongChanges) {
            saveSongChanges.addEventListener('click', function() {
                const songId = document.getElementById('editSongId').value;
                const songTitle = document.getElementById('editSongTitle').value;
                const songGenre = document.getElementById('editSongGenre').value;
                
                if (!songTitle || !songGenre) {
                    showNotification('Please fill in all required fields', 'danger');
                    return;
                }
                
                // Find and update song
                const songIndex = uploadedSongs.findIndex(s => s.id == songId);
                if (songIndex !== -1) {
                    uploadedSongs[songIndex].title = songTitle;
                    uploadedSongs[songIndex].genre = songGenre;
                    
                    // Close modal
                    bootstrap.Modal.getInstance(document.getElementById('editSongModal')).hide();
                    
                    // Refresh table
                    const songsTableBody = document.getElementById('songsTableBody');
                    if (songsTableBody) {
                        songsTableBody.innerHTML = getSongsTableRows();
                        attachMusicListeners();
                    }
                    
                    showNotification(`"${songTitle}" updated successfully!`, 'success');
                }
            });
        }
        
        // Delete song buttons
        document.querySelectorAll('.delete-song-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = this.getAttribute('data-id');
                const song = uploadedSongs.find(s => s.id == songId);
                
                if (song && confirm(`Delete "${song.title}"? This action cannot be undone.`)) {
                    // Remove from uploadedSongs
                    uploadedSongs = uploadedSongs.filter(s => s.id != songId);
                    
                    // Remove row from table
                    const row = this.closest('tr');
                    row.style.opacity = '0.5';
                    setTimeout(() => {
                        row.remove();
                        showNotification(`"${song.title}" has been deleted`, 'danger');
                    }, 300);
                }
            });
        });
    }
    
    function attachAnalyticsListeners() {
        // Period dropdown
        const periodItems = document.querySelectorAll('.dropdown-item[data-period]');
        periodItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const period = this.getAttribute('data-period');
                
                // Update active item
                periodItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // Update dropdown button text
                const dropdownBtn = this.closest('.dropdown-menu').previousElementSibling;
                dropdownBtn.textContent = this.textContent;
                
                showNotification(`Analytics updated for ${this.textContent}`, 'info');
            });
        });
    }
    
    function attachRevenueListeners() {
        // Withdraw all button
        const withdrawAllBtn = document.getElementById('withdrawAllBtn');
        if (withdrawAllBtn) {
            withdrawAllBtn.addEventListener('click', function() {
                const availableAmount = parseFloat(mockData.stats.availableForWithdrawal.replace(/[^0-9.-]+/g,""));
                document.getElementById('withdrawAmount').value = availableAmount.toFixed(2);
            });
        }
        
        // Process withdrawal button
        const processWithdrawalBtn = document.getElementById('processWithdrawalBtn');
        if (processWithdrawalBtn) {
            processWithdrawalBtn.addEventListener('click', function() {
                const amountInput = document.getElementById('withdrawAmount');
                const amount = parseFloat(amountInput.value);
                const availableAmount = parseFloat(mockData.stats.availableForWithdrawal.replace(/[^0-9.-]+/g,""));
                const method = document.getElementById('withdrawMethod').value;
                
                if (!amount || isNaN(amount)) {
                    showNotification('Please enter a valid amount', 'danger');
                    return;
                }
                
                if (amount < 50) {
                    showNotification('Minimum withdrawal amount is $50', 'danger');
                    return;
                }
                
                if (amount > availableAmount) {
                    showNotification('Insufficient balance', 'danger');
                    return;
                }
                
                if (amount > 10000) {
                    showNotification('Maximum withdrawal per day is $10,000', 'danger');
                    return;
                }
                
                // Disable button and show processing
                this.disabled = true;
                const originalText = this.textContent;
                this.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
                
                // Simulate withdrawal processing
                setTimeout(() => {
                    this.disabled = false;
                    this.textContent = originalText;
                    
                    // Update available balance
                    const newBalance = availableAmount - amount;
                    mockData.stats.availableForWithdrawal = `$${newBalance.toFixed(2)}`;
                    
                    // Clear input
                    amountInput.value = '';
                    
                    // Show success message
                    showNotification(`Successfully withdrew $${amount.toFixed(2)} via ${method}. Funds will arrive in 3-5 business days.`, 'success');
                    
                    // Update UI
                    const availableBalanceEl = document.getElementById('availableBalance');
                    if (availableBalanceEl) {
                        availableBalanceEl.textContent = `$${newBalance.toFixed(2)}`;
                    }
                }, 2000);
            });
        }
        
        // Withdraw earnings button
        const withdrawEarningsBtn = document.getElementById('withdrawEarningsBtn');
        if (withdrawEarningsBtn) {
            withdrawEarningsBtn.addEventListener('click', function() {
                const availableAmount = parseFloat(mockData.stats.availableForWithdrawal.replace(/[^0-9.-]+/g,""));
                
                if (availableAmount < 50) {
                    showNotification(`Minimum withdrawal is $50. Current available: $${availableAmount.toFixed(2)}`, 'warning');
                    return;
                }
                
                // Show withdraw modal
                const modal = new bootstrap.Modal(document.getElementById('withdrawEarningsModal'));
                modal.show();
            });
        }
    }
    
    function attachSubscriptionListeners() {
        // Already handled in initializePaymentOptions
    }
    
    function attachNotificationsListeners() {
        // Mark all as read button
        const markAllReadBtn = document.getElementById('markAllReadBtn');
        if (markAllReadBtn) {
            markAllReadBtn.addEventListener('click', function() {
                // Mark all notifications as read
                mockData.notifications.forEach(notification => {
                    notification.read = true;
                });
                
                // Update UI
                const notifications = document.querySelectorAll('.notification-item');
                notifications.forEach(notification => {
                    notification.classList.remove('unread');
                    const markReadBtn = notification.querySelector('.mark-read-btn');
                    if (markReadBtn) markReadBtn.remove();
                });
                
                // Update dropdown
                updateNotificationDropdown();
                
                showNotification('All notifications marked as read', 'success');
            });
        }
        
        // Clear all notifications button
        const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');
        if (clearNotificationsBtn) {
            clearNotificationsBtn.addEventListener('click', function() {
                if (confirm('Clear all notifications?')) {
                    const notificationsList = document.getElementById('notificationsList');
                    notificationsList.innerHTML = '<p class="text-center text-muted py-4">No notifications</p>';
                    showNotification('All notifications cleared', 'success');
                }
            });
        }
        
        // Mark individual as read buttons
        document.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = this.getAttribute('data-id');
                const notification = mockData.notifications.find(n => n.id == notificationId);
                
                if (notification) {
                    notification.read = true;
                    const notificationEl = this.closest('.notification-item');
                    notificationEl.classList.remove('unread');
                    this.remove();
                    
                    // Update dropdown
                    updateNotificationDropdown();
                    
                    showNotification('Notification marked as read', 'success');
                }
            });
        });
        
        // Save notification settings button
        const saveNotificationSettingsBtn = document.getElementById('saveNotificationSettingsBtn');
        if (saveNotificationSettingsBtn) {
            saveNotificationSettingsBtn.addEventListener('click', function() {
                showNotification('Notification settings saved successfully!', 'success');
            });
        }
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingAlerts = document.querySelectorAll('.alert.position-fixed');
        existingAlerts.forEach(alert => {
            alert.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
});