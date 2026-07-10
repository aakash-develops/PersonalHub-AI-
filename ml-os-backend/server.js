// ml-os-backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Your local storage path on Disk D:
const TARGET_DIR = 'D:/ML_Career_OS_Data';
const FILE_PATH = path.join(TARGET_DIR, 'database.json');

// Automatically build the folder structure on Disk D if it isn't there yet
if (!fs.existsSync(TARGET_DIR)){
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 1. GET: Fetch data from Disk D to hand over to React
app.get('/api/db', (req, res) => {
    if (!fs.existsSync(FILE_PATH)) {
        return res.json({ message: "EMPTY_RECORDS" });
    }
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file from D drive" });
        res.json(JSON.parse(data));
    });
});

// 2. POST: Take updated state from React and save it to Disk D
app.post('/api/db', (req, res) => {
    fs.writeFile(FILE_PATH, JSON.stringify(req.body, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).json({ error: "Write authorization failed on D Drive" });
        res.json({ status: "SUCCESS_SYNC" });
    });
});

app.listen(5000, () => console.log('🚀 D-Drive Bridge Server Active on port 5000!'));