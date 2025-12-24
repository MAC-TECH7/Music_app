# AfroRhythm Music App

A comprehensive music streaming platform built with HTML5, CSS3, Vanilla JavaScript, PHP, and MySQL.

## Project Structure

```
music_app/
├── backend/                 # PHP backend and API
│   ├── db.php              # Database connection
│   ├── setup.php           # Database setup and seeding
│   └── api/                # REST API endpoints
│       ├── users.php
│       ├── artists.php
│       ├── songs.php
│       └── subscriptions.php
├── frontend/               # Frontend application
│   ├── admin.html         # Admin dashboard
│   ├── artist.html        # Artist dashboard
│   ├── fan.html           # Fan dashboard
│   ├── index.html         # Landing page
│   ├── css/               # Stylesheets
│   ├── Js/                # JavaScript files
│   ├── img/               # Images
│   └── auth/              # Authentication pages
├── Music_app/             # Legacy folder (can be removed)
├── package.json           # Node.js dependencies (if any)
├── LICENSE
└── README.md
```

## Setup Instructions

1. **Install XAMPP** and start Apache and MySQL services
2. **Copy project** to `C:\xampp\htdocs\music_app\`
3. **Database Setup**:
   - Open `http://localhost/music_app/backend/setup.php` in browser
   - This creates the database and populates sample data
4. **Access Application**:
   - Admin Dashboard: `http://localhost/music_app/frontend/admin.html`
   - Artist Dashboard: `http://localhost/music_app/frontend/artist.html`
   - Fan Dashboard: `http://localhost/music_app/frontend/fan.html`

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