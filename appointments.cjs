const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all appointments for a specific doctor
router.get('/doctor/:doctorId', (req, res) => {
    const { doctorId } = req.params;
    const sql = `
        SELECT a.id, a.appointmentDate, a.status, a.notes,
               CONCAT(p.firstName, ' ', p.lastName) as patientName,
               p.patientId as patientId,
               d.name as departmentName
        FROM appointments a
        JOIN patients p ON a.patientId = p.id
        JOIN employees e ON a.doctorId = e.id
        LEFT JOIN departments d ON e.departmentId = d.id
        WHERE a.doctorId = ?
        ORDER BY a.appointmentDate DESC
    `;
    executeQuery(sql, [doctorId], (err, results) => {
        if (err) {
            console.error("Error fetching doctor appointments:", err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
        res.json(results);
    });
});

module.exports = router;