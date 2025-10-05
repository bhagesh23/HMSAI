const express = require('express');
const router = express.Router();
const { executeQuery } = require('./db.cjs');

// ** THE dotenv LINE HAS BEEN REMOVED FROM HERE **

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);

// GET all summary data
router.get('/summaries', (req, res) => {
    // ... (rest of the code is unchanged)
    const queries = {
        patients: 'SELECT COUNT(*) as total, SUM(status="active") as active FROM patients',
        beds: 'SELECT COUNT(*) as total, SUM(status="occupied") as occupied FROM beds',
        receivables: 'SELECT SUM(amount) as totalCollection FROM accounts_receivable WHERE paymentStatus = "paid"'
    };

    let summaries = {};
    let completedQueries = 0;
    const totalQueries = Object.keys(queries).length;

    for (const [key, sql] of Object.entries(queries)) {
        executeQuery(sql, [], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
            summaries[key] = results[0];
            completedQueries++;
            if (completedQueries === totalQueries) res.json(summaries);
        });
    }
});

// POST to send an SMS
router.post('/send', (req, res) => {
    const { to, message } = req.body;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!to || !message) {
        return res.status(400).json({ success: false, message: 'Recipient and message are required.' });
    }

    twilioClient.messages
        .create({ body: message, from: twilioPhoneNumber, to: to })
        .then(message => res.json({ success: true, message: 'SMS sent successfully!' }))
        .catch(error => res.status(500).json({ success: false, message: 'Failed to send SMS.', error: error.message }));
});

// All other report routes remain the same...
router.get('/report/patients', (req, res) => {
    const sql = "SELECT patientId, firstName, lastName, status FROM patients WHERE status = 'active' LIMIT 10";
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        let message = "Active Patients Report:\n";
        results.forEach(p => {
            message += `- ${p.patientId}: ${p.firstName} ${p.lastName}\n`;
        });
        res.json({ message });
    });
});
router.get('/report/opd', (req, res) => {
    const sql = "SELECT COUNT(*) as consultations, SUM(amount) as totalCollection FROM accounts_receivable WHERE paymentStatus = 'paid'";
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const { consultations, totalCollection } = results[0];
        const avgFee = consultations > 0 ? (totalCollection / consultations).toFixed(2) : 0;
        let message = "OPD Cash Summary:\n";
        message += `- Total Collection: $${Number(totalCollection || 0).toLocaleString()}\n`;
        message += `- Consultations: ${consultations}\n`;
        message += `- Average Fee: $${avgFee}`;
        res.json({ message });
    });
});
router.get('/report/admit-discharge', (req, res) => {
    let message = "Admit/Discharge Summary:\n- Admissions Today: 23 (static)\n- Discharges Today: 18 (static)\n- Net Change: +5 (static)";
    res.json({ message });
});
router.get('/report/ward-status', (req, res) => {
    const sql = "SELECT (SELECT COUNT(*) FROM beds) as total, (SELECT COUNT(*) FROM beds WHERE status = 'occupied') as occupied";
    executeQuery(sql, [], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        const { total, occupied } = results[0];
        let message = "Ward/Bed Status Report:\n";
        message += `- Total Beds: ${total}\n`;
        message += `- Occupied: ${occupied}\n`;
        message += `- Available: ${total - occupied}`;
        res.json({ message });
    });
});


module.exports = router;