const express = require("express");
const {
  getProjects,
  getProjectBySlug,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);

module.exports = router;
