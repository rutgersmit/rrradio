var radio = new Audio();
radio.volume = 0.5;
var isMuted = false;
var isPlaying = false;

function toggleRadio() {
  if (isPlaying) {
    radio.pause();
    isPlaying = false;
    document.getElementById("start-stop-button").innerText = "▶️";
  } else {
    var cSrc = radio.src;
    var d = "dt=" + Date.now();
    radio.src = cSrc.includes("?") ? cSrc.includes("dt=") ? cSrc.replace(/dt=[^&]*/, d) : cSrc + "&" + d : cSrc + "?" + d;
    radio.play();
    isPlaying = true;
    document.getElementById("start-stop-button").innerText = "⏹️";
  }
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    document.getElementById("mute-button").innerText = "🔊";
  } else {
    document.getElementById("mute-button").innerText = "🔇";
  }
  radio.muted = isMuted;
}

function toggleStartStop() {
  toggleRadio();
}

function setVolume() {
  radio.volume = document.getElementById("volume-slider").value / 100;
}

function playStation(stationUrl, stationImage) {
  radio.src = stationUrl;
  radio.play();
  isPlaying = true;
  document.getElementById("start-stop-button").innerText = "⏹️";
  document.getElementById("start-stop-button").style.visibility = "visible";
  document.getElementById("radio-logo").src = stationImage;

  // Display song information when available
  radio.addEventListener("loadedmetadata", function () {
    if (radio.title !== undefined) {
      document.getElementById("song-info").innerText =
        "Now Playing: " + radio.title;
    }
  });
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("js/sw.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  // Show a button or other UI element to prompt the user to install.
  showInstallButton();
  // Check if the app is already installed
  if (isAppInstalled()) {
    // If installed, hide the install button
    hideInstallButton();
  } else {
    // If not installed, show the install button
    showInstallButton();
  }
});



let stations = [];
const stationListContainer = document.getElementById("station-list");

// Function to save a station to local storage
function saveStation(name, imageUrl, streamUrl) {
    const station = { name, imageUrl, streamUrl };
    stations.push(station);
    localStorage.setItem('stations', JSON.stringify(stations));
}

// Function to edit a station in the list
function editStation(index, name, imageUrl, streamUrl) {
    if (index >= 0 && index < stations.length) {
        stations[index] = { name, imageUrl, streamUrl };
        localStorage.setItem('stations', JSON.stringify(stations));
    }
}

// Function to delete a station from the list
function deleteStation(index) {
    if (index >= 0 && index < stations.length) {
        stations.splice(index, 1);
        localStorage.setItem('stations', JSON.stringify(stations));
    }
}





function isAppInstalled() {
  // Check if the app is running in standalone mode (iOS)
  if (window.navigator.standalone) {
    return true;
  }

  // Check if the app is installed on other platforms
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  return false;
}

function showInstallButton() {
  const installButton = document.getElementById("install-button");

  if (installButton) {
    installButton.style.display = "block";

    installButton.addEventListener("click", () => {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }

        // Reset the deferred prompt variable
        deferredPrompt = null;
      });
    });
  }
}
