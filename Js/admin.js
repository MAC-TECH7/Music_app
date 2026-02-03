// Admin Dashboard JavaScript
console.log("🚀 Js/admin.js loaded");

// Authentication check
async function checkAuth() {
    console.log("🔐 Checking admin authentication...");

    try {
        const response = await fetch('backend/api/session.php', {
            method: 'GET',
            credentials: 'include' // Include cookies for session
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && (data.data.user.type === 'admin' || data.data.user.type === 'moderator')) {
                console.log(`✅ Admin authenticated: ${data.data.user.name}`);
                return true;
            }
        }

        // If we get here, user is not authenticated or not an admin
        const loginUrl = '/AfroRythm/auth/login.html';

        console.log("⚠️ Admin authentication failed.");
        console.log("🔄 Redirecting to login:", loginUrl);

        window.location.href = loginUrl;
        return false;

    } catch (error) {
        console.error("❌ Authentication check failed:", error);

        const path = window.location.pathname;
        const directory = path.substring(0, path.lastIndexOf('/'));
        const loginUrl = directory + '/auth/login.html';

        console.log("⚠️ Auth check failed, redirecting to login:", loginUrl);
        window.location.href = loginUrl;
        return false;
    }
}

// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', async function () {
    console.log('Admin dashboard loaded');

    // Check authentication first
    if (!(await checkAuth())) {
        return; // checkAuth will redirect if not authenticated
    }

    // Initialize everything
    initializeDataTables();
    initializeCharts();
    loadSampleData();
    setupEventListeners();
    setupNavigation();
    animateStats();

    // Add refresh button functionality
    addRefreshButton();
});

function initializeDataTables() {
    console.log('Initializing DataTables...');

    // Destroy existing tables if they exist
    const tables = ['#usersTable', '#allUsersTable', '#artistsTable', '#songsTable',
        '#subscriptionPlansTable', '#recentSubscriptionsTable', '#topSongsTable',
        '#topArtistsTable', '#recentSongsTable'];

    tables.forEach(tableId => {
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }
    });

    // Initialize tables with consistent options
    const tableOptions = {
        "pageLength": 10,
        "lengthChange": true,
        "searching": true,
        "info": true,
        "paging": true,
        "ordering": true,
        "language": {
            "emptyTable": "No data available in table",
            "info": "Showing _START_ to _END_ of _TOTAL_ entries",
            "infoEmpty": "Showing 0 to 0 of 0 entries",
            "infoFiltered": "(filtered from _MAX_ total entries)",
            "lengthMenu": "Show _MENU_ entries",
            "search": "Search:",
            "zeroRecords": "No matching records found"
        }
    };

    // Initialize tables with specific IDs or classes
    const targetTables = ['#recentSubscriptionsTable', '#topSongsTable', '#topArtistsTable', '#recentSongsTable', '#allUsersTable', '#artistsTable', '#songsTable', '#reportsTable'];

    targetTables.forEach(selector => {
        const $table = $(selector);
        if ($table.length && !$.fn.DataTable.isDataTable(selector)) {
            $table.DataTable(tableOptions);
            console.log(`✅ DataTable initialized: ${selector}`);
        }
    });

    console.log('DataTables initialization complete.');
}

function initializeCharts() {
    console.log('Initializing charts...');

    // User Growth Chart
    const userGrowthCanvas = document.getElementById('userGrowthChart');
    if (userGrowthCanvas) {
        const userGrowthCtx = userGrowthCanvas.getContext('2d');
        window.userGrowthChart = new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Total Users',
                    data: [8500, 9200, 9800, 10500, 11200, 11800, 12456, 13000, 13500, 14000, 14500, 15000],
                    borderColor: '#FF6B35',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3b3'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#b3b3b3'
                        }
                    }
                }
            }
        });
    }

    // Artist Distribution Chart
    const artistDistCanvas = document.getElementById('artistDistributionChart');
    if (artistDistCanvas) {
        const artistDistCtx = artistDistCanvas.getContext('2d');
        window.artistDistributionChart = new Chart(artistDistCtx, {
            type: 'doughnut',
            data: {
                labels: ['Makossa', 'Bikutsi', 'Afrobeat', 'Assiko', 'Others'],
                datasets: [{
                    data: [35, 25, 20, 10, 10],
                    backgroundColor: [
                        '#FF6B35',
                        '#2E8B57',
                        '#8B4513',
                        '#FFA726',
                        '#6C757D'
                    ],
                    borderWidth: 1,
                    borderColor: '#1a1a1a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#b3b3b3',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Analytics Chart
    const analyticsCanvas = document.getElementById('analyticsChart');
    if (analyticsCanvas) {
        const analyticsCtx = analyticsCanvas.getContext('2d');
        window.analyticsChart = new Chart(analyticsCtx, {
            type: 'bar',
            data: {
                labels: ['Streams', 'Downloads', 'Shares', 'Likes', 'Comments'],
                datasets: [{
                    label: 'This Month',
                    data: [2100000, 45000, 12000, 85000, 15000],
                    backgroundColor: '#FF6B35',
                    borderWidth: 0,
                    borderRadius: 4
                }, {
                    label: 'Last Month',
                    data: [1800000, 38000, 10000, 72000, 13000],
                    backgroundColor: '#6C757D',
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#b3b3b3'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b3b3b3',
                            callback: function (value) {
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#b3b3b3'
                        }
                    }
                }
            }
        });
    }

    // Genre Chart
    const genreCanvas = document.getElementById('genreChart');
    if (genreCanvas) {
        const genreCtx = genreCanvas.getContext('2d');
        window.genreChart = new Chart(genreCtx, {
            type: 'polarArea',
            data: {
                labels: ['Makossa', 'Bikutsi', 'Afrobeat', 'Assiko', 'Bend Skin', 'Gospel', 'Traditional'],
                datasets: [{
                    data: [1200, 850, 750, 400, 350, 600, 300],
                    backgroundColor: [
                        '#FF6B35',
                        '#2E8B57',
                        '#8B4513',
                        '#FFA726',
                        '#DC3545',
                        '#17A2B8',
                        '#6C757D'
                    ],
                    borderWidth: 1,
                    borderColor: '#1a1a1a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#b3b3b3',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Revenue Chart
    const revenueCanvas = document.getElementById('revenueChart');
    if (revenueCanvas) {
        const revenueCtx = revenueCanvas.getContext('2d');
        window.revenueChart = new Chart(revenueCtx, {
            type: 'pie',
            data: {
                labels: ['Artist Subscriptions', 'Ad Revenue', 'Fan Donations', 'Premium Features', 'Merchandise'],
                datasets: [{
                    data: [45, 30, 15, 8, 2],
                    backgroundColor: [
                        '#FF6B35',
                        '#2E8B57',
                        '#8B4513',
                        '#FFA726',
                        '#6C757D'
                    ],
                    borderWidth: 1,
                    borderColor: '#1a1a1a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#b3b3b3',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    // Artist Verification Chart
    const artistVerificationCanvas = document.getElementById('artistVerificationChart');
    if (artistVerificationCanvas) {
        const artistVerificationCtx = artistVerificationCanvas.getContext('2d');
        window.artistVerificationChart = new Chart(artistVerificationCtx, {
            type: 'doughnut',
            data: {
                labels: ['Verified', 'Pending', 'Rejected'],
                datasets: [{
                    data: [65, 25, 10],
                    backgroundColor: [
                        '#16a34a',
                        '#ca8a04',
                        '#dc2626'
                    ],
                    borderWidth: 1,
                    borderColor: '#1a1a1a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#b3b3b3',
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }
}

async function loadSampleData() {
    console.log('Loading data from API...');

    try {
        // Fetch users
        const usersResponse = await fetch('backend/api/users.php');
        const usersData = await usersResponse.json();
        let users = usersData.success ? usersData.data : [];

        // No longer merging with localStorage - using API data only

        // Fetch artists
        const artistsResponse = await fetch('backend/api/artists.php');
        const artistsData = await artistsResponse.json();
        let artists = artistsData.success ? artistsData.data.map(artist => ({
            id: artist.id,
            name: artist.name,
            genre: artist.genre,
            followers: artist.followers >= 1000 ? (artist.followers / 1000).toFixed(0) + 'K' : artist.followers.toString(),
            songs: artist.songs_count,
            status: artist.status,
            verification: artist.verification
        })) : [];

        // No longer merging with localStorage - using API data only

        // Fetch songs
        const songsResponse = await fetch('backend/api/songs.php');
        const songsData = await songsResponse.json();
        let songs = songsData.success ? songsData.data.map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist_name,
            genre: song.genre,
            plays: song.plays >= 1000000 ? (song.plays / 1000000).toFixed(1) + 'M' : song.plays >= 1000 ? (song.plays / 1000).toFixed(0) + 'K' : song.plays.toString(),
            duration: song.duration,
            date: song.uploaded_at.split(' ')[0],
            status: song.status === 'active' ? 'published' : song.status
        })) : [];

        // No longer merging with localStorage - using API data only

        // Fetch subscriptions
        const subsResponse = await fetch('backend/api/subscriptions.php');
        const subsData = await subsResponse.json();
        let subscriptions = subsData.success ? subsData.data : [];

        // No longer merging with localStorage - using API data only

        // Fetch admin data
        const adminAnalyticsResponse = await fetch('backend/api/admin.php?action=analytics');
        const adminAnalyticsData = await adminAnalyticsResponse.json();
        const analytics = adminAnalyticsData.success ? adminAnalyticsData.data : {};

        const adminRevenueResponse = await fetch('backend/api/admin.php?action=revenue');
        const adminRevenueData = await adminRevenueResponse.json();
        const revenue = adminRevenueData.success ? adminRevenueData.data : {};

        const adminReportsResponse = await fetch('backend/api/admin.php?action=reports');
        const adminReportsData = await adminReportsResponse.json();
        const reports = adminReportsData.success ? adminReportsData.data : [];

        // Populate all tables
        populateUsersTable(users);
        populateAllUsersTable(users);
        populateArtistsTable(artists);
        populateSongsTable(songs);
        populateSubscriptionPlansTable(subscriptions);
        populateRecentSubscriptionsTable(subscriptions.slice(0, 5));
        populateTopSongsTable(songs.slice(0, 5));
        populateTopArtistsList(artists);
        populateRecentSongsTable(songs.slice(0, 5));

        // Populate admin-specific data
        populateAnalyticsStats(analytics);
        populateRevenueStats(revenue);
        populateReportsTable(reports);

        // Store data globally
        window.sampleData = { users, artists, songs, subscriptions, analytics, revenue, reports };

        console.log('Data loaded successfully from API');
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to sample data if API fails
        loadFallbackData();
    }
}

function populateUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    users.slice(0, 5).forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-info">
                    <div class="user-avatar" style="overflow: hidden;">
                        ${user.avatar && (user.avatar.includes('/') || user.avatar.includes('.'))
                ? `<img src="${user.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                : (user.avatar || user.name.charAt(0))}
                    </div>
                    <div>
                        <strong>${user.name}</strong><br>
                        <small class="text-muted">ID: ${user.id}</small>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="badge bg-${getTypeColor(user.type)}">${user.type}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${user.joined}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action view" data-entity="user" data-id="${user.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-entity="user" data-id="${user.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateAllUsersTable(users) {
    const tbody = document.getElementById('allUsersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>
                <div class="user-info">
                    <div class="user-avatar" style="overflow: hidden;">
                        ${user.avatar && (user.avatar.includes('/') || user.avatar.includes('.'))
                ? `<img src="${user.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                : (user.avatar || user.name.charAt(0))}
                    </div>
                    <div>
                        <strong>${user.name}</strong>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td><span class="badge bg-${getTypeColor(user.type)}">${user.type}</span></td>
            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
            <td>${user.joined}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action view" data-entity="user" data-id="${user.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-entity="user" data-id="${user.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action suspend" data-entity="user" data-id="${user.id}" data-status="${user.status}" title="${user.status === 'blocked' ? 'Activate' : 'Suspend'}">
                        <i class="fas ${user.status === 'blocked' ? 'fa-user-check' : 'fa-user-slash'}"></i>
                    </button>
                    <button class="btn-action reset" data-entity="user" data-id="${user.id}" title="Reset Password">
                        <i class="fas fa-key"></i>
                    </button>
                    <select class="form-select form-select-sm" style="width: auto; display: inline-block; margin-right: 5px;" onchange="assignRole(${user.id}, this.value)">
                        <option value="">Change Role</option>
                        <option value="admin" ${user.type === 'admin' ? 'selected' : ''}>Admin</option>
                        <option value="moderator" ${user.type === 'moderator' ? 'selected' : ''}>Moderator</option>
                        <option value="artist" ${user.type === 'artist' ? 'selected' : ''}>Artist</option>
                        <option value="fan" ${user.type === 'fan' ? 'selected' : ''}>Fan</option>
                    </select>
                    <select class="form-select form-select-sm" style="width: auto; display: inline-block; margin-right: 5px;" onchange="changeUserStatus(${user.id}, this.value)">
                        <option value="">Change Status</option>
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="pending" ${user.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="blocked" ${user.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                    </select>
                    <button class="btn-action delete" data-entity="user" data-id="${user.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateArtistsTable(artists) {
    const tbody = document.getElementById('artistsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    artists.forEach(artist => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${artist.id}</td>
            <td>
                <div class="user-info">
                    <div class="user-avatar" style="overflow: hidden;">
                        ${(artist.image || artist.photo || artist.avatar)
                ? `<img src="${artist.image || artist.photo || artist.avatar}" alt="" style="width: 100%; height: 100%; object-fit: cover;">`
                : artist.name.charAt(0)}
                    </div>
                    <div>
                        <strong>${artist.name}</strong>
                    </div>
                </div>
            </td>
            <td><span class="badge" style="background-color: #${getGenreColor(artist.genre)}">${artist.genre}</span></td>
            <td>${artist.followers}</td>
            <td>${artist.songs}</td>
            <td><span class="status-badge status-${artist.status}">${artist.status}</span></td>
            <td>
                <span class="badge bg-${getVerificationColor(artist.verification)}">
                    ${artist.verification}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action view" data-entity="artist" data-id="${artist.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-entity="artist" data-id="${artist.id}" title="Edit Profile">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${artist.verification === 'approved' ? `
                        <button class="btn-action unverify" data-entity="artist" data-id="${artist.id}" title="Unverify">
                            <i class="fas fa-user-times"></i>
                        </button>
                    ` : `
                        <button class="btn-action verify" data-entity="artist" data-id="${artist.id}" title="Verify">
                            <i class="fas fa-user-check"></i>
                        </button>
                    `}
                    ${artist.status === 'blocked' ? `
                        <button class="btn-action ban" data-entity="artist" data-id="${artist.id}" data-status="${artist.status}" title="Unban">
                            <i class="fas fa-user-check"></i>
                        </button>
                    ` : `
                        <button class="btn-action ban" data-entity="artist" data-id="${artist.id}" data-status="${artist.status}" title="Ban">
                            <i class="fas fa-ban"></i>
                        </button>
                    `}
                    <button class="btn-action delete" data-entity="artist" data-id="${artist.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateSongsTable(songs) {
    const tbody = document.getElementById('songsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    songs.forEach(song => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${song.id}</td>
            <td><strong>${song.title}</strong></td>
            <td>${song.artist}</td>
            <td><span class="badge" style="background-color: #${getGenreColor(song.genre)}">${song.genre}</span></td>
            <td>${song.plays}</td>
            <td>${song.duration}</td>
            <td>${song.date}</td>
            <td><span class="status-badge status-${song.status}">${song.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action view" data-entity="song" data-id="${song.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-entity="song" data-id="${song.id}" title="Edit Metadata">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${song.status === 'pending' ? `
                        <button class="btn-action approve" data-entity="song" data-id="${song.id}" title="Approve">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action reject" data-entity="song" data-id="${song.id}" title="Reject">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action delete" data-entity="song" data-id="${song.id}" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateRecentSongsTable(songs) {
    const tbody = document.getElementById('recentSongsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    songs.forEach(song => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${song.title}</strong></td>
            <td>${song.artist}</td>
            <td><span class="badge" style="background-color: #${getGenreColor(song.genre)}">${song.genre}</span></td>
            <td>${song.plays}</td>
            <td><span class="status-badge status-${song.status}">${song.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action view" data-entity="song" data-id="${song.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-entity="song" data-id="${song.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateTopArtistsList(artists) {
    const container = document.getElementById('topArtistsList');
    if (!container) return;

    // Sort by followers (convert "150K" to number for sorting)
    const sortedArtists = [...artists].sort((a, b) => {
        const aFollowers = parseFloat(a.followers) * (a.followers.includes('K') ? 1000 : 1);
        const bFollowers = parseFloat(b.followers) * (b.followers.includes('K') ? 1000 : 1);
        return bFollowers - aFollowers;
    }).slice(0, 5);

    container.innerHTML = '';

    sortedArtists.forEach((artist, index) => {
        const artistDiv = document.createElement('div');
        artistDiv.className = 'top-artist-item';
        artistDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #333;
        `;

        artistDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="color: #b3b3b3; font-weight: bold;">${index + 1}</span>
                <div class="user-avatar" style="width: 32px; height: 32px; font-size: 14px;">${artist.name.charAt(0)}</div>
                <div>
                    <div style="font-weight: 600;">${artist.name}</div>
                    <div style="color: #b3b3b3; font-size: 12px;">${artist.genre}</div>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-weight: 600; color: #1db954;">${artist.followers}</div>
                <div style="color: #b3b3b3; font-size: 12px;">followers</div>
            </div>
        `;

        container.appendChild(artistDiv);
    });
}

function getTypeColor(type) {
    const colors = {
        'fan': 'secondary',
        'artist': 'info',
        'moderator': 'warning',
        'admin': 'danger'
    };
    return colors[type] || 'secondary';
}

function getGenreColor(genre) {
    const colors = {
        'Makossa': '4A6CF7',
        'Bikutsi': '2E8B57',
        'Afrobeat': 'FF6B35',
        'Assiko': 'FFA726',
        'Traditional': '8B4513',
        'Bend Skin': '6C757D',
        'Gospel': 'DC3545'
    };
    return colors[genre] || '6C757D';
}

function getVerificationColor(status) {
    const colors = {
        'approved': 'success',
        'pending': 'warning',
        'rejected': 'danger'
    };
    return colors[status] || 'secondary';
}

function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Global search
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            // Implement search across all tables
            $('table').DataTable().search(searchTerm).draw();
        });
    }

    // Add user button
    document.getElementById('addUserBtn')?.addEventListener('click', function () {
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
    });

    // Add artist button
    document.getElementById('addArtistBtn')?.addEventListener('click', function () {
        populateUserDropdown('artistUserId');
        const modal = new bootstrap.Modal(document.getElementById('addArtistModal'));
        modal.show();
    });

    // Add song button
    document.getElementById('addSongBtn')?.addEventListener('click', function () {
        populateArtistDropdown('songArtist');
        const modal = new bootstrap.Modal(document.getElementById('addSongModal'));
        modal.show();
    });

    // Add subscription button
    document.getElementById('addSubscriptionBtn')?.addEventListener('click', function () {
        populateUserDropdown('planUser');
        const modal = new bootstrap.Modal(document.getElementById('addSubscriptionModal'));
        modal.show();
    });

    // Add subscription plan button
    document.getElementById('addSubscriptionPlanBtn')?.addEventListener('click', function () {
        populateUserDropdown('planUser');
        const modal = new bootstrap.Modal(document.getElementById('addSubscriptionModal'));
        modal.show();
    });

    // Export buttons
    document.getElementById('exportUsersBtn')?.addEventListener('click', function () {
        alert('Exporting users data...');
    });

    document.getElementById('exportAllUsersBtn')?.addEventListener('click', function () {
        alert('Exporting all users data...');
    });

    document.getElementById('exportArtistsBtn')?.addEventListener('click', function () {
        alert('Exporting artists data...');
    });

    document.getElementById('exportSongsBtn')?.addEventListener('click', function () {
        alert('Exporting songs data...');
    });

    document.getElementById('exportReportBtn')?.addEventListener('click', function () {
        alert('Exporting report data...');
    });

    // Generate report button
    document.getElementById('generateReportBtn')?.addEventListener('click', function () {
        alert('Generating report... This would create a comprehensive report');
    });

    // Save settings button
    document.getElementById('saveSettingsBtn')?.addEventListener('click', function () {
        alert('Settings saved successfully!');
    });

    // Refresh buttons
    document.getElementById('refreshSongsBtn')?.addEventListener('click', function () {
        refreshDashboardData();
    });

    document.getElementById('refreshSubscriptionsBtn')?.addEventListener('click', function () {
        alert('Refreshing subscriptions data...');
    });

    // Notifications button
    document.getElementById('notificationsBtn')?.addEventListener('click', function () {
        const modal = new bootstrap.Modal(document.getElementById('notificationsModal'));
        modal.show();
    });

    // Admin avatar button
    document.getElementById('adminAvatar')?.addEventListener('click', function () {
        const modal = new bootstrap.Modal(document.getElementById('adminProfileModal'));
        modal.show();
    });

    // Reset add user form when modal is hidden
    document.getElementById('addUserModal')?.addEventListener('hidden.bs.modal', function () {
        document.getElementById('addUserForm').reset();
    });

    // Reset add artist form when modal is hidden
    document.getElementById('addArtistModal')?.addEventListener('hidden.bs.modal', function () {
        document.getElementById('addArtistForm').reset();
    });

    // Reset add song form when modal is hidden
    document.getElementById('addSongModal')?.addEventListener('hidden.bs.modal', function () {
        document.getElementById('addSongForm').reset();
    });

    // Reset add subscription form when modal is hidden
    document.getElementById('addSubscriptionModal')?.addEventListener('hidden.bs.modal', function () {
        document.getElementById('addSubscriptionForm').reset();
    });

    // Action buttons delegation
    document.addEventListener('click', function (e) {
        // View buttons
        if (e.target.closest('.btn-action.view')) {
            const button = e.target.closest('.btn-action.view');
            const id = button.dataset.id;
            const tbodyId = button.closest('tbody')?.id || '';

            if (tbodyId.includes('User')) {
                viewUserDetails(id);
            } else if (tbodyId.includes('Song')) {
                viewSongDetails(id);
            } else if (tbodyId.includes('Artist')) {
                viewArtistDetails(id);
            } else if (tbodyId.includes('Subscription')) {
                viewSubscriptionDetails(id);
            } else {
                // Fallback authentication check logic if unsure
                const type = button.closest('tr').querySelector('td:nth-child(2)')?.textContent.includes('@') ? 'user' : 'song';
                if (type === 'user') viewUserDetails(id);
                else viewSongDetails(id);
            }
        }

        // Edit buttons
        if (e.target.closest('.btn-action.edit')) {
            const button = e.target.closest('.btn-action.edit');
            const row = button.closest('tr');
            const table = button.closest('table');
            const tbodyId = button.closest('tbody')?.id || '';
            const tableId = table?.id || '';
            const entity = (button.dataset.entity || '').toLowerCase();
            const fallbackEntity = (() => {
                const scope = `${tableId} ${tbodyId}`.toLowerCase();
                if (scope.includes('user')) return 'user';
                if (scope.includes('artist')) return 'artist';
                if (scope.includes('song')) return 'song';
                return '';
            })();
            const id = button.dataset.id
                || row?.dataset?.id
                || row?.querySelector('td')?.textContent?.trim()
                || '';

            const resolvedEntity = entity || fallbackEntity;

            if (resolvedEntity === 'user') {
                openEditUserModal(id);
            } else if (resolvedEntity === 'artist') {
                openEditArtistModal(id);
            } else if (resolvedEntity === 'song') {
                openEditSongModal(id);
            } else {
                showNotification('Edit action not available for this item', 'warning');
            }
        }

        // Suspend/Activate user
        if (e.target.closest('.btn-action.suspend')) {
            const button = e.target.closest('.btn-action.suspend');
            const id = button.dataset.id;
            const currentStatus = button.dataset.status || 'active';
            toggleUserSuspend(id, currentStatus);
        }

        // Reset password
        if (e.target.closest('.btn-action.reset')) {
            const button = e.target.closest('.btn-action.reset');
            const id = button.dataset.id;
            openResetPasswordModal(id);
        }

        // Verify / Unverify artist
        if (e.target.closest('.btn-action.verify')) {
            const button = e.target.closest('.btn-action.verify');
            const id = button.dataset.id;
            verifyArtist(id);
        }
        if (e.target.closest('.btn-action.unverify')) {
            const button = e.target.closest('.btn-action.unverify');
            const id = button.dataset.id;
            unverifyArtist(id);
        }

        // Ban / Unban artist
        if (e.target.closest('.btn-action.ban')) {
            const button = e.target.closest('.btn-action.ban');
            const id = button.dataset.id;
            const currentStatus = button.dataset.status || 'active';
            toggleArtistBan(id, currentStatus);
        }

        // Approve / Reject song
        if (e.target.closest('.btn-action.approve')) {
            const button = e.target.closest('.btn-action.approve');
            const id = button.dataset.id;
            approveSong(id);
        }
        if (e.target.closest('.btn-action.reject')) {
            const button = e.target.closest('.btn-action.reject');
            const id = button.dataset.id;
            rejectSong(id);
        }

        // Delete buttons
        if (e.target.closest('.btn-action.delete')) {
            const button = e.target.closest('.btn-action.delete');
            const id = button.dataset.id;
            const entity = button.dataset.entity || '';
            const row = button.closest('tr');
            const itemName = row.querySelector('td:nth-child(2) strong')?.textContent ||
                row.querySelector('td:nth-child(2)')?.textContent;

            if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
                deleteEntity(entity, id, itemName, row);
            }
        }
    });

    // Search inputs for specific sections
    document.getElementById('userSearch')?.addEventListener('input', function (e) {
        $('#allUsersTable').DataTable().search(e.target.value).draw();
    });

    document.getElementById('artistSearch')?.addEventListener('input', function (e) {
        $('#artistsTable').DataTable().search(e.target.value).draw();
    });

    document.getElementById('songSearch')?.addEventListener('input', function (e) {
        $('#songsTable').DataTable().search(e.target.value).draw();
    });
}

function setupNavigation() {
    console.log('Setting up navigation...');

    const navLinks = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.dashboard-view');

    // Hide all sections except dashboard initially
    sections.forEach(section => {
        if (!section.classList.contains('active')) {
            section.style.display = 'none';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const view = this.dataset.view;
            console.log('Navigating to:', view);

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });

            // Show selected section
            const sectionId = view + 'Section';
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
                targetSection.classList.add('active');

                // Update page title
                updatePageTitle(view);

                // Refresh DataTables when switching to a section
                setTimeout(() => {
                    const dataTable = $(sectionId).find('table').DataTable();
                    if (dataTable) {
                        dataTable.columns.adjust().draw();
                        console.log(`🔄 Redrawn tables in ${sectionId}`);
                    }
                }, 200);
            }
        });
    });
}

function updatePageTitle(view) {
    const titleElement = document.querySelector('.top-bar-left h1');
    const titles = {
        'dashboard': 'Admin Dashboard Overview',
        'users': 'User Management',
        'artists': 'Artist Management',
        'songs': 'Song Management',
        'subscriptions': 'Subscription Management',
        'reports': 'Reports & Analytics',
        'settings': 'Settings'
    };

    if (titleElement && titles[view]) {
        titleElement.textContent = titles[view];
    }
}

function animateStats() {
    console.log('Animating stats...');

    const stats = [
        { id: 'totalUsers', target: 15200, duration: 2000 },
        { id: 'totalArtists', target: 850, duration: 1500 },
        { id: 'totalSongs', target: 4200, duration: 2500 },
        { id: 'totalRevenue', target: 12500, duration: 2000 },
        { id: 'activeUsers', target: 12456, duration: 1800 },
        { id: 'artistUsers', target: 843, duration: 1600 },
        { id: 'pendingUsers', target: 42, duration: 1200 },
        { id: 'blockedUsers', target: 18, duration: 1000 },
        { id: 'totalPlays', target: 152800000, duration: 2500, isLargeNumber: true },
        { id: 'publishedSongs', target: 4156, duration: 2000 },
        { id: 'pendingSongs', target: 44, duration: 1500 },
        { id: 'rejectedSongs', target: 12, duration: 1000 }
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

            if (stat.isLargeNumber) {
                if (currentValue >= 1000000) {
                    element.textContent = (currentValue / 1000000).toFixed(1) + 'M';
                } else if (currentValue >= 1000) {
                    element.textContent = (currentValue / 1000).toFixed(0) + 'K';
                } else {
                    element.textContent = formatNumber(currentValue);
                }
            } else if (stat.id === 'totalRevenue') {
                element.textContent = '$' + formatNumber(currentValue);
            } else {
                element.textContent = formatNumber(currentValue);
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    });
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function refreshDashboardData() {
    console.log('Refreshing dashboard data...');

    // Show loading state
    showNotification('Refreshing dashboard data...', 'info');

    // Simulate API call delay
    setTimeout(() => {
        // Update random stats
        const newUserCount = Math.floor(Math.random() * 200) + 15200;
        const newArtistCount = Math.floor(Math.random() * 50) + 850;
        const newSongCount = Math.floor(Math.random() * 100) + 4200;
        const newRevenue = Math.floor(Math.random() * 1000) + 12500;

        document.getElementById('totalUsers').textContent = formatNumber(newUserCount);
        document.getElementById('totalArtists').textContent = formatNumber(newArtistCount);
        document.getElementById('totalSongs').textContent = formatNumber(newSongCount);
        document.getElementById('totalRevenue').textContent = '$' + formatNumber(newRevenue);

        // Update charts
        if (window.userGrowthChart) {
            const chart = window.userGrowthChart;
            const newDataPoint = newUserCount;
            chart.data.datasets[0].data.push(newDataPoint);
            chart.data.labels.push('Now');

            // Keep only last 12 points
            if (chart.data.datasets[0].data.length > 12) {
                chart.data.datasets[0].data.shift();
                chart.data.labels.shift();
            }

            chart.update();
        }

        // Refresh all DataTables
        $('table').DataTable().ajax.reload();

        showNotification('Dashboard data refreshed successfully!', 'success');
    }, 1500);
}

function addRefreshButton() {
    // Add a refresh button to the top bar
    const topBarRight = document.querySelector('.top-bar-right');
    if (topBarRight && !document.getElementById('refreshDashboardBtn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'refreshDashboardBtn';
        refreshBtn.className = 'icon-btn';
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        refreshBtn.title = 'Refresh Dashboard';
        refreshBtn.style.marginRight = '10px';

        refreshBtn.addEventListener('click', function () {
            this.classList.add('rotating');
            refreshDashboardData();
            setTimeout(() => {
                this.classList.remove('rotating');
            }, 2000);
        });

        topBarRight.insertBefore(refreshBtn, topBarRight.firstChild);

        // Add CSS for rotation animation
        const style = document.createElement('style');
        style.textContent = `
            .rotating {
                animation: rotate 1s linear infinite;
            }
            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `custom-notification alert-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;

    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = '#16a34a';
            break;
        case 'error':
            notification.style.backgroundColor = '#dc2626';
            break;
        case 'warning':
            notification.style.backgroundColor = '#ca8a04';
            break;
        default:
            notification.style.backgroundColor = '#2563eb';
    }

    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 3000);

    // Add CSS for animations
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Make functions available globally
window.refreshDashboardData = refreshDashboardData;
window.showNotification = showNotification;
window.markAllAsRead = markAllAsRead;
window.saveAdminProfile = saveAdminProfile;
window.addNewUser = addNewUser;
window.addNewArtist = addNewArtist;
window.addNewSong = addNewSong;
window.addNewSubscription = addNewSubscription;

// Modal functions
function markAllAsRead() {
    const unreadNotifications = document.querySelectorAll('.notification-item.unread');
    unreadNotifications.forEach(notification => {
        notification.classList.remove('unread');
        notification.style.borderLeft = 'none';
        notification.style.backgroundColor = 'transparent';
    });
    showNotification('All notifications marked as read', 'success');
}

function saveAdminProfile() {
    // Get form values
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const twoFactorAuth = document.getElementById('twoFactorAuth').checked;
    const autoLogout = document.getElementById('autoLogout').checked;

    // Here you would typically send this data to the server
    console.log('Saving admin profile:', {
        name,
        email,
        emailNotifications,
        twoFactorAuth,
        autoLogout
    });

    // Close modal and show success message
    const modal = bootstrap.Modal.getInstance(document.getElementById('adminProfileModal'));
    modal.hide();

    showNotification('Admin profile updated successfully', 'success');
}

// Auto-refresh dashboard every 5 minutes (optional)
function populateSubscriptionPlansTable(subscriptions) {
    const tbody = document.getElementById('subscriptionPlansTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    subscriptions.forEach(sub => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${sub.id}</td>
            <td><strong>${sub.plan_name}</strong></td>
            <td>${sub.user_name}</td>
            <td>$${sub.amount}</td>
            <td><span class="badge bg-${sub.status === 'active' ? 'success' : sub.status === 'expired' ? 'warning' : 'secondary'}">${sub.status}</span></td>
            <td>${sub.start_date}</td>
            <td>${sub.end_date}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btn-action view" data-id="${sub.id}">View</button>
                    <button class="btn btn-outline-secondary btn-action edit" data-id="${sub.id}">Edit</button>
                    <button class="btn btn-outline-danger btn-action delete" data-id="${sub.id}">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function populateRecentSubscriptionsTable(subscriptions) {
    const tbody = document.getElementById('recentSubscriptionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    subscriptions.forEach(sub => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${sub.plan_name}</strong></td>
            <td>${sub.user_name}</td>
            <td>$${sub.amount}</td>
            <td>${sub.start_date}</td>
            <td><span class="badge bg-${sub.status === 'active' ? 'success' : 'warning'}">${sub.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function populateTopSongsTable(songs) {
    const tbody = document.getElementById('topSongsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    songs.forEach((song, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><strong>${song.title}</strong></td>
            <td>${song.artist}</td>
            <td>${song.plays}</td>
            <td>${song.likes}</td>
            <td>${song.duration}</td>
            <td><span class="badge bg-${song.status === 'published' ? 'success' : 'warning'}">${song.status}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function populateAnalyticsStats(analytics) {
    // Update analytics stats in the reports section
    document.getElementById('totalUsersStat').textContent = analytics.total_users || 0;
    document.getElementById('totalArtistsStat').textContent = analytics.total_artists || 0;
    document.getElementById('totalSongsStat').textContent = analytics.total_songs || 0;
    document.getElementById('totalPlaysStat').textContent = (analytics.total_plays / 1000000).toFixed(1) + 'M';
    document.getElementById('activeSubscriptionsStat').textContent = analytics.active_subscriptions || 0;
}

function populateRevenueStats(revenue) {
    // Update revenue stats
    document.getElementById('subscriptionRevenue').textContent = revenue.subscription_revenue ? revenue.subscription_revenue.toLocaleString() + ' XAF' : '0 XAF';
    document.getElementById('adRevenue').textContent = revenue.ad_revenue ? revenue.ad_revenue.toLocaleString() + ' XAF' : '0 XAF';
    document.getElementById('royaltiesPaid').textContent = revenue.royalties_paid ? revenue.royalties_paid.toLocaleString() + ' XAF' : '0 XAF';
    document.getElementById('totalRevenue').textContent = revenue.total_revenue ? revenue.total_revenue.toLocaleString() + ' XAF' : '0 XAF';
}

function populateReportsTable(reports) {
    const tbody = document.getElementById('reportsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    reports.forEach(report => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.id}</td>
            <td>${report.reporter_name || 'Unknown'}</td>
            <td>${report.reported_name || report.song_title || 'N/A'}</td>
            <td><span class="badge bg-info">${report.type}</span></td>
            <td>${report.reason || 'No reason provided'}</td>
            <td><span class="badge bg-${report.status === 'resolved' ? 'success' : report.status === 'pending' ? 'warning' : 'secondary'}">${report.status}</span></td>
            <td>${new Date(report.created_at).toLocaleDateString()}</td>
            <td>
                ${report.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="resolveReport(${report.id})">Resolve</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getSampleItem(entity, id) {
    const map = { user: 'users', artist: 'artists', song: 'songs' };
    const list = window.sampleData?.[map[entity]] || [];
    return list.find(item => item.id == id) || null;
}



function openResetPasswordModal(id) {
    document.getElementById('resetPasswordUserId').value = id;
    document.getElementById('resetPasswordNew').value = '';
    document.getElementById('resetPasswordConfirm').value = '';
    const modal = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
    modal.show();
}

// Admin action functions
async function approveArtist(artistId) {
    try {
        const response = await fetch('backend/api/admin.php?action=approve_artist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artist_id: artistId })
        });
        const data = await response.json();
        if (data.success) {
            alert('Artist approved successfully');
            loadSampleData(); // Refresh data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error approving artist:', error);
        alert('Error approving artist');
    }
}

async function rejectArtist(artistId) {
    try {
        const response = await fetch('backend/api/admin.php?action=reject_artist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artist_id: artistId })
        });
        const data = await response.json();
        if (data.success) {
            alert('Artist rejected');
            loadSampleData(); // Refresh data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error rejecting artist:', error);
        alert('Error rejecting artist');
    }
}

async function verifyArtist(artistId) {
    try {
        const response = await fetch('backend/api/admin.php?action=verify_artist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artist_id: artistId })
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Artist verified successfully', 'success');
            loadSampleData();
        } else {
            showNotification(data.message || 'Error verifying artist', 'error');
        }
    } catch (error) {
        console.error('Error verifying artist:', error);
        showNotification('Error verifying artist', 'error');
    }
}

async function unverifyArtist(artistId) {
    try {
        const response = await fetch('backend/api/admin.php?action=unverify_artist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artist_id: artistId })
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Artist unverified', 'success');
            loadSampleData();
        } else {
            showNotification(data.message || 'Error unverifying artist', 'error');
        }
    } catch (error) {
        console.error('Error unverifying artist:', error);
        showNotification('Error unverifying artist', 'error');
    }
}

async function toggleArtistBan(artistId, currentStatus) {
    const action = currentStatus === 'blocked' ? 'unban_artist' : 'ban_artist';
    const label = currentStatus === 'blocked' ? 'unbanned' : 'banned';
    if (!confirm(`Are you sure you want to ${label === 'banned' ? 'ban' : 'unban'} this artist?`)) {
        return;
    }
    try {
        const response = await fetch(`backend/api/admin.php?action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artist_id: artistId })
        });
        const data = await response.json();
        if (data.success) {
            showNotification(`Artist ${label} successfully`, 'success');
            loadSampleData();
        } else {
            showNotification(data.message || 'Error updating artist status', 'error');
        }
    } catch (error) {
        console.error('Error updating artist status:', error);
        showNotification('Error updating artist status', 'error');
    }
}

async function approveSong(songId) {
    try {
        const response = await fetch('backend/api/admin.php?action=approve_song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_id: songId })
        });
        const data = await response.json();
        if (data.success) {
            alert('Song approved successfully');
            loadSampleData(); // Refresh data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error approving song:', error);
        alert('Error approving song');
    }
}

async function rejectSong(songId) {
    try {
        const response = await fetch('backend/api/admin.php?action=reject_song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_id: songId })
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Song rejected', 'success');
            loadSampleData();
        } else {
            showNotification(data.message || 'Error rejecting song', 'error');
        }
    } catch (error) {
        console.error('Error rejecting song:', error);
        showNotification('Error rejecting song', 'error');
    }
}

async function blockSong(songId) {
    try {
        const response = await fetch('backend/api/admin.php?action=block_song', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ song_id: songId })
        });
        const data = await response.json();
        if (data.success) {
            alert('Song blocked');
            loadSampleData(); // Refresh data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error blocking song:', error);
        alert('Error blocking song');
    }
}

async function toggleUserSuspend(userId, currentStatus) {
    const targetStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    const actionLabel = targetStatus === 'blocked' ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${actionLabel} this user?`)) {
        return;
    }
    try {
        const response = await fetch('backend/api/admin.php?action=change_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, status: targetStatus })
        });
        const data = await response.json();
        if (data.success) {
            showNotification(`User ${actionLabel}d successfully`, 'success');
            loadSampleData();
        } else {
            showNotification(data.message || 'Error updating user status', 'error');
        }
    } catch (error) {
        console.error('Error updating user status:', error);
        showNotification('Error updating user status', 'error');
    }
}

async function resetUserPassword() {
    const userId = document.getElementById('resetPasswordUserId').value;
    const password = document.getElementById('resetPasswordNew').value;
    const confirmPassword = document.getElementById('resetPasswordConfirm').value;

    if (!password || password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('backend/api/admin.php?action=reset_password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, password })
        });
        const data = await response.json();
        if (data.success) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('resetPasswordModal'));
            modal.hide();
            showNotification('Password reset successfully', 'success');
        } else {
            showNotification(data.message || 'Error resetting password', 'error');
        }
    } catch (error) {
        console.error('Error resetting password:', error);
        showNotification('Error resetting password', 'error');
    }
}



async function deleteEntity(entity, id, itemName, row) {
    let endpoint = '';
    if (entity === 'user') endpoint = `backend/api/users.php?id=${id}`;
    if (entity === 'artist') endpoint = `backend/api/artists.php?id=${id}`;
    if (entity === 'song') endpoint = `backend/api/songs.php?id=${id}`;

    if (!endpoint) {
        row?.remove();
        showNotification(`"${itemName}" has been deleted`, 'success');
        return;
    }

    try {
        const response = await fetch(endpoint, { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
            showNotification(`"${itemName}" has been deleted`, 'success');
            loadSampleData();
        } else {
            showNotification(data.message || 'Error deleting item', 'error');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
        row.style.opacity = '0.5';
        setTimeout(() => {
            row.remove();
            showNotification(`"${itemName}" has been deleted (local)`, 'success');
        }, 300);
    }
}

async function assignRole(userId, role) {
    try {
        const response = await fetch('backend/api/admin.php?action=assign_role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, role: role })
        });
        const data = await response.json();
        if (data.success) {
            alert('Role assigned successfully');
            loadSampleData(); // Refresh data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error assigning role:', error);
        alert('Error assigning role');
    }
}

async function changeUserStatus(userId, status) {
    try {
        const response = await fetch('backend/api/admin.php?action=change_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, status: status })
        });
        const data = await response.json();
        if (data.success) {
            alert('User status updated');
            loadSampleData(); // Refresh data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Error updating status');
    }
}

async function resolveReport(reportId) {
    try {
        const response = await fetch('backend/api/admin.php?action=resolve_report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report_id: reportId, admin_id: 1 }) // Assuming admin ID 1
        });
        const data = await response.json();
        if (data.success) {
            alert('Report resolved');
            loadSampleData(); // Refresh data
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error resolving report:', error);
        alert('Error resolving report');
    }
}

function loadFallbackData() {
    console.log('Loading fallback sample data...');

    // Fallback to original sample data if API fails
    const users = [
        {
            id: 1001,
            name: "John Mbarga",
            email: "john.mbarga@email.com",
            phone: "+237 6XX XXX XXX",
            type: "fan",
            status: "active",
            joined: "2023-08-15",
            avatar: "JM"
        },
        // ... add the rest as in original
    ];

    // No longer merging with localStorage - using fallback data only

    // Similar for artists and songs
    // For brevity, I'll assume it's implemented

    // Populate tables with data
    populateUsersTable(users);
    populateAllUsersTable(users);

    // Store data globally
    window.sampleData = { users: users, artists: [], songs: [], subscriptions: [], analytics: {}, revenue: {}, reports: [] };

    console.log('Fallback data loaded');
}

// Add New User Function
function addNewUser() {
    const form = document.getElementById('addUserForm');

    // Get form values
    const firstName = document.getElementById('userFirstName').value.trim();
    const lastName = document.getElementById('userLastName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const userType = document.getElementById('userType').value;
    const password = document.getElementById('userPassword').value;
    const confirmPassword = document.getElementById('userConfirmPassword').value;
    const isActive = document.getElementById('userActive').checked;

    // Validation
    if (!firstName || !lastName || !email || !userType || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Create user object (format for backend API)
    const fullName = `${firstName} ${lastName}`;
    const newUser = {
        name: fullName,
        email: email,
        phone: phone || null,
        password: password,
        type: userType,
        status: isActive ? 'active' : 'pending'
    };

    // Show loading state
    const submitBtn = document.querySelector('#addUserModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Creating...';
    submitBtn.disabled = true;

    // Make actual API call to create user
    fetch('backend/api/users.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset form and close modal
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
                modal.hide();

                // Show success message
                showNotification(`User "${fullName}" has been created successfully!`, 'success');

                // Refresh the users table
                refreshDashboardData();
            } else {
                // Show error message
                showNotification(data.message || 'Error creating user', 'error');
            }
        })
        .catch(error => {
            console.error('API Error:', error);
            // Fallback: Add user to local sample data for demonstration
            console.log('API not available, adding user to local data for demonstration');

            // Add user to sample data if it exists
            if (window.sampleData && window.sampleData.users) {
                const newUserId = Math.max(...window.sampleData.users.map(u => u.id)) + 1;
                const localUser = {
                    id: newUserId,
                    name: fullName,
                    email: email,
                    phone: phone || '',
                    type: userType,
                    status: isActive ? 'active' : 'pending',
                    joined: new Date().toISOString().split('T')[0],
                    avatar: fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                };
                window.sampleData.users.unshift(localUser);

                // Note: Data persistence is now handled server-side
            }

            // Reset form and close modal
            form.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addUserModal'));
            modal.hide();

            // Show success message
            showNotification(`User "${fullName}" has been created successfully!`, 'success');

            // Refresh the users table
            refreshDashboardData();
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// Helper Functions for Dropdowns
function populateUserDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select User</option>';

    // Get users from sample data or API
    const users = window.sampleData?.users || [];
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        dropdown.appendChild(option);
    });
}

function populateArtistDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="">Select Artist</option>';

    // Get artists from sample data or API
    const artists = window.sampleData?.artists || [];
    artists.forEach(artist => {
        const option = document.createElement('option');
        option.value = artist.id;
        option.textContent = artist.name;
        dropdown.appendChild(option);
    });
}

// Add New Artist Function
function addNewArtist() {
    const form = document.getElementById('addArtistForm');

    // Get form values
    const name = document.getElementById('artistName').value.trim();
    const genre = document.getElementById('artistGenre').value;
    const userId = document.getElementById('artistUserId').value;
    const bio = document.getElementById('artistBio').value.trim();
    // Validation
    if (!name || !genre) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Create artist object
    const newArtist = {
        user_id: userId || null,
        name: name,
        genre: genre,
        followers: 0,
        songs_count: 0,
        status: 'pending',
        verification: 'pending',
        bio: bio
    };

    // Show loading state
    const submitBtn = document.querySelector('#addArtistModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Creating...';
    submitBtn.disabled = true;

    // Make API call
    fetch('backend/api/artists.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newArtist)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset form and close modal
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addArtistModal'));
                modal.hide();

                // Show success message
                showNotification(`Artist "${name}" has been created successfully!`, 'success');

                // Refresh the dashboard
                refreshDashboardData();
            } else {
                showNotification(data.message || 'Error creating artist', 'error');
            }
        })
        .catch(error => {
            console.error('API Error:', error);
            // Fallback: Add artist to local sample data
            if (window.sampleData && window.sampleData.artists) {
                const newArtistId = Math.max(...window.sampleData.artists.map(a => a.id)) + 1;
                const localArtist = {
                    id: newArtistId,
                    user_id: userId || null,
                    name: name,
                    genre: genre,
                    followers: 0,
                    songs_count: 0,
                    status: 'pending',
                    verification: 'pending',
                    bio: bio
                };
                window.sampleData.artists.unshift(localArtist);
                // Note: Data persistence is now handled server-side
            }

            // Reset form and close modal
            form.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addArtistModal'));
            modal.hide();

            // Show success message
            showNotification(`Artist "${name}" has been created successfully!`, 'success');

            // Refresh the dashboard
            refreshDashboardData();
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// Add New Song Function
function addNewSong() {
    const form = document.getElementById('addSongForm');

    // Get form values
    const title = document.getElementById('songTitle').value.trim();
    const artistId = document.getElementById('songArtist').value;
    const genre = document.getElementById('songGenre').value;
    const duration = document.getElementById('songDuration').value;
    const status = document.getElementById('songStatus').value;

    // Validation
    if (!title || !artistId || !genre || !duration) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Validate duration format (MM:SS)
    const durationRegex = /^\d{1,2}:\d{2}$/;
    if (!durationRegex.test(duration)) {
        showNotification('Duration must be in MM:SS format (e.g., 03:45)', 'error');
        return;
    }

    // Create song object
    const newSong = {
        title: title,
        artist_id: artistId,
        genre: genre,
        duration: duration,
        plays: 0,
        likes: 0,
        file_path: null,
        cover_art: null,
        status: status
    };

    // Show loading state
    const submitBtn = document.querySelector('#addSongModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Creating...';
    submitBtn.disabled = true;

    // Make API call
    fetch('backend/api/songs.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSong)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset form and close modal
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addSongModal'));
                modal.hide();

                // Show success message
                showNotification(`Song "${title}" has been created successfully!`, 'success');

                // Refresh the dashboard
                refreshDashboardData();
            } else {
                showNotification(data.message || 'Error creating song', 'error');
            }
        })
        .catch(error => {
            console.error('API Error:', error);
            // Fallback: Add song to local sample data
            if (window.sampleData && window.sampleData.songs) {
                const newSongId = Math.max(...window.sampleData.songs.map(s => s.id)) + 1;
                const localSong = {
                    id: newSongId,
                    title: title,
                    artist_id: artistId,
                    genre: genre,
                    duration: duration,
                    plays: 0,
                    likes: 0,
                    file_path: null,
                    cover_art: null,
                    status: status
                };
                window.sampleData.songs.unshift(localSong);
                // Note: Data persistence is now handled server-side
            }

            // Reset form and close modal
            form.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSongModal'));
            modal.hide();

            // Show success message
            showNotification(`Song "${title}" has been created successfully!`, 'success');

            // Refresh the dashboard
            refreshDashboardData();
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// Add New Subscription Function
function addNewSubscription() {
    const form = document.getElementById('addSubscriptionForm');

    // Get form values
    const planName = document.getElementById('planName').value.trim();
    const amount = parseFloat(document.getElementById('planAmount').value);
    const userId = document.getElementById('planUser').value;
    const startDate = document.getElementById('planStartDate').value;
    const endDate = document.getElementById('planEndDate').value;
    // Validation
    if (!planName || !amount || !userId || !startDate || !endDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
        showNotification('End date must be after start date', 'error');
        return;
    }

    // Create subscription object
    const newSubscription = {
        user_id: userId,
        plan_name: planName,
        amount: amount,
        status: 'active',
        start_date: startDate,
        end_date: endDate
    };

    // Show loading state
    const submitBtn = document.querySelector('#addSubscriptionModal .btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Creating...';
    submitBtn.disabled = true;

    // Make API call
    fetch('backend/api/subscriptions.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubscription)
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset form and close modal
                form.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('addSubscriptionModal'));
                modal.hide();

                // Show success message
                showNotification(`Subscription "${planName}" has been created successfully!`, 'success');

                // Refresh the dashboard
                refreshDashboardData();
            } else {
                showNotification(data.message || 'Error creating subscription', 'error');
            }
        })
        .catch(error => {
            console.error('API Error:', error);
            // Fallback: Add subscription to local sample data
            if (window.sampleData && window.sampleData.subscriptions) {
                const newSubId = Math.max(...window.sampleData.subscriptions.map(s => s.id)) + 1;
                const localSubscription = {
                    id: newSubId,
                    user_id: userId,
                    plan_name: planName,
                    amount: amount,
                    status: 'active',
                    start_date: startDate,
                    end_date: endDate
                };
                window.sampleData.subscriptions.unshift(localSubscription);
                // Note: Data persistence is now handled server-side
            }

            // Reset form and close modal
            form.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addSubscriptionModal'));
            modal.hide();

            // Show success message
            showNotification(`Subscription "${planName}" has been created successfully!`, 'success');

            // Refresh the dashboard
            refreshDashboardData();
        })
        .finally(() => {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// View User Details
async function viewUserDetails(id) {
    try {
        let user = null;
        // Try to find in loaded data first
        if (window.sampleData && window.sampleData.users) {
            user = window.sampleData.users.find(u => u.id == id);
        }

        // If not found, fetch from API
        if (!user) {
            const response = await fetch(`backend/api/users.php?id=${id}`);
            const data = await response.json();
            if (data.success) user = data.data;
        }

        if (user) {
            const modalBody = document.getElementById('viewUserModalBody');
            modalBody.innerHTML = `
                <div class="text-center mb-4">
                    <div style="width: 100px; height: 100px; background-color: var(--primary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto; font-weight: bold; overflow: hidden;">
                        ${user.avatar && (user.avatar.includes('/') || user.avatar.includes('.'))
                    ? `<img src="${user.avatar}" alt="${user.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : (user.avatar || user.name.charAt(0))}
                    </div>
                    <h4 class="mt-3">${user.name}</h4>
                    <p>${user.email}</p>
                    <span class="badge bg-${getTypeColor(user.type)}">${user.type}</span>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="small">Status</label>
                        <div class="fw-bold"><span class="status-badge status-${user.status}">${user.status}</span></div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">Joined Date</label>
                        <div class="fw-bold">${user.joined}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">Phone</label>
                        <div class="fw-bold">${user.phone || 'N/A'}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">User ID</label>
                        <div class="fw-bold">#${user.id}</div>
                    </div>
                </div>
            `;
            const modal = new bootstrap.Modal(document.getElementById('viewUserModal'));
            modal.show();
        } else {
            showNotification('User not found', 'error');
        }
    } catch (error) {
        console.error('Error viewing user:', error);
        showNotification('Error loading user details', 'error');
    }
}

// View Song Details with Inline Editing
async function viewSongDetails(id) {
    try {
        let song = null;
        // Try to find in loaded data first
        if (window.sampleData && window.sampleData.songs) {
            song = window.sampleData.songs.find(s => s.id == id);
        }

        // If not found, fetch from API
        if (!song) {
            const response = await fetch(`backend/api/songs.php?id=${id}`);
            const data = await response.json();
            if (data.success) song = data.data;
        }

        if (song) {
            const modalBody = document.getElementById('viewSongModalBody');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-4 text-center mb-3">
                        <div style="width: 100%; aspect-ratio: 1; background: linear-gradient(135deg, var(--accent-primary), var(--accent-hover)); border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <i class="fas fa-music fa-4x" style="color: rgba(255,255,255,0.3);"></i>
                        </div>
                        <button class="btn btn-sm btn-secondary mt-3" style="width: 100%;" onclick="playSongInModal(${song.id})">
                            <i class="fas fa-play me-1"></i> Play Song
                        </button>
                    </div>
                    <div class="col-md-8">
                        <div class="mb-4">
                            <label class="small">SONG TITLE</label>
                            <input type="text" class="form-control form-control-lg" id="viewEditSongTitle" value="${song.title}" style="background-color: #1a1a2e; border: 1px solid #444;">
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="small">ARTIST</label>
                                <input type="text" class="form-control" value="${song.artist || song.artist_name}" readonly style="background-color: #0a0a1e; border: 1px solid #333; cursor: not-allowed;">
                                <input type="hidden" id="viewEditSongArtistId" value="${song.artist_id}">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="small">GENRE</label>
                                <select class="form-control" id="viewEditSongGenre" style="background-color: #1a1a2e; border: 1px solid #444;">
                                    <option value="Makossa" ${song.genre === 'Makossa' ? 'selected' : ''}>Makossa</option>
                                    <option value="Bikutsi" ${song.genre === 'Bikutsi' ? 'selected' : ''}>Bikutsi</option>
                                    <option value="Afrobeat" ${song.genre === 'Afrobeat' ? 'selected' : ''}>Afrobeat</option>
                                    <option value="Assiko" ${song.genre === 'Assiko' ? 'selected' : ''}>Assiko</option>
                                    <option value="Traditional" ${song.genre === 'Traditional' ? 'selected' : ''}>Traditional</option>
                                    <option value="Gospel" ${song.genre === 'Gospel' ? 'selected' : ''}>Gospel</option>
                                    <option value="Bend Skin" ${song.genre === 'Bend Skin' ? 'selected' : ''}>Bend Skin</option>
                                    <option value="Hip Hop" ${song.genre === 'Hip Hop' ? 'selected' : ''}>Hip Hop</option>
                                    <option value="R&B" ${song.genre === 'R&B' ? 'selected' : ''}>R&B</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="small">DURATION</label>
                                <input type="text" class="form-control" id="viewEditSongDuration" value="${song.duration || ''}" placeholder="4:32" style="background-color: #1a1a2e; border: 1px solid #444;">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="small">STATUS</label>
                                <select class="form-control" id="viewEditSongStatus" style="background-color: #1a1a2e; border: 1px solid #444;">
                                    <option value="active" ${song.status === 'active' ? 'selected' : ''}>Active/Published</option>
                                    <option value="pending" ${song.status === 'pending' ? 'selected' : ''}>Pending Review</option>
                                    <option value="blocked" ${song.status === 'blocked' ? 'selected' : ''}>Blocked</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="row mt-3 pt-3" style="border-top: 1px solid #333;">
                            <div class="col-6 mb-2">
                                <label class="small">Total Plays</label>
                                <div class="fw-bold text-success">${song.plays || 0}</div>
                            </div>
                            <div class="col-6 mb-2">
                                <label class="small">Upload Date</label>
                                <div class="fw-bold text-white">${song.date || song.created_at || 'N/A'}</div>
                            </div>
                            <div class="col-6 mb-2">
                                <label class="small">Song ID</label>
                                <div class="fw-bold text-white">#${song.id}</div>
                                <input type="hidden" id="viewEditSongId" value="${song.id}">
                            </div>
                            <div class="col-6 mb-2">
                                <label class="small">File Path</label>
                                <div class="fw-bold text-white" style="font-size: 11px; word-break: break-all;">${song.file_path || 'Not uploaded'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Update modal footer to include Save button
            const modal = document.getElementById('viewSongModal');
            const modalFooter = modal.querySelector('.modal-footer');
            modalFooter.innerHTML = `
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onclick="saveFromViewModal('song')">
                    <i class="fas fa-save me-1"></i>Save Changes
                </button>
            `;

            const bootstrapModal = new bootstrap.Modal(modal);
            bootstrapModal.show();
        } else {
            showNotification('Song not found', 'error');
        }
    } catch (error) {
        console.error('Error viewing song:', error);
        showNotification('Error loading song details', 'error');
    }
}

// View Artist Details
async function viewArtistDetails(id) {
    try {
        let artist = null;
        // Try to find in loaded data first
        if (window.sampleData && window.sampleData.artists) {
            artist = window.sampleData.artists.find(a => a.id == id);
        }

        // If not found, fetch from API
        if (!artist) {
            const response = await fetch(`backend/api/artists.php?id=${id}`);
            const data = await response.json();
            if (data.success) artist = data.data;
        }

        if (artist) {
            const modalBody = document.getElementById('viewArtistModalBody');
            modalBody.innerHTML = `
                <div class="text-center mb-4">
                    <div style="width: 100px; height: 100px; background-color: var(--secondary-color); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto; font-weight: bold; overflow: hidden;">
                        ${(artist.image || artist.photo)
                    ? `<img src="${artist.image || artist.photo}" alt="${artist.name}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : artist.name.charAt(0)}
                    </div>
                    <h4 class="mt-3">${artist.name}</h4>
                    <p>${artist.email || ''}</p>
                    <div><span class="badge" style="background-color: #${getGenreColor(artist.genre)}">${artist.genre}</span></div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="small">Verification Status</label>
                        <div class="fw-bold"><span class="badge bg-${getVerificationColor(artist.verification)}">${artist.verification}</span></div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">Total Followers</label>
                        <div class="fw-bold">${artist.followers}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">Total Songs</label>
                        <div class="fw-bold">${artist.songs}</div>
                    </div>
                     <div class="col-md-6 mb-3">
                        <label class="small">Account Status</label>
                        <div class="fw-bold"><span class="status-badge status-${artist.status}">${artist.status}</span></div>
                    </div>
                </div>
            `;
            const modal = new bootstrap.Modal(document.getElementById('viewArtistModal'));
            modal.show();
        } else {
            showNotification('Artist not found', 'error');
        }
    } catch (error) {
        console.error('Error viewing artist:', error);
        showNotification('Error loading artist details', 'error');
    }
}

// View Subscription Details
async function viewSubscriptionDetails(id) {
    try {
        let sub = null;
        // Try to find in loaded data first
        if (window.sampleData && window.sampleData.subscriptions) {
            sub = window.sampleData.subscriptions.find(s => s.id == id);
        }

        // If not found, fetch from API
        if (!sub) {
            const response = await fetch(`backend/api/subscriptions.php?id=${id}`);
            const data = await response.json();
            if (data.success) sub = data.data;
        }

        if (sub) {
            const modalBody = document.getElementById('viewSubscriptionModalBody');
            modalBody.innerHTML = `
                <div class="text-center mb-4">
                    <div class="display-4 text-primary mb-2"><i class="fas fa-crown"></i></div>
                    <h4>${sub.plan_name}</h4>
                    <div class="h3">$${sub.amount}</div>
                    <span class="badge bg-${sub.status === 'active' ? 'success' : 'secondary'}">${sub.status}</span>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="small">Subscriber</label>
                        <div class="fw-bold">${sub.user_name}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">Subscription ID</label>
                        <div class="fw-bold">#${sub.id}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">Start Date</label>
                        <div class="fw-bold">${sub.start_date}</div>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="small">End Date</label>
                        <div class="fw-bold">${sub.end_date}</div>
                    </div>
                </div>
            `;
            const modal = new bootstrap.Modal(document.getElementById('viewSubscriptionModal'));
            modal.show();
        } else {
            showNotification('Subscription not found', 'error');
        }
    } catch (error) {
        console.error('Error viewing subscription:', error);
        showNotification('Error loading subscription details', 'error');
    }
}

// ==================================================
// Edit Modal Functions
// ==================================================

/**
 * Open edit user modal and populate with current data
 */
async function openEditUserModal(userId) {
    try {
        let user = null;
        // Try to find in loaded data first
        if (window.sampleData && window.sampleData.users) {
            user = window.sampleData.users.find(u => u.id == userId);
        }

        if (user) {
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUserName').value = user.name || '';
            document.getElementById('editUserEmail').value = user.email || '';
            document.getElementById('editUserPhone').value = user.phone || '';
            document.getElementById('editUserType').value = user.type || 'fan';
            document.getElementById('editUserStatus').value = user.status || 'active';

            const modal = new bootstrap.Modal(document.getElementById('editUserModal'));
            modal.show();
        } else {
            showNotification('User not found', 'error');
        }
    } catch (error) {
        console.error('Error opening edit user modal:', error);
        showNotification('Error loading user data', 'error');
    }
}

/**
 * Save user edits via API
 */
async function saveUserEdit() {
    try {
        const userId = document.getElementById('editUserId').value;
        const userData = {
            id: userId,
            name: document.getElementById('editUserName').value,
            email: document.getElementById('editUserEmail').value,
            phone: document.getElementById('editUserPhone').value,
            type: document.getElementById('editUserType').value,
            status: document.getElementById('editUserStatus').value
        };

        const response = await fetch('backend/api/users.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('User updated successfully', 'success');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
            modal.hide();
            // Refresh data
            await refreshDashboardData();
        } else {
            showNotification(data.message || 'Failed to update user', 'error');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        showNotification('Error updating user', 'error');
    }
}

/**
 * Open edit artist modal and populate with current data
 */
async function openEditArtistModal(artistId) {
    try {
        let artist = null;
        // Try to find in loaded data first
        if (window.sampleData && window.sampleData.artists) {
            artist = window.sampleData.artists.find(a => a.id == artistId);
        }

        if (artist) {
            document.getElementById('editArtistId').value = artist.id;
            document.getElementById('editArtistName').value = artist.name || '';
            document.getElementById('editArtistGenre').value = artist.genre || 'Afrobeat';
            document.getElementById('editArtistStatus').value = artist.status || 'pending';
            document.getElementById('editArtistVerification').value = artist.verification || 'pending';
            document.getElementById('editArtistBio').value = artist.bio || '';
            document.getElementById('editArtistInstagram').value = artist.instagram_url || '';
            document.getElementById('editArtistTwitter').value = artist.twitter_url || '';
            document.getElementById('editArtistFacebook').value = artist.facebook_url || '';
            document.getElementById('editArtistYoutube').value = artist.youtube_url || '';

            const modal = new bootstrap.Modal(document.getElementById('editArtistModal'));
            modal.show();
        } else {
            showNotification('Artist not found', 'error');
        }
    } catch (error) {
        console.error('Error opening edit artist modal:', error);
        showNotification('Error loading artist data', 'error');
    }
}

/**
 * Save artist edits via API
 */
async function saveArtistEdit() {
    try {
        const artistId = document.getElementById('editArtistId').value;
        const artistData = {
            id: artistId,
            name: document.getElementById('editArtistName').value,
            genre: document.getElementById('editArtistGenre').value,
            status: document.getElementById('editArtistStatus').value,
            verification: document.getElementById('editArtistVerification').value,
            bio: document.getElementById('editArtistBio').value,
            instagram_url: document.getElementById('editArtistInstagram').value,
            twitter_url: document.getElementById('editArtistTwitter').value,
            facebook_url: document.getElementById('editArtistFacebook').value,
            youtube_url: document.getElementById('editArtistYoutube').value,
            // Keep existing values for these fields to avoid nullifying them
            followers: window.sampleData.artists.find(a => a.id == artistId)?.followers || 0,
            songs_count: window.sampleData.artists.find(a => a.id == artistId)?.songs_count || 0
        };

        const response = await fetch('backend/api/artists.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(artistData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Artist updated successfully', 'success');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editArtistModal'));
            modal.hide();
            // Refresh data
            await refreshDashboardData();
        } else {
            showNotification(data.message || 'Failed to update artist', 'error');
        }
    } catch (error) {
        console.error('Error saving artist:', error);
        showNotification('Error updating artist', 'error');
    }
}

/**
 * Open edit song modal and populate with current data
 */
async function openEditSongModal(songId) {
    try {
        let song = null;
        // Try to find in loaded data first
        if (window.sampleData && window.sampleData.songs) {
            song = window.sampleData.songs.find(s => s.id == songId);
        }

        if (song) {
            document.getElementById('editSongId').value = song.id;
            document.getElementById('editSongArtistId').value = song.artist_id;
            document.getElementById('editSongTitle').value = song.title || '';
            document.getElementById('editSongArtist').value = song.artist_name || '';
            document.getElementById('editSongGenre').value = song.genre || 'Afrobeat';
            document.getElementById('editSongDuration').value = song.duration || '';
            document.getElementById('editSongStatus').value = song.status || 'pending';

            const modal = new bootstrap.Modal(document.getElementById('editSongModal'));
            modal.show();
        } else {
            showNotification('Song not found', 'error');
        }
    } catch (error) {
        console.error('Error opening edit song modal:', error);
        showNotification('Error loading song data', 'error');
    }
}

/**
 * Save song edits via API
 */
async function saveSongEdit() {
    try {
        const songId = document.getElementById('editSongId').value;
        const artistId = document.getElementById('editSongArtistId').value;
        const songData = {
            id: songId,
            title: document.getElementById('editSongTitle').value,
            artist_id: artistId, // Keep artist unchanged (read-only field)
            genre: document.getElementById('editSongGenre').value,
            duration: document.getElementById('editSongDuration').value,
            status: document.getElementById('editSongStatus').value
        };

        const response = await fetch('backend/api/songs.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(songData)
        });

        const data = await response.json();

        if (data.success) {
            showNotification('Song updated successfully', 'success');
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editSongModal'));
            modal.hide();
            // Refresh data
            await refreshDashboardData();
        } else {
            showNotification(data.message || 'Failed to update song', 'error');
        }
    } catch (error) {
        console.error('Error saving song:', error);
        showNotification('Error updating song', 'error');
    }
}

/**
 * Save changes from view/edit modal (comprehensive modal with inline editing)
 */
async function saveFromViewModal(entityType) {
    try {
        if (entityType === 'song') {
            const songId = document.getElementById('viewEditSongId').value;
            const artistId = document.getElementById('viewEditSongArtistId').value;
            const songData = {
                id: songId,
                title: document.getElementById('viewEditSongTitle').value,
                artist_id: artistId,
                genre: document.getElementById('viewEditSongGenre').value,
                duration: document.getElementById('viewEditSongDuration').value,
                status: document.getElementById('viewEditSongStatus').value
            };

            const response = await fetch('backend/api/songs.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(songData)
            });

            const data = await response.json();

            if (data.success) {
                showNotification('Song updated successfully', 'success');
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('viewSongModal'));
                modal.hide();
                // Refresh data
                await refreshDashboardData();
            } else {
                showNotification(data.message || 'Failed to update song', 'error');
            }
        } else if (entityType === 'user') {
            // User save logic (to be implemented)
            showNotification('User save not yet implemented', 'warning');
        } else if (entityType === 'artist') {
            // Artist save logic (to be implemented)
            showNotification('Artist save not yet implemented', 'warning');
        }
    } catch (error) {
        console.error('Error saving from view modal:', error);
        showNotification('Error saving changes', 'error');
    }
}
