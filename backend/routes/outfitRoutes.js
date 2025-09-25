// This file simply imports outfitController and exports it for server.js
const express = require("express");
const outfitController = require("../controllers/outfitController");

const router = express.Router();

// Mount all routes from outfitController
router.use("/", outfitController);

module.exports = router;
