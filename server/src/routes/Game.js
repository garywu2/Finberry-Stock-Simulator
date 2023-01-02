const express = require("express");
const router = express.Router();

//for parsing multipart form data (images)
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = router;