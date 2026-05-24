export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

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

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, "Request failed. Please try again."));
  }

  return data;
}