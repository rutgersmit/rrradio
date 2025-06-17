class RadioApp {
    constructor() {
        console.log('Initializing RadioApp...');
        this.stations = this.loadStations();
        console.log('Loaded stations:', this.stations);
        this.currentStation = null;
        this.audio = document.getElementById('audioElement');
        this.isPlaying = false;
        this.isStopping = false; // Flag to track intentional stops
        
        this.initializeEventListeners();
        this.renderStations();
        this.setupAudioEventListeners();
        
        // Add a method to clear localStorage for testing (accessible via browser console)
        window.clearRadioStations = () => {
            localStorage.removeItem('rrradio-stations');
            console.log('Cleared stored stations. Refresh the page to load default presets.');
        };
    }

    // Local Storage Management
    loadStations() {
        const stored = localStorage.getItem('rrradio-stations');
        console.log('Raw localStorage value:', stored);
        
        if (stored && stored !== 'null' && stored !== 'undefined') {
            try {
                const parsedStations = JSON.parse(stored);
                console.log('Loaded stations from localStorage:', parsedStations);
                
                // Check if parsed stations is a valid array with content
                if (Array.isArray(parsedStations) && parsedStations.length > 0) {
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
    }

    getDefaultStations() {
        return [
          {
            id: "preset-1",
            name: "NPO Radio 1",
            url: "https://www.mp3streams.nl/zender/npo-radio-1/stream/1-aac-64",
            image: "https://www.mp3streams.nl/logo/z/npo-radio-1",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-2",
            name: "NPO Radio 2",
            url: "https://www.mp3streams.nl/zender/npo-radio-2/stream/3-aac-64",
            image: "https://www.mp3streams.nl/logo/z/npo-radio-2",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-3",
            name: "NPO 3FM",
            url: "https://www.mp3streams.nl/zender/3fm/stream/7-aac-64",
            image: "https://www.mp3streams.nl/logo/z/3fm",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-4",
            name: "KINK",
            url: "https://www.mp3streams.nl/zender/kink/stream/19-aac-128",
            image: "https://www.mp3streams.nl/logo/z/kink",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-5",
            name: "NPO Radio 2 Soul & Jazz",
            url: "https://www.mp3streams.nl/zender/npo-radio-2-soul-jazz/stream/44-mp3-192",
            image: "https://www.mp3streams.nl/logo/z/npo-radio-2-soul-jazz",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-6",
            name: "Classic NL",
            url: "https://stream.classic.nl/classicnl-mindradio.mp3",
            image: "https://classic.nl/images/logo-classicnl-header.png",
            dateAdded: new Date().toISOString(),
          },
          {
            id: "preset-7",
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

            if (e.target === addModal) {
                this.hideAddStationModal();
            }
            if (e.target === editModal) {
                this.hideEditStationModal();
            }

            // Close station menus when clicking outside
            if (!e.target.closest('.station-actions')) {
                document.querySelectorAll('.station-menu').forEach(menu => {
                    menu.classList.remove('show');
                });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAddStationModal();
                this.hideEditStationModal();
            }
            if (e.key === ' ' && this.currentStation) {
                e.preventDefault();
                this.togglePlayPause();
            }
        });
    }

    setupAudioEventListeners() {
        this.audio.addEventListener('loadstart', () => {
            this.updatePlayerStatus('Loading...');
        });

        this.audio.addEventListener('loadeddata', () => {
            this.updatePlayerStatus('Ready to play');
        });

        this.audio.addEventListener('playing', () => {
            this.isPlaying = true;
            this.updatePlayerStatus('Playing');
            this.updatePlayPauseButton();
            this.markStationAsPlaying();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updatePlayerStatus('Paused');
            this.updatePlayPauseButton();
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayerStatus('Ended');
            this.updatePlayPauseButton();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            // Only show error message if it's not an intentional stop
            if (!this.isStopping) {
                this.updatePlayerStatus('Error loading stream');
                this.isPlaying = false;
                this.updatePlayPauseButton();
            }
        });

        this.audio.addEventListener('waiting', () => {
            this.updatePlayerStatus('Buffering...');
        });

        this.audio.addEventListener('canplay', () => {
            if (this.isPlaying) {
                this.updatePlayerStatus('Playing');
            } else {
                this.updatePlayerStatus('Ready to play');
            }
        });

        // Set initial volume
        this.audio.volume = 0.7;
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
    playStation(station) {
        if (this.currentStation && this.currentStation.id === station.id && this.isPlaying) {
            // Same station is already playing, pause it
            this.togglePlayPause();
            return;
        }

        this.currentStation = station;
        this.audio.src = station.url;
        this.updatePlayerInfo();
        
        // Enable player controls
        document.getElementById('playPauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;

        this.audio.play().catch(error => {
            console.error('Error playing audio:', error);
            this.updatePlayerStatus('Error playing stream');
            this.showNotification('Error playing stream. Please check the URL.');
        });
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
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = '';
        this.isPlaying = false;
        this.currentStation = null;

        // Reset player UI
        document.getElementById('currentStationName').textContent = 'No station playing';
        document.getElementById('playerStatus').textContent = 'Stopped';
        document.getElementById('currentStationImage').src = 'img/station_placeholder.png';
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
        this.audio.volume = value / 100;
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

        container.style.display = 'grid';
        noStationsMessage.style.display = 'none';

        container.innerHTML = this.stations.map(station => `
            <div class="station-card" data-station-id="${station.id}">
                <div class="station-image-container">
                    ${station.image ? 
                        `<img src="${station.image}" alt="${station.name}" class="station-image" onerror="app.handleImageError(this)">
                         <div class="station-image-placeholder" style="display: none;">
                             <img src="img/station_placeholder.png" alt="Station placeholder" class="placeholder-image">
                         </div>` :
                        `<div class="station-image-placeholder">
                             <img src="img/station_placeholder.png" alt="Station placeholder" class="placeholder-image">
                         </div>`
                    }
                </div>
                <div class="station-info">
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
        `).join('');

        // Add click listeners to station cards
        container.querySelectorAll('.station-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.station-actions')) {
                    const stationId = card.dataset.stationId;
                    const station = this.stations.find(s => s.id === stationId);
                    if (station) {
                        this.playStation(station);
                    }
                }
            });
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
            imageElement.src = 'img/station_placeholder.png';
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

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message) {
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

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
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

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
