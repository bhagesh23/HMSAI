const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Add this line
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());

// --- FIX: Add this line to serve uploaded files from the 'public' folder ---
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', require('./auth.cjs'));
app.use('/api/auth/patient', require('./auth_patient.cjs'));
app.use('/api/dashboard', require('./dashboard.cjs'));
app.use('/api/patients', require('./patients.cjs'));
app.use('/api/employees', require('./employees.cjs'));
app.use('/api/pharmacy', require('./pharmacy.cjs'));
app.use('/api/accounting', require('./accounting.cjs'));
app.use('/api/laboratory', require('./laboratory.cjs'));
app.use('/api/medical-records', require('./medicalRecords.cjs'));
app.use('/api/surgical', require('./surgical.cjs'));
app.use('/api/payroll', require('./payroll.cjs'));
app.use('/api/vendors', require('./vendors.cjs'));
app.use('/api/inventory', require('./inventory.cjs'));
app.use('/api/sms', require('./sms.cjs'));
app.use('/api/portal', require('./portal.cjs'));
app.use('/api/appointments', require('./appointments.cjs'));
app.use('/api/ai', require('./ai.cjs'));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Add this with your other app.use() lines
app.use('/api/triage', require('./triage.cjs'));