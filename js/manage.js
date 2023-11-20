document.addEventListener("DOMContentLoaded", function () {
  // Initialize station list from local storage
  var stationList = loadFromLocalStorage() || [];

  // Add/Edit form elements
  var stationForm = document.getElementById("station-form");
  var stationNameInput = document.getElementById("station-name");
  var stationImageUrlInput = document.getElementById("station-image-url");
  var stationStreamUrlInput = document.getElementById("station-stream-url");

  // Station list element
  var stationListContainer = document.getElementById("station-list");

  // Display initial station list
  displayStationList();

  // Save button click event
  document
    .getElementById("station-form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      saveStation();
    });

  window.saveStation = function () {
    var stationName = stationNameInput.value;
    var stationImageUrl = stationImageUrlInput.value;
    var stationStreamUrl = stationStreamUrlInput.value;

    if (stationName && stationImageUrl && stationStreamUrl) {
      var station = {
        name: stationName,
        imageUrl: stationImageUrl,
        streamUrl: stationStreamUrl,
      };

      if (editMode !== null) {
        // Editing existing station
        stationList[editMode] = station;
        editMode = null;
      } else {
        // Adding new station
        stationList.push(station);
      }

      clearStationForm();
      displayStationList();
      saveToLocalStorage();

      // Reset form for next input
      stationForm.reset();
    } else {
      alert("Please fill in all fields.");
    }
  };

  window.editStation = function (index) {
    editMode = index;
    var station = stationList[index];

    stationNameInput.value = station.name;
    stationImageUrlInput.value = station.imageUrl;
    stationStreamUrlInput.value = station.streamUrl;
  };

  window.confirmDelete = function (index) {
    var confirmDelete = confirm(
      "Are you sure you want to delete this station?"
    );

    if (confirmDelete) {
      deleteStation(index);
    }
  };

  var editMode = null;

  function clearStationForm() {
    stationNameInput.value = "";
    stationImageUrlInput.value = "";
    stationStreamUrlInput.value = "";
  }

  function displayStationList() {
    stationListContainer.innerHTML = "";

    if (stationList.length > 0) {
      stationList.forEach(function (station, index) {
        var listItem = document.createElement("li");
        listItem.innerHTML = `
                    <img src="${station.imageUrl}" alt="${station.name}">
                    <div>
                        <button class="edit-button" onclick="editStation(${index})">Edit</button>
                        <button class="delete-button" onclick="confirmDelete(${index})">Delete</button>
                    </div>
                `;
        stationListContainer.appendChild(listItem);
      });
    } else {
      var noStationsMessage = document.createElement("p");
      noStationsMessage.textContent = "No stations available.";
      stationListContainer.appendChild(noStationsMessage);
    }
  }

  function deleteStation(index) {
    stationList.splice(index, 1);
    displayStationList();
    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    localStorage.setItem("stationList", JSON.stringify(stationList));
  }

  function loadFromLocalStorage() {
    var storedStations = localStorage.getItem("stationList");
    return storedStations ? JSON.parse(storedStations) : null;
  }
});
