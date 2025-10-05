const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the File System module

// --- FIX: Automatically create the uploads directory if it doesn't exist ---
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use the verified upload directory path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST to upload a profile photo
router.post('/:id/upload-photo', upload.single('profilePhoto'), (req, res) => {
    const { id } = req.params;
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const profileImageUrl = `/uploads/${req.file.filename}`;
    const sql = 'UPDATE patients SET profileImageUrl = ? WHERE id = ?';
    
    executeQuery(sql, [profileImageUrl, id], (err, result) => {
        if (err) {
            console.error("DB error saving image URL:", err);
            return res.status(500).json({ success: false, message: 'Failed to update profile picture.' });
        }
        res.json({ success: true, message: 'Profile picture updated!', profileImageUrl: profileImageUrl });
    });
});


// GET all patients
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM patients ORDER BY id DESC';
  executeQuery(sql, [], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    res.json(results);
  });
});

// GET a single patient by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM patients WHERE id = ?';
    executeQuery(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'Patient not found' });
        res.json(results[0]);
    });
});

// POST a new patient
router.post('/add', (req, res) => {
  const { patientId, firstName, lastName, dateOfBirth, gender, bloodGroup, phone, email, address, emergencyContact, emergencyPhone } = req.body;
  const sql = `INSERT INTO patients (patientId, firstName, lastName, dateOfBirth, gender, bloodGroup, phone, email, address, emergencyContact, emergencyPhone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`;
  const params = [patientId, firstName, lastName, dateOfBirth, gender, bloodGroup, phone, email, address, emergencyContact, emergencyPhone];
  executeQuery(sql, params, (err, result) => {
    if (err) return res.status(500).json({ success: false, message: 'Failed to add patient' });
    res.json({ success: true, message: 'Patient added successfully!' });
  });
});

// PUT (update) a patient's details
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, phone, address } = req.body;
    const sql = 'UPDATE patients SET firstName = ?, lastName = ?, phone = ?, address = ? WHERE id = ?';
    const params = [firstName, lastName, phone, address, id];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update patient' });
        res.json({ success: true, message: 'Patient details updated successfully!' });
    });
});

// DELETE a patient
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM patients WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete patient' });
        res.json({ success: true, message: 'Patient deleted successfully!' });
    });
});

module.exports = router;