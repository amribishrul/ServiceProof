const express = require("express");

const {
  getVerificationDetails,
  approveVerification,
  disputeVerification,
} = require("../controllers/verificationController");

const router = express.Router();

/*
GET /api/verify/:token
*/
router.get("/:token", getVerificationDetails);

/*
POST /api/verify/:token/approve
*/
router.post(
  "/:token/approve",
  approveVerification
);

/*
POST /api/verify/:token/dispute
*/
router.post(
  "/:token/dispute",
  disputeVerification
);

module.exports = router;