
// pending-researches-router.js

const express = require('express');
const router = express.Router();
const { fetchPendingResearchesFromDatabase } = require('../database/db'); // Import your database module and function

// Define route to fetch pending researches
router.get('/pending-researches', async (req, res) => {
  try {
    // Fetch pending researches from the database
    const pendingResearches = await fetchPendingResearchesFromDatabase(); // Implement this function in your database module

    // Send the pending researches as a JSON response
    res.json(pendingResearches);
  } catch (error) {
    console.error('Error fetching pending researches:', error);
    res.status(500).json({ error: 'Error fetching pending researches' });
  }
});



// Route to get pending researches uploaded by the current user
router.get('/pending_researches/:userEmail', (req, res) => {
  const { userEmail } = req.params;
  const query = `
    SELECT * 
    FROM pending_researches 
    WHERE email = ?;
  `;
  db.query(query, [userEmail], (err, result) => {
    if (err) {
      console.error('Error fetching pending researches:', err);
      res.status(500).json({ error: 'Error fetching pending researches' });
      return;
    }
    res.json(result);
  });
});



module.exports = router;
