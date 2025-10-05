const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');
// FIX: Ensure bcryptjs is required at the top of the file
const bcrypt = require('bcryptjs');

// GET all employees
router.get('/', (req, res) => {
  const sql = `
    SELECT e.*, d.name as departmentName 
    FROM employees e 
    LEFT JOIN departments d ON e.departmentId = d.id 
    ORDER BY e.id DESC
  `;
  executeQuery(sql, [], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    res.json(results);
  });
});

// GET all departments
router.get('/departments', (req, res) => {
    const sql = 'SELECT * FROM departments';
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
        res.json(results);
    });
});

// POST a new employee
router.post('/add', (req, res) => {
  const { employeeId, firstName, lastName, email, password, phone, departmentId, position, role, hireDate, salary } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ success: false, message: 'Error hashing password.' });

      const sql = `INSERT INTO employees (employeeId, firstName, lastName, email, password, phone, departmentId, position, role, status, hireDate, salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`;
      const params = [employeeId, firstName, lastName, email, hash, phone, departmentId, position, role, hireDate, salary];
      
      executeQuery(sql, params, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
            }
            return res.status(500).json({ success: false, message: 'Failed to add employee' });
        }
        res.json({ success: true, message: 'Employee added successfully!' });
      });
  });
});

// PUT (update) an employee
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, phone, departmentId, position, status, salary, password } = req.body;

    let sql = 'UPDATE employees SET firstName = ?, lastName = ?, email = ?, phone = ?, departmentId = ?, position = ?, status = ?, salary = ?';
    const params = [firstName, lastName, email, phone, departmentId, position, status, salary];

    // If a new password is provided, hash it and add it to the query
    if (password && password.length > 0) {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ success: false, message: 'Error hashing password.' });

            sql += ', password = ? WHERE id = ?';
            params.push(hash, id);

            executeQuery(sql, params, (queryErr, result) => {
                if (queryErr) return res.status(500).json({ success: false, message: 'Failed to update employee' });
                res.json({ success: true, message: 'Employee updated successfully!' });
            });
        });
    } else {
        // If no new password, run the original query
        sql += ' WHERE id = ?';
        params.push(id);

        executeQuery(sql, params, (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Failed to update employee' });
            res.json({ success: true, message: 'Employee updated successfully!' });
        });
    }
});

// DELETE an employee
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM employees WHERE id = ?';
    executeQuery(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to delete employee' });
        res.json({ success: true, message: 'Employee deleted successfully!' });
    });
});

module.exports = router;