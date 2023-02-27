const express = require("express");
const router = express.Router();

//for parsing multipart form data (images)
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = router;

// Not sure how to implement this at the moment. Will be implemented along with more coaching.
// This might also be removed, as it might be either shoved to the Account route or moved here.