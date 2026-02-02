
import { Jimp } from "jimp";
import path from "path";

const processImage = async (filename) => {
    const filePath = path.join("public/assets", filename);
    console.log(`Processing ${filePath}...`);

    try {
        const image = await Jimp.read(filePath);

        // Scan every pixel
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];

            // Aggressive threshold: If all channels are dark (< 50), make transparent.
            // Previous attempt was sum < 40 (avg < 13), which missed dark grays.
            if (r < 50 && g < 50 && b < 50) {
                this.bitmap.data[idx + 3] = 0; // Set Alpha to 0
            } else {
                // Optional: Feathering/smooth transition for edge pixels
                // If it's somewhat dark, reduce alpha? 
                // For now, hard cutoff at 50 is significantly cleaner than 13.
            }
        });

        await image.write(filePath);
        console.log(`Successfully processed ${filename}`);
    } catch (error) {
        console.error(`Error processing ${filename}:`, error);
    }
};

const run = async () => {
    await processImage("logo-main.png");
    await processImage("logo-footer.png");
};

run();
