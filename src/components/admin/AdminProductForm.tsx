"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, X } from "lucide-react";
import { ImageUploader } from "./ImageUploader";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  categories: Category[];
}

export function AdminProductForm({ categories }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAt, setCompareAt] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [color, setColor] = useState("");
  const [composition, setComposition] = useState("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [sizeInput, setSizeInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addSize() {
    const s = sizeInput.trim().toUpperCase();
    if (s && !sizes.includes(s)) setSizes((prev) => [...prev, s]);
    setSizeInput("");
  }

  function removeSize(s: string) {
    setSizes((prev) => prev.filter((x) => x !== s));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!images.length) {
      setError("At least one image is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Math.round(parseFloat(price) * 100) / 100,
          compareAt: compareAt ? Math.round(parseFloat(compareAt) * 100) / 100 : null,
          stock: parseInt(stock, 10),
          images,
          categoryId,
          color,
          sizes,
          composition,
          featured,
          published,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create product.");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-outline/20 rounded-sm px-3 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "block text-[10px] uppercase tracking-widest text-on-surface-faint mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-4 py-3">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-surface-lowest rounded-sm p-6 space-y-5">
        <h2 className="text-xs uppercase tracking-widest text-on-surface-faint border-b border-outline/10 pb-3">
          Basic Information
        </h2>

        <div>
          <label className={labelClass}>Product Name *</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Silk Evening Gown"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            className={`${inputClass} resize-none`}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description…"
          />
        </div>

        <div>
          <label className={labelClass}>Category *</label>
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-surface-lowest rounded-sm p-6 space-y-5">
        <h2 className="text-xs uppercase tracking-widest text-on-surface-faint border-b border-outline/10 pb-3">
          Pricing & Stock
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (₦) *</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className={labelClass}>Compare-at Price (₦)</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="w-1/2">
          <label className={labelClass}>Stock Quantity *</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Images */}
      <div className="bg-surface-lowest rounded-sm p-6 space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-on-surface-faint border-b border-outline/10 pb-3">
          Images *
        </h2>
        <p className="text-xs text-on-surface-faint">Upload up to 8 product images. The first image is shown as the primary thumbnail.</p>

        <ImageUploader value={images} onChange={setImages} folder="eesha-luxe/products" />
      </div>

      {/* Details */}
      <div className="bg-surface-lowest rounded-sm p-6 space-y-5">
        <h2 className="text-xs uppercase tracking-widest text-on-surface-faint border-b border-outline/10 pb-3">
          Product Details
        </h2>

        <div>
          <label className={labelClass}>Color</label>
          <input
            className={inputClass}
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g. Ivory, Black"
          />
        </div>

        <div>
          <label className={labelClass}>Composition</label>
          <input
            className={inputClass}
            value={composition}
            onChange={(e) => setComposition(e.target.value)}
            placeholder="e.g. 100% Silk"
          />
        </div>

        <div>
          <label className={labelClass}>Sizes</label>
          <div className="flex gap-2 mb-2">
            <input
              className={`${inputClass} flex-1`}
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
              placeholder="e.g. XS, S, M, L, XL"
            />
            <button
              type="button"
              onClick={addSize}
              className="px-4 h-10 border border-outline/20 rounded-sm text-xs text-on-surface hover:border-primary/50 transition-colors"
            >
              Add
            </button>
          </div>
          {sizes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 px-2 py-1 bg-surface border border-outline/15 rounded-sm text-xs text-on-surface"
                >
                  {s}
                  <button type="button" onClick={() => removeSize(s)} className="text-on-surface-faint hover:text-red-500">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visibility */}
      <div className="bg-surface-lowest rounded-sm p-6 space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-on-surface-faint border-b border-outline/10 pb-3">
          Visibility
        </h2>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-on-surface">Published (visible to customers)</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-sm text-on-surface">Featured on homepage</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary h-11 px-8 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Saving…
            </>
          ) : (
            "Save Product"
          )}
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
  );
}
