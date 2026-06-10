const statusConfig: Record<string, string> = {
  // Asset Conditions
  excellent: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  good: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
  fair: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  poor: "bg-orange-500/10 text-orange-700 border border-orange-500/20",
  damaged: "bg-destructive/10 text-destructive border border-destructive/20",

  // Asset Statuses
  "in use": "bg-success/10 text-success border border-success/20",
  active: "bg-success/10 text-success border border-success/20",
  inactive: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  suspended: "bg-destructive/10 text-destructive border border-destructive/20",
  available: "bg-success/10 text-success border border-success/20",
  assigned: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
  "under maintenance":
    "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  disposed: "bg-destructive/10 text-destructive border border-destructive/20",
  lost: "bg-destructive/10 text-destructive border border-destructive/20",

  // Maintenance Statuses
  completed: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  "in progress": "bg-blue-500/10 text-blue-700 border border-blue-500/20",
  scheduled: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
  cancelled: "bg-gray-500/10 text-gray-700 border border-gray-500/20",

  // Fault Report Statuses
  resolved: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/20",
  closed: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
  reported: "bg-red-500/10 text-red-700 border border-red-500/20",
  investigating: "bg-orange-500/10 text-orange-700 border border-orange-500/20",

  // Priority Levels
  low: "bg-slate-500/10 text-slate-700 border border-slate-500/20",
  medium: "bg-yellow-500/10 text-yellow-700 border border-yellow-500/20",
  high: "bg-orange-500/10 text-orange-700 border border-orange-500/20",
  critical: "bg-red-500/10 text-red-700 border border-red-500/20",

  // Maintenance Types
  preventive: "bg-green-500/10 text-green-700 border border-green-500/20",
  corrective: "bg-blue-500/10 text-blue-700 border border-blue-500/20",
  predictive: "bg-purple-500/10 text-purple-700 border border-purple-500/20",
  emergency: "bg-red-500/10 text-red-700 border border-red-500/20",
};

function formatStatusLabel(status: string) {
  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function StatusBadge({ status }: { status: string }) {
  const normalized = status?.toString()?.trim().toLowerCase();
  const style =
    statusConfig[normalized] || "bg-secondary text-secondary-foreground";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
