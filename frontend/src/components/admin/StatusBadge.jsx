const VARIANTS = {
  completed: "success",
  in_progress: "warning",
  active: "success",
  inactive: "muted",
};

const LABELS = {
  completed: "Completed",
  in_progress: "In Progress",
  active: "Active",
  inactive: "Inactive",
};

export default function StatusBadge({ status }) {
  const variant = VARIANTS[status] || "muted";
  const label = LABELS[status] || status;

  return <span className={`admin-badge admin-badge--${variant}`}>{label}</span>;
}
