"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface Props {
  category: { id: string; name: string; description: string; imageUrl: string };
  productCount: number;
}

export function AdminCategoryEditForm({ category, productCount }: Props) {
  const router = useRouter();
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description);
  const [images, setImages] = useState<string[]>(category.imageUrl ? [category.imageUrl] : []);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const inputClass =
    "w-full border border-outline/20 rounded-sm px-3 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "block text-[10px] uppercase tracking-widest text-on-surface-faint mb-1.5";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, imageUrl: images[0] ?? "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update category.");
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to delete category.");
        setShowDeleteConfirm(false);
        return;
      }
      router.push("/admin/categories");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
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
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea className={`${inputClass} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category Image</label>
          <ImageUploader value={images} onChange={setImages} folder="eesha-luxe/categories" multiple={false} maxFiles={1} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary h-11 px-8 flex items-center gap-2 disabled:opacity-50">
            {loading ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()} className="h-11 px-8 border border-outline/20 rounded-sm text-sm text-on-surface-muted hover:border-outline/40 transition-colors">
            Cancel
          </button>
        </div>

        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={productCount > 0}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title={productCount > 0 ? `${productCount} product(s) in this category` : ""}
          >
            <Trash2 size={13} /> Delete
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-muted">Sure?</span>
            <button type="button" onClick={handleDelete} disabled={deleting} className="h-8 px-4 bg-red-500 text-white text-xs rounded-sm hover:bg-red-600 disabled:opacity-50 flex items-center gap-1.5">
              {deleting ? <Loader2 size={12} className="animate-spin" /> : null}
              Yes, delete
            </button>
            <button type="button" onClick={() => setShowDeleteConfirm(false)} className="h-8 px-4 border border-outline/20 rounded-sm text-xs text-on-surface-muted">
              Cancel
            </button>
          </div>
        )}
      </div>

      {productCount > 0 && (
        <p className="text-[11px] text-on-surface-faint">
          This category has {productCount} product{productCount === 1 ? "" : "s"}. Move or delete them before deleting the category.
        </p>
      )}
    </form>
  );
}
