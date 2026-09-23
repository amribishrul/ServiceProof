const crypto = require("crypto");

const Job = require("../models/Job");

const {
  sendVerificationEmail,
} = require("../services/emailService");

/*
|--------------------------------------------------------------------------
| GET ALL JOBS
|--------------------------------------------------------------------------
| GET /api/jobs
|--------------------------------------------------------------------------
*/

const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({
      jobId: 1,
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| GET ONE JOB
|--------------------------------------------------------------------------
| GET /api/jobs/:jobId
|--------------------------------------------------------------------------
*/

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      jobId: req.params.jobId,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Service job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| SUBMIT SERVICE VISIT
|--------------------------------------------------------------------------
| POST /api/jobs/:jobId/submit
|--------------------------------------------------------------------------
*/

const submitJob = async (req, res, next) => {
  try {
    const {
      workPerformed,
      recommendation,
      amount,
    } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE WORK PERFORMED
    |--------------------------------------------------------------------------
    */

    if (
      !workPerformed ||
      typeof workPerformed !== "string" ||
      !workPerformed.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Work performed is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE RECOMMENDATION
    |--------------------------------------------------------------------------
    */

    if (
      !recommendation ||
      typeof recommendation !== "string" ||
      !recommendation.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Recommendation is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | VALIDATE AMOUNT
    |--------------------------------------------------------------------------
    */

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount is required.",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: "Amount must be numeric.",
      });
    }

    if (numericAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot be negative.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | GENERATE SECURE VERIFICATION TOKEN
    |--------------------------------------------------------------------------
    */

    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    /*
    |--------------------------------------------------------------------------
    | UPDATE JOB
    |--------------------------------------------------------------------------
    |
    | Important:
    |
    | We only update a job where status = ASSIGNED.
    |
    | This makes the transition atomic and prevents two simultaneous
    | submissions from submitting the same job twice.
    |
    */

    const job = await Job.findOneAndUpdate(
      {
        jobId: req.params.jobId,
        status: "ASSIGNED",
      },

      {
        $set: {
          workPerformed: workPerformed.trim(),
          recommendation: recommendation.trim(),
          amount: numericAmount,

          status: "AWAITING_VERIFICATION",

          verificationToken,

          submittedAt: new Date(),

          disputeReason: null,
          verifiedAt: null,
        },
      },

      {
        new: true,
        runValidators: true,
      }
    );

    /*
    |--------------------------------------------------------------------------
    | JOB WAS NOT UPDATED
    |--------------------------------------------------------------------------
    */

    if (!job) {
      const existingJob = await Job.findOne({
        jobId: req.params.jobId,
      });

      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: "Service job not found.",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This service visit has already been submitted for customer verification.",
        status: existingJob.status,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | BUILD CUSTOMER VERIFICATION URL
    |--------------------------------------------------------------------------
    */

    const verificationUrl =
      `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    /*
    |--------------------------------------------------------------------------
    | SEND EMAIL
    |--------------------------------------------------------------------------
    |
    | Customer email comes from MongoDB.
    |
    | It does NOT come from req.body.
    |
    */

    try {
      await sendVerificationEmail({
        to: job.customer.email,
        job,
        verificationUrl,
      });

      return res.status(200).json({
        success: true,

        message:
          "Service visit submitted and verification email sent successfully.",

        emailSent: true,

        job,

        /*
        Development fallback.
        Remove this from production if necessary.
        */
        verificationUrl,
      });
    } catch (emailError) {
      console.error(
        "Verification email failed:",
        emailError.message
      );

      /*
      IMPORTANT:

      The job remains AWAITING_VERIFICATION.

      We do NOT undo the MongoDB update.

      The development response returns the URL so the demo can continue.
      */

      return res.status(200).json({
        success: true,

        message:
          "Service visit saved, but the verification email could not be sent.",

        emailSent: false,

        emailError: emailError.message,

        job,

        verificationUrl,
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  submitJob,
};