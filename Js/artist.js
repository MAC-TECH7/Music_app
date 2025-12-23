// Artist Dashboard JavaScript with Navigation

document.addEventListener('DOMContentLoaded', function() {
    // State management
    let currentView = 'dashboard';
    let uploadModal = null;
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const wrapper = document.getElementById('wrapper');
            wrapper.classList.toggle('toggled');
        });
    }
    
    // Navigation items
    const navItems = document.querySelectorAll('.list-group-item:not(.list-group-item-action[href*="#"]):not([href*="index.html"])');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get view from text
            let view = this.textContent.toLowerCase().trim().replace(/\s+/g, '-');
            
            // Handle special cases
            if (view.includes('dashboard')) view = 'dashboard';
            if (view.includes('my-songs')) view = 'songs';
            if (view.includes('upload-music')) view = 'upload';
            if (view.includes('analytics')) view = 'analytics';
            if (view.includes('earnings')) view = 'earnings';
            if (view.includes('followers')) view = 'followers';
            if (view.includes('profile')) view = 'profile';
            
            // Load the view
            loadView(view);
        });
    });
    
    // Function to load different views
    function loadView(view) {
        const mainContent = document.querySelector('#page-content-wrapper .container-fluid');
        currentView = view;
        
        // Update page title
        document.title = getViewTitle(view) + ' - Artist Dashboard - Melodify';
        
        // Show loading indicator
        mainContent.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading ${getViewTitle(view)}...</p>
            </div>
        `;
        
        // Simulate loading delay
        setTimeout(() => {
            // Load the actual content
            mainContent.innerHTML = getViewContent(view);
            
            // Re-attach event listeners for the new content
            reattachEventListeners();
        }, 500);
    }
    
    // Function to get view title
    function getViewTitle(view) {
        const titles = {
            'dashboard': 'Dashboard',
            'songs': 'My Songs',
            'upload': 'Upload Music',
            'analytics': 'Analytics',
            'earnings': 'Earnings',
            'followers': 'Followers',
            'profile': 'Profile'
        };
        return titles[view] || 'Artist Dashboard';
    }
    
    // Function to get view content
    function getViewContent(view) {
        switch(view) {
            case 'dashboard':
                return getDashboardContent();
            case 'songs':
                return getSongsContent();
            case 'upload':
                return getUploadContent();
            case 'analytics':
                return getAnalyticsContent();
            case 'earnings':
                return getEarningsContent();
            case 'followers':
                return getFollowersContent();
            case 'profile':
                return getProfileContent();
            default:
                return getDashboardContent();
        }
    }
    
    // Content for different views
    function getDashboardContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Artist Dashboard</h1>
                <div class="d-flex">
                    <button class="btn btn-outline-secondary me-2">Export Data</button>
                    <button class="btn btn-primary" id="viewProfileBtn">View Public Profile</button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Total Followers</h6>
                                    <h3 class="mb-0">2.4M</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 12.5%</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-users"></i>
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
                                    <h6 class="text-muted mb-2">Total Streams</h6>
                                    <h3 class="mb-0">124.5M</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 8.3%</span>
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
                                    <h6 class="text-muted mb-2">Monthly Earnings</h6>
                                    <h3 class="mb-0">$18,240</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 24.7%</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-dollar-sign"></i>
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
                                    <h6 class="text-muted mb-2">Total Songs</h6>
                                    <h3 class="mb-0">48</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 2 new</span>
                                </div>
                                <div class="stat-icon">
                                    <i class="fas fa-music"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts and Upload Form -->
            <div class="row">
                <div class="col-lg-8 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Streams Overview</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-5">
                                    <i class="fas fa-chart-line fa-4x text-muted mb-3"></i>
                                    <h5>Stream Performance</h5>
                                    <p class="text-muted">Daily streams for the last 30 days</p>
                                    <div class="d-flex justify-content-center">
                                        <div class="mx-3 text-center">
                                            <div class="h4 mb-0 text-primary">+245K</div>
                                            <small class="text-muted">Avg. Daily Streams</small>
                                        </div>
                                        <div class="mx-3 text-center">
                                            <div class="h4 mb-0 text-success">+18.7%</div>
                                            <small class="text-muted">Growth This Month</small>
                                        </div>
                                        <div class="mx-3 text-center">
                                            <div class="h4 mb-0 text-warning">42</div>
                                            <small class="text-muted">Countries</small>
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
                            <h5 class="card-title mb-0">Quick Upload</h5>
                        </div>
                        <div class="card-body">
                            <form id="quickUploadForm">
                                <div class="mb-3">
                                    <label class="form-label">Song Title</label>
                                    <input type="text" class="form-control" placeholder="Enter song title" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Genre</label>
                                    <select class="form-select" required>
                                        <option value="">Select genre</option>
                                        <option value="electronic">Electronic</option>
                                        <option value="pop">Pop</option>
                                        <option value="rock">Rock</option>
                                        <option value="hiphop">Hip Hop</option>
                                        <option value="rb">R&B</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Upload Audio File</label>
                                    <input type="file" class="form-control" accept="audio/*" required>
                                    <div class="form-text">Max file size: 50MB. Supported formats: MP3, WAV, FLAC</div>
                                </div>
                                <button type="submit" class="btn btn-primary w-100">Upload Song</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Recent Activity</h5>
                        </div>
                        <div class="card-body">
                            <div class="activity-timeline">
                                ${getActivityTimeline()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getSongsContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">My Songs</h1>
                <div class="d-flex">
                    <input type="text" class="form-control form-control-sm me-2" placeholder="Search songs" id="songSearch">
                    <button class="btn btn-primary" id="addSongBtn">
                        <i class="fas fa-plus me-2"></i>Add New
                    </button>
                </div>
            </div>

            <!-- Songs Table -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Song Title</th>
                                            <th>Genre</th>
                                            <th>Release Date</th>
                                            <th>Streams</th>
                                            <th>Earnings</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="songsTableBody">
                                        ${getSongsTableRows()}
                                    </tbody>
                                </table>
                            </div>
                            <nav aria-label="Table navigation">
                                <ul class="pagination justify-content-center">
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
        `;
    }
    
    function getUploadContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Upload Music</h1>
                <button class="btn btn-outline-secondary" id="viewUploadHistory">
                    <i class="fas fa-history me-2"></i>View Upload History
                </button>
            </div>

            <div class="row">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Upload New Song</h5>
                        </div>
                        <div class="card-body">
                            <form id="uploadSongForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Song Title *</label>
                                        <input type="text" class="form-control" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Album (Optional)</label>
                                        <input type="text" class="form-control" placeholder="Single">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Primary Genre *</label>
                                        <select class="form-select" required>
                                            <option value="">Select genre</option>
                                            <option>Electronic</option>
                                            <option>Pop</option>
                                            <option>Rock</option>
                                            <option>Hip Hop</option>
                                            <option>R&B</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Mood/Tags</label>
                                        <input type="text" class="form-control" placeholder="e.g., upbeat, chill, energetic">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Audio File *</label>
                                    <input type="file" class="form-control" accept="audio/*" required>
                                    <div class="form-text">Max file size: 50MB. Supported formats: MP3, WAV, FLAC, AAC</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Cover Art</label>
                                    <input type="file" class="form-control" accept="image/*">
                                    <div class="form-text">Recommended size: 3000x3000 pixels. JPG or PNG format.</div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Song Description</label>
                                    <textarea class="form-control" rows="3" placeholder="Tell listeners about this song..."></textarea>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="explicitCheck">
                                    <label class="form-check-label" for="explicitCheck">This song contains explicit content</label>
                                </div>
                                <div class="form-check mb-3">
                                    <input class="form-check-input" type="checkbox" id="royaltyCheck" required>
                                    <label class="form-check-label" for="royaltyCheck">I own all rights to this recording</label>
                                </div>
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary btn-lg">
                                        <i class="fas fa-upload me-2"></i>Upload Song
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" id="saveDraftBtn">
                                        <i class="fas fa-save me-2"></i>Save as Draft
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <!-- Upload Guidelines -->
                    <div class="card mb-4">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Upload Guidelines</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-unstyled">
                                <li class="mb-3">
                                    <i class="fas fa-check-circle text-success me-2"></i>
                                    <strong>Audio Quality:</strong> Minimum 192kbps MP3
                                </li>
                                <li class="mb-3">
                                    <i class="fas fa-check-circle text-success me-2"></i>
                                    <strong>File Size:</strong> Max 50MB per file
                                </li>
                                <li class="mb-3">
                                    <i class="fas fa-check-circle text-success me-2"></i>
                                    <strong>Metadata:</strong> Include accurate song info
                                </li>
                                <li class="mb-3">
                                    <i class="fas fa-check-circle text-success me-2"></i>
                                    <strong>Artwork:</strong> High-quality cover art (3000x3000)
                                </li>
                                <li class="mb-3">
                                    <i class="fas fa-check-circle text-success me-2"></i>
                                    <strong>Rights:</strong> You must own all rights
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Upload Status -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Upload Status</h5>
                        </div>
                        <div class="card-body">
                            <div class="upload-stats">
                                <div class="d-flex justify-content-between mb-3">
                                    <span>Total Uploads:</span>
                                    <strong>48</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-3">
                                    <span>Published:</span>
                                    <strong class="text-success">46</strong>
                                </div>
                                <div class="d-flex justify-content-between mb-3">
                                    <span>Pending:</span>
                                    <strong class="text-warning">2</strong>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Rejected:</span>
                                    <strong class="text-danger">0</strong>
                                </div>
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
                <h1 class="h3 mb-0">Analytics</h1>
                <div class="d-flex">
                    <div class="dropdown me-2">
                        <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Last 30 Days
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" data-period="7">Last 7 Days</a></li>
                            <li><a class="dropdown-item active" href="#" data-period="30">Last 30 Days</a></li>
                            <li><a class="dropdown-item" href="#" data-period="90">Last 90 Days</a></li>
                            <li><a class="dropdown-item" href="#" data-period="365">Last Year</a></li>
                        </ul>
                    </div>
                    <button class="btn btn-primary">
                        <i class="fas fa-download me-2"></i>Export Report
                    </button>
                </div>
            </div>

            <!-- Analytics Overview -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Total Streams</h6>
                                    <h3 class="mb-0">124.5M</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 18.7%</span>
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
                                    <h6 class="text-muted mb-2">Listeners</h6>
                                    <h3 class="mb-0">8.2M</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 12.3%</span>
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
                                    <h6 class="text-muted mb-2">Avg. Listen Time</h6>
                                    <h3 class="mb-0">2:45</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 5.2%</span>
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
                                    <h6 class="text-muted mb-2">Skip Rate</h6>
                                    <h3 class="mb-0">18%</h3>
                                    <span class="text-danger small"><i class="fas fa-arrow-down me-1"></i> 2.1%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts -->
            <div class="row mb-4">
                <div class="col-lg-8 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Streams Over Time</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-5">
                                    <i class="fas fa-chart-area fa-4x text-muted mb-3"></i>
                                    <h5>Stream Analytics</h5>
                                    <p class="text-muted">Daily stream count for the selected period</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Top Countries</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-4">
                                    <i class="fas fa-globe-americas fa-4x text-muted mb-3"></i>
                                    <h5>Geographic Distribution</h5>
                                    <div class="mt-3">
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>United States</span>
                                            <span class="text-primary">32%</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>United Kingdom</span>
                                            <span class="text-primary">18%</span>
                                        </div>
                                        <div class="d-flex justify-content-between mb-2">
                                            <span>Germany</span>
                                            <span class="text-primary">12%</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Other</span>
                                            <span class="text-primary">38%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Songs Analytics -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Top Performing Songs</h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Song</th>
                                            <th>Streams</th>
                                            <th>Listeners</th>
                                            <th>Completion Rate</th>
                                            <th>Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${getTopSongsAnalyticsRows()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getEarningsContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Earnings</h1>
                <button class="btn btn-primary" id="requestPayoutBtn">
                    <i class="fas fa-money-check-alt me-2"></i>Request Payout
                </button>
            </div>

            <!-- Earnings Summary -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">This Month</h6>
                                    <h3 class="mb-0">$18,240</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 24.7%</span>
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
                                    <h6 class="text-muted mb-2">Last Month</h6>
                                    <h3 class="mb-0">$14,620</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 8.3%</span>
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
                                    <h6 class="text-muted mb-2">Total Earned</h6>
                                    <h3 class="mb-0">$245,820</h3>
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
                                    <h6 class="text-muted mb-2">Available Balance</h6>
                                    <h3 class="mb-0">$8,450</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Earnings Chart -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Earnings Over Time</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-5">
                                    <i class="fas fa-chart-line fa-4x text-muted mb-3"></i>
                                    <h5>Revenue Analytics</h5>
                                    <p class="text-muted">Monthly earnings for the last 12 months</p>
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

            <!-- Recent Transactions -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">Recent Transactions</h5>
                            <button class="btn btn-sm btn-outline-secondary">View All</button>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Streams</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${getTransactionRows()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getFollowersContent() {
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h1 class="h3 mb-0">Followers</h1>
                <button class="btn btn-primary" id="exportFollowersBtn">
                    <i class="fas fa-download me-2"></i>Export List
                </button>
            </div>

            <!-- Followers Stats -->
            <div class="row mb-4">
                <div class="col-xl-3 col-md-6 mb-4">
                    <div class="card stat-card">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="text-muted mb-2">Total Followers</h6>
                                    <h3 class="mb-0">2.4M</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 12.5%</span>
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
                                    <h6 class="text-muted mb-2">New This Month</h6>
                                    <h3 class="mb-0">45,820</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 8.3%</span>
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
                                    <h6 class="text-muted mb-2">Active Followers</h6>
                                    <h3 class="mb-0">1.8M</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 5.2%</span>
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
                                    <h6 class="text-muted mb-2">Engagement Rate</h6>
                                    <h3 class="mb-0">4.8%</h3>
                                    <span class="text-success small"><i class="fas fa-arrow-up me-1"></i> 0.7%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Follower Growth Chart -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Follower Growth</h5>
                        </div>
                        <div class="card-body">
                            <div class="chart-placeholder">
                                <div class="text-center py-5">
                                    <i class="fas fa-chart-line fa-4x text-muted mb-3"></i>
                                    <h5>Follower Analytics</h5>
                                    <p class="text-muted">Monthly follower growth for the last 12 months</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Top Locations -->
            <div class="row">
                <div class="col-lg-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Top Cities</h5>
                        </div>
                        <div class="card-body">
                            <div class="location-list">
                                ${getTopCitiesList()}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 mb-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Demographics</h5>
                        </div>
                        <div class="card-body">
                            <div class="demographics-chart">
                                <div class="text-center py-4">
                                    <i class="fas fa-chart-pie fa-4x text-muted mb-3"></i>
                                    <h5>Age & Gender Distribution</h5>
                                    <div class="row mt-4">
                                        <div class="col-6">
                                            <h6 class="text-primary">Age Groups</h6>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>18-24</span>
                                                <span>32%</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>25-34</span>
                                                <span>45%</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>35-44</span>
                                                <span>18%</span>
                                            </div>
                                            <div class="d-flex justify-content-between">
                                                <span>45+</span>
                                                <span>5%</span>
                                            </div>
                                        </div>
                                        <div class="col-6">
                                            <h6 class="text-primary">Gender</h6>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>Male</span>
                                                <span>58%</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>Female</span>
                                                <span>40%</span>
                                            </div>
                                            <div class="d-flex justify-content-between">
                                                <span>Other</span>
                                                <span>2%</span>
                                            </div>
                                        </div>
                                    </div>
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
                <h1 class="h3 mb-0">Artist Profile</h1>
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
                                <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                                     alt="Nova Rhythm" class="rounded-circle" width="120" height="120">
                                <button class="btn btn-sm btn-outline-primary mt-2" id="changeAvatarBtn">
                                    <i class="fas fa-camera me-1"></i>Change Photo
                                </button>
                            </div>
                            <h4 class="card-title">Nova Rhythm</h4>
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
                                    <small class="text-muted">Streams</small>
                                </div>
                            </div>
                            <div class="artist-verification mb-3">
                                <span class="badge bg-success">
                                    <i class="fas fa-check-circle me-1"></i>Verified Artist
                                </span>
                            </div>
                            <button class="btn btn-outline-secondary w-100 mb-2" id="viewPublicProfileBtn">
                                <i class="fas fa-external-link-alt me-2"></i>View Public Profile
                            </button>
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
                                        <input type="text" class="form-control" value="Nova Rhythm" required>
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Real Name</label>
                                        <input type="text" class="form-control" value="Alex Johnson">
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" value="nova@example.com">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Location</label>
                                    <input type="text" class="form-control" value="Los Angeles, CA">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Genre *</label>
                                    <select class="form-select" multiple>
                                        <option selected>Electronic</option>
                                        <option>Ambient</option>
                                        <option>Synthwave</option>
                                        <option>House</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Bio</label>
                                    <textarea class="form-control" rows="4">Electronic music producer from Los Angeles. Creating atmospheric beats and melodic soundscapes since 2018. Influenced by ambient, synthwave, and deep house.</textarea>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Website</label>
                                    <input type="url" class="form-control" value="https://novarhythm.com">
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Facebook</label>
                                        <input type="text" class="form-control" value="@novarhythm">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label class="form-label">Instagram</label>
                                        <input type="text" class="form-control" value="@novarhythm">
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Account Settings -->
                    <div class="card">
                        <div class="card-header">
                            <h5 class="card-title mb-0">Account Settings</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-4">
                                <h6 class="mb-3">Payment Information</h6>
                                <div class="d-flex justify-content-between align-items-center mb-2">
                                    <span>Payment Method</span>
                                    <span class="text-muted">PayPal: nova@example.com</span>
                                </div>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span>Payout Schedule</span>
                                    <span class="text-muted">Monthly (15th of each month)</span>
                                </div>
                                <button class="btn btn-sm btn-outline-primary">Update Payment Info</button>
                            </div>
                            
                            <div class="mb-4">
                                <h6 class="mb-3">Notification Settings</h6>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="notif1" checked>
                                    <label class="form-check-label" for="notif1">New follower notifications</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="notif2" checked>
                                    <label class="form-check-label" for="notif2">Stream milestone notifications</label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="checkbox" id="notif3">
                                    <label class="form-check-label" for="notif3">Marketing emails</label>
                                </div>
                            </div>
                            
                            <div>
                                <h6 class="mb-3">Danger Zone</h6>
                                <button class="btn btn-sm btn-outline-danger me-2">Deactivate Account</button>
                                <button class="btn btn-sm btn-outline-danger">Delete Account</button>
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
            {time: '2 hours ago', action: 'New song "Cosmic Drift" uploaded', type: 'upload'},
            {time: '1 day ago', action: 'Reached 100K streams on "Midnight Pulse"', type: 'milestone'},
            {time: '2 days ago', activity: 'Gained 5,420 new followers', type: 'followers'},
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
        const songs = [
            {id: 1, title: 'Midnight Pulse', genre: 'Electronic', date: '2023-06-15', streams: '24.5M', earnings: '$8,450', status: 'active'},
            {id: 2, title: 'Dreamscape', genre: 'Ambient', date: '2023-05-22', streams: '18.2M', earnings: '$6,120', status: 'active'},
            {id: 3, title: 'Solar Flare', genre: 'Electronic', date: '2023-04-10', streams: '15.8M', earnings: '$5,340', status: 'active'},
            {id: 4, title: 'Neon Nights', genre: 'Synthwave', date: '2023-03-28', streams: '12.4M', earnings: '$4,180', status: 'active'},
            {id: 5, title: 'Cosmic Drift', genre: 'Ambient', date: '2023-02-15', streams: '9.7M', earnings: '$3,270', status: 'pending'}
        ];
        
        return songs.map(song => `
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
                <td>${song.streams}</td>
                <td>${song.earnings}</td>
                <td><span class="badge bg-${song.status === 'active' ? 'success' : 'warning'}">${song.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1 edit-song-btn" data-id="${song.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-song-btn" data-id="${song.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    function getTopSongsAnalyticsRows() {
        const songs = [
            {title: 'Midnight Pulse', streams: '24.5M', listeners: '8.2M', completion: '84%', trend: 'up'},
            {title: 'Dreamscape', streams: '18.2M', listeners: '6.5M', completion: '78%', trend: 'up'},
            {title: 'Solar Flare', streams: '15.8M', listeners: '5.8M', completion: '82%', trend: 'stable'},
            {title: 'Neon Nights', streams: '12.4M', listeners: '4.2M', completion: '76%', trend: 'up'},
            {title: 'Cosmic Drift', streams: '9.7M', listeners: '3.1M', completion: '81%', trend: 'down'}
        ];
        
        return songs.map(song => `
            <tr>
                <td>${song.title}</td>
                <td>${song.streams}</td>
                <td>${song.listeners}</td>
                <td>${song.completion}</td>
                <td>
                    <span class="text-${song.trend === 'up' ? 'success' : song.trend === 'down' ? 'danger' : 'warning'}">
                        <i class="fas fa-arrow-${song.trend === 'up' ? 'up' : song.trend === 'down' ? 'down' : 'right'} me-1"></i>
                        ${song.trend}
                    </span>
                </td>
            </tr>
        `).join('');
    }
    
    function getTransactionRows() {
        const transactions = [
            {date: '2023-06-15', description: 'Streaming Revenue - June', streams: '2.4M', amount: '$8,450', status: 'paid'},
            {date: '2023-05-15', description: 'Streaming Revenue - May', streams: '1.8M', amount: '$6,120', status: 'paid'},
            {date: '2023-04-15', description: 'Streaming Revenue - April', streams: '1.6M', amount: '$5,340', status: 'paid'},
            {date: '2023-03-15', description: 'Streaming Revenue - March', streams: '1.2M', amount: '$4,180', status: 'paid'},
            {date: '2023-02-15', description: 'Streaming Revenue - February', streams: '970K', amount: '$3,270', status: 'pending'}
        ];
        
        return transactions.map(tx => `
            <tr>
                <td>${tx.date}</td>
                <td>${tx.description}</td>
                <td>${tx.streams}</td>
                <td>${tx.amount}</td>
                <td><span class="badge bg-${tx.status === 'paid' ? 'success' : 'warning'}">${tx.status}</span></td>
            </tr>
        `).join('');
    }
    
    function getTopCitiesList() {
        const cities = [
            {city: 'Los Angeles', country: 'USA', followers: '245K'},
            {city: 'New York', country: 'USA', followers: '182K'},
            {city: 'London', country: 'UK', followers: '156K'},
            {city: 'Berlin', country: 'Germany', followers: '128K'},
            {city: 'Tokyo', country: 'Japan', followers: '98K'},
            {city: 'Sydney', country: 'Australia', followers: '76K'},
            {city: 'Toronto', country: 'Canada', followers: '65K'},
            {city: 'Paris', country: 'France', followers: '58K'}
        ];
        
        return cities.map(city => `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <div class="fw-bold">${city.city}</div>
                    <div class="text-muted small">${city.country}</div>
                </div>
                <div class="text-primary fw-bold">${city.followers}</div>
            </div>
        `).join('');
    }
    
    // Re-attach event listeners after content loads
    function reattachEventListeners() {
        // Upload forms
        const quickUploadForm = document.getElementById('quickUploadForm');
        const uploadSongForm = document.getElementById('uploadSongForm');
        
        if (quickUploadForm) {
            quickUploadForm.addEventListener('submit', handleQuickUpload);
        }
        
        if (uploadSongForm) {
            uploadSongForm.addEventListener('submit', handleSongUpload);
        }
        
        // Save draft button
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', function() {
                showNotification('Draft saved successfully!', 'success');
            });
        }
        
        // Song actions
        const editButtons = document.querySelectorAll('.edit-song-btn');
        const deleteButtons = document.querySelectorAll('.delete-song-btn');
        
        editButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = this.getAttribute('data-id');
                showNotification(`Editing song #${songId}`, 'info');
            });
        });
        
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const songId = this.getAttribute('data-id');
                const row = this.closest('tr');
                const songTitle = row.querySelector('.fw-bold').textContent;
                
                if (confirm(`Delete "${songTitle}"? This action cannot be undone.`)) {
                    row.style.opacity = '0.5';
                    
                    setTimeout(() => {
                        row.remove();
                        showNotification(`"${songTitle}" has been deleted`, 'danger');
                    }, 300);
                }
            });
        });
        
        // Search functionality
        const songSearch = document.getElementById('songSearch');
        if (songSearch) {
            songSearch.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = document.querySelectorAll('#songsTableBody tr');
                
                rows.forEach(row => {
                    const songTitle = row.querySelector('.fw-bold').textContent.toLowerCase();
                    const genre = row.querySelectorAll('td')[2].textContent.toLowerCase();
                    
                    if (songTitle.includes(searchTerm) || genre.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
        
        // Add song button
        const addSongBtn = document.getElementById('addSongBtn');
        if (addSongBtn) {
            addSongBtn.addEventListener('click', function() {
                // Navigate to upload page
                navItems.forEach(nav => nav.classList.remove('active'));
                const uploadNav = document.querySelector('.list-group-item:nth-child(3)');
                if (uploadNav) {
                    uploadNav.classList.add('active');
                    loadView('upload');
                }
            });
        }
        
        // View profile buttons
        const viewProfileBtn = document.getElementById('viewProfileBtn');
        const viewPublicProfileBtn = document.getElementById('viewPublicProfileBtn');
        
        if (viewProfileBtn) {
            viewProfileBtn.addEventListener('click', function() {
                showNotification('Opening public profile...', 'info');
                setTimeout(() => {
                    window.open('#', '_blank');
                }, 500);
            });
        }
        
        if (viewPublicProfileBtn) {
            viewPublicProfileBtn.addEventListener('click', function() {
                showNotification('Opening public profile...', 'info');
                setTimeout(() => {
                    window.open('#', '_blank');
                }, 500);
            });
        }
        
        // Change avatar button
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', function() {
                showNotification('Avatar change functionality would open file dialog', 'info');
            });
        }
        
        // Save profile button
        const saveProfileBtn = document.getElementById('saveProfileBtn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', function() {
                showNotification('Profile updated successfully!', 'success');
            });
        }
        
        // Request payout button
        const requestPayoutBtn = document.getElementById('requestPayoutBtn');
        if (requestPayoutBtn) {
            requestPayoutBtn.addEventListener('click', function() {
                showNotification('Payout request submitted! Funds will be transferred within 3-5 business days.', 'success');
            });
        }
        
        // Export followers button
        const exportFollowersBtn = document.getElementById('exportFollowersBtn');
        if (exportFollowersBtn) {
            exportFollowersBtn.addEventListener('click', function() {
                showNotification('Followers list exported to CSV file', 'success');
            });
        }
        
        // View upload history button
        const viewUploadHistory = document.getElementById('viewUploadHistory');
        if (viewUploadHistory) {
            viewUploadHistory.addEventListener('click', function() {
                showNotification('Opening upload history...', 'info');
            });
        }
        
        // Period dropdown for analytics
        const periodDropdown = document.querySelector('.dropdown-menu');
        if (periodDropdown) {
            const periodItems = periodDropdown.querySelectorAll('.dropdown-item');
            periodItems.forEach(item => {
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    const period = this.getAttribute('data-period');
                    
                    // Update active item
                    periodItems.forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Update dropdown button text
                    const dropdownBtn = periodDropdown.previousElementSibling;
                    dropdownBtn.textContent = this.textContent;
                    
                    showNotification(`Analytics updated for ${this.textContent}`, 'info');
                });
            });
        }
    }
    
    // Handle quick upload
    function handleQuickUpload(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const songTitle = form.querySelector('input[type="text"]').value;
        
        if (!songTitle) {
            alert('Please enter a song title');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showNotification(`"${songTitle}" uploaded successfully!`, 'success');
            form.reset();
        }, 1500);
    }
    
    // Handle song upload
    function handleSongUpload(e) {
        e.preventDefault();
        
        const form = e.target;
        const songTitle = form.querySelector('input[type="text"]').value;
        
        if (!songTitle) {
            alert('Please enter a song title');
            return;
        }
        
        const royaltyCheck = form.querySelector('#royaltyCheck');
        if (!royaltyCheck.checked) {
            alert('You must confirm that you own all rights to this recording');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showNotification(`"${songTitle}" uploaded successfully! It will be available after review.`, 'success');
            form.reset();
        }, 2000);
    }
    
    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    // Initialize the dashboard view
    loadView('dashboard');
});