const express = require("express");
const router = express.Router();

const onboardingController = require("../controllers/onboardingController");

router.post("/get-started", onboardingController.getStarted);

module.exports = router;
