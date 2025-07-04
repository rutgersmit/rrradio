# 🎵 Rrradio - Modern Web Radio Player

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

A modern, responsive web radio player that lets you stream your favorite radio stations directly in your browser. Built with vanilla JavaScript and containerized for easy deployment anywhere.

![Rrradio Screenshot](screenshot.png)

## ✨ Features

- 🎵 **Stream Radio Stations**: Play your favorite radio streams directly in the browser
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 💾 **Local Storage**: All your radio stations are stored locally in your browser
- ➕ **Station Management**: Easily add, edit, and remove radio stations
- 📻 **Default Presets**: Comes with sample stations to get you started
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 🔊 **Full Audio Controls**: Play, pause, stop, and volume control
- 🐳 **Docker Ready**: Easy deployment with Docker containerization
- ☁️ **Container Deployment**: Ready for any container host
- 📲 **PWA Support**: Install as a native app on mobile devices
- 🔄 **Automatic Updates**: Smart cache invalidation ensures users always get the latest version

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/rutgersmit/rrradio.git
cd rrradio

# Run with Docker Compose
docker compose up -d

# Open your browser to http://localhost:8080
```

### Option 2: Direct File Serving

```bash
# Clone the repository
git clone https://github.com/rutgersmit/rrradio.git
cd rrradio

# Serve files using any static server
python -m http.server 8080
# or
npx serve -s src -l 8080

# Open your browser to http://localhost:8080
```

## 🏗️ Architecture

**Cloud-Native Design**: Originally built for Azure Static Web Apps, now containerized for deployment anywhere.

### Core Components

- **Frontend**: Pure HTML5, CSS3, and JavaScript (no frameworks required)
- **Container**: Nginx-based Docker container for production deployment
- **Storage**: Browser localStorage for user data persistence
- **Audio Engine**: HTML5 Audio API for seamless streaming

### CI/CD
A sample GitHub Actions workflow deploys the app to Azure Static Web Apps.

## 📱 How to Use

### Getting Started

When you first open Rrradio, you'll see 6 sample radio stations to get you started:

- **Jazz FM** - Smooth jazz for relaxing
- **Rock Central** - Classic and modern rock hits  
- **Classical Radio** - Beautiful classical compositions
- **Electronic Beats** - Electronic and dance music
- **News Radio 24/7** - Stay informed with news
- **Chill Lounge** - Ambient and chill-out music

*Note: Sample stations use placeholder URLs. Add your own real radio stream URLs!*

### Adding Your Own Stations

1. Click the "**Add Station**" button
2. Fill in the station details:
   - **Station Name**: Give it a memorable name
   - **Stream URL**: The direct URL to the radio stream (usually ends in .mp3, .m3u, or .pls)
   - **Image URL**: Optional cover image for the station
3. Click "**Add Station**" to save

### Playing Music

- **Start Playing**: Click on any station card
- **Control Playback**: Use the audio player controls at the bottom
- **Switch Stations**: Click another station to switch immediately
- **Volume Control**: Adjust volume with the slider

### Managing Your Collection

- **Edit Station**: Click the "Edit" button on any station card
- **Remove Station**: Click "Remove" to delete a station permanently
- **Auto-Save**: All changes are automatically saved to your browser

## 🛠️ Development

### Local Development Setup

```bash
# Clone the repository
git clone https://github.com/rutgersmit/rrradio.git
cd rrradio

# For quick development, use Docker Compose
docker compose up -d

# For manual development
cd src
python -m http.server 8080
```

### Development Scripts

Convenient scripts for common development tasks:

```bash
# Full rebuild and restart (after code changes)
./rebuild.sh

# Quick restart without rebuilding
./restart.sh

# View application logs
./logs.sh
```

### Project Structure

```text
rrradio/
├── 📁 src/                     # Application source files
│   ├── 🏠 index.html          # Main HTML file
│   ├── 🎨 styles.css          # Application styles  
│   ├── ⚡ script.js           # Application logic
│   ├── 📱 manifest.json       # PWA manifest
│   ├── 🔧 sw.js              # Service worker
│   └── 📁 img/               # Images and icons
├── 🐳 docker/                 # Docker configuration
│   ├── 📋 Dockerfile          # Container definition
│   ├── 🔧 docker-compose.yml  # Development setup
│   └── ⚙️ nginx.conf          # Web server config
├── 🔧 scripts/               # Development helpers
├── 📝 logs.sh                # View container logs
├── ♻️ rebuild.sh             # Rebuild container
├── 🔄 restart.sh             # Restart container
└── 🖼️ screenshot.png         # Application screenshot
```

## 🔧 Technical Details

### Core Technologies

- **Frontend**: Pure HTML5, CSS3, and JavaScript (no frameworks)
- **Audio Engine**: HTML5 Audio API for streaming
- **Storage**: Browser localStorage for data persistence
- **Server**: Nginx (in Docker container)
- **Containerization**: Docker with multi-stage builds
- **Cloud**: Any container host for scalable deployment

### Browser Compatibility

- ✅ **Chrome** 60+
- ✅ **Firefox** 55+  
- ✅ **Safari** 11+
- ✅ **Edge** 79+
- 📱 **Mobile browsers** supported

### Audio Features

- **Streaming Support**: MP3, AAC, and other HTML5-supported formats
- **Real-time Controls**: Play, pause, stop, volume adjustment
- **Error Handling**: Graceful handling of invalid streams
- **Status Updates**: Live playback status and metadata display

### Automatic Updates

The app implements a smart cache invalidation system to ensure users always get the latest version:

- **Service Worker Updates**: Automatically detects new versions on each visit
- **Cache Busting**: Each deployment gets a unique timestamp to prevent stale caches
- **User Notifications**: Shows a friendly notification when updates are available
- **Auto-refresh**: Automatically refreshes the app after 5 seconds if user doesn't respond
- **Network-first Strategy**: App files are fetched from network first, falling back to cache only when offline

The update mechanism works by:

1. Generating a unique cache key during deployment
2. Service worker checks for updates every minute
3. When an update is detected, users see a notification
4. Old caches are automatically cleaned up

## 📻 Finding Radio Streams

Here are some reliable sources for radio stream URLs:

### Public Radio Directories

- **Radio-Browser.info**: Community-driven radio station database
- **Internet-Radio.com**: Large collection of streaming stations  
- **TuneIn**: Popular radio aggregator (check for direct stream URLs)

### Example Stream Formats

```text
Direct MP3: http://example.com/stream.mp3
M3U Playlist: http://example.com/playlist.m3u
PLS Playlist: http://example.com/stream.pls
```

### Testing Stream URLs

Always test stream URLs in your browser before adding them:

1. Copy the URL
2. Paste it into a new browser tab
3. If it starts downloading or playing, it should work in Rrradio

## 🐛 Troubleshooting

### Common Issues

#### 🔇 Audio Not Playing

- Verify the stream URL is accessible and valid
- Check if the stream format is supported by your browser
- Look for CORS issues in the browser developer console
- Try the stream URL directly in your browser

#### 💾 Stations Not Saving

- Ensure localStorage is enabled in your browser
- Disable private/incognito browsing mode
- Clear browser cache and cookies for the site
- Check available storage space

#### 🐳 Docker Issues

- Verify Docker is running: `docker --version`
- Check if port 8080 is available: `lsof -i :8080`
- Review container logs: `docker compose logs -f`
- Try rebuilding: `docker compose up --build`

### Getting Help

If you encounter issues:

1. **Check the browser console** for error messages
2. **Verify stream URLs** work in other players
3. **Test with different browsers** to isolate issues
4. **Open an issue** on GitHub with detailed information

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Follow the code style** (ESLint configuration coming soon)
5. **Submit a pull request** with a clear description

### Areas for Contribution

- 🎨 **UI/UX improvements** and themes
- 🔧 **New features** and functionality  
- 🐛 **Bug fixes** and performance optimizations
- 📱 **Mobile experience** enhancements
- 🌍 **Internationalization** support
- 📚 **Documentation** improvements

### Code Guidelines

- Use vanilla JavaScript (no frameworks)
- Follow existing code patterns and naming conventions
- Add comments for complex logic
- Test your changes across different browsers
- Update documentation as needed

## 🚀 Deployment Options

### Hosting Platforms

**Container Platforms** (Recommended)
- Run the container on your preferred cloud platform
- CI/CD with GitHub Actions

#### Docker-Compatible Platforms

- Google Cloud Run
- AWS Fargate
- DigitalOcean App Platform
- Railway, Render, Fly.io

**Static Hosting** (Basic)

- GitHub Pages
- Netlify
- Vercel
- Azure Static Web Apps

## 🛡️ Security & Privacy

### Data Handling

- **No server-side data storage**: All user data stays in your browser
- **No tracking**: We don't collect or transmit any personal information
- **No cookies**: Pure localStorage implementation
- **HTTPS recommended**: Use HTTPS for production deployments

### Stream Privacy

- Radio streams are accessed directly by your browser
- No proxy or intermediary servers involved
- Streams subject to their own privacy policies

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

This project is open source and free to use, modify, and distribute.

## 🙏 Acknowledgments

- **Icons**: From various open source icon libraries
- **Inspiration**: Classic radio players and modern web design
- **Community**: Thanks to all contributors and users!

---

**⭐ Star this project** if you find it useful!

**🐛 Found a bug?** Please [open an issue](https://github.com/rutgersmit/rrradio/issues).

**💡 Have an idea?** We'd love to hear about it in [discussions](https://github.com/rutgersmit/rrradio/discussions).
