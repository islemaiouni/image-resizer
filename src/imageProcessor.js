const { parentPort, workerData } = require('worker_threads');
const sharp = require('sharp');
const path = require('path');

// Function to resize image
const resizeImage = async (imagePath) => {
    try {
        const resizedImagePath = imagePath.replace('.jpg', '-resized.jpg');

        await sharp(imagePath)
            .resize(500) // Example: Resize image to 500px width
            .toFile(resizedImagePath);

        return resizedImagePath;
    } catch (err) {
        throw new Error(`Image processing error: ${err.message}`);
    }
};

// Receive message from main thread
parentPort.on('message', async (imagePath) => {
    console.log(`Worker thread received image: ${imagePath}`);
    try {
        const resizedImagePath = await resizeImage(imagePath);
        // Send resized image path back to main thread
        parentPort.postMessage(resizedImagePath);
    } catch (err) {
        console.error(err);
        parentPort.postMessage(null);
    }
});
