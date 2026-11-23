import { API_URL } from "@/lib/auth-client";

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";

const IMGBB_KEY = (process.env.NEXT_PUBLIC_IMGBB_API_KEY ?? "").trim();

export const hasImgBBKey = Boolean(IMGBB_KEY);
export const hasServerUpload = API_URL.length > 0;

export type UploadOutcome = {
  url: string;
  provider: "imgbb" | "local";
  warning?: string;
};

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read that image file."));
    };
    image.src = objectUrl;
  });
}

/**
 * Downscales and re-encodes an image in the browser so uploads stay small.
 * Returns a JPEG data URL that works both as a preview and as an ImgBB payload.
 */
export async function compressImage(
  file: File,
  { maxSize = 1280, quality = 0.82 }: { maxSize?: number; quality?: number } = {},
): Promise<string> {
  const image = await loadImage(file);
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not process this image.");
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

async function uploadToServer(dataUrl: string): Promise<string> {
  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataUrl }),
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const body = payload as { message?: string; error?: string } | string | null;
    const message =
      (typeof body === "string" ? body : body?.message ?? body?.error) ||
      `Image upload failed (${response.status}).`;
    throw new Error(message);
  }

  const data = (payload as { data?: { url?: string } } | null)?.data;
  if (!data?.url) throw new Error("The server did not return an image URL.");
  return data.url;
}

async function uploadToImgBB(dataUrl: string): Promise<string> {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("Could not prepare the image for upload.");

  const body = new FormData();
  body.append("key", IMGBB_KEY);
  body.append("image", base64);

  const response = await fetch(IMGBB_ENDPOINT, { method: "POST", body });
  if (!response.ok) {
    throw new Error(`ImgBB upload failed (${response.status}).`);
  }

  const payload = (await response.json()) as {
    data?: { url?: string; display_url?: string };
  };
  const url = payload.data?.display_url ?? payload.data?.url;
  if (!url) throw new Error("ImgBB did not return an image URL.");
  return url;
}

/**
 * Compresses an image and uploads it through the PizzaHub API (which proxies to
 * ImgBB so the key stays server-side). When the API is not configured, a
 * `NEXT_PUBLIC_IMGBB_API_KEY` can be used from the browser instead. If neither
 * is available, or the upload fails, a compressed local data URL is returned so
 * the form keeps working with a clear warning.
 */
export async function uploadImage(file: File): Promise<UploadOutcome> {
  const dataUrl = await compressImage(file);

  if (hasServerUpload) {
    try {
      return { url: await uploadToServer(dataUrl), provider: "imgbb" };
    } catch (error) {
      return {
        url: dataUrl,
        provider: "local",
        warning: `${
          error instanceof Error ? error.message : "ImgBB upload failed."
        } The compressed image was kept locally instead.`,
      };
    }
  }

  if (IMGBB_KEY) {
    try {
      return { url: await uploadToImgBB(dataUrl), provider: "imgbb" };
    } catch (error) {
      return {
        url: dataUrl,
        provider: "local",
        warning: `${
          error instanceof Error ? error.message : "ImgBB upload failed."
        } The compressed image was kept locally instead.`,
      };
    }
  }

  return {
    url: dataUrl,
    provider: "local",
    warning:
      "ImgBB is not configured. Add IMGBB_API_KEY on the server to publish hosted menu images.",
  };
}
