"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING:    "Pending",
  CONFIRMED:  "Confirmed",
  PROCESSING: "Processing",
  SHIPPED:    "Shipped",
  DELIVERED:  "Delivered",
  CANCELLED:  "Cancelled",
  REFUNDED:   "Refunded",
};

export function AdminStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate() {
    if (selected === currentStatus) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selected }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Update failed.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      router.refresh();
    } catch {
      setError("Could not connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <select
        value={selected}
        onChange={(e) => { setSelected(e.target.value); setSaved(false); }}
        className="w-full bg-surface border border-outline/15 rounded-sm px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary transition-colors"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleUpdate}
        disabled={saving || selected === currentStatus}
        className="btn-primary w-full h-10 flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
      >
        {saving ? (
          <><Loader2 size={13} className="animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle size={13} /> Updated</>
        ) : (
          "Save Status"
        )}
      </button>
    </div>
  );
}
