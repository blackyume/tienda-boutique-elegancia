async function testKeys() {
    const key = "AIzaSyCn2x_ZhY0XOGPria1CAdsywR3XhKfqjJM";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "hello" }] }] })
        });
        const data = await response.json();
        console.log(`HTTP Status: ${response.status}`);
        console.log(`Response body: ${JSON.stringify(data)}`);
    } catch (e) {
        console.error("Fetch failed", e);
    }
}
testKeys();
