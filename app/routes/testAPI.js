const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send("API is working fucking properly");
});

module.exports = router;
