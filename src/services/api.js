export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

// Thrown specifically on 403 so callers can distinguish it from other errors
export class ForbiddenError extends Error {
  constructor() {
    super("You don't have permission to access this resource.");
    this.name = "ForbiddenError";
  }
}

export async function parseApiResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function getApiErrorMessage(data, fallback) {
  if (typeof data === "string") return data;
  return data?.message || data?.title || data?.error || fallback;
}

function getStoredToken() {
  try {
    const stored = localStorage.getItem("tanzeem_auth");
    return stored ? JSON.parse(stored)?.token : null;
  } catch {
    return null;
  }
}

export async function apiRequest(path, options = {}) {
  const token = getStoredToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Throw a specific error for 403 so pages can show the right UI
  if (response.status === 403) {
    throw new ForbiddenError();
  }

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Request failed. Please try again."));
  }

  return data;
}