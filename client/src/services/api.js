const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

/*
|--------------------------------------------------------------------------
| GENERIC REQUEST HELPER
|--------------------------------------------------------------------------
*/

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    /*
    |--------------------------------------------------------------------------
    | TRY TO READ RESPONSE BODY
    |--------------------------------------------------------------------------
    */

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    /*
    |--------------------------------------------------------------------------
    | HANDLE HTTP ERRORS
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      const error = new Error(
        data?.message ||
          `Request failed with status ${response.status}`
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | NETWORK ERRORS
    |--------------------------------------------------------------------------
    */

    if (!error.status) {
      console.error(
        `API request failed: ${url}`,
        error
      );

      const networkError = new Error(
        "Unable to connect to the ServiceProof server."
      );

      networkError.originalError = error;

      throw networkError;
    }

    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| TECHNICIAN APIs
|--------------------------------------------------------------------------
*/

/*
GET /api/jobs

Fetch all jobs for the technician dashboard.
*/
export const getJobs = async () => {
  return request("/jobs");
};

/*
GET /api/jobs/:jobId

Fetch one job.
*/
export const getJobById = async (jobId) => {
  return request(
    `/jobs/${encodeURIComponent(jobId)}`
  );
};

/*
POST /api/jobs/:jobId/submit

Submit technician service visit details.

Customer email is NOT sent from the frontend.
The backend reads it from MongoDB.
*/
export const submitJob = async (
  jobId,
  serviceDetails
) => {
  return request(
    `/jobs/${encodeURIComponent(jobId)}/submit`,
    {
      method: "POST",

      body: JSON.stringify({
        workPerformed:
          serviceDetails.workPerformed,

        recommendation:
          serviceDetails.recommendation,

        amount:
          serviceDetails.amount,
      }),
    }
  );
};

/*
|--------------------------------------------------------------------------
| CUSTOMER VERIFICATION APIs
|--------------------------------------------------------------------------
*/

/*
GET /api/verify/:token

Load the service visit from the verification token.
*/
export const getVerification = async (
  token
) => {
  return request(
    `/verify/${encodeURIComponent(token)}`
  );
};

/*
POST /api/verify/:token/approve

Approve the technician submission.
*/
export const approveVerification = async (
  token
) => {
  return request(
    `/verify/${encodeURIComponent(token)}/approve`,
    {
      method: "POST",
    }
  );
};

/*
POST /api/verify/:token/dispute

Dispute the technician submission.
*/
export const disputeVerification = async (
  token,
  reason
) => {
  return request(
    `/verify/${encodeURIComponent(token)}/dispute`,
    {
      method: "POST",

      body: JSON.stringify({
        reason,
      }),
    }
  );
};

/*
|--------------------------------------------------------------------------
| OPTIONAL DEBUG HELPER
|--------------------------------------------------------------------------
|
| Useful while deploying.
|
| Open browser console and this tells us which backend URL Vite compiled.
|--------------------------------------------------------------------------
*/

export const getApiUrl = () => {
  return API_URL;
};

console.log(
  "ServiceProof API URL:",
  API_URL
);