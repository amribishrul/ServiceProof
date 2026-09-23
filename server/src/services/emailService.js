const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },

    tls: {
      rejectUnauthorized: true,
    },
  });
};

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const sendVerificationEmail = async ({
  to,
  job,
  verificationUrl,
}) => {
  const transporter = createTransporter();

  const formattedAmount = Number(job.amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM || "ServiceProof"}" <${
      process.env.EMAIL_USER
    }>`,
    to,

    subject: `Service Visit Verification - ${job.jobId}`,

    text: `
Service Visit Verification

Your technician has submitted the details for your recent service visit.

Job ID: ${job.jobId}
Technician: ${job.technician.name}
Product: ${job.product}
Reported Issue: ${job.reportedIssue}

Work Performed:
${job.workPerformed}

Recommendation:
${job.recommendation}

Amount Charged / Collected:
LKR ${formattedAmount}

Please review the service visit using the link below:

${verificationUrl}

If any information is incorrect, you can dispute the submission.
    `.trim(),

    html: `
      <div
        style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          color: #222;
        "
      >
        <h2>Service Visit Verification</h2>

        <p>
          Your technician has submitted the details for your recent
          service visit.
        </p>

        <div
          style="
            background: #f6f6f6;
            padding: 18px;
            border-radius: 8px;
            margin: 20px 0;
          "
        >
          <p>
            <strong>Job ID:</strong>
            ${escapeHtml(job.jobId)}
          </p>

          <p>
            <strong>Technician:</strong>
            ${escapeHtml(job.technician.name)}
          </p>

          <p>
            <strong>Product:</strong>
            ${escapeHtml(job.product)}
          </p>

          <p>
            <strong>Reported Issue:</strong>
            ${escapeHtml(job.reportedIssue)}
          </p>

          <p>
            <strong>Amount:</strong>
            LKR ${formattedAmount}
          </p>
        </div>

        <p>
          Please review the complete service details and confirm whether
          they are correct.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            background: #111;
            color: white;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          Review Service Visit
        </a>

        <p style="margin-top: 24px; font-size: 13px; color: #666;">
          If any information is incorrect, you can dispute the service
          record from the verification page.
        </p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
};