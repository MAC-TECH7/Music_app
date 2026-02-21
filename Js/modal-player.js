// AfroRhythm - Modal Audio Player with Real Playback
// A Bootstrap modal-based music player with HTML5 audio

(function () {
    'use strict';

    let currentSong = null;
    let audio = null;
    let allSongs = [];
    let currentIndex = 0;

    // Fetch all songs from backend
    async function loadSongs() {
        try {
            const res = await fetch('backend/api/songs.php');
            const json = await res.json();
            if (json.success && json.data) {
                allSongs = json.data.map(s => {
                    // Use cover art if available, otherwise use Unsplash image based on artist name
                    let coverArt = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';

                    if (s.cover_art) {
                        coverArt = s.cover_art;
                    } else if (s.artist_name) {
                        // Generate unique Unsplash image based on artist name hash
                        const hash = s.artist_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                        const imageId = ['1493225457124-a3eb161ffa5f', '1459749411175-04bf5292ceea', '1511671782779-c97d3d27a1d4', '1514525253161-7a46d19cd819', '1493225457124-a3eb161ffa5f'][hash % 5];
                        coverArt = `https://images.unsplash.com/photo-${imageId}?w=400&h=400&fit=crop`;
                    }

                    return {
                        id: s.id,
                        title: s.title || 'Unknown',
                        artist: s.artist_name || 'Unknown Artist',
                        filePath: s.file_path || '',
                        coverArt: coverArt
                    };
                });
                console.log(`✅ Loaded ${allSongs.length} songs with cover art`);
            }
        } catch (err) {
            console.error('Failed to load songs:', err);
        }
    }

    // Create modal HTML dynamically
    function createModal() {
        const modalHTML = `
            <div class="modal fade" id="audioPlayerModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content" style="background: #2a2a3e; color: #f8f9fa; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="modal-header" style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <h5 class="modal-title">Now Playing</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="text-center mb-4">
                                <img id="playingAlbumArt" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%232a2a3e' stroke='%23444' stroke-width='2'/%3E%3Ctext x='50%25' y='50%25' fill='%23666' text-anchor='middle' dy='.3em' font-family='Arial' font-size='24'%3EAfroRhythm%3C/text%3E%3C/svg%3E" 
                                     alt="Album Art" 
                                     style="width: 200px; height: 200px; border-radius: 8px; object-fit: cover;">
                            </div>
                            <div class="text-center mb-4">
                                <h4 id="playingSongTitle" class="text-fix mb-2">Song Title</h4>
                                <p id="playingSongGenre" class="text-muted text-secondary-fix">Artist</p>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="mb-3">
                                <div class="d-flex justify-content-between mb-2">
                                    <small id="currentTime">0:00</small>
                                    <small id="totalTime">0:00</small>
                                </div>
                                <div class="progress" style="height: 6px; cursor: pointer; background: rgba(255,255,255,0.1);" id="progressBar">
                                    <div class="progress-bar" id="progressFill" style="width: 0%; background: linear-gradient(90deg, #FF6B35, #2E8B57);"></div>
                                </div>
                            </div>

                            <!-- Controls -->
                            <div class="d-flex justify-content-center align-items-center gap-3 mb-3">
                                <button class="btn btn-outline-light rounded-circle" id="prevBtn" style="width: 45px; height: 45px;">
                                    <i class="fas fa-step-backward"></i>
                                </button>
                                <button class="btn btn-primary rounded-circle" id="playPauseBtn" style="width: 55px; height: 55px; background: linear-gradient(135deg, #FF6B35, #2E8B57); border: none;">
                                    <i class="fas fa-play" id="playPauseIcon"></i>
                                </button>
                                <button class="btn btn-outline-light rounded-circle" id="nextBtn" style="width: 45px; height: 45px;">
                                    <i class="fas fa-step-forward"></i>
                                </button>
                            </div>

                            <!-- Volume -->
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-sm btn-outline-light" id="volumeBtn" style="width: 35px;">
                                    <i class="fas fa-volume-up"></i>
                                </button>
                                <input type="range" class="form-range flex-grow-1" id="volumeSlider" min="0" max="100" value="80">
                            </div>
                        </div>
                        <div class="modal-footer" style="border-top: 1px solid rgba(255,255,255,0.1);">
                            <button type="button" class="btn btn-outline-light btn-sm" id="downloadBtn">
                                <i class="fas fa-download me-1"></i> Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if present
        const existing = document.getElementById('audioPlayerModal');
        if (existing) existing.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Initialize audio element
    function initAudio() {
        if (!audio) {
            audio = new Audio();
            audio.preload = 'auto';

            // Time update
            audio.addEventListener('timeupdate', () => {
                if (audio.duration) {
                    const percent = (audio.currentTime / audio.duration) * 100;
                    const progressFill = document.getElementById('progressFill');
                    const currentTime = document.getElementById('currentTime');
                    const totalTime = document.getElementById('totalTime');

                    if (progressFill) progressFill.style.width = percent + '%';
                    if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
                    if (totalTime) totalTime.textContent = formatTime(audio.duration);
                }
            });

            // On ended - play next
            audio.addEventListener('ended', () => {
                playNext();
            });

            // On play - change icon to pause
            audio.addEventListener('play', () => {
                const icon = document.getElementById('playPauseIcon');
                if (icon) {
                    icon.classList.remove('fa-play');
                    icon.classList.add('fa-pause');
                    console.log('Audio playing - icon changed to pause');
                }
            });

            // On pause - change icon to play
            audio.addEventListener('pause', () => {
                const icon = document.getElementById('playPauseIcon');
                if (icon) {
                    icon.classList.remove('fa-pause');
                    icon.classList.add('fa-play');
                    console.log('Audio paused - icon changed to play');
                }
            });
        }
    }

    // Format time helper
    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    // Attach event listeners (with duplicate prevention)
    let listenersAttached = false;

    function attachListeners() {
        if (listenersAttached) {
            console.log('Listeners already attached, skipping');
            return;
        }

        console.log('Attaching modal player listeners...');

        // Play/Pause
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.onclick = function () {
                console.log('Play/Pause clicked, audio.paused:', audio.paused);
                if (audio.paused) {
                    audio.play();
                } else {
                    audio.pause();
                }
            };
        }

        // Previous
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn) {
            prevBtn.onclick = function () {
                console.log('Previous clicked');
                playPrevious();
            };
        }

        // Next
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn) {
            nextBtn.onclick = function () {
                console.log('Next clicked');
                playNext();
            };
        }

        // Progress bar click to seek
        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            progressBar.onclick = function (e) {
                if (audio.duration) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = (e.clientX - rect.left) / rect.width;
                    audio.currentTime = percent * audio.duration;
                }
            };
        }

        // Volume
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.oninput = function (e) {
                audio.volume = e.target.value / 100;
                updateVolumeIcon(e.target.value);
            };
            // Set initial volume
            audio.volume = 0.8;
        }

        // Download
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.onclick = async function () {
                if (currentSong && currentSong.filePath) {
                    // Report download to backend
                    try {
                        fetch('backend/api/track.php', {
                            method: 'POST',
                            body: JSON.stringify({ action: 'download', id: currentSong.id }),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } catch (e) { console.error("Track error:", e); }

                    const link = document.createElement('a');
                    link.href = currentSong.filePath;
                    link.download = `${currentSong.title}.mp3`;
                    link.click();
                }
            };
        }

        listenersAttached = true;
        console.log('✅ All listeners attached successfully');
    }

    function updateVolumeIcon(volume) {
        const icon = document.getElementById('volumeBtn').querySelector('i');
        if (!icon) return;

        // Remove all volume classes
        icon.classList.remove('fa-volume-mute', 'fa-volume-down', 'fa-volume-up');

        // Add appropriate class based on volume
        if (volume == 0) {
            icon.classList.add('fa-volume-mute');
        } else if (volume < 50) {
            icon.classList.add('fa-volume-down');
        } else {
            icon.classList.add('fa-volume-up');
        }
    }

    // Play specific song
    function playSong(song) {
        currentSong = song;
        currentIndex = allSongs.findIndex(s => s.id === song.id);

        // Update modal UI
        document.getElementById('playingSongTitle').textContent = song.title;
        document.getElementById('playingSongGenre').textContent = song.artist;
        document.getElementById('playingAlbumArt').src = song.coverArt;

        // Set audio source and play
        if (audio && song.filePath) {
            // Report play and history to backend
            try {
                fetch('backend/api/track.php', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'play', id: song.id }),
                    headers: { 'Content-Type': 'application/json' }
                });
                fetch('backend/api/track.php', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'history', id: song.id }),
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (e) { console.error("Track error:", e); }

            audio.src = song.filePath;
            audio.load();
            audio.play().catch(err => {
                console.error('Playback error:', err);
                alert('Failed to play audio. File may not exist or format is unsupported.');
            });
        }
    }

    // Play next song
    function playNext() {
        if (allSongs.length === 0) return;
        currentIndex = (currentIndex + 1) % allSongs.length;
        playSong(allSongs[currentIndex]);
    }

    // Play previous song
    function playPrevious() {
        if (allSongs.length === 0) return;
        currentIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
        playSong(allSongs[currentIndex]);
    }

    // Global function to play song by ID
    window.playSongInModal = function (songId) {
        const song = allSongs.find(s => s.id == songId);
        if (!song) {
            console.error('Song not found:', songId);
            return;
        }

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('audioPlayerModal'));
        modal.show();

        // Play song
        playSong(song);
    };

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', async () => {
        await loadSongs();
        createModal();
        initAudio();
        attachListeners(); // Attach immediately after modal creation
    });

})();
