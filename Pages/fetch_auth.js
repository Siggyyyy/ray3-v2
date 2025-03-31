const dataCache = {
    missionFootprints: {},
    scenes: {},
    products: {},
    missionInfo: {}
};

const drawnFootprints = new Map();
let highlightedPolygons = [];
let activeSceneLayers = [];

function addMissionFootprint(footprintData, missionId) {
    if (!Array.isArray(footprintData) || drawnFootprints.has(missionId)) return;
    drawnFootprints.set(missionId, []);

    footprintData.forEach(fp => {
        const { coordinates } = fp;
        if (!coordinates) return;

        const geoJsonLayer = L.geoJSON({
            type: "Feature",
            geometry: {
                type: coordinates.length > 1 ? "MultiPolygon" : "Polygon",
                coordinates
            }
        }, {
            style: {
                color: 'black',
                weight: 0.5,
                fillColor: 'black',
                fillOpacity: 0.6
            }
        });

        geoJsonLayer.on('click', () => {
            highlightMissionPolygons(missionId);
            triggerMissionCardClick(missionId);
        });

        geoJsonLayer.addTo(missionMap);
        drawnFootprints.get(missionId).push(geoJsonLayer);
    });
}

function highlightMissionPolygons(missionId) {
    drawnFootprints.forEach(layers =>
        layers.forEach(layer => layer.setStyle({
            color: 'black',
            weight: 0.5,
            fillColor: 'black',
            fillOpacity: 0.6
        }))

    );

    if (!drawnFootprints.has(missionId)) return;

    drawnFootprints.get(missionId).forEach(layer =>
        layer.setStyle({
            color: 'red',
            weight: 1,
            fillColor: 'purple',
            fillOpacity: 0.6
        })
    );
}

function triggerMissionCardClick(missionId) {
    const card = document.querySelector(`.mission-card[data-id="${missionId}"]`);
    if (card) {
        card.click();
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

// Fetch footprint data
async function fetchFootprintInfo(accessToken, missionIds) {
    for (const missionId of missionIds) {
        if (dataCache.missionFootprints[missionId]) {
            addMissionFootprint(dataCache.missionFootprints[missionId], missionId);
            continue;
        }

        try {
            const res = await fetch("http://localhost:5000/fetch-mission-footprints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ accessToken, missionIds: [missionId] })
            });

            if (!res.ok) throw new Error(res.status);

            const data = await res.json();
            if (data?.length) {
                dataCache.missionFootprints[missionId] = data;
                addMissionFootprint(data, missionId);
            }
        } catch (err) {
            console.error("Footprint error:", err);
        }
    }
}
