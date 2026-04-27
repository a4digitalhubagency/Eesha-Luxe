"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSessionStore } from "@/store/session";

interface Props {
  user: { id: string; name: string | null; email: string; createdAt: Date };
}

export function AccountSettingsForm({ user }: Props) {
  const router = useRouter();
  const setUser = useSessionStore((s) => s.setUser);

  const [name, setName] = useState(user.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) { setError("Name is required."); return; }
    if (newPassword && newPassword.length < 8) { setError("New password must be at least 8 characters."); return; }
    if (newPassword && newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword && !currentPassword) { setError("Current password is required to set a new password."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/account/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
      setSuccess("Your details have been updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setUser(data.user);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">

      {/* Status banners */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600 leading-relaxed">{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-sm px-4 py-3">
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 leading-relaxed">{success}</p>
        </div>
      )}

      {/* Profile section */}
      <div className="bg-surface-lowest rounded-sm p-6">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-5">Profile</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="label text-on-surface-muted block mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); setSuccess(""); }}
              className="w-full h-11 px-4 bg-surface-low border border-outline/20 rounded-sm text-sm text-on-surface placeholder:text-on-surface-faint focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="label text-on-surface-muted block mb-1.5">Email Address</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full h-11 px-4 bg-surface-low/50 border border-outline/10 rounded-sm text-sm text-on-surface-faint cursor-not-allowed"
            />
            <p className="text-[10px] text-on-surface-faint mt-1.5">Email cannot be changed.</p>
          </div>

          <div>
            <label className="label text-on-surface-muted block mb-1.5">Member Since</label>
            <p className="text-sm text-on-surface-muted">
              {new Date(user.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* Password section */}
      <div className="bg-surface-lowest rounded-sm p-6">
        <p className="text-[10px] uppercase tracking-widest text-on-surface-faint mb-5">Change Password</p>
        <p className="text-xs text-on-surface-faint mb-5 leading-relaxed">Leave blank if you don&apos;t want to change your password.</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="label text-on-surface-muted block mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setError(""); setSuccess(""); }}
              className="w-full h-11 px-4 bg-surface-low border border-outline/20 rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="label text-on-surface-muted block mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); setSuccess(""); }}
              className="w-full h-11 px-4 bg-surface-low border border-outline/20 rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="label text-on-surface-muted block mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(""); setSuccess(""); }}
              className="w-full h-11 px-4 bg-surface-low border border-outline/20 rounded-sm text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
              placeholder="Repeat new password"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary h-12 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
