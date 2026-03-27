
# AfroRhythm System Presentation

This document explains the AfroRhythm platform in presentation format for:

1. non-developers
2. developers

It is designed so you can present the product, the user experience, the system architecture, and the security model clearly to different audiences.

---

# Part 1: Presentation For A Non-Developer

## Slide 1: What Is AfroRhythm?

AfroRhythm is a digital music platform built to promote Cameroonian music.

It allows:
- fans to discover and enjoy music
- artists to upload and manage their songs
- admins to supervise the platform and keep it safe

In simple terms:
- fans listen
- artists publish
- admins govern

---

## Slide 2: The Main Goal

The main goal of AfroRhythm is to connect music creators and listeners in one system.

The platform helps:
- artists share their work
- fans discover local music
- the business manage subscriptions, users, and platform activity

It is more than a website.
It is a structured music ecosystem with roles, permissions, and workflows.

---

## Slide 3: Who Uses The System?

There are 3 main user groups.

### Fans
- create accounts
- browse songs
- listen to music
- follow artists
- favorite songs
- create playlists
- view listening history

### Artists
- create artist accounts
- upload songs
- upload cover art
- manage profile details
- view performance data
- receive notifications

### Admins
- monitor users
- manage artists
- review subscriptions
- view reports and platform data
- manage settings

---

## Slide 4: What The Fan Experiences

The fan dashboard is the listener side of the platform.

Key fan functions:
- browse songs and artists
- play music
- mark songs as favorites
- follow artists
- build playlists
- view notifications
- check listening history

The fan experience is designed to feel like a streaming platform with social and personalization features.

---

## Slide 5: What The Artist Experiences

The artist dashboard is the creator side of the platform.

Key artist functions:
- upload music files
- upload cover images
- manage profile information
- see songs in their catalog
- track activity such as plays and engagement
- manage subscription-related features

This part of the system is focused on content publishing and self-management.

---

## Slide 6: What The Admin Experiences

The admin dashboard is the control center.

Key admin functions:
- manage user accounts
- manage artist records
- review subscriptions
- view reports and analytics
- configure platform settings

Important governance rule:
- admins can review artist songs
- admins do not own artist songs
- artist song creation and artist song editing remain artist-controlled

This protects data integrity and creator ownership.

---

## Slide 7: How The UI Works

The system is divided into clear pages:
- landing page
- login and signup pages
- fan dashboard
- artist dashboard
- admin dashboard

The UI is role-based.

That means:
- a fan sees fan tools
- an artist sees artist tools
- an admin sees admin tools

Users are redirected to the correct dashboard after login.

---

## Slide 8: How Music Flows Through The System

A song typically moves through this flow:

1. an artist logs in
2. the artist uploads the music file
3. the artist uploads cover art
4. the song is stored by the backend
5. the song appears in the system catalog
6. fans can listen and interact with it
7. activity such as plays, favorites, follows, and history is recorded

This creates a full music lifecycle from publishing to listener engagement.

---

## Slide 9: Subscriptions And Payments

The system includes subscription management.

This supports:
- subscription plans
- active and expired subscription tracking
- subscriber management
- payment-style flows such as MoMo simulation

Business value:
- supports monetization
- supports premium artist or platform plans
- gives admins visibility into subscription activity

---

## Slide 10: Security In Simple Language

Security means the system makes sure people only do what they are allowed to do.

Examples:
- fans cannot enter artist dashboards as artists
- artists cannot access admin dashboards
- one user cannot change another user’s favorites, playlists, or history
- artist song ownership is protected
- admin access is limited to governance actions

This keeps the platform fair, reliable, and trustworthy.

---

## Slide 11: Data Integrity In Simple Language

Data integrity means the information stays correct and consistent.

Examples:
- follower counts are based on real follow records
- likes are tied to real favorite actions
- song ownership stays linked to the correct artist
- notifications are tied to the correct users
- playlists belong to the correct account owner

This reduces false data, manipulation, and accidental corruption.

---

## Slide 12: Why The System Matters

AfroRhythm matters because it combines:
- cultural promotion
- artist empowerment
- music access
- platform administration
- basic business operations

It is not just a front page with songs.
It is a full role-based application with real workflows.

---

## Slide 13: Business Strengths

Key strengths of the system:
- clear user roles
- full content flow from upload to playback
- dashboard-based management
- support for subscriptions
- local file upload support
- analytics and reporting support

This makes the platform useful as:
- a student or academic project
- a startup prototype
- a foundation for a more advanced music service

---

## Slide 14: Key Message For Non-Technical Stakeholders

AfroRhythm is a structured digital music platform that:
- helps artists publish music
- helps fans engage with music
- helps administrators manage the ecosystem
- protects users through role-based access and safer data handling

In short:
it is a controlled, role-aware music platform built for music discovery, artist publishing, and platform oversight.

---

# Part 2: Presentation For A Developer

## Slide 1: Technical Overview

AfroRhythm is a multi-role web application built with:
- HTML
- CSS
- vanilla JavaScript
- PHP
- MySQL

It runs as a classic server-rendered/static frontend plus API backend model.

Frontend pages call backend API endpoints over fetch-based JSON requests.

---

## Slide 2: Core Architecture

The system architecture can be described in 4 layers.

### 1. Presentation Layer
- `index.html`
- `fan.html`
- `artist.html`
- `admin.html`
- `auth/login.html`
- `auth/signup.html`

### 2. Frontend Logic Layer
- `Js/fan.js`
- `Js/artist.js`
- `Js/admin.js`
- `auth/auth-logic.js`
- `Js/player.js`
- `Js/momo.js`

### 3. API Layer
- `backend/api/*.php`

### 4. Persistence Layer
- MySQL database
- uploaded files in `uploads/`

---

## Slide 3: Role-Based System Model

The application uses 3 main runtime roles:
- `fan`
- `artist`
- `admin`

Role enforcement is applied in:
- dashboard auth checks
- session-based API validation
- endpoint-level ownership checks

Examples:
- `fan.html` only allows fan sessions
- song uploads require artist ownership
- user-scoped endpoints derive identity from the server session
- admin endpoints require admin session context

---

## Slide 4: Frontend Responsibilities

The frontend handles:
- page rendering
- event handling
- dashboard state updates
- fetch calls to backend APIs
- modal workflows
- dynamic table population
- audio player interactions

Major frontend files:
- [fan.js](/c:/xampp/htdocs/Music_app/Js/fan.js)
- [artist.js](/c:/xampp/htdocs/Music_app/Js/artist.js)
- [admin.js](/c:/xampp/htdocs/Music_app/Js/admin.js)
- [auth-logic.js](/c:/xampp/htdocs/Music_app/auth/auth-logic.js)

---

## Slide 5: Backend Responsibilities

The backend handles:
- authentication
- session management
- authorization
- database reads and writes
- file upload processing
- ownership checks
- notifications
- stats and reporting

Important backend files:
- [db.php](/c:/xampp/htdocs/Music_app/backend/db.php)
- [login.php](/c:/xampp/htdocs/Music_app/backend/api/login.php)
- [session.php](/c:/xampp/htdocs/Music_app/backend/api/session.php)
- [upload.php](/c:/xampp/htdocs/Music_app/backend/api/upload.php)
- [songs.php](/c:/xampp/htdocs/Music_app/backend/api/songs.php)

---

## Slide 6: Authentication Model

The app uses session-based authentication.

Flow:
1. login request is sent to `backend/api/login.php`
2. backend validates credentials
3. PHP session is created
4. session user data is stored server-side
5. dashboards verify session via `backend/api/session.php`

Why this matters:
- reduces reliance on browser-side trust
- supports role checks on the server
- improves control over protected routes and API calls

---

## Slide 7: Authorization Model

Authorization is enforced at the endpoint level.

Important patterns used:
- admin-only endpoint restrictions
- artist ownership checks for songs
- fan ownership checks for follows, favorites, history, playlists
- session-derived identity instead of trusting `user_id` from the client

This is one of the key architectural strengths of the current system.

---

## Slide 8: Security Highlights

The system now emphasizes:

### Session-Based Identity
- user identity comes from PHP session state

### Ownership Enforcement
- users cannot act on behalf of other users by changing request payloads

### Admin Separation
- admin UI and backend privileges are separated from artist-owned content

### Protected User Data
- favorites
- follows
- playlists
- history
- notifications

### Safer Upload Flow
- song upload ownership is derived from the logged-in artist

---

## Slide 9: Key Security Improvements In The Current System

The system was hardened around several sensitive areas.

Examples:
- artist profile writes are scoped by ownership or admin rights
- subscriptions are no longer openly writable by arbitrary callers
- follow/unfollow actions use the current session user
- favorites and history are tied to the authenticated account
- playlist modification requires playlist ownership or admin rights
- notifications no longer allow arbitrary cross-user posting from the browser
- admin song editing was intentionally disabled to preserve artist control

---

## Slide 10: Song Ownership Model

Artist song integrity is a major design principle.

Current rules:
- artists create and manage their own songs
- song upload binds to the logged-in artist profile
- artists can update safe song metadata for their own songs
- admins can review songs but do not own artist catalog data

This supports:
- creator ownership
- better auditability
- lower risk of unauthorized metadata changes

---

## Slide 11: UI Functionality By Dashboard

### Fan Dashboard
- browse songs and artists
- play music
- favorite songs
- follow artists
- create and manage playlists
- view notifications
- view history

### Artist Dashboard
- upload songs and cover art
- manage artist profile
- view artist-side stats
- see uploaded songs
- use subscription/payment-related flows

### Admin Dashboard
- manage users
- manage artists
- manage subscriptions
- view platform stats
- use read-only song review flow

---

## Slide 12: Data Model Overview

The database includes core entities such as:
- users
- artists
- songs
- subscriptions
- playlists
- playlist_songs
- follows
- user_likes
- listening_history
- notifications
- settings
- reports

This supports:
- role-based identity
- music publishing
- engagement tracking
- admin reporting

Reference:
- [database_schema.sql](/c:/xampp/htdocs/Music_app/database_schema.sql)

---

## Slide 13: File Upload And Media Storage

Uploaded content is stored locally under:
- `uploads/songs`
- `uploads/artwork`
- `uploads/avatars`

The upload backend:
- validates authentication
- validates upload type
- derives artist ownership
- stores media paths in the database

Reference:
- [upload.php](/c:/xampp/htdocs/Music_app/backend/api/upload.php)

---

## Slide 14: Notifications Model

Notifications are now handled more safely.

Patterns:
- users can read their own notifications
- users can mark their own notifications as read
- admins can manage notifications more broadly
- artist follow/unfollow alerts are created by the backend

This removes the risk of the browser sending arbitrary messages to unrelated users.

---

## Slide 15: Playlist And Engagement Model

Playlists and engagement features are part of the fan retention model.

The system supports:
- playlist creation
- playlist update
- playlist deletion
- adding/removing songs from playlists
- favorites
- follows
- listening history

These actions now depend on session ownership rules.

---

## Slide 16: Admin Governance Model

The admin dashboard is not meant to impersonate content ownership.

Its responsibilities are governance-oriented:
- user oversight
- artist moderation
- subscription visibility
- reporting
- settings

Current design decision:
- admin songs area is intentionally read-only for artist-owned songs

This is aligned with platform integrity and creator ownership.

---

## Slide 17: Performance And UX Notes

Current UX strengths:
- clear role-based separation
- dashboard-driven navigation
- AJAX-style updates through fetch
- lightweight frontend stack
- no heavy framework dependency

Possible future improvements:
- API response caching
- consolidated frontend data services
- stronger component reuse
- browser automation tests
- reduced duplicate session fetches

---

## Slide 18: Risks And Technical Debt

Even with the current hardening, future work still exists.

Areas to improve next:
- unify older and newer backend patterns completely
- reduce duplicate endpoint consumers
- add automated integration tests
- improve admin quick-action consistency further
- standardize response contracts across all endpoints
- strengthen payment and audit workflows for production use

This is normal for a growing full-stack project.

---

## Slide 19: Suggested Developer Walkthrough Order

If explaining the project to a developer, use this order:

1. start with the role model
2. explain the page-to-dashboard structure
3. explain session-based authentication
4. explain API ownership rules
5. explain the core data tables
6. explain the song upload and playback flow
7. explain fan engagement features
8. explain admin governance design
9. explain recent security hardening choices

This keeps the explanation logical and easy to follow.

---

## Slide 20: Key Developer Message

AfroRhythm is a role-aware music platform built on a simple but effective architecture:
- static frontend pages
- vanilla JS dashboards
- PHP session-based API backend
- MySQL persistence
- local media storage

Its most important architectural qualities are:
- clear domain separation by role
- increasing ownership-based authorization
- strong alignment between content integrity and user permissions

---

# Part 3: Presentation Summary

## Executive Summary

AfroRhythm is a multi-role digital music platform for Cameroonian music distribution and engagement.

From a non-technical point of view, it helps:
- fans listen
- artists publish
- admins manage

From a technical point of view, it is:
- a full-stack web application
- role-based
- session-authenticated
- API-driven
- backed by MySQL and local file storage

Its most important strengths are:
- structured user roles
- working music lifecycle
- dashboard-based operations
- improving security and ownership controls

---

# Part 4: Files To Mention During A Presentation

If you want to reference the codebase while presenting, these are the best starting points:

- [index.html](/c:/xampp/htdocs/Music_app/index.html)
- [fan.html](/c:/xampp/htdocs/Music_app/fan.html)
- [artist.html](/c:/xampp/htdocs/Music_app/artist.html)
- [admin.html](/c:/xampp/htdocs/Music_app/admin.html)
- [auth/login.html](/c:/xampp/htdocs/Music_app/auth/login.html)
- [auth/signup.html](/c:/xampp/htdocs/Music_app/auth/signup.html)
- [Js/fan.js](/c:/xampp/htdocs/Music_app/Js/fan.js)
- [Js/artist.js](/c:/xampp/htdocs/Music_app/Js/artist.js)
- [Js/admin.js](/c:/xampp/htdocs/Music_app/Js/admin.js)
- [backend/api/login.php](/c:/xampp/htdocs/Music_app/backend/api/login.php)
- [backend/api/session.php](/c:/xampp/htdocs/Music_app/backend/api/session.php)
- [backend/api/upload.php](/c:/xampp/htdocs/Music_app/backend/api/upload.php)
- [backend/api/songs.php](/c:/xampp/htdocs/Music_app/backend/api/songs.php)
- [backend/api/favorites.php](/c:/xampp/htdocs/Music_app/backend/api/favorites.php)
- [backend/api/follows.php](/c:/xampp/htdocs/Music_app/backend/api/follows.php)
- [backend/api/playlists.php](/c:/xampp/htdocs/Music_app/backend/api/playlists.php)
- [backend/api/history.php](/c:/xampp/htdocs/Music_app/backend/api/history.php)
- [backend/api/notifications.php](/c:/xampp/htdocs/Music_app/backend/api/notifications.php)
- [backend/api/subscriptions.php](/c:/xampp/htdocs/Music_app/backend/api/subscriptions.php)
- [database_schema.sql](/c:/xampp/htdocs/Music_app/database_schema.sql)

---

# Part 5: How To Use This Document In A Real Presentation

You can present this in 2 ways.

### Option 1: For Business Or Academic Audiences
Use:
- Part 1
- Part 3

### Option 2: For Technical Review Or Project Defense
Use:
- Part 2
- Part 3
- Part 4

### Option 3: For Mixed Audiences
Use:
- Part 1 first
- then Part 2
- then end with Part 3

This gives both groups the right level of explanation without overwhelming either audience.
