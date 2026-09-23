const express = require("express");

const {
  getJobs,
  getJobById,
  submitJob,
} = require("../controllers/jobController");

const router = express.Router();

/*
GET /api/jobs
*/
router.get("/", getJobs);

/*
GET /api/jobs/:jobId
*/
router.get("/:jobId", getJobById);

/*
POST /api/jobs/:jobId/submit
*/
router.post("/:jobId/submit", submitJob);

module.exports = router;