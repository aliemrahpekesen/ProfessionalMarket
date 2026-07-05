import {
  RUMOR_STATUS_LABELS,
  TRANSFER_TYPE_LABELS,
  type RumorStatus,
  type TransferType,
} from "@/lib/constants";

const RUMOR_STYLES: Record<RumorStatus, string> = {
  HOT: "bg-red-100 text-red-800 border-red-300",
  WARMING: "bg-amber-100 text-amber-800 border-amber-300",
  COLD: "bg-sky-100 text-sky-800 border-sky-300",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  DENIED: "bg-gray-200 text-gray-600 border-gray-300",
};

export function RumorStatusBadge({ status }: { status: string }) {
  const s = (status in RUMOR_STYLES ? status : "COLD") as RumorStatus;
  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-xs font-semibold ${RUMOR_STYLES[s]}`}>
      {RUMOR_STATUS_LABELS[s]}
    </span>
  );
}

export function TransferTypeBadge({ type }: { type: string }) {
  const label = TRANSFER_TYPE_LABELS[type as TransferType] ?? type;
  return (
    <span className="inline-block rounded border border-gray-300 bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-700">
      {label}
    </span>
  );
}

/** Probability bar (0-100) with visible % label — value is never color-alone. */
export function ProbabilityBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-24 overflow-hidden rounded-full bg-gray-200" aria-hidden>
        <span className="block h-full rounded-full bg-emerald-600" style={{ width: `${clamped}%` }} />
      </span>
      <span className="text-xs font-semibold tabular-nums text-gray-700">{clamped}%</span>
    </span>
  );
}
