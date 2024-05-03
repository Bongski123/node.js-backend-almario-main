const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const multer = require('multer') //http://expressjs.com/en/resources/middleware/multer.html npm install --save multer
const router = express.Router();


router.get("/researches/:id", (req, res) => {
  const researchId = req.params.id;
  

  if (!research) {
    return res.status(404).json({ error: "Research not found" });
  }

  res.json(research);
});



router.get('/total_researches', (req, res) => {
  const query = 'SELECT COUNT(*) AS total_researches FROM researches';
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const totalResearches = result[0].total_researches;
    res.json({ total_researches: totalResearches });
  });
});


router.get('/total_pending_researches', (req, res) => {
  const query = `
  SELECT COUNT(*) AS total_pending_researches 
  FROM pending_researches 

  `;
  db.query(query, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const totalPendingResearches = result[0].total_pending_researches;
    res.json({ total_pending_researches: totalPendingResearches });
  });
});



  module.exports = router;