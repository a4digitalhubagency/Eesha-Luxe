import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { cloudinary, publicIdFromUrl } from "@/lib/cloudinary";
import { handleApiError, safeJson } from "@/lib/errors";

const ALLOWED_FOLDERS = ["eesha-luxe/products", "eesha-luxe/categories"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

/**
 * Returns a signed upload payload so the browser can upload directly to Cloudinary
 * without our secret leaving the server. The signature is bound to specific params
 * (folder, timestamp), so a leaked signature can only be used for *that* upload.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await safeJson<{ folder?: string }>(req);
    const folder = body?.folder ?? "eesha-luxe/products";
    if (!ALLOWED_FOLDERS.includes(folder as AllowedFolder)) {
      return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
    }

    const timestamp = Math.round(Date.now() / 1000);

    // Sign the params we want Cloudinary to enforce. Cloudinary will reject the
    // upload if the browser tries to change them (e.g. uploading to a different folder).
    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    return handleApiError(err, "Failed to prepare upload.");
  }
}

/**
 * Delete an uploaded asset by URL. Used when admin removes an image from a
 * product so we don't accumulate orphaned files in the Cloudinary account.
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await safeJson<{ url?: string }>(req);
    const url = body?.url;
    if (!url) return NextResponse.json({ error: "URL required." }, { status: 400 });

    const publicId = publicIdFromUrl(url);
    if (!publicId || !publicId.startsWith("eesha-luxe/")) {
      return NextResponse.json({ error: "Invalid Cloudinary URL." }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return handleApiError(err, "Failed to delete image.");
  }
}
