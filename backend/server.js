const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection using Neon Database URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection on startup
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Successfully connected to Neon PostgreSQL database!');
    release();
});

// --- 1. AUTH ROUTES ---

// Register Route (Handles both Clients and Lawyers)
app.post('/api/auth/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        // Insert new user (Note: In production, hash the password using bcrypt!)
        const newUser = await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, password, role]
        );

        res.status(201).json({
            message: 'User registered successfully!',
            token: 'mock-jwt-token-' + newUser.rows[0].id, // Simplified token for development
            role: newUser.rows[0].role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        res.json({
            message: 'Login successful!',
            token: 'mock-jwt-token-' + user.rows[0].id,
            role: user.rows[0].role
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// --- 2. LAWYER PROFILE ROUTE ---

app.post('/api/lawyer/complete-profile', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided.' });

    const token = authHeader.split(' ')[1];
    const userId = token.replace('mock-jwt-token-', ''); // Extracting ID from mock token

    const { fullName, barID, practiceArea, experience, city, state } = req.body;

    try {
        await pool.query(
            `INSERT INTO lawyers (user_id, full_name, bar_id, practice_area, experience, city, state) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (bar_id) DO UPDATE 
             SET full_name = $2, practice_area = $4, experience = $5, city = $6, state = $7`,
            [userId, fullName, barID, practiceArea, experience, city.toLowerCase().trim(), state.toLowerCase().trim()]
        );

        res.json({ message: 'Profile saved successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving lawyer profile.' });
    }
});

// --- 3. CLIENT SEARCH ROUTE ---

app.get('/api/lawyer/search', async (req, res) => {
    const { caseType, location } = req.query;
    try {
        let query = 'SELECT * FROM lawyers WHERE 1=1';
        let params = [];

        if (caseType) {
            params.push(caseType);
            query += ` AND practice_area = $${params.length}`;
        }

        if (location) {
            params.push(`%${decodeURIComponent(location).toLowerCase().trim()}%`);
            query += ` AND (city LIKE $${params.length} OR state LIKE $${params.length})`;
        }

        const result = await pool.query(query, params);
        res.json({ lawyers: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error searching lawyers.' });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});