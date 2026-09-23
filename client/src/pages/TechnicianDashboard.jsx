import {
  useCallback,
  useEffect,
  useState,
} from "react";

import StatusBadge from "../components/StatusBadge";

import {
  getJobs,
  submitJob,
} from "../services/api";

function TechnicianDashboard() {
  const [jobs, setJobs] = useState([]);

  const [selectedJobId, setSelectedJobId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [verificationUrl, setVerificationUrl] =
    useState("");

  const [form, setForm] = useState({
    workPerformed: "",
    recommendation: "",
    amount: "",
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD JOBS
  |--------------------------------------------------------------------------
  */

  const loadJobs = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const response = await getJobs();

        setJobs(response.jobs);

        if (
          selectedJobId &&
          !response.jobs.some(
            (job) =>
              job.jobId === selectedJobId
          )
        ) {
          setSelectedJobId(null);
        }
      } catch (err) {
        setError(
          err.message ||
            "Failed to load service jobs."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [selectedJobId]
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadJobs(true);
  }, []);

  /*
  |--------------------------------------------------------------------------
  | AUTO REFRESH
  |--------------------------------------------------------------------------
  |
  | This lets the technician dashboard automatically show APPROVED or
  | DISPUTED after the customer responds.
  |
  */

  useEffect(() => {
    const interval = setInterval(() => {
      loadJobs(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadJobs]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED JOB
  |--------------------------------------------------------------------------
  */

  const selectedJob = jobs.find(
    (job) => job.jobId === selectedJobId
  );

  /*
  |--------------------------------------------------------------------------
  | SELECT JOB
  |--------------------------------------------------------------------------
  */

  const handleSelectJob = (job) => {
    setSelectedJobId(job.jobId);

    setError("");
    setSuccess("");
    setVerificationUrl("");

    if (job.status === "ASSIGNED") {
      setForm({
        workPerformed:
          job.workPerformed || "",

        recommendation:
          job.recommendation || "",

        amount:
          job.amount ?? "",
      });
    }
  };

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT VISIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedJob) {
      return;
    }

    setError("");
    setSuccess("");
    setVerificationUrl("");

    if (!form.workPerformed.trim()) {
      setError(
        "Please enter the work performed."
      );

      return;
    }

    if (!form.recommendation.trim()) {
      setError(
        "Please enter the recommendation."
      );

      return;
    }

    if (form.amount === "") {
      setError(
        "Please enter the amount."
      );

      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount)) {
      setError(
        "Amount must be numeric."
      );

      return;
    }

    if (amount < 0) {
      setError(
        "Amount cannot be negative."
      );

      return;
    }

    try {
      setSubmitting(true);

      const response = await submitJob(
        selectedJob.jobId,
        {
          workPerformed:
            form.workPerformed.trim(),

          recommendation:
            form.recommendation.trim(),

          amount,
        }
      );

      if (response.emailSent) {
        setSuccess(
          "Service visit submitted. Verification email sent to the customer."
        );
      } else {
        setSuccess(
          "Service visit submitted, but the email could not be sent."
        );
      }

      if (response.verificationUrl) {
        setVerificationUrl(
          response.verificationUrl
        );
      }

      await loadJobs(false);
    } catch (err) {
      setError(
        err.message ||
          "Failed to submit the service visit."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | COPY DEVELOPMENT VERIFICATION URL
  |--------------------------------------------------------------------------
  */

  const copyVerificationUrl =
    async () => {
      try {
        await navigator.clipboard.writeText(
          verificationUrl
        );

        setSuccess(
          "Verification link copied."
        );
      } catch {
        setError(
          "Could not copy verification link."
        );
      }
    };

  if (loading) {
    return (
      <div className="page-center">
        <p>Loading assigned jobs...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">
            SERVICEPROOF
          </p>

          <h1>
            Technician Dashboard
          </h1>

          <p className="muted">
            Manage your assigned service visits
            and customer verification status.
          </p>
        </div>

        <div className="technician-chip">
          <div className="technician-avatar">
            NP
          </div>

          <div>
            <strong>
              Nimal Perera
            </strong>

            <span>
              Technician
            </span>
          </div>
        </div>
      </header>

      <main className="dashboard-layout">
        {/* JOB LIST */}

        <section className="jobs-panel">
          <div className="section-heading">
            <div>
              <h2>
                Assigned Jobs
              </h2>

              <p>
                {jobs.length} service jobs
              </p>
            </div>
          </div>

          <div className="job-list">
            {jobs.map((job) => (
              <button
                key={job.jobId}
                className={`job-card ${
                  selectedJobId ===
                  job.jobId
                    ? "job-card-selected"
                    : ""
                }`}
                onClick={() =>
                  handleSelectJob(job)
                }
              >
                <div className="job-card-top">
                  <strong>
                    {job.jobId}
                  </strong>

                  <StatusBadge
                    status={job.status}
                  />
                </div>

                <h3>
                  {job.product}
                </h3>

                <p>
                  {job.customer.name}
                </p>

                <small>
                  {job.reportedIssue}
                </small>
              </button>
            ))}
          </div>
        </section>

        {/* JOB DETAILS */}

        <section className="details-panel">
          {!selectedJob ? (
            <div className="empty-state">
              <div className="empty-icon">
                SP
              </div>

              <h2>
                Select a service job
              </h2>

              <p>
                Choose one of your assigned jobs
                to view its details.
              </p>
            </div>
          ) : (
            <>
              <div className="job-details-header">
                <div>
                  <p className="eyebrow">
                    SERVICE JOB
                  </p>

                  <h2>
                    {selectedJob.jobId}
                  </h2>
                </div>

                <StatusBadge
                  status={
                    selectedJob.status
                  }
                />
              </div>

              <div className="info-grid">
                <div className="info-card">
                  <span>
                    Customer
                  </span>

                  <strong>
                    {
                      selectedJob.customer
                        .name
                    }
                  </strong>
                </div>

                <div className="info-card">
                  <span>
                    Customer Email
                  </span>

                  <strong>
                    {
                      selectedJob.customer
                        .email
                    }
                  </strong>
                </div>

                <div className="info-card">
                  <span>
                    Product
                  </span>

                  <strong>
                    {
                      selectedJob.product
                    }
                  </strong>
                </div>

                <div className="info-card">
                  <span>
                    Technician
                  </span>

                  <strong>
                    {
                      selectedJob.technician
                        .name
                    }
                  </strong>
                </div>
              </div>

              <div className="issue-box">
                <span>
                  Reported Issue
                </span>

                <p>
                  {
                    selectedJob.reportedIssue
                  }
                </p>
              </div>

              {error && (
                <div className="alert alert-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  {success}
                </div>
              )}

              {/* ASSIGNED */}

              {selectedJob.status ===
                "ASSIGNED" && (
                <form
                  className="service-form"
                  onSubmit={
                    handleSubmit
                  }
                >
                  <div className="form-heading">
                    <h3>
                      Service Visit Details
                    </h3>

                    <p>
                      Record what happened
                      during this visit.
                    </p>
                  </div>

                  <label>
                    Work Performed

                    <textarea
                      name="workPerformed"
                      value={
                        form.workPerformed
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Describe what you inspected, repaired or completed..."
                      rows="5"
                    />
                  </label>

                  <label>
                    Parts / Recommendation

                    <textarea
                      name="recommendation"
                      value={
                        form.recommendation
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter any replacement, repair or follow-up recommendation..."
                      rows="4"
                    />
                  </label>

                  <label>
                    Amount Charged /
                    Collected

                    <div className="amount-input">
                      <span>
                        LKR
                      </span>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="amount"
                        value={
                          form.amount
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </label>

                  <div className="submit-note">
                    A verification email
                    will be sent automatically
                    to{" "}
                    <strong>
                      {
                        selectedJob
                          .customer.email
                      }
                    </strong>
                  </div>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      submitting
                    }
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Service Visit"}
                  </button>
                </form>
              )}

              {/* SUBMITTED / FINAL */}

              {selectedJob.status !==
                "ASSIGNED" && (
                <div className="submitted-details">
                  <div className="form-heading">
                    <h3>
                      Submitted Service
                      Details
                    </h3>

                    <p>
                      This record is now
                      read-only.
                    </p>
                  </div>

                  <div className="detail-block">
                    <span>
                      Work Performed
                    </span>

                    <p>
                      {
                        selectedJob.workPerformed
                      }
                    </p>
                  </div>

                  <div className="detail-block">
                    <span>
                      Recommendation
                    </span>

                    <p>
                      {
                        selectedJob.recommendation
                      }
                    </p>
                  </div>

                  <div className="amount-summary">
                    <span>
                      Amount Charged /
                      Collected
                    </span>

                    <strong>
                      LKR{" "}
                      {Number(
                        selectedJob.amount
                      ).toLocaleString(
                        "en-LK",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}
                    </strong>
                  </div>

                  {selectedJob.status ===
                    "AWAITING_VERIFICATION" && (
                    <div className="waiting-box">
                      Waiting for customer
                      verification.
                    </div>
                  )}

                  {selectedJob.status ===
                    "APPROVED" && (
                    <div className="final-result approved-result">
                      Customer has approved
                      this service visit.
                    </div>
                  )}

                  {selectedJob.status ===
                    "DISPUTED" && (
                    <div className="final-result disputed-result">
                      <strong>
                        Customer disputed this
                        service visit.
                      </strong>

                      {selectedJob.disputeReason && (
                        <p>
                          {
                            selectedJob.disputeReason
                          }
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {verificationUrl && (
                <div className="developer-box">
                  <span>
                    Development fallback
                  </span>

                  <p>
                    {verificationUrl}
                  </p>

                  <button
                    type="button"
                    onClick={
                      copyVerificationUrl
                    }
                  >
                    Copy Verification Link
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default TechnicianDashboard;