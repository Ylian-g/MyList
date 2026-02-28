import type { Status } from "@prisma/client";

const statusConfig: Record<Status, { label: string; className: string }> = {
  PLANNED: { label: "Planifié", className: "badge-ghost" },
  IN_PROGRESS: { label: "En cours", className: "badge-info" },
  COMPLETED: { label: "Terminé", className: "badge-success" },
  PAUSED: { label: "En pause", className: "badge-warning" },
  DROPPED: { label: "Abandonné", className: "badge-error" },
};

const statusEmoji: Record<Status, string> = {
  PLANNED: "📋",
  IN_PROGRESS: "▶",
  COMPLETED: "✓",
  PAUSED: "⏸",
  DROPPED: "✕",
};

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span className={`badge badge-sm gap-1 ${config.className}`}>
      <span className="text-[9px]">{statusEmoji[status]}</span>
      {config.label}
    </span>
  );
}
