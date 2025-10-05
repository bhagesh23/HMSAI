const express = require('express');
const router = express.Router();

const triageLogic = (symptoms) => {
    const lowerCaseSymptoms = symptoms.toLowerCase();

    // Emergency Keywords
    const emergencyWords = ['chest pain', 'breathing difficulty', 'can\'t breathe', 'severe bleeding', 'unconscious', 'seizure'];
    if (emergencyWords.some(word => lowerCaseSymptoms.includes(word))) {
        return 'Emergency';
    }

    // Department-specific Keywords
    const departmentKeywords = {
        'Cardiology': ['heart', 'palpitations', 'high blood pressure', 'dizziness'],
        'Orthopedics': ['bone', 'joint pain', 'fracture', 'sprain', 'broken'],
        'Pediatrics': ['child', 'baby', 'infant', 'kid', 'toddler'],
    };

    for (const department in departmentKeywords) {
        if (departmentKeywords[department].some(word => lowerCaseSymptoms.includes(word))) {
            return department;
        }
    }

    // Default to General Medicine if no specific keywords are found
    return 'General Medicine';
};

router.post('/ask', (req, res) => {
    const { symptoms } = req.body;
    if (!symptoms) {
        return res.status(400).json({ error: 'Symptoms are required.' });
    }

    const suggestedDepartment = triageLogic(symptoms);

    // Simulate a thinking delay
    setTimeout(() => {
        res.json({ 
            reply: `Based on your symptoms, I would recommend visiting the **${suggestedDepartment}** department. If you feel your condition is a critical emergency, please visit the ER immediately.` 
        });
    }, 1500); // 1.5 second delay
});

module.exports = router;