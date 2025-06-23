class RadioApp {
    constructor() {
        console.log('Initializing Rrradio...');
        this.stations = this.loadStations();
        console.log('Loaded stations:', this.stations);
        this.currentStation = null;
        this.audio = document.getElementById('audioElement');
        this.crossfadeAudio = null; // Secondary audio element for crossfading
        this.isPlaying = false;
        this.isStopping = false; // Flag to track intentional stops
        this.isCrossfading = false; // Flag to track crossfade in progress
        this.crossfadeDuration = 2000; // Crossfade duration in milliseconds
        this.crossfadeEnabled = true; // Enable/disable crossfade feature
        this.targetVolume = 0.7; // Target volume for crossfade completion
        
        // Version information
        this.version = {
            number: '1.3.3',
            build: this.generateBuildNumber(),
            date: this.formatBuildDate(),
            codename: 'Frequency Shift',
            isBeta: false
        };

        this.detectBetaEnvironment();
        
        this.initializeEventListeners();
        this.renderStations();
        this.setupAudioEventListeners();
        this.createCrossfadeAudio();
        
        // Initialize version info immediately
        this.updateVersionInfo();
        
        // Make version info accessible globally for debugging
        window.rrradioVersion = this.version;
        
        // Add helpful debug methods
        window.showRrradioInfo = () => this.showVersionDetails();
        window.getRrradioVersion = () => this.version;
        
        // Add a method to clear localStorage for testing (accessible via browser console)
        window.clearRadioStations = () => {
            localStorage.removeItem('rrradio-stations');
            console.log('Cleared stored stations. Refresh the page to load default presets.');
        };
        
        // Make the app instance globally accessible for the update notification
        window.radioApp = this;
        
        // Check if we need to restore playback state after an update reload
        this.restorePlaybackStateAfterUpdate();
    }

    // Local Storage Management
    loadStations() {
        console.log('Starting loadStations method');
        try {
            const stored = localStorage.getItem('rrradio-stations');
            console.log('Raw localStorage value:', stored);
            
            if (stored && stored !== 'null' && stored !== 'undefined') {
                try {
                    const parsedStations = JSON.parse(stored);
                    console.log('Loaded stations from localStorage:', parsedStations);
                    
                    // Check if parsed stations is a valid array with content
                    if (Array.isArray(parsedStations) && parsedStations.length > 0) {
                        console.log('Returning parsed stations:', parsedStations.length, 'stations found');
                        return parsedStations;
                    } else {
                        console.log('Parsed stations is empty or invalid, loading defaults');
                        // If empty array or invalid, load defaults
                        const defaultStations = this.getDefaultStations();
                        this.saveStationsToStorage(defaultStations);
                        return defaultStations;
                    }
                } catch (error) {
                    console.error('Error parsing stored stations:', error);
                    // If JSON parse fails, load defaults
                    const defaultStations = this.getDefaultStations();
                    this.saveStationsToStorage(defaultStations);
                    return defaultStations;
                }
            } else {
                // Return default preset stations if no saved stations exist
                const defaultStations = this.getDefaultStations();
                console.log('No saved stations found, loading default presets:', defaultStations);
                // Save the default stations to localStorage so they persist
                this.saveStationsToStorage(defaultStations);
                return defaultStations;
            }
        } catch (e) {
            console.error('Critical error in loadStations:', e);
            // Last resort fallback
            return this.getDefaultStations();
        }
    }

    getDefaultStations() {
        return [
          {
            id: "preset-npo-radio-1",
            name: "NPO Radio 1",
            url: "https://www.mp3streams.nl/zender/npo-radio-1/stream/1-aac-64",
            image: "https://www.mp3streams.nl/logo/z/npo-radio-1",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-npo-radio-2",
            name: "NPO Radio 2",
            url: "https://www.mp3streams.nl/zender/npo-radio-2/stream/3-aac-64",
            image: "https://www.mp3streams.nl/logo/z/npo-radio-2",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-npo-3fm",
            name: "NPO 3FM",
            url: "https://www.mp3streams.nl/zender/3fm/stream/7-aac-64",
            image: "https://www.mp3streams.nl/logo/z/3fm",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-kink",
            name: "KINK",
            url: "https://www.mp3streams.nl/zender/kink/stream/19-aac-128",
            image: "https://www.mp3streams.nl/logo/z/kink",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-arrow-classic-rock",
            name: "Arrow Classic Rock",
            url: "https://www.mp3streams.nl/zender/arrow-classic-rock/stream/13-mp3-128",
            image: "https://www.mp3streams.nl/logo/z/arrow-classic-rock",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-npo-radio-2-soul-jazz",
            name: "NPO Radio 2 Soul & Jazz",
            url: "https://www.mp3streams.nl/zender/npo-radio-2-soul-jazz/stream/44-mp3-192",
            image: "https://www.mp3streams.nl/logo/z/npo-radio-2-soul-jazz",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-classic-nl",
            name: "Classic NL",
            url: "https://stream.classic.nl/classicnl-mindradio.mp3",
            image: "https://classic.nl/images/logo-classicnl-header.png",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-subasio",
            name: "Radio Subasio",
            url: "https://icy.unitedradio.it/Subasio.mp3",
            image: "https://i.imgur.com/U8zaFmv.png",
            dateAdded: new Date().toISOString(),
          },
        ];
    }

    saveStations() {
        this.saveStationsToStorage(this.stations);
    }

    saveStationsToStorage(stations) {
        localStorage.setItem('rrradio-stations', JSON.stringify(stations));
        console.log('Saved stations to localStorage:', stations);
    }

    // Event Listeners
    initializeEventListeners() {
        // Add station modal
        document.getElementById('addStationBtn').addEventListener('click', () => {
            this.showAddStationModal();
        });

        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideAddStationModal();
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.hideAddStationModal();
        });

        document.getElementById('addStationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addStation();
        });

        // Edit station modal
        document.getElementById('closeEditModal').addEventListener('click', () => {
            this.hideEditStationModal();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.hideEditStationModal();
        });

        document.getElementById('editStationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateStation();
        });

        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettingsModal();
        });

        document.getElementById('closeSettingsModal').addEventListener('click', () => {
            this.hideSettingsModal();
        });

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('resetSettingsBtn').addEventListener('click', () => {
            this.resetSettings();
        });

        // Crossfade settings
        document.getElementById('crossfadeEnabled').addEventListener('change', (e) => {
            this.crossfadeEnabled = e.target.checked;
        });

        document.getElementById('crossfadeDuration').addEventListener('input', (e) => {
            this.crossfadeDuration = parseInt(e.target.value);
            document.getElementById('crossfadeDurationValue').textContent = (this.crossfadeDuration / 1000).toFixed(1) + 's';
        });

        // Theme preference
        document.getElementById('themePreference').addEventListener('change', (e) => {
            this.setThemePreference(e.target.value);
        });

        // Audio player controls
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('stopBtn').addEventListener('click', () => {
            this.stopPlayback();
        });

        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.setVolume(e.target.value);
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            const addModal = document.getElementById('addStationModal');
            const editModal = document.getElementById('editStationModal');
            const settingsModal = document.getElementById('settingsModal');

            if (e.target === addModal) {
                this.hideAddStationModal();
            }
            if (e.target === editModal) {
                this.hideEditStationModal();
            }
            if (e.target === settingsModal) {
                this.hideSettingsModal();
            }

            // Close station menus when clicking outside
            if (!e.target.closest('.station-actions')) {
                document.querySelectorAll('.station-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
                document.querySelectorAll('.station-card.menu-active').forEach(card => {
                    card.classList.remove('menu-active');
                });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddStationModal();
                this.hideEditStationModal();
                this.hideSettingsModal();
            }
            if (e.key === ' ' && this.currentStation) {
                e.preventDefault();
                this.togglePlayPause();
            }
        });

        // Load saved settings
        this.loadSettings();
        
        // Add version info click handler for detailed info
        this.setupVersionInfoHandler();
    }
    
    setupVersionInfoHandler() {
        // Add click handler to version info for detailed information
        const versionInfo = document.querySelector('.version-info');
        if (versionInfo) {
            versionInfo.style.cursor = 'pointer';
            versionInfo.title = 'Click for detailed version information';
            
            versionInfo.addEventListener('click', () => {
                this.showVersionDetails();
            });
        }
    }
    
    showVersionDetails() {
        const betaText = this.version.isBeta ? ' Beta' : '';
        const detailedInfo = `🎵 Rrradio v${this.version.number}${betaText} "${this.version.codename}" - Built with ❤️ for radio lovers!`;
        this.showNotification(detailedInfo, 5000); // Show for 5 seconds
        
        // Also log detailed info to console
        console.group('🎵 Rrradio Version Details');
        console.log(`Version: ${this.version.number} (${this.version.codename})`);
        console.log(`Build: ${this.version.build}`);
        console.log(`Last Updated: ${this.version.date}`);
        console.log('Features: Background playback, Crossfade, PWA, Dark/Light themes');
        console.log('Built with: Vanilla JavaScript, CSS Grid, Web Audio API, Media Session API');
        console.groupEnd();
    }

    setupAudioEventListeners() {
        // Remove any existing listeners first to prevent duplicates
        this.removeAudioEventListeners(this.audio);
        
        this.audio.addEventListener('loadstart', this.audioLoadStartHandler);
        this.audio.addEventListener('loadeddata', this.audioLoadedDataHandler);
        this.audio.addEventListener('playing', this.audioPlayingHandler);
        this.audio.addEventListener('pause', this.audioPauseHandler);
        this.audio.addEventListener('ended', this.audioEndedHandler);
        this.audio.addEventListener('error', this.audioErrorHandler);
        this.audio.addEventListener('waiting', this.audioWaitingHandler);
        this.audio.addEventListener('canplay', this.audioCanPlayHandler);

        // Set initial volume
        this.audio.volume = 0.7;
        this.targetVolume = 0.7;
    }

    removeAudioEventListeners(audioElement) {
        if (!audioElement) return;
        
        audioElement.removeEventListener('loadstart', this.audioLoadStartHandler);
        audioElement.removeEventListener('loadeddata', this.audioLoadedDataHandler);
        audioElement.removeEventListener('playing', this.audioPlayingHandler);
        audioElement.removeEventListener('pause', this.audioPauseHandler);
        audioElement.removeEventListener('ended', this.audioEndedHandler);
        audioElement.removeEventListener('error', this.audioErrorHandler);
        audioElement.removeEventListener('waiting', this.audioWaitingHandler);
        audioElement.removeEventListener('canplay', this.audioCanPlayHandler);
    }

    // Audio event handler methods (bound to maintain 'this' context)
    audioLoadStartHandler = () => {
        this.updatePlayerStatus('Loading...');
    }

    audioLoadedDataHandler = () => {
        this.updatePlayerStatus('Ready to play');
    }

    audioPlayingHandler = () => {
        this.isPlaying = true;
        this.updatePlayerStatus('Playing');
        this.updatePlayPauseButton();
        this.markStationAsPlaying();
    }

    audioPauseHandler = () => {
        this.isPlaying = false;
        this.updatePlayerStatus('Paused');
        this.updatePlayPauseButton();
    }

    audioEndedHandler = () => {
        this.isPlaying = false;
        this.updatePlayerStatus('Ended');
        this.updatePlayPauseButton();
        this.clearPlayingStations();
    }

    audioErrorHandler = (e) => {
        console.error('Audio error:', e);
        // Only show error message if it's not an intentional stop
        if (!this.isStopping) {
            this.updatePlayerStatus('Error loading stream');
            this.isPlaying = false;
            this.updatePlayPauseButton();
            this.clearPlayingStations();
        }
    }

    audioWaitingHandler = () => {
        this.updatePlayerStatus('Buffering...');
    }

    audioCanPlayHandler = () => {
        if (this.isPlaying) {
            this.updatePlayerStatus('Playing');
        } else {
            this.updatePlayerStatus('Ready to play');
        }
    }

    // Crossfade Audio Management
    createCrossfadeAudio() {
        this.crossfadeAudio = document.createElement('audio');
        this.crossfadeAudio.id = 'crossfadeAudioElement';
        this.crossfadeAudio.preload = 'none';
        this.crossfadeAudio.volume = 0;
        document.body.appendChild(this.crossfadeAudio);
        
        // Setup event listeners for crossfade audio
        this.crossfadeAudio.addEventListener('error', (e) => {
            console.error('Crossfade audio error:', e);
            this.isCrossfading = false;
        });

        this.crossfadeAudio.addEventListener('canplay', () => {
            console.log('Crossfade audio ready to play');
        });
    }

    async performCrossfade(newStation) {
        if (!this.crossfadeEnabled || this.isCrossfading) {
            console.log('Crossfade disabled or already in progress');
            return false;
        }

        if (!this.isPlaying || !this.currentStation) {
            console.log('No current station playing, skipping crossfade');
            return false;
        }

        console.log(`Starting crossfade from ${this.currentStation.name} to ${newStation.name}`);
        this.isCrossfading = true;

        // Add visual feedback for crossfading
        this.markStationAsCrossfading(newStation);
        this.updatePlayerStatusWithCrossfade(newStation);

        try {
            // Prepare the new audio stream
            this.crossfadeAudio.src = newStation.url;
            this.crossfadeAudio.volume = 0;
            
            // Wait for the new stream to be ready
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Crossfade audio load timeout'));
                }, 10000); // 10 second timeout

                const onCanPlay = () => {
                    clearTimeout(timeout);
                    this.crossfadeAudio.removeEventListener('canplay', onCanPlay);
                    this.crossfadeAudio.removeEventListener('error', onError);
                    resolve();
                };

                const onError = (e) => {
                    clearTimeout(timeout);
                    this.crossfadeAudio.removeEventListener('canplay', onCanPlay);
                    this.crossfadeAudio.removeEventListener('error', onError);
                    reject(e);
                };

                this.crossfadeAudio.addEventListener('canplay', onCanPlay);
                this.crossfadeAudio.addEventListener('error', onError);
                
                this.crossfadeAudio.load();
            });

            // Start playing the new stream at volume 0
            await this.crossfadeAudio.play();

            // Perform the crossfade
            await this.animateCrossfade();

            // Switch audio elements
            this.swapAudioElements();
            
            // Update station info
            this.currentStation = newStation;
            this.updatePlayerInfo();
            this.markStationAsPlaying();
            this.updatePlayerStatus('Playing');

            // Clear crossfading visual feedback
            this.clearCrossfadingStations();

            console.log('Crossfade completed successfully');
            return true;

        } catch (error) {
            console.error('Crossfade failed:', error);
            this.isCrossfading = false;
            
            // Clear crossfading visual feedback on error
            this.clearCrossfadingStations();
            
            // Clean up crossfade audio on error
            this.crossfadeAudio.pause();
            this.crossfadeAudio.src = '';
            this.crossfadeAudio.volume = 0;
            return false;
        }
    }

    async animateCrossfade() {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const initialVolume = this.audio.volume;
            const targetVolume = this.targetVolume || initialVolume;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / this.crossfadeDuration, 1);

                // Smooth easing function (ease-in-out)
                const easeInOut = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                // Fade out current audio
                this.audio.volume = initialVolume * (1 - easeInOut);
                
                // Fade in new audio
                this.crossfadeAudio.volume = targetVolume * easeInOut;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.isCrossfading = false;
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    swapAudioElements() {
        // Pause and clear the old audio
        this.audio.pause();
        this.audio.src = '';

        // Remove event listeners from current audio element
        this.removeAudioEventListeners(this.audio);

        // Swap the audio elements
        const tempAudio = this.audio;
        this.audio = this.crossfadeAudio;
        this.crossfadeAudio = tempAudio;

        // Reset crossfade audio for next use
        this.crossfadeAudio.volume = 0;
        this.crossfadeAudio.src = '';

        // Add event listeners to the new primary audio element
        this.setupAudioEventListeners();

        // Update media session if available
        if (window.mediaSessionManager) {
            window.mediaSessionManager.updateMetadata(
                this.currentStation.name,
                this.currentStation.image
            );
        }
    }

    // Station Management
    toggleStationMenu(stationId) {
        // Close all other menus and remove menu-active class
        document.querySelectorAll('.station-menu').forEach(menu => {
            if (menu.id !== `menu-${stationId}`) {
                menu.classList.remove('show');
                // Remove menu-active class from the station card
                const stationCard = menu.closest('.station-card');
                if (stationCard) {
                    stationCard.classList.remove('menu-active');
                }
            }
        });

        // Toggle the clicked menu
        const menu = document.getElementById(`menu-${stationId}`);
        const stationCard = document.querySelector(`[data-station-id="${stationId}"]`);
        
        if (menu && stationCard) {
            menu.classList.toggle('show');
            // Toggle menu-active class on the station card
            if (menu.classList.contains('show')) {
                stationCard.classList.add('menu-active');
            } else {
                stationCard.classList.remove('menu-active');
            }
        }
    }

    handleImageError(imgElement) {
        // Hide the failed image
        imgElement.style.display = 'none';
        
        // Find and show the placeholder
        const placeholder = imgElement.nextElementSibling;
        if (placeholder && placeholder.classList.contains('station-image-placeholder')) {
            placeholder.style.display = 'flex';
        }
    }

    addStation() {
        const name = document.getElementById('stationName').value.trim();
        const url = document.getElementById('stationUrl').value.trim();
        const image = document.getElementById('stationImage').value.trim();

        if (!name || !url) {
            alert('Please fill in station name and URL');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            alert('Please enter a valid stream URL');
            return;
        }

        const station = {
            id: Date.now().toString(),
            name,
            url,
            image: image || null,
            dateAdded: new Date().toISOString()
        };

        this.stations.push(station);
        this.saveStations();
        this.renderStations();
        this.hideAddStationModal();
        this.clearAddStationForm();

        // Show success message
        this.showNotification(`Station "${name}" added successfully!`);
    }

    editStation(stationId) {
        const station = this.stations.find(s => s.id === stationId);
        if (!station) return;

        // Populate edit form
        document.getElementById('editStationName').value = station.name;
        document.getElementById('editStationUrl').value = station.url;
        document.getElementById('editStationImage').value = station.image || '';

        // Store the station ID for updating
        document.getElementById('editStationForm').dataset.stationId = stationId;

        this.showEditStationModal();
    }

    updateStation() {
        const stationId = document.getElementById('editStationForm').dataset.stationId;
        const station = this.stations.find(s => s.id === stationId);
        if (!station) return;

        const name = document.getElementById('editStationName').value.trim();
        const url = document.getElementById('editStationUrl').value.trim();
        const image = document.getElementById('editStationImage').value.trim();

        if (!name || !url) {
            alert('Please fill in station name and URL');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch (e) {
            alert('Please enter a valid stream URL');
            return;
        }

        // Update station
        station.name = name;
        station.url = url;
        station.image = image || null;

        this.saveStations();
        this.renderStations();
        this.hideEditStationModal();

        // Update player if this station is currently playing
        if (this.currentStation && this.currentStation.id === stationId) {
            this.currentStation = station;
            this.updatePlayerInfo();
        }

        this.showNotification(`Station "${name}" updated successfully!`);
    }

    removeStation(stationId) {
        const station = this.stations.find(s => s.id === stationId);
        if (!station) return;

        if (confirm(`Are you sure you want to remove "${station.name}"?`)) {
            // Stop playing if this station is currently playing
            if (this.currentStation && this.currentStation.id === stationId) {
                this.stopPlayback();
            }

            this.stations = this.stations.filter(s => s.id !== stationId);
            this.saveStations();
            this.renderStations();

            this.showNotification(`Station "${station.name}" removed successfully!`);
        }
    }

    // Audio Playback
    async playStation(station) {
        if (this.currentStation && this.currentStation.id === station.id && this.isPlaying) {
            // Same station is already playing, pause it
            this.togglePlayPause();
            return;
        }

        // If a station is currently playing and it's different, attempt crossfade
        if (this.currentStation && this.currentStation.id !== station.id && this.isPlaying && this.crossfadeEnabled) {
            const crossfadeSuccess = await this.performCrossfade(station);
            if (crossfadeSuccess) {
                // Crossfade completed successfully
                return;
            }
            // If crossfade failed, fall through to normal playback
            console.log('Crossfade failed, falling back to normal playback');
        }

        // Normal playback (no crossfade or crossfade failed)
        this.currentStation = station;
        this.audio.src = station.url;
        this.updatePlayerInfo();
        
        // Clear any lingering crossfading feedback
        this.clearCrossfadingStations();
        
        // Enable player controls
        document.getElementById('playPauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;

        try {
            await this.audio.play();
            this.markStationAsPlaying();
        } catch (error) {
            console.error('Error playing audio:', error);
            this.updatePlayerStatus('Error playing stream');
            this.showNotification('Error playing stream. Please check the URL.');
        }
    }

    togglePlayPause() {
        if (!this.currentStation) return;

        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(error => {
                console.error('Error playing audio:', error);
                this.updatePlayerStatus('Error playing stream');
                this.showNotification('Error playing stream. Please check the URL.');
            });
        }
    }

    stopPlayback() {
        this.isStopping = true; // Set flag to prevent error message
        this.isCrossfading = false; // Stop any ongoing crossfade
        
        // Clear visual feedback
        this.clearCrossfadingStations();
        
        // Stop both audio elements
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = '';
        
        if (this.crossfadeAudio) {
            this.crossfadeAudio.pause();
            this.crossfadeAudio.currentTime = 0;
            this.crossfadeAudio.src = '';
            this.crossfadeAudio.volume = 0;
        }
        
        this.isPlaying = false;
        this.currentStation = null;

        // Reset player UI
        document.getElementById('currentStationName').textContent = 'No station playing';
        document.getElementById('playerStatus').textContent = 'Stopped';
        document.getElementById('currentStationImage').src = 'img/station_placeholder.svg';
        document.getElementById('playPauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;

        this.updatePlayPauseButton();
        this.clearPlayingStations();
        
        // Reset the stopping flag after a short delay
        setTimeout(() => {
            this.isStopping = false;
            this.updatePlayerStatus('Ready to play');
        }, 100);
    }

    setVolume(value) {
        const volume = value / 100;
        this.audio.volume = volume;
        
        // Also update the crossfade audio volume if it's playing (during crossfade)
        if (this.isCrossfading && this.crossfadeAudio) {
            // During crossfade, the crossfade audio will have its volume managed by the animation
            // But we store the target volume for when crossfade completes
            this.targetVolume = volume;
        }
    }

    // UI Updates
    renderStations() {
        const container = document.getElementById('stationsGrid');
        const noStationsMessage = document.getElementById('noStations');

        if (this.stations.length === 0) {
            container.style.display = 'none';
            noStationsMessage.style.display = 'block';
            return;
        }

        // Change display from grid to flex for draggable layout
        container.style.display = 'flex';
        container.style.flexWrap = 'wrap';
        container.style.alignItems = 'flex-start';
        noStationsMessage.style.display = 'none';

        container.innerHTML = this.stations.map(station => `
            <div class="station-card" data-station-id="${station.id}" draggable="true">
                <div class="drag-handle" title="Drag to reorder">
                    <i class="fas fa-grip-lines"></i>
                </div>
                <div class="station-image-container">
                    ${station.image ? 
                        `<img src="${station.image}" alt="${station.name}" class="station-image" onerror="app.handleImageError(this)">
                         <div class="station-image-placeholder" style="display: none;">
                             <img src="img/station_placeholder.svg" alt="Station placeholder" class="placeholder-image">
                         </div>` :
                        `<div class="station-image-placeholder">
                             <img src="img/station_placeholder.svg" alt="Station placeholder" class="placeholder-image">
                         </div>`
                    }
                </div>
                <div class="station-info">
                    <div class="station-header">
                        <h3>${this.escapeHtml(station.name)}</h3>
                        <div class="station-actions">
                            <button class="station-menu-btn" onclick="event.stopPropagation(); app.toggleStationMenu('${station.id}')">
                                <i class="fas fa-ellipsis-vertical"></i>
                            </button>
                            <div class="station-menu" id="menu-${station.id}">
                                <button class="station-menu-item" onclick="event.stopPropagation(); app.editStation('${station.id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="station-menu-item" onclick="event.stopPropagation(); app.removeStation('${station.id}')">
                                    <i class="fas fa-trash"></i> Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click listeners to station cards
        container.querySelectorAll('.station-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.station-actions') && !e.target.closest('.drag-handle')) {
                    const stationId = card.dataset.stationId;
                    const station = this.stations.find(s => s.id === stationId);
                    if (station) {
                        this.playStation(station);
                    }
                }
            });
            
            // Add drag-and-drop event listeners
            this.setupDragHandlers(card);
        });
    }

    setupDragHandlers(card) {
        card.addEventListener('dragstart', (e) => {
            // Set the data being dragged and add a dragging class
            e.dataTransfer.setData('text/plain', card.dataset.stationId);
            card.classList.add('dragging');
            
            // Set drag image to the card itself
            // Slight delay to allow the dragging class to take effect
            setTimeout(() => {
                e.dataTransfer.setDragImage(card, 20, 20);
            }, 0);
        });

        card.addEventListener('dragend', () => {
            // Remove the dragging class
            card.classList.remove('dragging');
            
            // Remove drag-over class from all cards
            document.querySelectorAll('.station-card').forEach(c => {
                c.classList.remove('drag-over');
            });
        });

        card.addEventListener('dragover', (e) => {
            // Allow dropping
            e.preventDefault();
        });

        card.addEventListener('dragenter', (e) => {
            e.preventDefault();
            // Style the potential drop target
            if (!card.classList.contains('dragging')) {
                card.classList.add('drag-over');
            }
        });

        card.addEventListener('dragleave', () => {
            // Remove drop target styling
            card.classList.remove('drag-over');
        });

        card.addEventListener('drop', (e) => {
            e.preventDefault();
            card.classList.remove('drag-over');
            
            // Get the dragged station ID
            const draggedStationId = e.dataTransfer.getData('text/plain');
            const targetStationId = card.dataset.stationId;
            
            if (draggedStationId === targetStationId) return;
            
            // Find indices of both stations
            const draggedIndex = this.stations.findIndex(s => s.id === draggedStationId);
            const targetIndex = this.stations.findIndex(s => s.id === targetStationId);
            
            if (draggedIndex === -1 || targetIndex === -1) return;
            
            // Reorder the stations array
            const [draggedStation] = this.stations.splice(draggedIndex, 1);
            this.stations.splice(targetIndex, 0, draggedStation);
            
            // Save the reordered stations to storage
            this.saveStations();
            
            // Re-render all the stations with the new order
            this.renderStations();
            
            // Show a notification of the reordering
            this.showNotification('Station order updated');
        });
    }

    updatePlayerInfo() {
        if (!this.currentStation) return;

        document.getElementById('currentStationName').textContent = this.currentStation.name;
        
        const imageElement = document.getElementById('currentStationImage');
        if (this.currentStation.image) {
            imageElement.src = this.currentStation.image;
            imageElement.style.display = 'block';
        } else {
            imageElement.src = 'img/station_placeholder.svg';
            imageElement.style.display = 'block';
        }
    }

    updatePlayerStatus(status) {
        document.getElementById('playerStatus').textContent = status;
    }

    updatePlayPauseButton() {
        const button = document.getElementById('playPauseBtn');
        const icon = button.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    markStationAsPlaying() {
        // Remove playing class from all stations
        this.clearPlayingStations();

        // Add playing class to current station
        if (this.currentStation) {
            const stationCard = document.querySelector(`[data-station-id="${this.currentStation.id}"]`);
            if (stationCard) {
                stationCard.classList.add('playing');
            }
        }
    }

    clearPlayingStations() {
        document.querySelectorAll('.station-card.playing').forEach(card => {
            card.classList.remove('playing');
        });
    }

    markStationAsCrossfading(station) {
        // Remove crossfading class from all stations first
        this.clearCrossfadingStations();
        
        // Add crossfading class to the target station
        if (station) {
            const stationCard = document.querySelector(`[data-station-id="${station.id}"]`);
            if (stationCard) {
                stationCard.classList.add('crossfading');
            }
        }
    }

    clearCrossfadingStations() {
        document.querySelectorAll('.station-card.crossfading').forEach(card => {
            card.classList.remove('crossfading');
        });
    }

    updatePlayerStatusWithCrossfade(newStation) {
        if (newStation) {
            this.updatePlayerStatus(`Crossfading to ${newStation.name}...`);
        }
    }

    // Modal Management
    showAddStationModal() {
        document.getElementById('addStationModal').classList.add('show');
        document.getElementById('stationName').focus();
    }

    hideAddStationModal() {
        document.getElementById('addStationModal').classList.remove('show');
        this.clearAddStationForm();
    }

    showEditStationModal() {
        document.getElementById('editStationModal').classList.add('show');
        document.getElementById('editStationName').focus();
    }

    hideEditStationModal() {
        document.getElementById('editStationModal').classList.remove('show');
    }

    clearAddStationForm() {
        document.getElementById('addStationForm').reset();
    }

    showSettingsModal() {
        console.log('Showing settings modal');
        try {
            this.populateSettingsModal();
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                settingsModal.classList.add('show');
                console.log('Settings modal displayed');
            } else {
                console.error('Settings modal element not found');
            }
        } catch (e) {
            console.error('Error showing settings modal:', e);
        }
    }

    hideSettingsModal() {
        console.log('Hiding settings modal');
        try {
            const settingsModal = document.getElementById('settingsModal');
            if (settingsModal) {
                settingsModal.classList.remove('show');
            } else {
                console.error('Settings modal element not found');
            }
        } catch (e) {
            console.error('Error hiding settings modal:', e);
        }
    }

    // Settings Management
    loadSettings() {
        const settings = localStorage.getItem('rrradio-settings');
        if (settings) {
            try {
                const parsedSettings = JSON.parse(settings);
                this.crossfadeEnabled = parsedSettings.crossfadeEnabled !== undefined ? parsedSettings.crossfadeEnabled : true;
                this.crossfadeDuration = parsedSettings.crossfadeDuration || 2000;
                
                // Apply theme preference if available
                if (parsedSettings.themePreference) {
                    this.setThemePreference(parsedSettings.themePreference);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                this.setDefaultSettings();
            }
        } else {
            this.setDefaultSettings();
        }
    }

    setDefaultSettings() {
        this.crossfadeEnabled = true;
        this.crossfadeDuration = 2000;
    }

    saveSettings() {
        const settings = {
            crossfadeEnabled: this.crossfadeEnabled,
            crossfadeDuration: this.crossfadeDuration,
            themePreference: document.getElementById('themePreference').value
        };

        localStorage.setItem('rrradio-settings', JSON.stringify(settings));
        this.hideSettingsModal();
        this.showNotification('Settings saved successfully!');
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            this.setDefaultSettings();
            this.populateSettingsModal();
            
            // Reset theme to auto
            this.setThemePreference('auto');
            
            this.showNotification('Settings reset to defaults');
        }
    }

    populateSettingsModal() {
        document.getElementById('crossfadeEnabled').checked = this.crossfadeEnabled;
        document.getElementById('crossfadeDuration').value = this.crossfadeDuration;
        document.getElementById('crossfadeDurationValue').textContent = (this.crossfadeDuration / 1000).toFixed(1) + 's';
        
        // Set theme preference
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'auto';
        document.getElementById('themePreference').value = currentTheme;
        
        // Update version information
        this.updateVersionInfo();
    }
    
    updateVersionInfo() {
        // Update version display elements
        const appVersionEl = document.getElementById('appVersion');
        const buildNumberEl = document.getElementById('buildNumber');
        const buildDateEl = document.getElementById('buildDate');

        if (appVersionEl) {
            appVersionEl.textContent = this.version.number + (this.version.isBeta ? ' (beta)' : '');
        }
        if (buildNumberEl) buildNumberEl.textContent = this.version.build;
        if (buildDateEl) buildDateEl.textContent = this.version.date;
        
        // Add version info to console for debugging
        const betaFlag = this.version.isBeta ? ' beta' : '';
        console.log(`Rrradio v${this.version.number}${betaFlag} (${this.version.codename}) - Build ${this.version.build}`);
    }
    
    generateBuildNumber() {
        // Generate a build number based on the current date and time
        // In production, this would typically be set during the build process
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}.${month}.${day}.${hours}${minutes}`;
    }
    
    formatBuildDate() {
        // Format the current date for display
        const now = new Date();
        return now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    detectBetaEnvironment() {
        const params = new URLSearchParams(window.location.search);
        const hasBetaParam = params.has('beta');
        const hostHasBeta = window.location.hostname.toLowerCase().includes('beta');
        
        // Get beta status from localStorage if set by the server
        const storedBetaStatus = localStorage.getItem('rrradio-is-beta') === 'true';
        
        // Check if we're in a development environment
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('.local');
                     
        // On first load in dev environment, set beta flag in localStorage
        if (isDev && localStorage.getItem('rrradio-is-beta') === null) {
            // This could be enhanced to actually check the Git branch via a server endpoint
            localStorage.setItem('rrradio-is-beta', 'true');
        }
        
        const isBeta = hasBetaParam || hostHasBeta || storedBetaStatus;
        this.version.isBeta = isBeta;

        if (isBeta) {
            // Show beta indicator
            const indicator = document.getElementById('betaIndicator');
            if (indicator) {
                indicator.style.display = 'inline-block';
            }
            
            // Switch to beta icons
            this.updateIconsForBeta();
            
            // Show beta info notification if this is their first visit to beta
            if (!localStorage.getItem('rrradio-beta-info-shown')) {
                this.showBetaInfo();
                localStorage.setItem('rrradio-beta-info-shown', 'true');
            }
        }
    }
    
    updateIconsForBeta() {
        console.log('Switching to beta icons');
        
        // Update favicon
        const faviconLink = document.querySelector('link[rel="icon"][type="image/x-icon"]');
        if (faviconLink) {
            faviconLink.href = 'img/favicon-beta.ico';
        }
        
        // Update all PNG icons (16px, 32px, 192px, 512px)
        const pngIcons = document.querySelectorAll('link[rel="icon"][type="image/png"]');
        pngIcons.forEach(icon => {
            const size = icon.getAttribute('sizes');
            if (size) {
                const newIconPath = icon.href.replace(/icon-(\d+)\.png/, 'icon-$1-beta.png');
                icon.href = newIconPath;
            }
        });
        
        // Update Apple touch icons
        const appleIcons = document.querySelectorAll('link[rel="apple-touch-icon"]');
        appleIcons.forEach(icon => {
            if (icon.href.includes('icon-apple-touch-icon')) {
                icon.href = 'img/icon-apple-touch-icon-beta.png';
            } else if (icon.href.includes('256x256')) {
                icon.href = 'img/256x256-beta.png';
            } else {
                const newIconPath = icon.href.replace(/icon-(\d+)\.png/, 'icon-$1-beta.png');
                icon.href = newIconPath;
            }
        });
        
        // Update Open Graph and Twitter image references
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage) {
            ogImage.content = 'img/icon-512-beta.png';
        }
        
        const twitterImage = document.querySelector('meta[name="twitter:image"]');
        if (twitterImage) {
            twitterImage.content = 'img/icon-512-beta.png';
        }
    }
    
    showBetaInfo() {
        // Create a notification for beta info
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        notification.innerHTML = `
            <strong><i class="fas fa-flask"></i> Welcome to Rrradio Beta!</strong><br>
            <small>You're using a beta version with experimental features. 
            Notice the beta icons and indicator showing you're on the cutting edge.
            Please report any issues you encounter.</small>
            <div style="margin-top: 10px; text-align: right;">
                <button id="closeBetaNotification" style="
                    background: rgba(255,255,255,0.2); 
                    border: none; 
                    color: white; 
                    padding: 5px 10px; 
                    border-radius: 4px; 
                    cursor: pointer;
                ">OK, Got it</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add event listener to close button
        document.getElementById('closeBetaNotification').addEventListener('click', () => {
            document.body.removeChild(notification);
        });
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 10000);
    }
    
    // Restore playback state after update
    restorePlaybackStateAfterUpdate() {
        // Check if we were playing a station before the update
        const wasPlaying = sessionStorage.getItem('rrradio-playing-before-update');
        if (wasPlaying === 'true') {
            const lastStationId = sessionStorage.getItem('rrradio-last-station-id');
            if (lastStationId) {
                console.log('Restoring playback after update for station:', lastStationId);
                
                // Find the station in our list
                const stationToPlay = this.stations.find(station => station.id === lastStationId);
                if (stationToPlay) {
                    // Slight delay to ensure DOM is ready
                    setTimeout(() => {
                        this.playStation(stationToPlay);
                        
                        // Show a brief notification that playback has been restored
                        this.showNotification('Playback restored after update');
                    }, 1000);
                }
            }
            
            // Clear the session storage items
            sessionStorage.removeItem('rrradio-playing-before-update');
            sessionStorage.removeItem('rrradio-last-station-id');
        }
    }

    setThemePreference(preference) {
        // Update the theme manager if it exists
        if (window.themeManager) {
            if (preference === 'auto') {
                window.themeManager.setAutoTheme();
            } else {
                window.themeManager.setTheme(preference);
            }
        } else {
            // Fallback: set theme directly
            if (preference === 'auto') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', preference);
            }
        }
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showNotification(message, duration = 3000) {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 3000;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);

        // Remove notification after specified duration
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
                if (document.head.contains(style)) {
                    document.head.removeChild(style);
                }
            }, 300);
        }, duration);
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RadioApp();
});

// Close menus when clicking outside
document.addEventListener('click', (event) => {
    if (!event.target.closest('.station-actions')) {
        document.querySelectorAll('.station-menu.show').forEach(menu => {
            menu.classList.remove('show');
            // Remove menu-active class from the station card
            const stationCard = menu.closest('.station-card');
            if (stationCard) {
                stationCard.classList.remove('menu-active');
            }
        });
    }
});
