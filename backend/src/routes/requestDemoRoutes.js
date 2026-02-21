const express = require("express");
const router = express.Router();

const requestDemoController = require("../controllers/requestDemoController");

router.post("/", requestDemoController.createRequestDemo);

module.exports = router;
