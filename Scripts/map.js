const mapOptions = {
  center: [53.383331, -1.466667],
  zoom: 6,
};

const map = new L.map("map-container", mapOptions);
const tileLayer = new L.TileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
map.addLayer(tileLayer);

// Mission records storage
const missionRecords = {
    "2020-0": { missions: 2, coverage: 50 },  // January 2020
    "2020-1": { missions: 3, coverage: 70 },  // February 2020
    "2020-2": { missions: 1, coverage: 30 },  // March 2020
    "2021-0": { missions: 4, coverage: 100 }, // January 2021
    "2021-5": { missions: 5, coverage: 120 }, // June 2021
    "2022-3": { missions: 6, coverage: 150 }, // April 2022
    "2023-7": { missions: 8, coverage: 200 }, // August 2023
    "2024-11": { missions: 10, coverage: 300 }, // December 2024
    "2025-0": { missions: 5, coverage: 120 },  // January 2025
    "2025-1": { missions: 3, coverage: 90 },   // February 2025
    "2025-2": { missions: 7, coverage: 150 },  // March 2025
    "2025-3": { missions: 9, coverage: 180 },  // April 2025
    "2025-4": { missions: 6, coverage: 140 },  // May 2025
    "2025-5": { missions: 4, coverage: 100 },  // June 2025
    "2025-6": { missions: 8, coverage: 200 },  // July 2025
    "2025-7": { missions: 2, coverage: 50 },   // August 2025
    "2025-8": { missions: 3, coverage: 70 },   // September 2025
    "2025-9": { missions: 5, coverage: 120 },  // October 2025
    "2025-10": { missions: 7, coverage: 150 }, // November 2025
    "2025-11": { missions: 10, coverage: 300 } // December 2025
};
const footprintVisibility = {};

// Initialize Timeline Chart
function initializeTimeChart() {
    // Create container
    const timeChartContainer = document.createElement('div');
    timeChartContainer.id = 'time-chart-container';
    document.body.appendChild(timeChartContainer);

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'time-chart';
    canvas.style.width = '400rem';
    canvas.style.height = '100%';
    timeChartContainer.appendChild(canvas);

    // Create toggle button
    const timeChartToggle = document.createElement('button');
    timeChartToggle.className = 'time-chart-toggle';
    timeChartToggle.innerHTML = '▼ Timeline';
    document.body.appendChild(timeChartToggle);

    // Toggle functionality
    timeChartToggle.addEventListener('click', toggleTimeChart);

    // Initial chart update
    updateTimeChart();
}

// Toggle time chart visibility
function toggleTimeChart() {
    const timeChartContainer = document.getElementById('time-chart-container');
    const timeChartToggle = document.querySelector('.time-chart-toggle');
    
    timeChartContainer.classList.toggle('collapsed');
    timeChartToggle.classList.toggle('chart-visible');
    
    if (timeChartContainer.classList.contains('collapsed')) {
        timeChartToggle.innerHTML = '▲ Timeline';
        timeChartContainer.style.height = '0';
        timeChartContainer.style.padding = '0';
    } else {
        timeChartToggle.innerHTML = '▼ Timeline';
        timeChartContainer.style.height = '7rem';
        timeChartContainer.style.padding = '20px 15px';
        setTimeout(() => {
            if (window.missionChart) {
                window.missionChart.update();
            }
        }, 300);
    }
}

// Update time chart with mission data
function updateTimeChart() {
    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const labels = [];
    const data = [];
    
    years.forEach(year => {
        months.forEach(month => {
            const monthIndex = months.indexOf(month);
            const monthYear = `${year}-${monthIndex}`;
            labels.push(`${month} ${year}`);
            data.push(missionRecords[monthYear]?.missions || 0);
        });
    });

    const canvas = document.getElementById('time-chart');
    if (!canvas) return;

    if (window.missionChart) {
        window.missionChart.destroy();
    }

    window.missionChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Missions',
                data: data,
                backgroundColor: '#F6A066',
                borderWidth: 0,
                barThickness: 35,
                borderRadius: 5
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    display: false, 
                    beginAtZero: true,
                    min: 0
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#B5C9D2',
                        font: { 
                            size: 14,
                            weight: 'bold'
                        },
                        maxRotation: 0,
                        minRotation: 0
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (context) => context[0].label,
                        label: (context) => `Missions: ${context.raw}`
                    },
                    bodyFont: {
                        size: 14
                    }
                }
            }
        }
    });

    setTimeout(() => {
        const timeChartContainer = document.getElementById('time-chart-container');
        const recentPosition = labels.findIndex(l => l.includes('2024') || labels.length);
        if (timeChartContainer) {
            timeChartContainer.scrollLeft = (recentPosition/labels.length) * timeChartContainer.scrollWidth;
        }
    }, 100);
}

// Update coverage histogram with mission data
function updateCoverageHistogram() {
    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const labels = [];
    const data = [];

    // Populate labels and data
    years.forEach(year => {
        months.forEach((month, monthIndex) => {
            const monthYear = `${year}-${monthIndex}`;
            labels.push(`${month} ${year}`);
            data.push(missionRecords[monthYear]?.coverage || 0);
        });
    });

    console.log("Labels for Histogram:", labels);
    console.log("Data for Histogram:", data);

    const canvas = document.getElementById('coverage-histogram');
    if (!canvas) {
        console.error("Canvas element for coverage histogram not found.");
        return;
    }

    // Destroy existing chart if it exists
    if (window.coverageChart) {
        window.coverageChart.destroy();
    }

    // Create the histogram chart
    window.coverageChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Coverage (km²)',
                data: data,
                backgroundColor: '#42A5F5',
                borderColor: '#FFFFFF',
                borderWidth: 1,
                barThickness: 15,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { 
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Coverage (km²)',
                        color: '#B5C9D2',
                        font: { size: 14 }
                    }
                },
                x: {
                    ticks: {
                        color: '#B5C9D2',
                        font: { size: 12 }
                    },
                    grid: {
                        display: false
                    },
                    barPercentage: 0.8, // Adjust bar width (smaller value = thinner bars)
                    categoryPercentage: 3 // Adjust spacing between bars
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (context) => context[0].label,
                        label: (context) => `Coverage: ${context.raw.toFixed(2)} km²`
                    }
                }
            }
        }
    });

    console.log("Coverage histogram updated successfully.");
}

// Initialize the chart when the map loads
initializeTimeChart();
updateCoverageHistogram();

// === Drawing Setup ===
const drawnPolygons = [];
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const activePolygons = [];
const polygonLayerGroup = L.layerGroup().addTo(map);
let regionLayer;

// === Drawing Controls ===
const drawControl = new L.Control.Draw({
  draw: {
    polygon: {
      allowIntersection: false,
      showArea: true,
      shapeOptions: { color: "blue" },
    },
    polyline: {
      shapeOptions: { color: "red" },
    },
    rectangle: {
      shapeOptions: { color: "green" },
    },
    circle: {
      shapeOptions: { color: "purple" },
    },
    marker: true,
    circlemarker: true,
  },
  edit: {
    featureGroup: drawnItems,
    edit: true,
    remove: true,
  }
});
map.addControl(drawControl);

// === Color based on polygon count ===
function getColorByCount(count) {
  if (count >= 10) return "#ff0000";
  if (count >= 5) return "#ffa500";
  if (count >= 2) return "#ffff00";
  if (count >= 1) return "#90ee90";
  return "#d3d3d3";
}

// === Render regions with dynamic color ===
function renderRegionCoverage() {
  if (regionLayer) map.removeLayer(regionLayer);

  fetch('../data/regions.geojson')
    .then(res => res.json())
    .then(geojsonData => {
      regionLayer = L.geoJSON(geojsonData, {
        style: feature => {
          const region = feature.geometry;
          let count = 0;

          for (const poly of activePolygons) {
            const mission = poly.toGeoJSON().geometry;
            if (turf.intersect(region, mission)) count++;
          }

          return {
            color: "black",
            weight: 1,
            fillColor: getColorByCount(count),
            fillOpacity: 0.6,
          };
        },
      }).addTo(map);
    })
    .catch(err => console.error("Error rendering regions:", err));
}

// === Draw created ===
map.on("draw:created", (e) => {
  const layer = e.layer;
  drawnItems.addLayer(layer);

  if (e.layerType === "polygon") {
    const geojsonShape = layer.toGeoJSON();
    const shapeArea = turf.area(geojsonShape);
    let totalCoverage = 0;

    for (const poly of activePolygons) {
      try {
        const intersection = turf.intersect(geojsonShape, poly.toGeoJSON());
        if (intersection) {
          const intersectionArea = turf.area(intersection);
          totalCoverage += (intersectionArea / shapeArea) * 100;
        }
      } catch (err) {
        console.warn("Intersection error:", err);
      }
    }

    drawnPolygons.push({
      id: drawnPolygons.length + 1,
      area: (shapeArea / 1e6).toFixed(2),
      type: e.layerType,
      coverage: totalCoverage.toFixed(4),
    });

    updatePolygonTable();
  }
});

map.on("draw:deleted", () => {
  drawnPolygons.length = 0;
  updatePolygonTable();
});

const updatePolygonTable = () => {
  const tableBody = document.querySelector("#polygon-table tbody");
  tableBody.innerHTML = drawnPolygons.map(polygon =>
    `<tr>
      <td>${polygon.id}</td>
      <td>${polygon.type}</td>
      <td>${polygon.area} km²</td>
      <td>${polygon.coverage}%</td>
    </tr>`
  ).join("");
};

// === Marker clustering ===
const markersCluster = L.markerClusterGroup({
  disableClusteringAtZoom: 10,
  chunkedLoading: true,
  maxClusterRadius: 50,
  iconCreateFunction: cluster => new L.DivIcon({
    html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
    className: "custom-cluster-icon",
    iconSize: new L.Point(40, 40),
  }),
});
map.addLayer(markersCluster);

// Footprint Functions
function toggleFootprint(productId) {
  const marker = markersCluster.getLayers().find(l => l.options?.productId === productId);
  if (marker && marker.footprint) {
    const currentOpacity = marker.footprint.options.opacity;
    marker.footprint.setStyle({
      opacity: currentOpacity ? 0 : 1,
      fillOpacity: currentOpacity ? 0 : 0.2
    });
    footprintVisibility[productId] = !currentOpacity;
    
    if (marker.isPopupOpen()) {
      marker.setPopupContent(generatePopupContent(productId, !currentOpacity));
    }
  }
}

function zoomToFootprint(productId) {
  const marker = markersCluster.getLayers().find(l => l.options?.productId === productId);
  if (marker && marker.footprint) {
    map.fitBounds(marker.footprint.getBounds(), {
      padding: [50, 50],
      maxZoom: 12
    });
    highlightFootprint(productId);
  }
}

function highlightFootprint(productId, duration = 3000) {
  const marker = markersCluster.getLayers().find(l => l.options?.productId === productId);
  if (marker && marker.footprint) {
    marker.footprint.setStyle({
      fillOpacity: 0.4,
      className: 'footprint-highlight'
    });
    
    if (duration) {
      setTimeout(() => {
        marker.footprint.setStyle({
          fillOpacity: footprintVisibility[productId] ? 0.2 : 0,
          className: ''
        });
      }, duration);
    }
  }
}

function generatePopupContent(productId, isVisible) {
  const content = document.createElement('div');
  content.className = 'popup-content';
  content.innerHTML = `
    <h4>Scene Details</h4>
    <p><strong>Product ID:</strong> ${productId}</p>
    <div class="popup-controls">
      <button class="footprint-toggle" onclick="window.toggleFootprint('${productId}')">
        ${isVisible ? 'Hide' : 'Show'} Footprint
      </button>
      <button class="footprint-zoom" onclick="window.zoomToFootprint('${productId}')">
        Zoom to Footprint
      </button>
    </div>
  `;
  return content;
}

const addMarkersToMap = (markerData) => {
  markersCluster.clearLayers();
  polygonLayerGroup.clearLayers();
  activePolygons.length = 0;

  const markerObjects = markerData.map(({ lat, lng, productId, coordinates }) => {
    const footprintPolygon = L.polygon(coordinates, {
      color: '#3388ff',
      weight: 2,
      fillColor: '#3388ff',
      fillOpacity: 0,
      opacity: 0
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      productId,
      autoPanOnFocus: false
    });

    marker.footprint = footprintPolygon;
    
    marker.bindPopup(generatePopupContent(productId, false));

    marker.on('click', function() {
      const currentOpacity = this.footprint.options.opacity;
      const newOpacity = !currentOpacity;
      this.footprint.setStyle({
        opacity: newOpacity ? 1 : 0,
        fillOpacity: newOpacity ? 0.2 : 0
      });
      footprintVisibility[productId] = newOpacity;
      this.setPopupContent(generatePopupContent(productId, newOpacity));
    });

    if (coordinates && coordinates.length) {
      const polygon = L.polygon(coordinates, { color: "blue" });
      const area = turf.area(polygon.toGeoJSON());

      if (area < 1e9) {
        polygonLayerGroup.addLayer(polygon);
        activePolygons.push(polygon);
      }
    }

    return marker;
  });

  markersCluster.addLayers(markerObjects);
  renderRegionCoverage();
  handlePolygonVisibility();
  
  window.toggleFootprint = toggleFootprint;
  window.zoomToFootprint = zoomToFootprint;
};

// === Polygon visibility toggle by zoom ===
const polygonVisibilityZoomThreshold = 9;

function handlePolygonVisibility() {
  if (map.getZoom() >= polygonVisibilityZoomThreshold) {
    map.addLayer(polygonLayerGroup);
  } else {
    map.removeLayer(polygonLayerGroup);
  }
}

map.on("zoomend", handlePolygonVisibility);

// Mission drawing functionality
let missionCoordinates = [];
let missionPolyline = null;
let missionDrawingActive = false;

const startMission = () => {
  missionCoordinates = [];
  missionDrawingActive = true;
  alert("Mission drawing started. Click on the map to add points, and double-click to finish.");
  map.on("click", onMapClick);
  map.on("dblclick", finishMission);
};

const onMapClick = (e) => {
  if (!missionDrawingActive) return;
  missionCoordinates.push(e.latlng);
  if (missionPolyline) {
    missionPolyline.setLatLngs(missionCoordinates);
  } else {
    missionPolyline = L.polyline(missionCoordinates, { color: "red", weight: 4 }).addTo(map);
  }
};

const finishMission = () => {
  if (!missionDrawingActive) return;
  missionDrawingActive = false;
  map.off("click", onMapClick);
  map.off("dblclick", finishMission);
  processMission();
};

const calculateDistances = (coords) => {
  if (coords.length < 2) return { direct: 0, total: 0 };
  let total = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    total += coords[i].distanceTo(coords[i + 1]);
  }
  const direct = coords[0].distanceTo(coords[coords.length - 1]);
  return { direct, total };
};

const processMission = () => {
    const distances = calculateDistances(missionCoordinates);
    const directMiles = (distances.direct * 0.000621371).toFixed(2);
    const totalMiles = (distances.total * 0.000621371).toFixed(2);
    const productId = prompt("Please enter the Product ID for this mission (mandatory):");
    
    if (!productId) {
        alert("Product ID is mandatory. Mission not saved.");
        if (missionPolyline) map.removeLayer(missionPolyline);
        return;
    }

    const now = new Date();
    const monthYear = `${now.getFullYear()}-${now.getMonth()}`;
    missionRecords[monthYear] = missionRecords[monthYear] || { missions: 0, coverage: 0 };
    missionRecords[monthYear].missions += 1;

    // Calculate coverage (example: area of drawn polygons)
    const coverage = drawnPolygons.reduce((total, polygon) => total + parseFloat(polygon.area), 0);
    missionRecords[monthYear].coverage += coverage;

    const tableBody = document.querySelector("#missions-table tbody");
    const row = document.createElement("tr");
    row.innerHTML = `<td>${productId}</td><td>${directMiles}</td><td>${totalMiles}</td>`;
    tableBody.appendChild(row);

    updateTimeChart();
    updateCoverageHistogram(); // Update histogram after processing a mission
};

// === Styles ===
const style = document.createElement("style");
style.innerHTML = `
  .custom-cluster-icon {
    background-color: #42A5F5;
    color: white;
    border-radius: 50%;
    text-align: center;
    font-size: 14px;
    line-height: 40px;
  }
  .footprint-highlight {
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { fill-opacity: 0.2; }
    50% { fill-opacity: 0.4; }
    100% { fill-opacity: 0.2; }
  }
  .popup-content {
    padding: 10px;
    min-width: 200px;
  }
  .popup-content h4 {
    margin: 0 0 10px 0;
    color: #2c3e50;
  }
  .popup-controls {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-top: 10px;
  }
  .popup-controls button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    margin: 5px 0;
    width: 100%;
  }
  .popup-controls button:hover {
    background-color: #2980b9;
  }
  .leaflet-interactive {
    transition: opacity 0.3s ease;
  }
`;
document.head.appendChild(style);

// Brand Logo
const londonCoords = [51.5074, -0.1278];
const brandLogoIcon = L.icon({
    iconUrl: '/Assets/Images/Raytheon Logo.svg',
    iconSize: [100, 100],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
});
L.marker(londonCoords, { icon: brandLogoIcon })
    .addTo(map)
    .bindPopup('Our main base in London!')
    .openPopup();

// === Start App ===
