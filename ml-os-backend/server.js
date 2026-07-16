// ml-os-backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // Install this: npm install bcryptjs

const app = express();
app.use(cors({
  // This explicitly permits BOTH Vite ports (5173 and 5174)
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
  credentials: true, // 🔑 REQUIRED to allow session/cookie transmission
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

const TARGET_DIR = 'D:/ML_Career_OS_Data';
const FILE_PATH = path.join(TARGET_DIR, 'database.json');

// Ensure folder exists
if (!fs.existsSync(TARGET_DIR)){
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Helper to safely read current database file
const readDatabase = () => {
    if (!fs.existsSync(FILE_PATH)) {
        return {};
    }
    try {
        const fileData = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(fileData);
    } catch (err) {
        return {};
    }
};

// Helper to safely write back to database file
const writeDatabase = (data) => {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
};

// 🛡️ INITIAL SEED: Ensure an administrator user exists in your JSON database safely
const initializeAdminUser = async () => {
    let dbData = readDatabase();

    // Create 'users' object namespace if not present
    if (!dbData.users) {
        dbData.users = {};
    }

    // Default username: aakash
    // Default local key: adminAakash2026! (We hash this so it's secure on your drive)
    if (!dbData.users['aakash']) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('adminAakash2026!', salt);

        dbData.users['aakash'] = {
            username: 'aakash',
            passwordHash: hashedPassword
        };

        writeDatabase(dbData);
        console.log('🔑 Secure admin user [aakash] seeded to Disk D.');
    }
};
initializeAdminUser();

// 1. GET: Fetch data from Disk D (Filtered to hide user credentials from public requests)
app.get('/api/db', (req, res) => {
    if (!fs.existsSync(FILE_PATH)) {
        return res.json({ message: "EMPTY_RECORDS" });
    }
    fs.readFile(FILE_PATH, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read file from D drive" });

        const fullDb = JSON.parse(data);
        // Deep copy and delete the sensitive credentials before transmitting back to client
        const publicDb = { ...fullDb };
        delete publicDb.users;

        res.json(publicDb);
    });
});

// 2. POST: Take updated workspace state from React and save to Disk D (Merging with existing user accounts)
app.post('/api/db', (req, res) => {
    const incomingData = req.body;
    const currentDb = readDatabase();

    // Preserve users block so client-side state updates don't wipe out your user accounts
    const mergedDb = {
        ...incomingData,
        users: currentDb.users || {}
    };

    fs.writeFile(FILE_PATH, JSON.stringify(mergedDb, null, 2), 'utf8', (err) => {
        if (err) return res.status(500).json({ error: "Write authorization failed on D Drive" });
        res.json({ status: "SUCCESS_SYNC" });
    });
});

// 🔑 3. POST: Verify Admin Login securely on Server
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const dbData = readDatabase();

        if (!dbData.users || !dbData.users[username]) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = dbData.users[username];
        // Cryptographically compare input with hashed password in database.json
        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (isMatch) {
            // Generate simple unique local session key
            const sessionToken = `session_key_${Buffer.from(username).toString('base64')}_${Date.now()}`;
            return res.json({ success: true, token: sessionToken });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error during verification' });
    }
});
app.get('/api/auth/users', (req, res) => {
    try {
        const dbData = readDatabase();
        if (!dbData.users) return res.json([]);

        // Return only the usernames array
        const usernames = Object.keys(dbData.users);
        res.json(usernames);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users list" });
    }
});

// 2. POST: Securely register/add a new user from Admin Panel
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        const dbData = readDatabase();
        if (!dbData.users) dbData.users = {};

        const cleanUsername = username.toLowerCase().trim();
        if (dbData.users[cleanUsername]) {
            return res.status(400).json({ success: false, message: 'User already exists.' });
        }

        // Cryptographically salt & hash the new user's password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        dbData.users[cleanUsername] = {
            username: cleanUsername,
            passwordHash: hashedPassword
        };

        writeDatabase(dbData);
        res.json({ success: true, message: `User ${cleanUsername} registered successfully.` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Registration failed.' });
    }
});

// 3. DELETE: Securely delete an account from Admin Panel
app.delete('/api/auth/user/:username', (req, res) => {
    try {
        const usernameToDelete = req.params.username.toLowerCase().trim();
        const dbData = readDatabase();

        if (!dbData.users || !dbData.users[usernameToDelete]) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Hard lock: Prevent accidental self-deletion of root administrator
        if (usernameToDelete === 'aakash') {
            return res.status(403).json({ success: false, message: 'Cannot delete primary root administrator account.' });
        }

        delete dbData.users[usernameToDelete];
        writeDatabase(dbData);
        res.json({ success: true, message: `User ${usernameToDelete} successfully deleted.` });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Deletion failed.' });
    }
});

app.listen(5000, () => console.log('🚀 D-Drive Secure Bridge Server Active on port 5000!'));