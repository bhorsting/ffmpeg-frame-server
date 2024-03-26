const express = require('express');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const http = require('http');

const app = express();
const server = http.createServer(app);

const videoFilePath = 'file_example_MP4_1920_18MG.mp4'; // Update with your video file path

// Function to extract a specific frame from the video and return it as PNG
function extractFrame(frameNumber, callback) {
    ffmpeg(videoFilePath)
        .on('end', () => callback(null))
        .on('error', (err) => callback(err))
        .outputOptions('-vf', `select=gte(n\\,${frameNumber})`)
        .frames(1)
        .format('image2')
        .saveToFile('temp.png');
}

// Express route to serve the PNG frame
app.get('/frame/:frameNumber', (req, res) => {
    const frameNumber = req.params.frameNumber;
    extractFrame(frameNumber, (err) => {
        if (err) {
            res.status(500).send('Error extracting frame');
            return;
        }
        const stream = fs.createReadStream('temp.png');
        stream.pipe(res);
    });
});

// Start the server
const PORT = 3000; // Change to desired port
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});