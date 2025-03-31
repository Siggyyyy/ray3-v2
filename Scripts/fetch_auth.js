// Global Cache
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

async function fetchSceneFrames(accessToken, missionId, sceneId) {
    try {
        const res = await fetch("http://localhost:5000/get-scene-frames", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, missionId, sceneId })
        });

        if (!res.ok) throw new Error("Scene frame fetch failed");

        const frames = await res.json();

        // Clear previous scene layers
        activeSceneLayers.forEach(layer => missionMap.removeLayer(layer));
        activeSceneLayers = [];

        frames.forEach((frame, i) => {
            const { geometry } = frame;
            if (!geometry?.coordinates) return;

            const sceneLayer = L.geoJSON({
                type: "Feature",
                geometry
            }, {
                style: {
                    color: "#FF5722",
                    weight: 1,
                    fillColor: "#FF5722",
                    fillOpacity: 0.4
                }
            });

            setTimeout(() => {
                sceneLayer.addTo(missionMap).bringToFront();
                activeSceneLayers.push(sceneLayer);
            }, i * 500); // show build-up over time
        });

    } catch (err) {
        console.error("Scene frames error:", err);
    }
}

function addSceneData(sceneData, accessToken) {
    const container = document.getElementById("scene-list");
    const heading = document.querySelector(".missions-box h1");
    container.innerHTML = '';

    sceneData.sort((a, b) => new Date(a.firstFrameTime) - new Date(b.firstFrameTime));

    sceneData.forEach(scene => {
        const html = `
            <div class="scene-card" id="${scene.sceneId}">
                <h3>${scene.sceneName}</h3>
                <p>${new Date(scene.firstFrameTime).toLocaleString()}</p>
            </div>`;
        container.insertAdjacentHTML("beforeend", html);
    });

    document.querySelectorAll(".scene-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".scene-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            const sceneId = card.id;
            const { missionId, accessToken } = history.state;

            fetchSceneFrames(accessToken, missionId, sceneId);

            // Expand right pane
            framesContainer.style.display = "block";
            document.querySelectorAll('.card-container').forEach(c => c.classList.add('shorten-container'));
            document.querySelectorAll('.more-stuff-box, .missions-stuff-box').forEach(el =>
                el.classList.add('shorten-for-frames'));
        });
    });
}

async function fetchScenes(accessToken, missionIds) {
    const missionId = missionIds[0];

    if (dataCache.scenes[missionId]) {
        addSceneData(dataCache.scenes[missionId], accessToken);
        return;
    }

    try {
        const res = await fetch("http://localhost:5000/get-scenes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, missionIds })
        });

        if (!res.ok) throw new Error("Failed to fetch scenes");

        const data = await res.json();
        dataCache.scenes[missionId] = data;
        addSceneData(data, accessToken);
    } catch (err) {
        console.error("Scene fetch error:", err);
    }
}

const renderMissionCards = (accessToken, missions) => {
    const container = document.getElementById("mission-list");
    const heading = document.querySelector(".missions-box h1");
    container.innerHTML = "";

    const allIds = missions.map(m => m.id);
    fetchFootprintInfo(accessToken, allIds);

    missions.forEach(m => {
        const html = `
            <div class="mission-card" data-id="${m.id}" style="cursor: pointer;">
                <h3>${m.name}</h3>
                <p>Aircraft Take Off: ${new Date(m.aircraftTakeOffTime).toLocaleString()}</p>
            </div>`;
        container.insertAdjacentHTML("beforeend", html);
    });

    document.querySelectorAll(".mission-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".mission-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            highlightMissionPolygons(card.getAttribute("data-id"));
        });

        card.addEventListener("dblclick", async () => {
            const missionId = card.getAttribute("data-id");
            await fetchScenes(accessToken, [missionId]);
            heading.innerHTML = `Scenes for Mission: <span style="color: orange;">${card.querySelector("h3").textContent}</span>`;
            showSceneContainer();
            history.pushState({
                view: 'scenes',
                missionId,
                accessToken,
                missionName: card.querySelector("h3").textContent
            }, '', window.location.href);
        });
    });

    window.onpopstate = e => {
        if (e.state?.view === 'scenes') {
            fetchScenes(e.state.accessToken, [e.state.missionId]);
            heading.innerHTML = `Scenes for Mission: <span style="color: orange;">${e.state.missionName}</span>`;
            showSceneContainer();
        } else {
            heading.innerHTML = "Missions";
            document.querySelectorAll('.card-container').forEach(c => c.classList.remove('shorten-container'));
            document.querySelectorAll('.more-stuff-box, .missions-stuff-box').forEach(el =>
                el.classList.remove('shorten-for-frames'));
            framesContainer.style.display = "none";
            fetchMissionInfo(accessToken);
        }
    };
};

function showSceneContainer() {
    document.getElementById("mission-list").style.display = "none";
    document.getElementById("scene-list").style.display = "block";
}
function showMissionContainer() {
    document.getElementById("mission-list").style.display = "block";
    document.getElementById("scene-list").style.display = "none";
}

async function fetchMissionInfo(accessToken) {
    const loading = document.getElementById("loading-message");
    if (loading) loading.style.display = "block";

    try {
        const res = await fetch("http://localhost:5000/fetch-missions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken })
        });

        const data = await res.json();
        dataCache.missionInfo[accessToken] = data;
        renderMissionCards(accessToken, data.missions);
    } catch (err) {
        console.error("Mission fetch error:", err);
    } finally {
        if (loading) loading.style.display = "none";
    }
}

async function fetchProducts(accessToken) {
    if (dataCache.products[accessToken]) {
        const result = dataCache.products[accessToken];
        const ids = result.results?.searchresults?.map(p => p.id) || [];
        return fetchProductInfo(accessToken, ids);
    }

    try {
        const res = await fetch("http://localhost:5000/fetch-products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken })
        });

        const result = await res.json();
        dataCache.products[accessToken] = result;
        const ids = result.results?.searchresults?.map(p => p.id) || [];
        if (ids.length > 0) await fetchProductInfo(accessToken, ids);
    } catch (err) {
        console.error("Product fetch error:", err);
    }
}

async function fetchProductInfo(accessToken, productIds) {
    try {
        const res = await fetch("http://localhost:5000/fetch-product-info", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accessToken, productIds })
        });

        const products = await res.json();
        const valid = products.filter(p => p.centre && p.footprint?.coordinates && !p.error);
        const markers = valid.map(p => {
            const [lat, lng] = p.centre.split(',').map(Number);
            const coords = p.footprint.coordinates[0].map(([lng, lat]) => [lat, lng]);
            return { lat, lng, productId: p.productId, coordinates: coords };
        });

        addMarkersToMap(markers);
    } catch (err) {
        console.error("Product info error:", err);
    }
}

async function fetchAccessToken() {
    const urlencoded = new URLSearchParams();
    urlencoded.append("grant_type", "password");
    urlencoded.append("username", "hallam2");
    urlencoded.append("password", "2513@5De");

    try {
        const res = await fetch("https://hallam.sci-toolset.com/api/v1/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": "Basic c2NpLXRvb2xzZXQ6c3Q="
            },
            body: urlencoded
        });

        const data = await res.json();
        if (data.access_token) {
            await fetchProducts(data.access_token);
            await fetchMissionInfo(data.access_token);
        }
    } catch (err) {
        console.error("Token fetch error:", err);
    }
}

fetchAccessToken();
