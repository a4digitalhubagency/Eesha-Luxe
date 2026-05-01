"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, X, Upload, AlertCircle } from "lucide-react";

interface Props {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: "eesha-luxe/products" | "eesha-luxe/categories";
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageUploader({
  value,
  onChange,
  folder = "eesha-luxe/products",
  multiple = true,
  maxFiles = 8,
  maxSizeMB = 5,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File): Promise<string> {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      throw new Error(`"${file.name}" is not a supported image format.`);
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`"${file.name}" exceeds ${maxSizeMB}MB.`);
    }

    // 1. Get a signed payload from our server
    const sigRes = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder }),
    });
    if (!sigRes.ok) {
      const data = await sigRes.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to authorize upload.");
    }
    const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

    // 2. Upload directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", String(timestamp));
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );
    if (!uploadRes.ok) {
      throw new Error("Cloudinary upload failed.");
    }
    const data = await uploadRes.json();
    return data.secure_url as string;
  }

  async function handleFiles(files: FileList | File[]) {
    setError("");
    const fileArray = Array.from(files);
    const remaining = maxFiles - value.length;
    if (fileArray.length > remaining) {
      setError(`You can only add ${remaining} more image${remaining === 1 ? "" : "s"} (max ${maxFiles}).`);
      return;
    }

    setUploading(true);
    try {
      const urls = await Promise.all(fileArray.map(uploadFile));
      onChange(multiple ? [...value, ...urls] : urls.slice(0, 1));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(i: number) {
    const url = value[i];
    onChange(value.filter((_, idx) => idx !== i));
    // Clean up Cloudinary in background — don't block the UI on this
    fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).catch(() => {});
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  const canAddMore = value.length < maxFiles;

  return (
    <div className="space-y-3">
      {/* Existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, i) => (
            <div key={url + i} className="relative group aspect-square bg-surface-low rounded-sm overflow-hidden border border-outline/15">
              <Image src={url} alt="" fill sizes="200px" className="object-cover" />

              {/* First-image badge */}
              {i === 0 && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-on-surface text-surface text-[8px] uppercase tracking-widest rounded-sm">
                  Primary
                </div>
              )}

              {/* Reorder controls */}
              {value.length > 1 && (
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                  {i > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i - 1)}
                      className="w-6 h-6 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-sm text-on-surface text-xs"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {i < value.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(i, i + 1)}
                      className="w-6 h-6 flex items-center justify-center bg-surface/90 backdrop-blur-sm rounded-sm text-on-surface text-xs"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                </div>
              )}

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute bottom-1.5 right-1.5 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone / add button */}
      {canAddMore && (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`block border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-outline/20 hover:border-primary/40"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple={multiple}
            disabled={uploading}
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = ""; // reset so picking the same file again triggers onChange
              }
            }}
          />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-on-surface-muted py-2">
              <Loader2 size={16} className="animate-spin" />
              Uploading…
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-on-surface-muted">
              <Upload size={20} className="text-on-surface-faint" strokeWidth={1.5} />
              <p className="text-sm">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-on-surface-faint">
                JPG, PNG, WebP up to {maxSizeMB}MB · {value.length}/{maxFiles} used
              </p>
            </div>
          )}
        </label>
      )}

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-sm px-3 py-2">
          <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
