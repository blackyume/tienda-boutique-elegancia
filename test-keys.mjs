import { GoogleGenerativeAI } from "@google/generative-ai";

async function testKeys() {
    const keys = [
        "AIzaSyCn2x_ZhY0XOGPria1CAdsywR3XhKfqjJM",
        "AIzaSyAiW4zqaXNlMlTQGJbLf5sQYp1fCruWtbk",
        "AIzaSyDqT6JP15iBaghHBCqDPt994oRo5nR175A"
    ];

    for (const key of keys) {
        console.log(`\nTesting key: ${key.substring(0, 10)}...`);
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("hello");
            console.log(`Success! Response: ${result.response.text()}`);
        } catch (err) {
            console.error(`Error details: ${err.message}`);
        }
    }
}

testKeys();
