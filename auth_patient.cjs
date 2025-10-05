const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const bcrypt = require('bcryptjs');

// Patient Registration
router.post('/register', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const patientId = `PAT${Math.floor(1000 + Math.random() * 9000)}`;
    const patientSql = `INSERT INTO patients (patientId, firstName, lastName, email, status) VALUES (?, ?, ?, ?, 'active')`;
    
    executeQuery(patientSql, [patientId, firstName, lastName, email], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'A patient with this email already exists.' });
            }
            return res.status(500).json({ success: false, message: 'Failed to create patient record.' });
        }

        const newPatientId = result.insertId;

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ success: false, message: 'Error hashing password.' });
            
            const authSql = 'INSERT INTO patients_auth (patientId, email, password) VALUES (?, ?, ?)';
            executeQuery(authSql, [newPatientId, email, hash], (authErr, authResult) => {
                if (authErr) {
                     if (authErr.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ success: false, message: 'This email is already registered for login.' });
                     }
                    return res.status(500).json({ success: false, message: 'Failed to create login credentials.' });
                }
                res.json({ success: true, message: 'Patient registered successfully!' });
            });
        });
    });
});


// Patient Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // --- DEBUGGING LOGS ---
    console.log(`\n--- Patient Login Attempt ---`);
    console.log(`Received Email: ${email}`);
    console.log(`Received Password: ${password}`);

    const sql = 'SELECT * FROM patients_auth WHERE email = ?';

    executeQuery(sql, [email], (err, results) => {
        if (err) {
            console.error("DB Error on patient login:", err);
            return res.status(500).json({ success: false, message: 'Internal server error.' });
        }

        if (results.length === 0) {
            console.log(`Result: Patient with email '${email}' not found in 'patients_auth' table.`);
            console.log(`---------------------------\n`);
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const user = results[0];
        console.log(`Found user in 'patients_auth'. Patient ID: ${user.patientId}`);
        console.log(`Stored Hash from DB: ${user.password}`);

        if (!user.password) {
            console.log(`Result: Login failed because no password is set for this user.`);
            return res.status(401).json({ success: false, message: 'Invalid credentials. Account not fully configured.' });
        }

        bcrypt.compare(password, user.password, (compareErr, isMatch) => {
            if (compareErr) {
                console.error("Bcrypt compare error:", compareErr);
                return res.status(500).json({ success: false, message: 'Error checking password.' });
            }

            console.log(`Password Match Result: ${isMatch}`);
            console.log(`---------------------------\n`);

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid credentials.' });
            }

            res.json({
                success: true,
                message: 'Login successful!',
                patientId: user.patientId
            });
        });
    });
});

// POST to change a patient's password
router.post('/change-password', (req, res) => {
    // ... (your existing change password code)
});

module.exports = router;