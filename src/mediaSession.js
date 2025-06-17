// Media Session API for background playback and notification controls
class MediaSessionManager {
    constructor(audioElement) {
        this.audioElement = audioElement;
        this.currentStation = null;
        this.currentStationImage = null;
        this.isSupported = 'mediaSession' in navigator;
        
        if (this.isSupported) {
            this.setupMediaSession();
        }
    }

    setupMediaSession() {
        // Set up action handlers for notification controls
        navigator.mediaSession.setActionHandler('play', () => {
            this.audioElement.play().catch(e => {
                console.log('Media session play failed:', e);
            });
        });

        navigator.mediaSession.setActionHandler('pause', () => {
            this.audioElement.pause();
        });

        navigator.mediaSession.setActionHandler('stop', () => {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
            // Trigger custom stop event for the app to handle
            document.dispatchEvent(new CustomEvent('mediaSessionStop'));
        });

        // Optional: Add previous/next handlers for station switching
        try {
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                document.dispatchEvent(new CustomEvent('mediaSessionPrevious'));
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                document.dispatchEvent(new CustomEvent('mediaSessionNext'));
            });
        } catch (error) {
            // Previous/next actions not supported on this browser
            console.log('Previous/next track actions not supported');
        }

        // Handle seek actions (disabled for radio streams)
        try {
            navigator.mediaSession.setActionHandler('seekbackward', null);
            navigator.mediaSession.setActionHandler('seekforward', null);
            navigator.mediaSession.setActionHandler('seekto', null);
        } catch (error) {
            // Seek actions not supported
        }
    }

    updateMetadata(stationName, stationImage = null) {
        if (!this.isSupported) return;

        this.currentStation = stationName;
        this.currentStationImage = stationImage;
        
        // Prepare artwork array
        const artwork = [];
        
        if (stationImage && stationImage !== 'img/station_placeholder.png') {
            artwork.push({
                src: stationImage,
                sizes: '192x192',
                type: 'image/png'
            });
        }
        
        // Always include default icons as fallback
        artwork.push(
            {
                src: 'img/icon-192.png',
                sizes: '192x192',
                type: 'image/png'
            },
            {
                src: 'img/icon-512.png',
                sizes: '512x512',
                type: 'image/png'
            }
        );
        
        navigator.mediaSession.metadata = new MediaMetadata({
            title: stationName,
            artist: 'Live Radio Stream',
            album: 'Rrradio',
            artwork: artwork
        });
    }

    setPlaybackState(state) {
        if (!this.isSupported) return;
        
        // Valid states: 'none', 'paused', 'playing'
        navigator.mediaSession.playbackState = state;
    }

    clearMetadata() {
        if (!this.isSupported) return;
        
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
        this.currentStation = null;
        this.currentStationImage = null;
    }

    // Update position info (for compatibility, though radio streams don't have duration)
    updatePositionState() {
        if (!this.isSupported || !('setPositionState' in navigator.mediaSession)) return;
        
        try {
            navigator.mediaSession.setPositionState({
                duration: Infinity, // Radio streams are infinite
                playbackRate: 1.0,
                position: 0
            });
        } catch (error) {
            // Position state not supported or invalid
        }
    }
}

// Make available globally
window.MediaSessionManager = MediaSessionManager;
