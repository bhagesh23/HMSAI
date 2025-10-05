const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET a patient's medical records
router.get('/my-records/:patientId', (req, res) => {
    const { patientId } = req.params;
    if (!patientId || isNaN(parseInt(patientId))) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
    }
    const sql = `
        SELECT mr.id, mr.recordDate, mr.diagnosis, mr.treatment, 
               CONCAT(e.firstName, ' ', e.lastName) as doctorName
        FROM medical_records mr JOIN employees e ON mr.doctorId = e.id
        WHERE mr.patientId = ? ORDER BY mr.recordDate DESC
    `;
    executeQuery(sql, [patientId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// GET a patient's appointments
router.get('/my-appointments/:patientId', (req, res) => {
    const { patientId } = req.params;
    if (!patientId || isNaN(parseInt(patientId))) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
    }
    const sql = `
        SELECT a.id, a.appointmentDate, a.notes, a.status,
               CONCAT(e.firstName, ' ', e.lastName) as doctorName,
               d.name as departmentName
        FROM appointments a JOIN employees e ON a.doctorId = e.id
        LEFT JOIN departments d ON e.departmentId = d.id
        WHERE a.patientId = ? ORDER BY a.appointmentDate DESC
    `;
    executeQuery(sql, [patientId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// GET a patient's billing history
router.get('/my-billing/:patientId', (req, res) => {
    const { patientId } = req.params;
    if (!patientId || isNaN(parseInt(patientId))) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
    }
    const sql = 'SELECT * FROM accounts_receivable WHERE patientId = ? ORDER BY dueDate DESC';
    executeQuery(sql, [patientId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// GET a patient's lab results
router.get('/my-lab-results/:patientId', (req, res) => {
    const { patientId } = req.params;
    if (!patientId || isNaN(parseInt(patientId))) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
    }
    const sql = `
        SELECT lt.id, lt.testName, lt.testDate, lt.status,
               CONCAT(e.firstName, ' ', e.lastName) as doctorName
        FROM lab_tests lt JOIN employees e ON lt.doctorId = e.id
        WHERE lt.patientId = ? ORDER BY lt.testDate DESC
    `;
    executeQuery(sql, [patientId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// GET a patient's prescriptions
router.get('/my-prescriptions/:patientId', (req, res) => {
    const { patientId } = req.params;
    if (!patientId || isNaN(parseInt(patientId))) {
        return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
    }
    const sql = `
        SELECT pr.id, pr.prescriptionDate, pr.notes, pr.status,
               CONCAT(e.firstName, ' ', e.lastName) as doctorName
        FROM prescriptions pr JOIN employees e ON pr.doctorId = e.id
        WHERE pr.patientId = ? ORDER BY pr.prescriptionDate DESC
    `;
    executeQuery(sql, [patientId], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// POST to book a new appointment
router.post('/book-appointment', (req, res) => {
    const { patientId, doctorId, appointmentDate, notes } = req.body;
    if (!patientId || !doctorId || !appointmentDate) {
        return res.status(400).json({ success: false, message: 'Patient, doctor, and date are required.' });
    }
    const sql = 'INSERT INTO appointments (patientId, doctorId, appointmentDate, notes, status) VALUES (?, ?, ?, ?, ?)';
    const params = [patientId, doctorId, appointmentDate, notes || null, 'scheduled'];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to book appointment.' });
        res.status(201).json({ success: true, message: 'Appointment booked successfully!' });
    });
});

// PUT to cancel an appointment
router.put('/my-appointments/:appointmentId/cancel', (req, res) => {
    const { appointmentId } = req.params;
    if (!appointmentId || isNaN(parseInt(appointmentId))) {
        return res.status(400).json({ success: false, message: 'Invalid appointment ID.' });
    }
    const sql = 'UPDATE appointments SET status = ? WHERE id = ?';
    executeQuery(sql, ['canceled', appointmentId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to cancel appointment.' });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Appointment not found.' });
        res.json({ success: true, message: 'Appointment canceled.' });
    });
});

// PUT to "pay" a bill
router.put('/my-billing/:billId/pay', (req, res) => {
    const { billId } = req.params;
    if (!billId || isNaN(parseInt(billId))) {
        return res.status(400).json({ success: false, message: 'Invalid bill ID.' });
    }
    const sql = "UPDATE accounts_receivable SET paymentStatus = 'paid' WHERE id = ?";
    executeQuery(sql, [billId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to process payment.' });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Bill not found.' });
        res.json({ success: true, message: 'Payment successful! The bill has been marked as paid.' });
    });
});

module.exports = router;