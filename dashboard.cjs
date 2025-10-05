const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

router.get('/stats', (req, res) => {
    const queries = [
        "SELECT COUNT(*) as value FROM patients",
        "SELECT COUNT(*) as value FROM employees WHERE status = 'active'",
        "SELECT COUNT(*) as value FROM beds WHERE status = 'available'",
        "SELECT COUNT(*) as value FROM appointments WHERE DATE(appointmentDate) = CURDATE()",
        "SELECT COUNT(*) as value FROM lab_tests WHERE DATE(testDate) = CURDATE()",
        "SELECT SUM(amount) as value FROM accounts_receivable WHERE paymentStatus = 'paid'",
        "SELECT COUNT(*) as value FROM surgery_records WHERE DATE(surgeryDate) = CURDATE()"
    ];

    const promises = queries.map(sql => {
        return new Promise((resolve, reject) => {
            executeQuery(sql, [], (err, results) => {
                if (err) return reject(err);
                resolve(results[0].value);
            });
        });
    });

    Promise.all(promises)
        .then(results => {
            const [totalPatients, activeStaff, availableBeds, appointmentsToday, labTestsToday, totalRevenue, surgeriesToday] = results;
            res.json({
                totalPatients: totalPatients || 0,
                activeStaff: activeStaff || 0,
                availableBeds: availableBeds || 0,
                appointmentsToday: appointmentsToday || 0,
                labTestsToday: labTestsToday || 0,
                revenue: totalRevenue || 0,
                surgeriesToday: surgeriesToday || 0
            });
        })
        .catch(err => {
            console.error("Dashboard stat query error:", err);
            res.status(500).json({ success: false, message: 'Internal server error' });
        });
});

module.exports = router;