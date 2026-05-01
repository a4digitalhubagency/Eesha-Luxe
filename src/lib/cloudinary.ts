import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Extract a Cloudinary public_id from a delivery URL so we can call destroy().
 * Example URL: https://res.cloudinary.com/<cloud>/image/upload/v1700000000/eesha-luxe/products/abc.jpg
 * Public ID:   eesha-luxe/products/abc
 */
export function publicIdFromUrl(url: string): string | null {
  if (!url || !url.includes("/upload/")) return null;
  const after = url.split("/upload/")[1];
  if (!after) return null;
  // Strip optional version segment (e.g. v1700000000/)
  const noVersion = after.replace(/^v\d+\//, "");
  // Strip extension
  return noVersion.replace(/\.[^.]+$/, "");
}
