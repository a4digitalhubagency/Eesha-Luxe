"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { ImageUploader } from "@/components/admin/ImageUploader";

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "w-full border border-outline/20 rounded-sm px-3 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "block text-[10px] uppercase tracking-widest text-on-surface-faint mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, imageUrl: images[0] ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create category.");
        return;
      }
      router.push("/admin/products/new");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="px-5 md:px-8 py-7 border-b border-outline/10 bg-surface-lowest">
        <div className="flex items-center gap-2 text-xs text-on-surface-faint mb-3">
          <Link href="/admin/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <span>New Category</span>
        </div>
        <h1
          className="text-3xl text-on-surface"
          style={{ fontFamily: "var(--font-serif)", letterSpacing: "-0.02em" }}
        >
          Add Category
        </h1>
        <p className="text-sm text-on-surface-muted mt-1">Create a category before adding products.</p>
      </div>

      <div className="px-5 md:px-8 py-8 max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-4 py-3">
              <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-surface-lowest rounded-sm p-6 space-y-5">
            <div>
              <label className={labelClass}>Category Name *</label>
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Evening Wear"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description…"
              />
            </div>
            <div>
              <label className={labelClass}>Category Image</label>
              <ImageUploader value={images} onChange={setImages} folder="eesha-luxe/categories" multiple={false} maxFiles={1} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary h-11 px-8 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Category"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="h-11 px-8 border border-outline/20 rounded-sm text-sm text-on-surface-muted hover:border-outline/40 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
