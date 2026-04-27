"use client";

interface DayData {
  label: string;
  amount: number;
}

export function RevenueChart({ data }: { data: DayData[] }) {
  const W = 560;
  const H = 160;
  const PAD = { top: 12, right: 8, bottom: 24, left: 8 };

  const max = Math.max(...data.map((d) => d.amount), 1);
  const pts = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1)) * (W - PAD.left - PAD.right),
    y: PAD.top + (1 - d.amount / max) * (H - PAD.top - PAD.bottom),
  }));

  function smooth(points: { x: number; y: number }[]) {
    return points.reduce((path, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${path} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, "");
  }

  const linePath = smooth(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  const areaPath = `${linePath} L ${last.x} ${H - PAD.bottom} L ${first.x} ${H - PAD.bottom} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary, #7c6d5e)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-primary, #7c6d5e)" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="var(--color-primary, #7c6d5e)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="2.5" fill="var(--color-primary, #7c6d5e)" />
        ))}
      </svg>
      <div className="flex justify-between mt-1 px-1">
        {data.map((d) => (
          <span key={d.label} className="text-[9px] uppercase tracking-wide text-on-surface-faint">{d.label}</span>
        ))}
      </div>
    </div>
  );
}
