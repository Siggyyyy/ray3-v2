// Collapsible Panels
const missionMap = new L.map("mission-map-container", mapOptions);
const missionMapTile = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
missionMap.addLayer(missionMapTile);

L.marker(londonCoords, { icon: brandLogoIcon })
  .addTo(missionMap)
  .bindPopup('Mission Map!')
  .openPopup();

function togglePanel(panelId) {
    const panel = document.querySelector(`.${panelId}`);
    const toggleButton = panel.querySelector('.toggle-btn');

    panel.classList.toggle('collapsed');
    toggleButton.classList.toggle('active');

    const map = document.querySelector('.map');
    if (panelId === 'item-1') {
        map.classList.toggle('expanded-left');
    } else if (panelId === 'item-3') {
        map.classList.toggle('expanded-right');
    }

    resizeMap();
}

//function to handle map resizing
function resizeMap() {
    setTimeout(() => {
        map.invalidateSize(); // Ensure the map is resized properly
        map.fitBounds(map.getBounds()); // Optional, fits the map to its bounds after resize
    }, 300);
}

// Trying new UI stuffs
let currentSelection = null;
var mapContainer = document.getElementById("map-container");
var missionMapContainer = document.getElementById("mission-map-container");
var framesContainer = document.getElementById("frames-container");

function selectTab(tabNumber) {
    // Remove the selected class from the previous element
    if (currentSelection !== null) {
        currentSelection.classList.remove('selected');
        currentSelection.style.pointerEvents = 'auto';
    }

    // Add the selected class to the clicked element
    const selectedTab = document.querySelectorAll('.clickable')[tabNumber - 1];
    selectedTab.classList.add('selected');
    selectedTab.style.pointerEvents = 'none';

    // Update the current selection
    currentSelection = selectedTab;
    const cardContainers = document.querySelectorAll('.card-container'); 
    const elements = document.querySelectorAll('.more-stuff-box, .missions-stuff-box'); 


    // Add your JavaScript functions here to handle tab changes
    if (tabNumber === 1) {
        togglePanel('item-3');
        togglePanel('item-1');

        missionMapContainer.style.display = "none";
        framesContainer.style.display = "none";

        mapContainer.style.display = "block";
        map.setView([51.505, -0.09], 6); // Adjust this as needed

        cardContainers.forEach(crd => crd.classList.remove('shorten-container'));
        elements.forEach(el => el.classList.remove('shorten-for-frames'));

        console.log('Product View selected');
        // Call your Product View function here
    } else if (tabNumber === 2) {
        togglePanel('item-1');
        togglePanel('item-3');

        mapContainer.style.display = "none";
        missionMapContainer.style.display = "block";
        missionMap.setView([51.505, -0.09], 6); // Adjust this as needed
        

        console.log('Mission Data selected');

        // Ensure the map is fully rendered and resized
        setTimeout(() => {
            missionMap.invalidateSize(); // Trigger the resize
            missionMap.setView([51.505, -0.09], 6); // Reset the map's view if necessary
        }, 300); // Delay to allow for DOM updates before resizing the map
    }
}

currentSelection = document.querySelectorAll('.clickable')[0];
currentSelection.classList.add('selected');
togglePanel('item-3');
currentSelection.style.pointerEvents = 'none';
