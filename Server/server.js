const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Keep this import
const https = require('https');

const app = express();

// CORS configuration to allow requests from your frontend (Netlify)
const corsOptions = {
    origin: 'https://wonderful-pasca-9656d5.netlify.app', // Replace with your Netlify URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions)); // Use CORS with custom options
app.use(express.json());

// Serve static files from the Pages, CSS, Scripts, and data folders
app.use(express.static('C:/Users/sigam/Documents/Application/Pages'));
app.use('/css', express.static('C:/Users/sigam/Documents/Application/CSS'));
app.use('/scripts', express.static('/Scripts')); // Make sure this path is correct
app.use('/data', express.static('C:/Users/sigam/Documents/Application/data'));

// Route to fetch products
app.post('/fetch-products', async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: 'Access token is required' });
    }

    try {
        const response = await axios.post(
            'https://hallam.sci-toolset.com/discover/api/v1/products/search',
            { size: 150, keywords: '' },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products', details: error.message });
    }
});

// Fetch Mission footprints
app.post('/fetch-mission-footprints', async (req, res) => {
    const { accessToken, missionIds } = req.body;

    if (!accessToken || !Array.isArray(missionIds) || missionIds.length === 0) {
        return res.status(400).json({ error: "Invalid request parameters" });
    }

    try {
        const footprintRequests = missionIds.map(missionId =>
            axios.get(`https://hallam.sci-toolset.com/discover/api/v1/missionfeed/missions/${missionId}/footprint`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            })
        );

        const results = await Promise.all(footprintRequests);
        res.json(results.map(response => response.data));  // Return the actual footprint data
    } catch (error) {
        console.error("Error fetching footprint data:", error);
        res.status(500).json({ error: "Failed to fetch footprint info", details: error.message });
    }
});

// Route to fetch product info
app.post('/fetch-product-info', async (req, res) => {
    const { accessToken, productIds } = req.body;

    if (!accessToken || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({ error: "Invalid request parameters" });
    }

    try {
        const productRequests = productIds.map(productId =>
            axios.get(`https://hallam.sci-toolset.com/discover/api/v1/products/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }).then(response => ({
                productId,
                centre: response.data.product?.result?.centre || null,
                footprint: response.data.product?.result?.footprint || null
            })).catch(error => ({
                productId,
                error: error.response?.data || "Failed to fetch"
            }))
        );

        const results = await Promise.all(productRequests);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch product info", details: error.message });
    }
});

// Mission Stuffs
app.post('/fetch-missions', async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: 'Access token is required' });
    }

    try {
        const response = await axios.get(
            'https://hallam.sci-toolset.com/discover/api/v1/missionfeed/missions',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                params: { size: 25, keywords: '' },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch mission data', details: error.message });
    }
});

// New route to fetch scenes
app.post('/get-scenes', async (req, res) => {
    const { accessToken, missionIds } = req.body;

    // Validate input parameters
    if (!accessToken || !Array.isArray(missionIds) || missionIds.length === 0) {
        return res.status(400).json({ error: "Invalid request parameters" });
    }

    try {
        // Fetch mission data for each missionId
        const sceneRequests = missionIds.map(missionId =>
            axios.get(`https://hallam.sci-toolset.com/discover/api/v1/missionfeed/missions/${missionId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            })
        );

        // Wait for all the API requests to complete
        const results = await Promise.all(sceneRequests);

        // Format the response to include missionId -> scene names, firstFrameTime, and band count
        const sceneData = results.map(response => {
            const mission = response.data;

            // Iterate through all scenes in the mission
            return mission.scenes.map(scene => {
                const sceneName = scene.name || 'Unnamed Scene'; // Get scene name, fallback to 'Unnamed Scene'
                const sceneId = scene.id
                const firstFrameTime = scene.firstFrameTime; // Get first frame time (timestamp)

                // Calculate the total band count from all bands in the scene
                const bandCount = scene.bands ? scene.bands.reduce((total, band) => total + (band.count || 0), 0) : 0;

                return {
                    missionId: mission.id,    // Add missionId to the response
                    sceneName: sceneName,     // Add scene name to the response
                    sceneId: sceneId,
                    firstFrameTime: firstFrameTime,  // Add firstFrameTime to the response
                    bandCount: bandCount     // Add calculated band count to the response
                };
            });
        }).flat();  // Flatten the array of scenes for each mission into a single array

        res.json(sceneData);  // Return the scene data as the response
    } catch (error) {
        console.error("Error fetching scene data:", error);
        res.status(500).json({ error: "Failed to fetch scene data", details: error.message });
    }
});

// POST /get-scene-frames
app.post("/get-scene-frames", async (req, res) => {
    const { accessToken, missionId, sceneId } = req.body;

    try {
        const response = await fetch(`https://hallam.sci-toolset.com/api/v1/missionfeed/missions/${missionId}/scene/${sceneId}/frames`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch frames." });
        }

        const frameData = await response.json();
        res.json(frameData);
    } catch (error) {
        console.error("Error fetching scene frames:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend API running on http://localhost:${PORT}`));
