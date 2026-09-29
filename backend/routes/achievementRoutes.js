const express = require("express");
const {
  getAchievements,
} = require("../controllers/achievementController");

const router = express.Router();

router.get("/", getAchievements);

module.exports = router;
