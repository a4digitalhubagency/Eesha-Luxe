"use client";

import { useRouter } from "next/navigation";

const OPTIONS = [
  { value: "week",  label: "7 Days" },
  { value: "month", label: "30 Days" },
  { value: "year",  label: "12 Months" },
  { value: "all",   label: "All Time" },
];

export function AdminAnalyticsFilter({ current }: { current: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 bg-surface border border-outline/15 rounded-sm p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => router.push(`/admin/analytics?range=${o.value}`)}
          className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${
            current === o.value
              ? "bg-primary text-white"
              : "text-on-surface-muted hover:text-on-surface"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
