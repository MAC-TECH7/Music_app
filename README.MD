# AfroRhythm - Music Streaming Platform

AfroRhythm is a comprehensive, multi-role music streaming web application dedicated to African music genres like Makossa, Bikutsi, and Afrobeat. It connects listeners, artists, and administrators in a seamless ecosystem.

## 🎵 What This Application Does
AfroRhythm isn't just a music player; it's a complete platform with three distinct interfaces:

*   **For Fans**: A rich dashboard to discover trending music, create personal playlists, follow favorite artists, and view listening history.
*   **For Artists**: A dedicated portal to upload and manage songs, view analytics (plays/likes), and manage their public profile.
*   **For Admins**: A powerful backend dashboard to moderate content, verify artists, manage users, and view platform-wide statistics.

---

## 🚀 How to Run on XAMPP (Step-by-Step)

This application is built with **PHP** and **MySQL**, making it perfect for the XAMPP stack.

### Prerequisites
*   [Download and Install XAMPP](https://www.apachefriends.org/index.html) (Ensure usage of PHP 7.4 or higher).

### Installation Steps

1.  **Prepare the Folder**
    *   Rename this project folder to `music_app`.
    *   Move the entire `music_app` folder into your XAMPP `htdocs` directory.
    *   *Correct Path*: `C:\xampp\htdocs\music_app\`

2.  **Start the Server**
    *   Open **XAMPP Control Panel**.
    *   Click **Start** next to **Apache**.
    *   Click **Start** next to **MySQL**.

3.  **Initialize the Database**
    *   Open your web browser.
    *   Go to: `http://localhost/music_app/backend/setup.php`
    *   You will see a message confirming that the Database and Tables have been created successfully.
    *   *Note: This script also inserts sample data/users so you can test immediately.*

4.  **Launch the Application**
    *   **Fan Dashboard**: [http://localhost/music_app/fan.html](http://localhost/music_app/fan.html)
    *   **Landing Page**: [http://localhost/music_app/index.html](http://localhost/music_app/index.html)
    *   **Login Page**: [http://localhost/music_app/auth/login.html](http://localhost/music_app/auth/login.html)

---

## 🔑 Default Login Credentials
Use these credentials to test the different user roles immediately after setup:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@afrorhythm.com` | `admin123` |
| **Artist** | `artist@afrorhythm.com` | `artist123` |
| **Fan** | `fan@afrorhythm.com` | `fan123` |

---

## 🛠️ Technical Overview

*   **Frontend**: HTML5, CSS3, Vanilla JavaScript (SPA architecture), Bootstrap 5.
*   **Backend**: PHP (REST API structure).
*   **Database**: MySQL.
*   **Security**: Password hashing, Session management, Role-based access control.

## 📂 Project Structure
*   `backend/api/` - Contains all PHP API endpoints (Users, Songs, Artists).
*   `backend/db.php` - Database connection configuration.
*   `frontend/` or Root - HTML/JS files for the User Interface.
*   `auth/` - Specialized Login and Signup logic.

---

*Verified for XAMPP deployment as of January 2026*