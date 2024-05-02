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


  module.exports = router;