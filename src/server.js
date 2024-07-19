const express = require('express');
const basicAuth = require('express-basic-auth');
const { Worker } = require('worker_threads');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Basic authentication middleware
const users = { 'admin': 'password' }; // Replace with secure credentials
app.use(basicAuth({ users, challenge: true }));

// Route to handle image uploads
app.post('/upload', (req, res) => {
    // Assuming multipart form data with 'image' field
    const { image } = req.body;

    // Example: Save uploaded image to 'public' directory
    const imagePath = path.join(__dirname, 'public', 'uploaded-image.jpg');
    fs.writeFileSync(imagePath, image, 'base64');

    // Send the image path to the worker thread for resizing
    const worker = new Worker(path.join(__dirname, 'imageProcessor.js'), { workerData: imagePath });

    worker.on('message', (resizedImagePath) => {
        // Example: Send resized image path back to client
        res.json({ resizedImagePath });
    });

    worker.on('error', (err) => {
        console.error(err);
        res.status(500).json({ error: 'Image processing error' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
