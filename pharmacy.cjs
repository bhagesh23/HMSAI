const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// GET all medicines with category names
router.get('/medicines', (req, res) => {
  const sql = `SELECT p.*, pc.name as categoryName FROM pharmaceuticals p LEFT JOIN pharmaceutical_categories pc ON p.categoryId = pc.id ORDER BY p.name ASC`;
  executeQuery(sql, [], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    res.json(results);
  });
});

// GET all categories
router.get('/categories', (req, res) => {
    const sql = 'SELECT * FROM pharmaceutical_categories ORDER BY name ASC';
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// GET all prescriptions for the pharmacy view
router.get('/prescriptions', (req, res) => {
    const sql = `
        SELECT pr.id, pr.prescriptionNumber, pr.prescriptionDate, pr.status, pr.notes,
               CONCAT(p.firstName, ' ', p.lastName) as patientName,
               CONCAT(e.firstName, ' ', e.lastName) as doctorName
        FROM prescriptions pr
        JOIN patients p ON pr.patientId = p.id
        JOIN employees e ON pr.doctorId = e.id
        ORDER BY pr.prescriptionDate DESC
    `;
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// POST a new medicine
router.post('/medicines/add', (req, res) => {
    const { name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel } = req.body;
    const sql = 'INSERT INTO pharmaceuticals (name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to add medicine' });
        res.json({ success: true, message: 'Medicine added successfully!' });
    });
});

// PUT (update) a medicine
router.put('/medicines/:id', (req, res) => {
    const { id } = req.params;
    const { name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel } = req.body;
    const sql = 'UPDATE pharmaceuticals SET name = ?, categoryId = ?, description = ?, dosageForm = ?, strength = ?, unitPrice = ?, stockQuantity = ?, reorderLevel = ? WHERE id = ?';
    const params = [name, categoryId, description, dosageForm, strength, unitPrice, stockQuantity, reorderLevel, id];
    executeQuery(sql, params, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update medicine' });
        res.json({ success: true, message: 'Medicine updated successfully!' });
    });
});

// DELETE a medicine
router.delete('/medicines/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM pharmaceuticals WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete medicine' });
        res.json({ success: true, message: 'Medicine deleted successfully!' });
    });
});

// PUT (update) a prescription's status
router.put('/prescriptions/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const sql = 'UPDATE prescriptions SET status = ? WHERE id = ?';
    executeQuery(sql, [status, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to update status' });
        res.json({ success: true, message: 'Status updated!' });
    });
});

module.exports = router;