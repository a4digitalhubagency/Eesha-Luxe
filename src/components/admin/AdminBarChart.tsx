"use client";

interface DayData {
  label: string;
  amount: number;
}

export function AdminBarChart({ data }: { data: DayData[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  const todayIdx = new Date().getDay();
  // Map Sunday=0 to index 6, Mon=1→0, etc. if data is Mon-Sun order
  const peakIdx = data.reduce((best, d, i) => (d.amount > data[best].amount ? i : best), 0);

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5 h-20">
        {data.map((d, i) => {
          const pct = d.amount / max;
          const isPeak = i === peakIdx && d.amount > 0;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(pct * 100, 6)}%`,
                  background: isPeak
                    ? "var(--color-secondary, #5c4a3a)"
                    : d.amount > 0
                    ? "var(--color-primary-container, #f0e8df)"
                    : "var(--color-surface-low, #f5f0eb)",
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center">
            <span className="text-[9px] uppercase tracking-wide text-on-surface-faint">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
