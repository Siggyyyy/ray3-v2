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
    const timeChartContainer = document.createElement('div');
    timeChartContainer.id = 'time-chart-container';
    document.body.appendChild(timeChartContainer);

    const canvas = document.createElement('canvas');
    canvas.id = 'time-chart';
    canvas.style.width = '400rem';
    canvas.style.height = '100%';
    timeChartContainer.appendChild(canvas);

    const timeChartToggle = document.createElement('button');
    timeChartToggle.className = 'time-chart-toggle';
    timeChartToggle.innerHTML = '▼ Timeline';
    document.body.appendChild(timeChartToggle);

    timeChartToggle.addEventListener('click', toggleTimeChart);

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

    years.forEach(year => {
        months.forEach((month, monthIndex) => {
            const monthYear = `${year}-${monthIndex}`;
            labels.push(`${month} ${year}`);
            data.push(missionRecords[monthYear]?.coverage || 0);
        });
    });

    const canvas = document.getElementById('coverage-histogram');
    if (!canvas) {
        console.error("Canvas element for coverage histogram not found.");
        return;
    }

    if (window.coverageChart) {
        window.coverageChart.destroy();
    }

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
                    barPercentage: 0.8, 
                    categoryPercentage: 3 
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

// === Render regions with dynamic color ===
function renderRegionCoverage() {
  if (regionLayer) map.removeLayer(regionLayer);

  fetch('./regions.geojson')
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

// === Add Mission Markers and Render on Map ===
function addMarkersToMap(markerData) {
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
}
