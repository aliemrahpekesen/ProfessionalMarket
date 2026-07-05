// Server-rendered SVG line/area chart for market value history.
// Single series (green, validated vs light surface); native <title> tooltips
// on ≥8px point targets; latest value direct-labeled; recessive grid.

import { formatMoney, formatMonthShort } from "@/lib/format";

export interface ValuePoint {
  date: Date;
  value: number;
}

const W = 640;
const H = 220;
const PAD = { top: 24, right: 76, bottom: 28, left: 8 };
const GREEN = "#15803d";

export function MarketValueChart({ points }: { points: ValuePoint[] }) {
  if (points.length === 0) {
    return <p className="p-4 text-sm text-gray-500">No market value records yet.</p>;
  }
  const sorted = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());
  const xs = sorted.map((p) => p.date.getTime());
  const ys = sorted.map((p) => p.value);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMax = Math.max(...ys) * 1.15;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const x = (tm: number) => (xMax === xMin ? plotW / 2 : ((tm - xMin) / (xMax - xMin)) * plotW) + PAD.left;
  const y = (v: number) => H - PAD.bottom - (yMax === 0 ? 0 : (v / yMax) * plotH);

  const linePath = sorted.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.date.getTime()).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${x(xMax).toFixed(1)},${H - PAD.bottom} L${x(xMin).toFixed(1)},${H - PAD.bottom} Z`;

  const gridValues = [0.25, 0.5, 0.75, 1].map((f) => yMax * f);
  const last = sorted[sorted.length - 1];

  return (
    <figure className="p-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Market value development, currently ${formatMoney(last.value)}`}
        className="h-auto w-full"
      >
        {gridValues.map((gv) => (
          <g key={gv}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(gv)} y2={y(gv)} stroke="#e5e7eb" strokeWidth={1} />
            <text x={W - PAD.right + 6} y={y(gv) + 4} fontSize={11} fill="#6b7280">
              {formatMoney(gv)}
            </text>
          </g>
        ))}
        <path d={areaPath} fill={GREEN} opacity={0.12} />
        <path d={linePath} fill="none" stroke={GREEN} strokeWidth={2} strokeLinejoin="round" />
        {sorted.map((p, i) => (
          <g key={i}>
            <circle cx={x(p.date.getTime())} cy={y(p.value)} r={4} fill={GREEN} stroke="#fff" strokeWidth={2}>
              <title>{`${formatMonthShort(p.date)}: ${formatMoney(p.value)}`}</title>
            </circle>
          </g>
        ))}
        <text
          x={Math.min(x(last.date.getTime()), W - PAD.right - 4)}
          y={y(last.value) - 10}
          fontSize={12}
          fontWeight={700}
          fill={GREEN}
          textAnchor="end"
        >
          {formatMoney(last.value)}
        </text>
        {/* x labels: first, middle, last */}
        {[sorted[0], sorted[Math.floor(sorted.length / 2)], last].map((p, i) => (
          <text
            key={i}
            x={x(p.date.getTime())}
            y={H - 8}
            fontSize={11}
            fill="#6b7280"
            textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"}
          >
            {formatMonthShort(p.date)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
