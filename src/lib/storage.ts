import apiConfig from "../config/api";

/**
 * Generate the storage base URL from the API base URL
 * Converts: http://192.168.1.128:8000 -> http://192.168.1.128:8000/storage/
 */
export const getStorageBaseUrl = (): string => {
  let baseUrlValue = apiConfig.baseURL.trim();

  // Remove trailing slash
  if (baseUrlValue.endsWith("/")) {
    baseUrlValue = baseUrlValue.slice(0, -1);
  }

  // Remove /api if it exists
  if (baseUrlValue.endsWith("/api")) {
    baseUrlValue = baseUrlValue.slice(0, -4);
  }

  return baseUrlValue + "/storage/";
};

/**
 * Normalize preview URLs to use absolute storage paths
 * - Absolute URLs (http/https) are returned as-is
 * - Relative paths are prefixed with storage base URL
 * - Empty/null values return empty string
 */
export const normalizeStorageUrl = (
  url?: string | null,
  fallbackUrl?: string
): string => {
  if (!url) return fallbackUrl || "";

  const trimmed = String(url).trim();
  if (!trimmed) return fallbackUrl || "";

  // Absolute URLs are used as-is
  const isAbsolute = /^https?:\/\//i.test(trimmed);
  if (isAbsolute) return trimmed;

  // Clean leading slashes
  const sanitized = trimmed.replace(/^\/+/, "");

  // Avoid duplicating "storage" when backend already returns a storage-relative path
  const storageBase = getStorageBaseUrl();
  if (sanitized.startsWith("storage/")) {
    const hostRoot = storageBase.replace(/storage\/?$/, "");
    return `${hostRoot}${sanitized}`;
  }

  return `${storageBase}${sanitized}`;
};

/**
 * Create an image element with fallback error handling
 */
export const createImageWithFallback = (
  src: string,
  fallbackSrc?: string,
  onLoadCallback?: () => void
): HTMLImageElement => {
  const img = new Image();
  if (onLoadCallback) {
    img.onload = onLoadCallback;
  }
  if (fallbackSrc) {
    img.onerror = () => {
      img.src = fallbackSrc;
    };
  }
  img.src = src;
  return img;
};
