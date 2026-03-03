import fetch from 'node-fetch';

async function listModels() {
    const key = "AIzaSyCn2x_ZhY0XOGPria1CAdsywR3XhKfqjJM"; // from previous file
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Body:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch failed", e);
    }
}
listModels();
