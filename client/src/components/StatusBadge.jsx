const STATUS_CONFIG = {
  ASSIGNED: {
    label: "Assigned",
    className: "status-assigned",
  },

  AWAITING_VERIFICATION: {
    label: "Awaiting Customer",
    className: "status-awaiting",
  },

  APPROVED: {
    label: "Customer Approved",
    className: "status-approved",
  },

  DISPUTED: {
    label: "Customer Disputed",
    className: "status-disputed",
  },
};

function StatusBadge({ status }) {
  const config =
    STATUS_CONFIG[status] || {
      label: status,
      className: "",
    };

  return (
    <span
      className={`status-badge ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default StatusBadge;