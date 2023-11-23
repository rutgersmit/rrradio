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

  var editMode = null;

  window.editStation = function (index) {
    editMode = index;
    var station = stationList[index];

    stationNameInput.value = station.name;
    stationImageUrlInput.value = station.imageUrl;
    stationStreamUrlInput.value = station.streamUrl;
  };

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

  window.deleteStation = function (index) {
    stationList.splice(index, 1);
    displayStationList();
    saveToLocalStorage();
  };

  window.confirmDelete = function (index) {
    var confirmDelete = confirm(
      "Are you sure you want to delete this station?"
    );

    if (confirmDelete) {
      deleteStation(index);
    }
  };

  function clearStationForm() {
    stationNameInput.value = "";
    stationImageUrlInput.value = "";
    stationStreamUrlInput.value = "";
  }

  // Function to create a tooltip element
  function createTooltip(stationName) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.textContent = stationName;
    return tooltip;
  }

  function displayStationList() {
    stationListContainer.innerHTML = "";

    if (stationList.length > 0) {
      // Loop through each station and create list items
      stationList.forEach((station, index) => {
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

        // Create edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-button"); // Using the 'edit-button' class
        editButton.addEventListener("click", () => editStation(index, station));

        // Create delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-button"); // Using the 'delete-button' class
        deleteButton.addEventListener("click", () => deleteStation(index));

        // Append elements to the list item
        listItem.appendChild(img);
        listItem.appendChild(span);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        // Append the list item to the container
        stationListContainer.appendChild(listItem);
      });
    } else {
      var noStationsMessage = document.createElement("p");
      noStationsMessage.textContent = "No stations available.";
      stationListContainer.appendChild(noStationsMessage);
    }
  }

  function saveToLocalStorage() {
    localStorage.setItem("stationList", JSON.stringify(stationList));
  }

  function loadFromLocalStorage() {
    var storedStations = localStorage.getItem("stationList");
    return storedStations ? JSON.parse(storedStations) : null;
  }
});
