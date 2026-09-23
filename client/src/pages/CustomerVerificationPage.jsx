import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "react-router-dom";

import { jsPDF } from "jspdf";

import StatusBadge from "../components/StatusBadge";

import {
  approveVerification,
  disputeVerification,
  getVerification,
} from "../services/api";

function CustomerVerificationPage() {
  const { token } = useParams();

  const [job, setJob] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    showDisputeForm,
    setShowDisputeForm,
  ] = useState(false);

  const [reason, setReason] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD VERIFICATION DETAILS
  |--------------------------------------------------------------------------
  */

  const loadVerification =
    async () => {
      try {
        setError("");

        const response =
          await getVerification(token);

        setJob(response.job);
      } catch (err) {
        setError(
          err.message ||
            "Unable to load the verification record."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadVerification();
  }, [token]);

  /*
  |--------------------------------------------------------------------------
  | DATE FORMATTER
  |--------------------------------------------------------------------------
  */

  const formatDate = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(
      value
    ).toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | APPROVE SERVICE VISIT
  |--------------------------------------------------------------------------
  */

  const handleApprove =
    async () => {
      try {
        setActionLoading(true);
        setError("");

        const response =
          await approveVerification(
            token
          );

        setJob(response.job);
      } catch (err) {
        if (err.data?.job) {
          setJob(err.data.job);
        }

        setError(
          err.message ||
            "Unable to approve this service visit."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DISPUTE SERVICE VISIT
  |--------------------------------------------------------------------------
  */

  const handleDispute =
    async (event) => {
      event.preventDefault();

      if (!reason.trim()) {
        setError(
          "Please explain why you are disputing this service record."
        );

        return;
      }

      try {
        setActionLoading(true);
        setError("");

        const response =
          await disputeVerification(
            token,
            reason.trim()
          );

        setJob(response.job);

        setShowDisputeForm(false);
        setReason("");
      } catch (err) {
        if (err.data?.job) {
          setJob(err.data.job);
        }

        setError(
          err.message ||
            "Unable to submit the dispute."
        );
      } finally {
        setActionLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | DOWNLOAD APPROVED RECORD AS PDF
  |--------------------------------------------------------------------------
  */

  const downloadApprovedPdf = () => {
    if (
      !job ||
      job.status !== "APPROVED"
    ) {
      return;
    }

    const doc = new jsPDF();

    const margin = 18;

    const pageWidth =
      doc.internal.pageSize.getWidth();

    const pageHeight =
      doc.internal.pageSize.getHeight();

    const contentWidth =
      pageWidth - margin * 2;

    let y = 20;

    /*
    |--------------------------------------------------------------------------
    | PAGE SPACE CHECK
    |--------------------------------------------------------------------------
    */

    const ensureSpace = (
      requiredHeight = 20
    ) => {
      if (
        y + requiredHeight >
        pageHeight - 20
      ) {
        doc.addPage();
        y = 20;
      }
    };

    /*
    |--------------------------------------------------------------------------
    | ADD FIELD TO PDF
    |--------------------------------------------------------------------------
    */

    const addField = (
      label,
      value
    ) => {
      ensureSpace(25);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(10);

      doc.text(
        label,
        margin,
        y
      );

      y += 6;

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(11);

      const text =
        value === null ||
        value === undefined ||
        value === ""
          ? "Not available"
          : String(value);

      const lines =
        doc.splitTextToSize(
          text,
          contentWidth
        );

      doc.text(
        lines,
        margin,
        y
      );

      y +=
        lines.length * 6 + 7;
    };

    /*
    |--------------------------------------------------------------------------
    | PDF HEADER
    |--------------------------------------------------------------------------
    */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(21);

    doc.text(
      "ServiceProof",
      margin,
      y
    );

    y += 9;

    doc.setFontSize(14);

    doc.text(
      "Approved Service Visit Record",
      margin,
      y
    );

    y += 8;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(9);

    doc.text(
      "Customer-confirmed service visit record",
      margin,
      y
    );

    y += 12;

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 10;

    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    addField(
      "Job ID",
      job.jobId
    );

    addField(
      "Customer",
      job.customer?.name
    );

    addField(
      "Technician",
      job.technician?.name
    );

    addField(
      "Product",
      job.product
    );

    /*
    |--------------------------------------------------------------------------
    | SITE VISIT DETAILS
    |--------------------------------------------------------------------------
    */

    addField(
      "Reported Issue",
      job.reportedIssue
    );

    addField(
      "Work Performed",
      job.workPerformed
    );

    addField(
      "Parts / Recommendation",
      job.recommendation
    );

    /*
    |--------------------------------------------------------------------------
    | AMOUNT
    |--------------------------------------------------------------------------
    */

    const formattedAmount =
      Number(
        job.amount
      ).toLocaleString(
        "en-LK",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

    addField(
      "Amount Charged / Collected",
      `LKR ${formattedAmount}`
    );

    /*
    |--------------------------------------------------------------------------
    | VERIFICATION DETAILS
    |--------------------------------------------------------------------------
    */

    addField(
      "Verification Status",
      "CUSTOMER APPROVED"
    );

    addField(
      "Submitted At",
      formatDate(
        job.submittedAt
      )
    );

    addField(
      "Approved At",
      formatDate(
        job.verifiedAt
      )
    );

    /*
    |--------------------------------------------------------------------------
    | FOOTER
    |--------------------------------------------------------------------------
    */

    ensureSpace(25);

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );

    y += 8;

    doc.setFontSize(8);

    doc.setFont(
      "helvetica",
      "normal"
    );

    const footer =
      "This record was approved by the customer through the ServiceProof verification process.";

    const footerLines =
      doc.splitTextToSize(
        footer,
        contentWidth
      );

    doc.text(
      footerLines,
      margin,
      y
    );

    /*
    |--------------------------------------------------------------------------
    | DOWNLOAD
    |--------------------------------------------------------------------------
    */

    doc.save(
      `ServiceProof-${job.jobId}-Approved.pdf`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="verification-page">
        <div className="verification-card">
          <p>
            Loading service visit...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | INVALID TOKEN
  |--------------------------------------------------------------------------
  */

  if (!job) {
    return (
      <div className="verification-page">
        <div className="verification-card invalid-card">
          <div className="verification-logo">
            SP
          </div>

          <h1>
            Invalid Verification Link
          </h1>

          <p>
            {error ||
              "This verification link is invalid or no longer available."}
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | FORMAT AMOUNT
  |--------------------------------------------------------------------------
  */

  const formattedAmount =
    Number(
      job.amount
    ).toLocaleString(
      "en-LK",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  return (
    <div className="verification-page">
      <div className="verification-card">

        {/* BRAND */}

        <div className="verification-brand">
          <div className="verification-logo">
            SP
          </div>

          <div>
            <strong>
              ServiceProof
            </strong>

            <span>
              Customer Verification
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* AWAITING CUSTOMER VERIFICATION */}
        {/* ========================================================= */}

        {job.status ===
          "AWAITING_VERIFICATION" && (
          <>
            <div className="verification-heading">
              <p className="eyebrow">
                SERVICE VISIT
              </p>

              <h1>
                Review your service visit
              </h1>

              <p>
                Please confirm that
                the information
                submitted by your
                technician is correct.
              </p>
            </div>

            <div className="verification-job-header">
              <strong>
                {job.jobId}
              </strong>

              <StatusBadge
                status={
                  job.status
                }
              />
            </div>

            <div className="verification-info-grid">
              <div>
                <span>
                  Customer
                </span>

                <strong>
                  {
                    job.customer
                      ?.name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Technician
                </span>

                <strong>
                  {
                    job.technician
                      ?.name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Product
                </span>

                <strong>
                  {job.product}
                </strong>
              </div>

              <div>
                <span>
                  Job ID
                </span>

                <strong>
                  {job.jobId}
                </strong>
              </div>
            </div>

            {/* REPORTED ISSUE */}

            <div className="verification-section">
              <span>
                Reported Issue
              </span>

              <p>
                {
                  job.reportedIssue
                }
              </p>
            </div>

            {/* WORK PERFORMED */}

            <div className="verification-section">
              <span>
                Work Performed
              </span>

              <p>
                {
                  job.workPerformed
                }
              </p>
            </div>

            {/* RECOMMENDATION */}

            <div className="verification-section">
              <span>
                Parts / Recommendation
              </span>

              <p>
                {
                  job.recommendation
                }
              </p>
            </div>

            {/* AMOUNT */}

            <div className="customer-amount">
              <span>
                Amount Charged /
                Collected
              </span>

              <strong>
                LKR{" "}
                {
                  formattedAmount
                }
              </strong>
            </div>

            {/* ERROR */}

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {/* ACTIONS */}

            {!showDisputeForm ? (
              <div className="verification-actions">
                <button
                  className="approve-button"
                  onClick={
                    handleApprove
                  }
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Processing..."
                    : "Approve Service Visit"}
                </button>

                <button
                  className="dispute-button"
                  onClick={() => {
                    setError("");

                    setShowDisputeForm(
                      true
                    );
                  }}
                  disabled={
                    actionLoading
                  }
                >
                  Dispute
                </button>
              </div>
            ) : (
              <form
                className="dispute-form"
                onSubmit={
                  handleDispute
                }
              >
                <label>
                  Why are you disputing
                  this service record?

                  <textarea
                    value={
                      reason
                    }
                    onChange={(
                      event
                    ) =>
                      setReason(
                        event.target
                          .value
                      )
                    }
                    rows="4"
                    placeholder="Please briefly explain what is incorrect..."
                  />
                </label>

                <div className="dispute-form-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setShowDisputeForm(
                        false
                      );

                      setReason("");
                      setError("");
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="confirm-dispute-button"
                    disabled={
                      actionLoading
                    }
                  >
                    {actionLoading
                      ? "Submitting..."
                      : "Submit Dispute"}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* APPROVED */}
        {/* ========================================================= */}

        {job.status ===
          "APPROVED" && (
          <div className="final-verification">

            <div className="final-icon approved-icon">
              ✓
            </div>

            <p className="eyebrow">
              VERIFICATION COMPLETE
            </p>

            <h1>
              Service Visit Approved
            </h1>

            <p>
              Thank you. Your
              confirmation has been
              recorded successfully.
              This service visit is now
              a locked customer-approved
              record.
            </p>

            {/* SUMMARY */}

            <div className="final-record">

              <div>
                <span>
                  Job ID
                </span>

                <strong>
                  {job.jobId}
                </strong>
              </div>

              <div>
                <span>
                  Customer
                </span>

                <strong>
                  {
                    job.customer
                      ?.name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Technician
                </span>

                <strong>
                  {
                    job.technician
                      ?.name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Product
                </span>

                <strong>
                  {job.product}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <StatusBadge
                  status={
                    job.status
                  }
                />
              </div>

              <div>
                <span>
                  Approved At
                </span>

                <strong>
                  {formatDate(
                    job.verifiedAt
                  )}
                </strong>
              </div>

            </div>

            {/* SITE VISIT DETAILS */}

            <div className="approved-service-details">

              <div className="approved-section-heading">
                <p className="eyebrow">
                  SITE VISIT DETAILS
                </p>

                <h2>
                  Technician Submission
                </h2>
              </div>

              {/* REPORTED ISSUE */}

              <div className="approved-detail-box">
                <span>
                  Reported Issue
                </span>

                <p>
                  {
                    job.reportedIssue
                  }
                </p>
              </div>

              {/* WORK PERFORMED */}

              <div className="approved-detail-box">
                <span>
                  Work Performed
                </span>

                <p>
                  {
                    job.workPerformed
                  }
                </p>
              </div>

              {/* RECOMMENDATION */}

              <div className="approved-detail-box">
                <span>
                  Parts /
                  Recommendation
                </span>

                <p>
                  {
                    job.recommendation
                  }
                </p>
              </div>

              {/* AMOUNT */}

              <div className="approved-amount">
                <span>
                  Amount Charged /
                  Collected
                </span>

                <strong>
                  LKR{" "}
                  {
                    formattedAmount
                  }
                </strong>
              </div>

            </div>

            {/* PDF */}

            <button
              type="button"
              className="pdf-download-button"
              onClick={
                downloadApprovedPdf
              }
            >
              Download Approved Record as PDF
            </button>

            <p className="pdf-note">
              The PDF contains the
              customer-approved site
              visit information.
            </p>

          </div>
        )}

        {/* ========================================================= */}
        {/* DISPUTED */}
        {/* ========================================================= */}

        {job.status ===
          "DISPUTED" && (
          <div className="final-verification">

            <div className="final-icon disputed-icon">
              !
            </div>

            <p className="eyebrow">
              RESPONSE RECORDED
            </p>

            <h1>
              Service Visit Disputed
            </h1>

            <p>
              Your dispute has been
              recorded and can be
              reviewed by the service
              provider.
            </p>

            {/* SUMMARY */}

            <div className="final-record">

              <div>
                <span>
                  Job ID
                </span>

                <strong>
                  {job.jobId}
                </strong>
              </div>

              <div>
                <span>
                  Customer
                </span>

                <strong>
                  {
                    job.customer
                      ?.name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Technician
                </span>

                <strong>
                  {
                    job.technician
                      ?.name
                  }
                </strong>
              </div>

              <div>
                <span>
                  Product
                </span>

                <strong>
                  {job.product}
                </strong>
              </div>

              <div>
                <span>
                  Amount
                </span>

                <strong>
                  LKR{" "}
                  {
                    formattedAmount
                  }
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <StatusBadge
                  status={
                    job.status
                  }
                />
              </div>

            </div>

            {/* SITE VISIT DETAILS */}

            <div className="approved-service-details">

              <div className="approved-section-heading">
                <p className="eyebrow">
                  SITE VISIT DETAILS
                </p>

                <h2>
                  Technician Submission
                </h2>
              </div>

              <div className="approved-detail-box">
                <span>
                  Reported Issue
                </span>

                <p>
                  {
                    job.reportedIssue
                  }
                </p>
              </div>

              <div className="approved-detail-box">
                <span>
                  Work Performed
                </span>

                <p>
                  {
                    job.workPerformed
                  }
                </p>
              </div>

              <div className="approved-detail-box">
                <span>
                  Parts /
                  Recommendation
                </span>

                <p>
                  {
                    job.recommendation
                  }
                </p>
              </div>

              <div className="approved-amount">
                <span>
                  Amount Charged /
                  Collected
                </span>

                <strong>
                  LKR{" "}
                  {
                    formattedAmount
                  }
                </strong>
              </div>

            </div>

            {/* DISPUTE REASON */}

            {job.disputeReason && (
              <div className="dispute-reason-box">

                <span>
                  Customer Dispute
                  Reason
                </span>

                <p>
                  {
                    job.disputeReason
                  }
                </p>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default CustomerVerificationPage;