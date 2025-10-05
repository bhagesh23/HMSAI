const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all medical records
router.get('/', (req, res) => {
    const sql = `
        SELECT mr.id, mr.recordDate, mr.diagnosis, mr.treatment, 
               CONCAT(p.firstName, ' ', p.lastName) as patientName, 
               CONCAT(e.firstName, ' ', e.lastName) as doctorName
        FROM medical_records mr
        JOIN patients p ON mr.patientId = p.id
        JOIN employees e ON mr.doctorId = e.id
        ORDER BY mr.recordDate DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// POST a new medical record (and optionally a prescription)
router.post('/add', (req, res) => {
    // Destructure the new 'prescriptionNotes' field
    const { patientId, doctorId, recordDate, diagnosis, treatment, prescriptionNotes } = req.body;
    
    // 1. First, insert the main medical record
    const medicalRecordSql = 'INSERT INTO medical_records (patientId, doctorId, recordDate, diagnosis, treatment) VALUES (?, ?, ?, ?, ?)';
    const medicalRecordParams = [patientId, doctorId, recordDate, diagnosis, treatment];

    executeQuery(medicalRecordSql, medicalRecordParams, (err, result) => {
        if (err) {
            console.error("Error adding medical record:", err);
            return res.status(500).json({ success: false, message: 'Failed to add medical record' });
        }

        // 2. If prescription notes were provided, create a prescription entry
        if (prescriptionNotes && prescriptionNotes.trim() !== '') {
            const prescriptionNumber = `PRES-${Date.now()}`;
            const prescriptionSql = 'INSERT INTO prescriptions (prescriptionNumber, patientId, doctorId, prescriptionDate, notes, status) VALUES (?, ?, ?, ?, ?, ?)';
            const prescriptionParams = [prescriptionNumber, patientId, doctorId, recordDate, prescriptionNotes, 'active'];

            executeQuery(prescriptionSql, prescriptionParams, (prescErr, prescResult) => {
                if (prescErr) {
                    console.error("Error adding prescription:", prescErr);
                    // Even if this fails, the main record was added, so we send a partial success message
                    return res.status(500).json({ success: false, message: 'Medical record added, but failed to create prescription.' });
                }
                res.json({ success: true, message: 'Medical record and prescription added successfully!' });
            });
        } else {
            // If no prescription notes, just confirm the medical record was added
            res.json({ success: true, message: 'Medical record added successfully!' });
        }
    });
});

// DELETE a medical record
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM medical_records WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete medical record' });
        res.json({ success: true, message: 'Medical record deleted successfully!' });
    });
});

module.exports = router;