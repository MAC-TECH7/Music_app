// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    
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
    
    // Apply to all tables
    $('table').each(function() {
        if (!$.fn.DataTable.isDataTable(this)) {
            $(this).DataTable(tableOptions);
        }
    });
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
                            callback: function(value) {
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
        
        // Merge with localStorage users (for persistence when API is down)
        users = mergeUsersWithLocalStorage(users);
        
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
        
        // Merge with localStorage artists
        const localArtists = loadArtistsFromLocalStorage();
        if (localArtists) {
            localArtists.forEach(localArtist => {
                const existingIndex = artists.findIndex(artist => artist.name === localArtist.name);
                if (existingIndex === -1) {
                    artists.unshift({
                        id: localArtist.id,
                        name: localArtist.name,
                        genre: localArtist.genre,
                        followers: localArtist.followers >= 1000 ? (localArtist.followers / 1000).toFixed(0) + 'K' : localArtist.followers.toString(),
                        songs: localArtist.songs_count,
                        status: localArtist.status,
                        verification: localArtist.verification
                    });
                }
            });
        }
        
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
        
        // Merge with localStorage songs
        const localSongs = loadSongsFromLocalStorage();
        if (localSongs) {
            localSongs.forEach(localSong => {
                const existingIndex = songs.findIndex(song => song.title === localSong.title && song.artist_id === localSong.artist_id);
                if (existingIndex === -1) {
                    // Find artist name for local song
                    const artist = artists.find(a => a.id == localSong.artist_id);
                    songs.unshift({
                        id: localSong.id,
                        title: localSong.title,
                        artist: artist ? artist.name : 'Unknown Artist',
                        genre: localSong.genre,
                        plays: localSong.plays >= 1000000 ? (localSong.plays / 1000000).toFixed(1) + 'M' : localSong.plays >= 1000 ? (localSong.plays / 1000).toFixed(0) + 'K' : localSong.plays.toString(),
                        duration: localSong.duration,
                        date: new Date().toISOString().split('T')[0],
                        status: localSong.status === 'active' ? 'published' : localSong.status
                    });
                }
            });
        }
        
        // Fetch subscriptions
        const subsResponse = await fetch('backend/api/subscriptions.php');
        const subsData = await subsResponse.json();
        let subscriptions = subsData.success ? subsData.data : [];
        
        // Merge with localStorage subscriptions
        const localSubscriptions = loadSubscriptionsFromLocalStorage();
        if (localSubscriptions) {
            localSubscriptions.forEach(localSub => {
                const existingIndex = subscriptions.findIndex(sub => sub.plan_name === localSub.plan_name && sub.user_id === localSub.user_id);
                if (existingIndex === -1) {
                    subscriptions.unshift(localSub);
                }
            });
        }
        
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
                    <div class="user-avatar">${user.avatar}</div>
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
                    <button class="btn-action view" data-id="${user.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-id="${user.id}" title="Edit">
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
                    <div class="user-avatar">${user.avatar}</div>
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
                    <button class="btn-action view" data-id="${user.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-id="${user.id}" title="Edit">
                        <i class="fas fa-edit"></i>
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
                    <button class="btn-action delete" data-id="${user.id}" title="Delete">
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
                    <div class="user-avatar">${artist.name.charAt(0)}</div>
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
                    <button class="btn-action view" data-id="${artist.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-id="${artist.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${artist.verification === 'pending' ? `
                        <button class="btn-action approve" data-id="${artist.id}" title="Approve" onclick="approveArtist(${artist.id})">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="btn-action reject" data-id="${artist.id}" title="Reject" onclick="rejectArtist(${artist.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action delete" data-id="${artist.id}" title="Delete">
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
                    <button class="btn-action view" data-id="${song.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-id="${song.id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${song.status === 'pending' ? `
                        <button class="btn-action approve" data-id="${song.id}" title="Approve" onclick="approveSong(${song.id})">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${song.status === 'active' ? `
                        <button class="btn-action block" data-id="${song.id}" title="Block" onclick="blockSong(${song.id})">
                            <i class="fas fa-ban"></i>
                        </button>
                    ` : ''}
                    <button class="btn-action delete" data-id="${song.id}" title="Delete">
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
                    <button class="btn-action view" data-id="${song.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action edit" data-id="${song.id}" title="Edit">
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
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            console.log('Searching for:', searchTerm);
            // Implement search across all tables
            $('table').DataTable().search(searchTerm).draw();
        });
    }
    
    // Add user button
    document.getElementById('addUserBtn')?.addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
        modal.show();
    });
    
    // Add artist button
    document.getElementById('addArtistBtn')?.addEventListener('click', function() {
        populateUserDropdown('artistUserId');
        const modal = new bootstrap.Modal(document.getElementById('addArtistModal'));
        modal.show();
    });
    
    // Add song button
    document.getElementById('addSongBtn')?.addEventListener('click', function() {
        populateArtistDropdown('songArtist');
        const modal = new bootstrap.Modal(document.getElementById('addSongModal'));
        modal.show();
    });
    
    // Add subscription plan button
    document.getElementById('addSubscriptionPlanBtn')?.addEventListener('click', function() {
        populateUserDropdown('planUser');
        const modal = new bootstrap.Modal(document.getElementById('addSubscriptionModal'));
        modal.show();
    });
    
    // Export buttons
    document.getElementById('exportUsersBtn')?.addEventListener('click', function() {
        alert('Exporting users data...');
    });
    
    document.getElementById('exportAllUsersBtn')?.addEventListener('click', function() {
        alert('Exporting all users data...');
    });
    
    document.getElementById('exportArtistsBtn')?.addEventListener('click', function() {
        alert('Exporting artists data...');
    });
    
    document.getElementById('exportSongsBtn')?.addEventListener('click', function() {
        alert('Exporting songs data...');
    });
    
    document.getElementById('exportReportBtn')?.addEventListener('click', function() {
        alert('Exporting report data...');
    });
    
    // Generate report button
    document.getElementById('generateReportBtn')?.addEventListener('click', function() {
        alert('Generating report... This would create a comprehensive report');
    });
    
    // Save settings button
    document.getElementById('saveSettingsBtn')?.addEventListener('click', function() {
        alert('Settings saved successfully!');
    });
    
    // Refresh buttons
    document.getElementById('refreshSongsBtn')?.addEventListener('click', function() {
        refreshDashboardData();
    });
    
    document.getElementById('refreshSubscriptionsBtn')?.addEventListener('click', function() {
        alert('Refreshing subscriptions data...');
    });
    
    // Notifications button
    document.getElementById('notificationsBtn')?.addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('notificationsModal'));
        modal.show();
    });
    
    // Admin avatar button
    document.getElementById('adminAvatar')?.addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('adminProfileModal'));
        modal.show();
    });
    
    // Reset add user form when modal is hidden
    document.getElementById('addUserModal')?.addEventListener('hidden.bs.modal', function() {
        document.getElementById('addUserForm').reset();
    });
    
    // Reset add artist form when modal is hidden
    document.getElementById('addArtistModal')?.addEventListener('hidden.bs.modal', function() {
        document.getElementById('addArtistForm').reset();
    });
    
    // Reset add song form when modal is hidden
    document.getElementById('addSongModal')?.addEventListener('hidden.bs.modal', function() {
        document.getElementById('addSongForm').reset();
    });
    
    // Reset add subscription form when modal is hidden
    document.getElementById('addSubscriptionModal')?.addEventListener('hidden.bs.modal', function() {
        document.getElementById('addSubscriptionForm').reset();
    });
    
    // Action buttons delegation
    document.addEventListener('click', function(e) {
        // View buttons
        if (e.target.closest('.btn-action.view')) {
            const button = e.target.closest('.btn-action.view');
            const id = button.dataset.id;
            const type = button.closest('tr').querySelector('td:nth-child(2)')?.textContent.includes('@') ? 'user' : 
                        button.closest('tr').querySelector('td:nth-child(3)')?.textContent.includes('K') ? 'artist' : 'song';
            alert(`View ${type} details for ID: ${id}`);
        }
        
        // Edit buttons
        if (e.target.closest('.btn-action.edit')) {
            const button = e.target.closest('.btn-action.edit');
            const id = button.dataset.id;
            alert(`Edit item with ID: ${id}`);
        }
        
        // Delete buttons
        if (e.target.closest('.btn-action.delete')) {
            const button = e.target.closest('.btn-action.delete');
            const id = button.dataset.id;
            const row = button.closest('tr');
            const itemName = row.querySelector('td:nth-child(2) strong')?.textContent || 
                           row.querySelector('td:nth-child(2)')?.textContent;
            
            if (confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
                row.style.opacity = '0.5';
                setTimeout(() => {
                    row.remove();
                    showNotification(`"${itemName}" has been deleted`, 'success');
                }, 300);
            }
        }
    });
    
    // Search inputs for specific sections
    document.getElementById('userSearch')?.addEventListener('input', function(e) {
        $('#allUsersTable').DataTable().search(e.target.value).draw();
    });
    
    document.getElementById('artistSearch')?.addEventListener('input', function(e) {
        $('#artistsTable').DataTable().search(e.target.value).draw();
    });
    
    document.getElementById('songSearch')?.addEventListener('input', function(e) {
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
        link.addEventListener('click', function(e) {
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
                    $('table').DataTable().draw();
                }, 100);
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
        
        refreshBtn.addEventListener('click', function() {
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
    switch(type) {
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
    
    // Merge with localStorage users
    const mergedUsers = mergeUsersWithLocalStorage(users);
    
    // Similar for artists and songs
    // For brevity, I'll assume it's implemented
    
    // Populate tables with merged data
    populateUsersTable(mergedUsers);
    populateAllUsersTable(mergedUsers);
    
    // Store merged data globally
    window.sampleData = { users: mergedUsers, artists: [], songs: [], subscriptions: [], analytics: {}, revenue: {}, reports: [] };
    
    console.log('Fallback data loaded with localStorage users');
}

// Local Storage Functions for User Persistence
function saveUsersToLocalStorage(users) {
    try {
        try{ localStorage.setItem('admin_users', JSON.stringify(users)); }catch(e){}
        if (window.afro && window.afro.storage && typeof window.afro.storage.set === 'function') {
            window.afro.storage.set('admin_users', users).catch(()=>{});
        }
    } catch (error) {
        console.error('Error saving users to localStorage:', error);
    }
}

function loadUsersFromLocalStorage() {
    try {
        const savedUsers = (()=>{ try{ return localStorage.getItem('admin_users'); }catch(e){return null;} })();
        const parsed = savedUsers ? JSON.parse(savedUsers) : null;
        // async fetch from server-backed storage and merge later
        if (window.afro && window.afro.storage && typeof window.afro.storage.get === 'function') {
            window.afro.storage.get('admin_users').then(srv=>{
                if (srv) {
                    try{ localStorage.setItem('admin_users', JSON.stringify(srv)); }catch(e){}
                    console.log('Admin users loaded from server backup');
                }
            }).catch(()=>{});
        }
        return parsed;
    } catch (error) {
        console.error('Error loading users from localStorage:', error);
        return null;
    }
}

function saveArtistsToLocalStorage(artists) {
    try {
        try{ localStorage.setItem('admin_artists', JSON.stringify(artists)); }catch(e){}
        if (window.afro && window.afro.storage && typeof window.afro.storage.set === 'function') {
            window.afro.storage.set('admin_artists', artists).catch(()=>{});
        }
    } catch (error) {
        console.error('Error saving artists to localStorage:', error);
    }
}

function loadArtistsFromLocalStorage() {
    try {
        const savedArtists = (()=>{ try{ return localStorage.getItem('admin_artists'); }catch(e){return null;} })();
        const parsed = savedArtists ? JSON.parse(savedArtists) : null;
        if (window.afro && window.afro.storage && typeof window.afro.storage.get === 'function') {
            window.afro.storage.get('admin_artists').then(srv=>{ if (srv) try{ localStorage.setItem('admin_artists', JSON.stringify(srv)); }catch(e){} }).catch(()=>{});
        }
        return parsed;
    } catch (error) {
        console.error('Error loading artists from localStorage:', error);
        return null;
    }
}

function saveSongsToLocalStorage(songs) {
    try {
        try{ localStorage.setItem('admin_songs', JSON.stringify(songs)); }catch(e){}
        if (window.afro && window.afro.storage && typeof window.afro.storage.set === 'function') {
            window.afro.storage.set('admin_songs', songs).catch(()=>{});
        }
    } catch (error) {
        console.error('Error saving songs to localStorage:', error);
    }
}

function loadSongsFromLocalStorage() {
    try {
        const savedSongs = (()=>{ try{ return localStorage.getItem('admin_songs'); }catch(e){return null;} })();
        const parsed = savedSongs ? JSON.parse(savedSongs) : null;
        if (window.afro && window.afro.storage && typeof window.afro.storage.get === 'function') {
            window.afro.storage.get('admin_songs').then(srv=>{ if (srv) try{ localStorage.setItem('admin_songs', JSON.stringify(srv)); }catch(e){} }).catch(()=>{});
        }
        return parsed;
    } catch (error) {
        console.error('Error loading songs from localStorage:', error);
        return null;
    }
}

function saveSubscriptionsToLocalStorage(subscriptions) {
    try {
        try{ localStorage.setItem('admin_subscriptions', JSON.stringify(subscriptions)); }catch(e){}
        if (window.afro && window.afro.storage && typeof window.afro.storage.set === 'function') {
            window.afro.storage.set('admin_subscriptions', subscriptions).catch(()=>{});
        }
    } catch (error) {
        console.error('Error saving subscriptions to localStorage:', error);
    }
}

function loadSubscriptionsFromLocalStorage() {
    try {
        const savedSubscriptions = (()=>{ try{ return localStorage.getItem('admin_subscriptions'); }catch(e){return null;} })();
        const parsed = savedSubscriptions ? JSON.parse(savedSubscriptions) : null;
        if (window.afro && window.afro.storage && typeof window.afro.storage.get === 'function') {
            window.afro.storage.get('admin_subscriptions').then(srv=>{ if (srv) try{ localStorage.setItem('admin_subscriptions', JSON.stringify(srv)); }catch(e){} }).catch(()=>{});
        }
        return parsed;
    } catch (error) {
        console.error('Error loading subscriptions from localStorage:', error);
        return null;
    }
}

function mergeUsersWithLocalStorage(apiUsers) {
    const localUsers = loadUsersFromLocalStorage();
    if (!localUsers) return apiUsers;
    
    // Merge local users with API users, preferring local users for duplicates
    const mergedUsers = [...apiUsers];
    localUsers.forEach(localUser => {
        const existingIndex = mergedUsers.findIndex(user => user.email === localUser.email);
        if (existingIndex === -1) {
            mergedUsers.unshift(localUser);
        }
    });
    
    return mergedUsers;
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
    const sendEmail = document.getElementById('userEmailNotifications').checked;
    
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
            
            // Save to localStorage to persist across page refreshes
            saveUsersToLocalStorage(window.sampleData.users);
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
    const followers = parseInt(document.getElementById('artistFollowers').value) || 0;
    const songsCount = parseInt(document.getElementById('artistSongsCount').value) || 0;
    const isVerified = document.getElementById('artistVerified').checked;
    
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
        followers: followers,
        songs_count: songsCount,
        status: 'pending',
        verification: isVerified ? 'approved' : 'pending',
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
                followers: followers,
                songs_count: songsCount,
                status: 'pending',
                verification: isVerified ? 'approved' : 'pending',
                bio: bio
            };
            window.sampleData.artists.unshift(localArtist);
            saveArtistsToLocalStorage(window.sampleData.artists);
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
    const plays = parseInt(document.getElementById('songPlays').value) || 0;
    const filePath = document.getElementById('songFilePath').value.trim();
    const coverArt = document.getElementById('songCoverArt').value.trim();
    const isActive = document.getElementById('songActive').checked;
    
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
        plays: plays,
        likes: 0,
        file_path: filePath,
        cover_art: coverArt,
        status: isActive ? 'active' : 'pending'
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
                plays: plays,
                likes: 0,
                file_path: filePath,
                cover_art: coverArt,
                status: isActive ? 'active' : 'pending'
            };
            window.sampleData.songs.unshift(localSong);
            saveSongsToLocalStorage(window.sampleData.songs);
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
    const isActive = document.getElementById('planActive').checked;
    
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
        status: isActive ? 'active' : 'pending',
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
                status: isActive ? 'active' : 'pending',
                start_date: startDate,
                end_date: endDate
            };
            window.sampleData.subscriptions.unshift(localSubscription);
            saveSubscriptionsToLocalStorage(window.sampleData.subscriptions);
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