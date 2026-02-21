# AfroRhythm Music App

A comprehensive music streaming platform built with HTML5, CSS3, Vanilla JavaScript, PHP, and MySQL.

## Project Structure

```
AfroRythm/
├── admin.html              # Admin dashboard
├── artist.html             # Artist dashboard
├── fan.html                # Fan dashboard
├── index.html              # Landing page
├── auth/                   # Authentication pages
│   ├── login.html
│   ├── login.js
│   ├── signup.html
│   └── signup.js
├── backend/                # PHP backend and API
│   ├── db.php             # Database connection
│   ├── setup.php          # Database setup and seeding
│   └── api/               # REST API endpoints
│       ├── admin.php
│       ├── artists.php
│       ├── favorites.php
│       ├── follows.php
│       ├── history.php
│       ├── login.php
│       ├── notifications.php
│       ├── playlists.php
│       ├── songs.php
│       ├── subscriptions.php
│       └── users.php
├── css/                   # Stylesheets
├── Js/                    # JavaScript files
├── img/                   # Images
├── FAN_DASHBOARD_COMPARISON.md
├── package.json
├── LICENSE
└── README.md
```




## Current Status & Completion Plan

**Current Completion: ~75%**

The AfroRhythm platform has completed Phase 1 (Security) and Phase 2 (File Uploads/Audio), with a functional music streaming system including real file uploads, audio playback, and session-based authentication.

## 🚀 Suggested Features & Improvements

Here are exciting features you can add to make AfroRhythm even better! These suggestions are organized by priority and implementation complexity.

### 🔥 **High Priority Features**

#### 1. **Smart Music Discovery**
- **Recommended For You**: AI-powered song recommendations based on listening history
- **Discover Weekly**: Weekly playlist of new songs matching user preferences
- **Genre-Based Discovery**: Explore by mood, activity, or genre with smart playlists
- **Trending Songs**: Real-time trending tracks across the platform

#### 2. **Enhanced Social Features**
- **User Profiles**: Custom profile pages with listening stats and favorite genres
- **Music Sharing**: Share songs/playlists via social media or direct links
- **Comments & Reviews**: Let fans leave reviews and comments on songs
- **Collaborative Playlists**: Create playlists that multiple users can edit
- **Following Activity Feed**: See what your followed artists/friends are listening to

#### 3. **Advanced Audio Features**
- **Audio Quality Options**: Multiple bitrate streaming (128kbps, 320kbps, lossless)
- **Offline Listening**: Download songs for offline playback (premium feature)
- **Crossfade**: Smooth transitions between songs
- **Equalizer**: Custom audio equalization settings
- **Sleep Timer**: Auto-stop playback after set time

### 🎵 **Music & Content Features**

#### 4. **Lyrics Integration**
- **Synced Lyrics**: Display lyrics that sync with song playback
- **Lyrics Search**: Find songs by searching lyrics
- **Multi-language Lyrics**: Support for lyrics in different languages
- **User-Generated Lyrics**: Allow fans to submit/correct lyrics

#### 5. **Playlist Enhancements**
- **Smart Playlists**: Auto-updating playlists based on rules (e.g., "Recently Added")
- **Playlist Folders**: Organize playlists into folders
- **Public Playlists**: Share playlists publicly for others to discover
- **Playlist Analytics**: See how many people listened to your playlists

#### 6. **Artist Tools & Features**
- **Artist Analytics**: Detailed stats on streams, followers, geography
- **Release Management**: Schedule releases and manage albums
- **Fan Engagement**: Direct messaging with fans, Q&A sessions
- **Merch Integration**: Sell merchandise directly through artist profiles
- **Tour Dates**: Display upcoming concerts and ticket links

### 🎨 **User Experience Improvements**

#### 7. **Mobile Responsiveness**
- **Progressive Web App (PWA)**: Install AfroRhythm like a mobile app
- **Mobile-Optimized Player**: Better controls for mobile devices
- **Touch Gestures**: Swipe to skip, pinch to zoom album art
- **Dark Mode**: Automatic dark/light theme switching

#### 8. **Search & Navigation**
- **Advanced Search**: Filter by artist, album, year, genre, mood
- **Voice Search**: Search songs using voice commands
- **Keyboard Shortcuts**: Hotkeys for play/pause, skip, volume, etc.
- **Recently Played**: Quick access to recently listened songs

#### 9. **Personalization**
- **Custom Themes**: Let users choose color schemes
- **Homepage Customization**: Personalized homepage layout
- **Listening Goals**: Set daily/hourly listening goals with progress tracking
- **Music Taste Profile**: Visual representation of user's music preferences

### 🔧 **Technical Enhancements**

#### 10. **Performance & Reliability**
- **CDN Integration**: Faster loading with Content Delivery Network
- **Caching System**: Cache frequently accessed data
- **Background Sync**: Sync data when connection is restored
- **Error Recovery**: Auto-retry failed requests

#### 11. **Data & Analytics**
- **Listening Statistics**: Detailed personal listening history and stats
- **Platform Analytics**: Global usage statistics and trends
- **Export Data**: Allow users to export their data (GDPR compliance)
- **Data Visualization**: Charts and graphs for listening patterns

#### 12. **Integration Features**
- **Social Media Login**: Sign up with Google, Facebook, etc.
- **Third-Party Apps**: API for third-party music apps
- **Hardware Integration**: Control playback via smart home devices
- **Calendar Integration**: Create playlists for events/calendars

### 💰 **Monetization Features**

#### 13. **Premium Features**
- **Ad-Free Listening**: Remove ads for premium users
- **Unlimited Skips**: Skip as many songs as you want
- **High-Quality Audio**: Access to lossless audio
- **Exclusive Content**: Premium-only songs and playlists

#### 14. **Creator Economy**
- **Artist Donations**: Let fans support artists directly
- **Crowdfunding**: Artists can run crowdfunding campaigns
- **Revenue Sharing**: Transparent payout system for artists
- **NFT Integration**: Music NFTs and collectibles

### 🎯 **Quick Wins (Easy to Implement)**

#### 15. **Small but Impactful Features**
- **Song Queue**: Visual queue showing upcoming songs
- **Volume Normalization**: Consistent volume across all songs
- **Repeat Modes**: Repeat one song, repeat playlist, or shuffle
- **Speed Control**: Play songs at different speeds (0.5x to 2x)
- **Mini Player**: Small floating player when navigating other pages
- **Keyboard Media Keys**: Use keyboard media keys for playback control

### 🛠️ **Implementation Priority Guide**

**Week 1-2: Core Experience**
1. Smart Music Discovery
2. Enhanced Social Features
3. Advanced Audio Features

**Week 3-4: Content & Engagement**
4. Lyrics Integration
5. Playlist Enhancements
6. Artist Tools

**Week 5-6: Polish & Performance**
7. Mobile Responsiveness
8. Search Improvements
9. Performance Enhancements

**Week 7-8: Advanced Features**
10. Monetization
11. Analytics
12. Integrations

### 💡 **Implementation Tips**

- **Start Small**: Begin with high-impact, low-complexity features
- **User Feedback**: Test features with real users before full implementation
- **Progressive Enhancement**: Add features without breaking existing functionality
- **API Design**: Plan APIs to support future features
- **Scalability**: Design features to work with growing user base

---

*Want to implement any of these features? Let me know which ones interest you most, and I can help you build them!*

### 4-Week Completion Plan

#### ✅ **Week 1: Core Music Infrastructure (COMPLETED)**
**Objectives**: Enable actual music playback and secure file uploads

**✅ Completed Tasks**:
- ✅ Removed localStorage dependencies from authentication system
- ✅ Implemented session-based authentication with PHP sessions
- ✅ Created session management API (`backend/api/session.php`)
- ✅ Updated login system to use server-side sessions
- ✅ Added authentication checks to all dashboard pages (fan, artist, admin)
- ✅ Removed localStorage merge operations from admin dashboard
- ✅ Created API test suite (`api_test.html`) for validation
- ✅ Cleaned up all localStorage references across the application

**Next Steps**:
- Implement secure file upload system (`backend/api/upload.php`)
- Create `uploads/` directory with proper permissions
- Enhance audio player to handle real music files
- Add file validation and progress indicators
- Connect artist upload interface to backend

#### Week 2: Security & Authentication Overhaul
**Objectives**: Replace localStorage with secure session management

**Key Tasks**:
- Implement PHP session-based authentication
- Remove localStorage dependencies from all JS files
- Add CSRF protection and rate limiting
- Create password reset functionality
- Update all API endpoints for session validation

**Deliverables**: Secure authentication system with session management

#### Week 3: Payment Integration & Monetization
**Objectives**: Enable subscription payments and access control

**Key Tasks**:
- Integrate Stripe/PayPal payment processing
- Implement subscription plan management
- Create paywall for premium content
- Add billing history and revenue sharing
- Build subscription analytics dashboard

**Deliverables**: Working payment system with premium features

#### Week 4: Testing, Deployment & Launch Preparation
**Objectives**: Establish quality assurance and production readiness

**Key Tasks**:
- Setup PHPUnit and JavaScript testing frameworks
- Create comprehensive test suites
- Configure Docker containers for deployment
- Update documentation and create user guides
- Performance optimization and final polish

**Deliverables**: Production-ready system with deployment configuration

### Success Metrics
- **Week 1**: Upload and stream 5+ test songs successfully
- **Week 2**: Secure session-based authentication across all user flows
- **Week 3**: Process test payments and enforce subscription access
- **Week 4**: 80%+ test coverage, successful Docker deployment

### Risk Mitigation
- **File Upload Complexity**: Start with basic uploads, enhance streaming later
- **Payment Integration**: Stripe primary, PayPal backup
- **Testing Timeline**: Focus on critical path tests first
- **Dependencies**: Each week builds on previous deliverables

## 🚀 How to Run AfroRhythm (Beginner's Guide)

Welcome! This guide will help you get AfroRhythm running on your computer step by step. Don't worry if you're new to this - we'll explain everything clearly!

### 📋 What You Need Before Starting

1. **A computer with Windows** (this guide is for Windows)
2. **Internet connection** (to download software)
3. **About 30 minutes** of your time
4. **Basic computer skills** (like opening programs and following instructions)

### Step 1: Install XAMPP (The Web Server)

XAMPP is like a "web development kit" that lets your computer run websites locally.

1. **Download XAMPP**:
   - Go to: https://www.apachefriends.org/download.html
   - Download the **Windows version** (look for "XAMPP for Windows")
   - Choose the **PHP 8.1 or 8.2** version (the latest one)

2. **Install XAMPP**:
   - Run the downloaded file (it will be called something like `xampp-windows-x64-8.2.12-0-VS16-installer.exe`)
   - Click "Next" through all the screens
   - When asked where to install, keep the default location: `C:\xampp`
   - Finish the installation

3. **Start XAMPP**:
   - Find the XAMPP icon on your desktop or in Start menu
   - Open XAMPP Control Panel
   - Click "Start" next to **Apache** (this runs the web server)
   - Click "Start" next to **MySQL** (this runs the database)
   - You should see green text saying they're running

### Step 2: Get the AfroRhythm Project

You already have the project files! They're in the folder where you found this README.

### Step 3: Set Up the Database 🚀

> [!IMPORTANT]
> **This is the most critical step to get AfroRhythm running!**
> You don't need to create the database manually in phpMyAdmin. Our automated script handles everything for you.

1. **Open your web browser** (Chrome, Firefox, Edge, etc.)

2. **Go to the setup page**:
   - Type this in your browser: `http://localhost/AfroRythm/backend/setup.php`
   - **Important**: Make sure XAMPP is running (Apache and MySQL should be green)

3. **Run the Setup**:
   - Click the **"Run Database Setup"** button.
   - The script will:
     - ✅ Create the `music_app` database
     - ✅ Create all necessary tables automatically
     - ✅ Setup initial project structure

4. **Check for Success**:
   - You should see a "Setup Complete!" message with checkmarks.
   - If you see errors, double-check that MySQL is started in your XAMPP Control Panel.

### Step 4: Access AfroRhythm

Now let's see the website!

1. **Open the main page**:
   - In your browser, go to: `http://localhost/AfroRythm/index.html`
   - You should see the AfroRhythm homepage!

2. **Try the different pages**:
   - **Fan Dashboard**: `http://localhost/AfroRythm/fan.html`
   - **Artist Dashboard**: `http://localhost/AfroRythm/artist.html`
   - **Admin Dashboard**: `http://localhost/AfroRythm/admin.html`

### Step 5: Create Your First Account

Let's make a test account to explore the features!

1. **Go to signup**:
   - Visit: `http://localhost/AfroRythm/auth/signup.html`

2. **Fill out the form**:
   - Choose "Fan" as the user type
   - Fill in: Name, Email, Phone, Password
   - Click "Sign Up"

3. **Login**:
   - Go to: `http://localhost/AfroRythm/auth/login.html`
   - Use the email and password you just created

4. **Explore the fan dashboard**:
   - You should now be able to browse music, create playlists, etc.!

### Step 6: Upload Your First Song (For Artists)

Want to try uploading music? Let's create an artist account!

1. **Sign up as an artist**:
   - Go to signup again: `http://localhost/AfroRythm/auth/signup.html`
   - Choose "Artist" as the user type
   - Fill in the details

2. **Login as artist**:
   - Use the artist login: `http://localhost/AfroRythm/auth/login.html`

3. **Go to artist dashboard**:
   - Visit: `http://localhost/AfroRythm/artist.html`

4. **Upload a song**:
   - Look for the upload section
   - You'll need an MP3, WAV, or OGG music file
   - Fill in: Song title, genre
   - Upload the music file
   - Optionally add cover art (a picture for the song)

### 🧪 Testing the Features

We created some test pages to help you check if everything works:

1. **Test File Upload**:
   - Visit: `http://localhost/AfroRythm/upload_test.html`
   - Try uploading a song file

2. **Test Audio Playback**:
   - Visit: `http://localhost/AfroRythm/playback_test.html`
   - Enter a URL to a music file and test playing it

3. **Test API**:
   - Visit: `http://localhost/AfroRythm/api_test.html`
   - This tests if the backend APIs are working

### 🔧 Troubleshooting (If Something Goes Wrong)

#### "Page not found" or "404 error"
- Make sure XAMPP is running (Apache should be green)
- Check the URL - it should start with `http://localhost/AfroRythm/`

#### "Database connection failed"
- Make sure MySQL is running in XAMPP (should be green)
- Try restarting MySQL in XAMPP Control Panel

#### "Permission denied" or upload errors
- The `uploads` folder should have proper permissions
- If uploads don't work, the folder might need special permissions

#### XAMPP won't start
- Try running XAMPP as Administrator (right-click → Run as administrator)
- Check if ports 80 (Apache) and 3306 (MySQL) are free
- Close Skype or other programs that might use these ports

#### Still having problems?
- Check the XAMPP control panel for error messages
- Try restarting your computer
- Make sure you're using the correct URLs

### 📁 Project Structure Explained
+

Here's what each folder contains (you don't need to change anything here):

- **`index.html`** - The main homepage
- **`fan.html`** - Where fans listen to music
- **`artist.html`** - Where artists upload music
- **`admin.html`** - Admin control panel
- **`auth/`** - Login and signup pages
- **`backend/`** - PHP files that handle the server-side logic
- **`css/`** - Stylesheets that make everything look nice
- **`Js/`** - JavaScript files for interactive features
- **`img/`** - Images and icons
- **`uploads/`** - Where uploaded songs and images are stored

### 🎯 What You Can Do Now

With AfroRhythm running, you can:

- ✅ Create accounts (fans, artists, admins)
- ✅ Browse and listen to music
- ✅ Create playlists
- ✅ Follow artists
- ✅ Upload songs (as an artist)
- ✅ Manage users (as an admin)
- ✅ View analytics and statistics

### 📞 Need Help?

If you get stuck:
1. Check the troubleshooting section above
2. Make sure all steps were followed in order
3. Try restarting XAMPP and your browser
4. Check that you're using the correct URLs

### 🚀 Next Steps

Once everything is working, you can:
- Add more music to the database
- Customize the design (edit CSS files)
- Add new features (modify JavaScript and PHP files)
- Deploy to a real web server for others to use

---

**Congratulations!** 🎉 You've successfully set up AfroRhythm. Enjoy exploring your music streaming platform!

## Features

- **Admin Dashboard**: User management, artist verification, song moderation, analytics
- **Artist Portal**: Upload music, manage profile, view analytics
- **Fan Experience**: Browse music, create playlists, follow artists
- **Authentication**: Login/signup system
- **Database**: MySQL with PHP API backend

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: PHP 7+
- **Database**: MySQL
- **Server**: Apache (XAMPP)

## API Endpoints

All endpoints return JSON responses with `success` and `data` fields.

- `GET/POST/PUT/DELETE /backend/api/users.php`
- `GET/POST/PUT/DELETE /backend/api/artists.php`
- `GET/POST/PUT/DELETE /backend/api/songs.php`
- `GET/POST/PUT/DELETE /backend/api/subscriptions.php`

UMLS PLAN GUIDE. Promt agent to analayze the system and generate the codes of the umls the system needs, then go to draw.io and paste the code to generate the diagrams.