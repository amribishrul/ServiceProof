const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const request = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },

    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message || "Something went wrong."
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

// Technician APIs

export const getJobs = () => {
  return request("/jobs");
};

export const getJobById = (jobId) => {
  return request(`/jobs/${jobId}`);
};

export const submitJob = (
  jobId,
  serviceDetails
) => {
  return request(`/jobs/${jobId}/submit`, {
    method: "POST",
    body: JSON.stringify(serviceDetails),
  });
};

// Customer APIs

export const getVerification = (token) => {
  return request(`/verify/${token}`);
};

export const approveVerification = (token) => {
  return request(`/verify/${token}/approve`, {
    method: "POST",
  });
};

export const disputeVerification = (
  token,
  reason
) => {
  return request(`/verify/${token}/dispute`, {
    method: "POST",

    body: JSON.stringify({
      reason,
    }),
  });
};