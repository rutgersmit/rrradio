var radio = new Audio();
radio.volume = 0.5;
var isMuted = false;
var isPlaying = false;

function toggleRadio() {
  if (isPlaying) {
    radio.pause();
    isPlaying = false;
    document.getElementById("start-stop-button").innerText = "▶️";
    document.getElementById("volume-slider").style.visibility = "hidden";
  } else {
    var cSrc = radio.src;
    var d = "dt=" + Date.now();
    radio.src = cSrc.includes("?")
      ? cSrc.includes("dt=")
        ? cSrc.replace(/dt=[^&]*/, d)
        : cSrc + "&" + d
      : cSrc + "?" + d;
    radio.play();
    isPlaying = true;
    document.getElementById("start-stop-button").innerText = "⏹️";
    document.getElementById("volume-slider").style.visibility = "visible";

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
  document.getElementById("volume-slider").style.visibility = "visible";
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

// Event listener for the "error" event
radio.addEventListener("error", function (e) {
  //console.error('Audio playback error:', e);

  // Check for network error (MEDIA_ERR_NETWORK)
  if (e.target.error && e.target.error.code === MediaError.MEDIA_ERR_NETWORK) {
    // Network error occurred, attempt to resume playback
    radio.load(); // Reload the audio element
    radio.play(); // Attempt to resume playback
  }
});

let stations = [];
const stationListContainer = document.getElementById("station-list");

// Function to save a station to local storage
function saveStation(name, imageUrl, streamUrl) {
  const station = { name, imageUrl, streamUrl };
  stations.push(station);
  localStorage.setItem("stations", JSON.stringify(stations));
}

// Function to edit a station in the list
function editStation(index, name, imageUrl, streamUrl) {
  if (index >= 0 && index < stations.length) {
    stations[index] = { name, imageUrl, streamUrl };
    localStorage.setItem("stationList", JSON.stringify(stations));
  }
}

// Function to delete a station from the list
function deleteStation(index) {
  if (index >= 0 && index < stations.length) {
    stations.splice(index, 1);
    localStorage.setItem("stationList", JSON.stringify(stations));
  }
}

// Function to populate the station list for the player page
function populatePlayerStation() {
  // Clear existing content
  stationListContainer.innerHTML = "";

  // Retrieve stations from local storage
  let storedStations = JSON.parse(localStorage.getItem("stationList")) || [];

  // Check if local storage is empty
  if (storedStations.length === 0) {
    // Load predefined stations into storage
    const predefinedStations = [
      {
        name: "NPO Radio 1",
        imageUrl: "https://www.mp3streams.nl/logo/z/npo-radio-1",
        streamUrl:
          "https://www.mp3streams.nl/zender/npo-radio-1/stream/1-aac-64",
      },
      {
        name: "NPO Radio 2",
        imageUrl: "https://www.mp3streams.nl/logo/z/npo-radio-2",
        streamUrl:
          "https://www.mp3streams.nl/zender/npo-radio-2/stream/3-aac-64",
      },
      {
        name: "3FM",
        imageUrl: "https://www.mp3streams.nl/logo/z/3fm",
        streamUrl: "https://www.mp3streams.nl/zender/3fm/stream/7-aac-64",
      },
      {
        name: "KINK",
        imageUrl: "https://www.mp3streams.nl/logo/z/kink",
        streamUrl: "https://www.mp3streams.nl/zender/kink/stream/19-aac-128",
      },
      {
        name: "NPO Radio 2 Soul & Jazz",
        imageUrl:
          "https://broadcast-images.nporadio.nl/w_600/s3-nposoulenjazz/4ge46qazf0lr-nieuw-logo.jpg",
        streamUrl:
          "https://www.mp3streams.nl/zender/npo-radio-2-soul-jazz/stream/44-mp3-192",
      },
    ];

    // Set stored stations to predefined stations
    storedStations = predefinedStations;

    // Save predefined stations to local storage
    localStorage.setItem("stationList", JSON.stringify(predefinedStations));
  }

  // Display all stored stations
  storedStations.forEach(displayStation);
}

// Function to display a station in the list
function displayStation(station) {
  const listItem = document.createElement("li");
  listItem.classList.add("station-entry");

  // Create image element
  const img = document.createElement("img");
  img.src = station.imageUrl;
  img.alt = station.name;
  img.classList.add("station-image");

  // Create span for station name
  const span = document.createElement("span");
  span.textContent = station.name;
  span.classList.add("station-name"); // Added class for styling

  // Set up click event to play the station
  listItem.addEventListener("click", () =>
    playStation(station.streamUrl, station.imageUrl)
  );

  // Append elements to the list item
  listItem.appendChild(img);
  listItem.appendChild(span);

  // Append the list item to the container
  stationListContainer.appendChild(listItem);
}

// Call the function to populate the player station
populatePlayerStation();

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
