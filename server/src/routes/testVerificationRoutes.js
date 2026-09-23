const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();

// Temporary memory storage for testing only
const verificationRecords = {};

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// --------------------------------------------------
// 1. CREATE VERIFICATION + SEND EMAIL
// --------------------------------------------------

router.post("/create-verification", async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString("hex");

    // Temporary sample job
    const job = {
      jobId: "SRV-1001",
      customerName: "Test Customer",

      // SEND TO YOUR OWN EMAIL FOR TESTING
      customerEmail: "amrishafi77@gmail.com",

      technician: "Nimal Perera",
      product: "Washing Machine",
      reportedIssue: "Machine not starting",

      workPerformed:
        "Inspected the control panel and electrical connections.",

      recommendation: "Control panel requires repair.",

      amount: 7000,

      status: "AWAITING_VERIFICATION",

      verificationToken: token,

      submittedAt: new Date(),

      verifiedAt: null,
    };

    verificationRecords[token] = job;

    const verificationUrl = `${process.env.BASE_URL}/verify/${token}`;

    await transporter.sendMail({
      from: `"ServiceProof" <${process.env.EMAIL_USER}>`,
      to: job.customerEmail,

      subject: `Service Visit Verification - ${job.jobId}`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          
          <h2>Service Visit Verification</h2>

          <p>Hello ${job.customerName},</p>

          <p>
            Your technician has submitted the service details
            for your recent visit.
          </p>

          <p>
            <strong>Job ID:</strong> ${job.jobId}<br>
            <strong>Technician:</strong> ${job.technician}<br>
            <strong>Product:</strong> ${job.product}<br>
            <strong>Amount:</strong> LKR ${job.amount.toLocaleString()}
          </p>

          <p>Please review and confirm the service visit.</p>

          <a 
            href="${verificationUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#111;
              color:white;
              text-decoration:none;
              border-radius:5px;
            "
          >
            Review Service Visit
          </a>

          <p style="margin-top:30px;font-size:12px;color:#666;">
            Test verification link:<br>
            ${verificationUrl}
          </p>

        </div>
      `,
    });

    res.json({
      success: true,
      message: "Verification email sent successfully.",
      verificationUrl,
      token,
      status: job.status,
    });
  } catch (error) {
    console.error("Email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send verification email.",
      error: error.message,
    });
  }
});

// --------------------------------------------------
// 2. CUSTOMER OPENS VERIFICATION LINK
// --------------------------------------------------

router.get("/verify/:token", (req, res) => {
  const { token } = req.params;

  const job = verificationRecords[token];

  if (!job) {
    return res.status(404).send(`
      <h2>Invalid verification link</h2>
      <p>This verification link does not exist.</p>
    `);
  }

  // Already approved
  if (job.status === "APPROVED") {
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Service Visit Confirmed</title>
      </head>

      <body style="
        font-family:Arial;
        max-width:700px;
        margin:50px auto;
        line-height:1.6;
      ">

        <h1>Service Visit Confirmed</h1>

        <p>
          This service visit has been confirmed by the customer.
        </p>

        <hr>

        <p><strong>Job ID:</strong> ${job.jobId}</p>

        <p><strong>Technician:</strong> ${job.technician}</p>

        <p><strong>Product:</strong> ${job.product}</p>

        <p>
          <strong>Reported Issue:</strong><br>
          ${job.reportedIssue}
        </p>

        <p>
          <strong>Work Performed:</strong><br>
          ${job.workPerformed}
        </p>

        <p>
          <strong>Recommendation:</strong><br>
          ${job.recommendation}
        </p>

        <h2>
          Total: LKR ${job.amount.toLocaleString()}
        </h2>

        <p>
          <strong>Confirmed:</strong>
          ${new Date(job.verifiedAt).toLocaleString()}
        </p>

        <button onclick="window.print()">
          Print / Save as PDF
        </button>

      </body>
      </html>
    `);
  }

  // Already disputed
  if (job.status === "DISPUTED") {
    return res.send(`
      <h1>Service Visit Disputed</h1>

      <p>
        This service visit has already been disputed.
      </p>

      <p>
        <strong>Job ID:</strong> ${job.jobId}
      </p>
    `);
  }

  // Awaiting verification
  res.send(`
    <!DOCTYPE html>
    <html>

    <head>
      <title>Service Visit Verification</title>
    </head>

    <body style="
      font-family:Arial;
      max-width:700px;
      margin:50px auto;
      line-height:1.6;
    ">

      <h1>Service Visit Verification</h1>

      <hr>

      <p>
        <strong>Job ID:</strong>
        ${job.jobId}
      </p>

      <p>
        <strong>Technician:</strong>
        ${job.technician}
      </p>

      <p>
        <strong>Product:</strong>
        ${job.product}
      </p>

      <p>
        <strong>Reported Issue:</strong><br>
        ${job.reportedIssue}
      </p>

      <hr>

      <h2>Technician Report</h2>

      <p>
        <strong>Work Performed:</strong><br>
        ${job.workPerformed}
      </p>

      <p>
        <strong>Recommendation:</strong><br>
        ${job.recommendation}
      </p>

      <h2>
        Amount: LKR ${job.amount.toLocaleString()}
      </h2>

      <hr>

      <form
        method="POST"
        action="/verify/${token}/approve"
        style="display:inline;"
      >
        <button
          type="submit"
          style="
            padding:12px 20px;
            cursor:pointer;
          "
        >
          Confirm Service Visit
        </button>
      </form>

      <form
        method="POST"
        action="/verify/${token}/dispute"
        style="display:inline;margin-left:10px;"
      >
        <button
          type="submit"
          style="
            padding:12px 20px;
            cursor:pointer;
          "
        >
          Dispute
        </button>
      </form>

    </body>
    </html>
  `);
});

// --------------------------------------------------
// 3. CUSTOMER APPROVES
// --------------------------------------------------

router.post("/verify/:token/approve", (req, res) => {
  const { token } = req.params;

  const job = verificationRecords[token];

  if (!job) {
    return res.status(404).send("Invalid verification link.");
  }

  if (job.status !== "AWAITING_VERIFICATION") {
    return res.status(400).send(`
      This service visit has already been finalized.
    `);
  }

  job.status = "APPROVED";
  job.verifiedAt = new Date();

  console.log(`${job.jobId} approved by customer`);

  // Redirect back to same permanent link
  res.redirect(`/verify/${token}`);
});

// --------------------------------------------------
// 4. CUSTOMER DISPUTES
// --------------------------------------------------

router.post("/verify/:token/dispute", (req, res) => {
  const { token } = req.params;

  const job = verificationRecords[token];

  if (!job) {
    return res.status(404).send("Invalid verification link.");
  }

  if (job.status !== "AWAITING_VERIFICATION") {
    return res.status(400).send(`
      This service visit has already been finalized.
    `);
  }

  job.status = "DISPUTED";
  job.verifiedAt = new Date();

  console.log(`${job.jobId} disputed by customer`);

  res.redirect(`/verify/${token}`);
});

module.exports = router;