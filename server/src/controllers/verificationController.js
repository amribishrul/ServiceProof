const Job = require("../models/Job");

/*
|--------------------------------------------------------------------------
| FORMAT CUSTOMER RESPONSE
|--------------------------------------------------------------------------
|
| Do not expose unnecessary MongoDB/internal information.
|
*/

const formatVerificationJob = (job) => {
  return {
    jobId: job.jobId,

    technician: {
      name: job.technician.name,
    },

    customer: {
      name: job.customer.name,
    },

    product: job.product,

    reportedIssue: job.reportedIssue,

    workPerformed: job.workPerformed,

    recommendation: job.recommendation,

    amount: job.amount,

    status: job.status,

    disputeReason:
      job.status === "DISPUTED"
        ? job.disputeReason
        : null,

    submittedAt: job.submittedAt,

    verifiedAt: job.verifiedAt,
  };
};

/*
|--------------------------------------------------------------------------
| GET VERIFICATION DETAILS
|--------------------------------------------------------------------------
| GET /api/verify/:token
|--------------------------------------------------------------------------
*/

const getVerificationDetails = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.params;

    const job = await Job.findOne({
      verificationToken: token,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "This verification link is invalid.",
      });
    }

    return res.status(200).json({
      success: true,
      job: formatVerificationJob(job),
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| APPROVE SERVICE VISIT
|--------------------------------------------------------------------------
| POST /api/verify/:token/approve
|--------------------------------------------------------------------------
*/

const approveVerification = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.params;

    /*
    Only an AWAITING_VERIFICATION record can become APPROVED.
    */

    const job = await Job.findOneAndUpdate(
      {
        verificationToken: token,
        status: "AWAITING_VERIFICATION",
      },

      {
        $set: {
          status: "APPROVED",
          verifiedAt: new Date(),
        },
      },

      {
        new: true,
        runValidators: true,
      }
    );

    if (job) {
      return res.status(200).json({
        success: true,

        message:
          "Service visit approved successfully.",

        job: formatVerificationJob(job),
      });
    }

    /*
    Determine why update failed.
    */

    const existingJob = await Job.findOne({
      verificationToken: token,
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "This verification link is invalid.",
      });
    }

    if (existingJob.status === "APPROVED") {
      return res.status(409).json({
        success: false,

        message:
          "This service visit has already been approved.",

        job: formatVerificationJob(existingJob),
      });
    }

    if (existingJob.status === "DISPUTED") {
      return res.status(409).json({
        success: false,

        message:
          "This service visit has already been disputed.",

        job: formatVerificationJob(existingJob),
      });
    }

    return res.status(409).json({
      success: false,

      message:
        "This service visit cannot be approved in its current state.",

      status: existingJob.status,
    });
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| DISPUTE SERVICE VISIT
|--------------------------------------------------------------------------
| POST /api/verify/:token/dispute
|--------------------------------------------------------------------------
*/

const disputeVerification = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.params;

    const { reason } = req.body;

    /*
    |--------------------------------------------------------------------------
    | VALIDATE DISPUTE REASON
    |--------------------------------------------------------------------------
    */

    if (
      !reason ||
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Dispute reason is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE ONLY IF STILL WAITING
    |--------------------------------------------------------------------------
    */

    const job = await Job.findOneAndUpdate(
      {
        verificationToken: token,
        status: "AWAITING_VERIFICATION",
      },

      {
        $set: {
          status: "DISPUTED",

          disputeReason: reason.trim(),

          verifiedAt: new Date(),
        },
      },

      {
        new: true,
        runValidators: true,
      }
    );

    if (job) {
      return res.status(200).json({
        success: true,

        message:
          "Service visit dispute recorded successfully.",

        job: formatVerificationJob(job),
      });
    }

    /*
    |--------------------------------------------------------------------------
    | CHECK WHY UPDATE FAILED
    |--------------------------------------------------------------------------
    */

    const existingJob = await Job.findOne({
      verificationToken: token,
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "This verification link is invalid.",
      });
    }

    if (existingJob.status === "APPROVED") {
      return res.status(409).json({
        success: false,

        message:
          "This service visit has already been approved.",

        job: formatVerificationJob(existingJob),
      });
    }

    if (existingJob.status === "DISPUTED") {
      return res.status(409).json({
        success: false,

        message:
          "This service visit has already been disputed.",

        job: formatVerificationJob(existingJob),
      });
    }

    return res.status(409).json({
      success: false,

      message:
        "This service visit cannot be disputed in its current state.",

      status: existingJob.status,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVerificationDetails,
  approveVerification,
  disputeVerification,
};