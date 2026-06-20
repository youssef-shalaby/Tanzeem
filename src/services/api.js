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

function addDetail(details, value) {
  if (value === null || value === undefined) return;

  if (Array.isArray(value)) {
    value.forEach((item) => addDetail(details, item));
    return;
  }

  if (typeof value === "object") {
    const field = value.field || value.propertyName || value.name || value.key;
    const row = value.row || value.rowNumber || value.line || value.lineNumber;
    const message = value.message || value.error || value.description || value.reason;

    if (message) {
      const location = [
        row ? `row ${row}` : null,
        field ? String(field) : null,
      ].filter(Boolean).join(", ");
      details.push(location ? `${location}: ${message}` : String(message));
      return;
    }

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (["traceId", "type", "title", "status"].includes(key)) return;
      if (Array.isArray(nestedValue)) {
        nestedValue.forEach((item) => {
          details.push(`${key}: ${typeof item === "string" ? item : JSON.stringify(item)}`);
        });
      } else if (typeof nestedValue === "string") {
        details.push(`${key}: ${nestedValue}`);
      }
    });
    return;
  }

  details.push(String(value));
}

function getValueIgnoreCase(data, key) {
  if (!data || typeof data !== "object") return undefined;
  const match = Object.keys(data).find((item) => item.toLowerCase() === key.toLowerCase());
  return match ? data[match] : undefined;
}

function splitCsvValidationMessage(message) {
  if (typeof message !== "string") return [];

  const match = message.match(/^CSV Validation Failed:\s*(.+)$/i);
  if (!match) return [];

  return match[1]
    .split("|")
    .map((detail) => detail.trim())
    .map((detail) => detail.replace(/^Row\s+(\d+):/i, (_, row) => `Item ${Math.max(Number(row) - 1, 1)}:`))
    .filter(Boolean);
}

function getApiErrorSummary(message) {
  if (typeof message !== "string") return null;
  if (/^CSV Validation Failed:/i.test(message)) return "CSV validation failed.";
  return message;
}

export function getApiErrorDetails(data) {
  const details = [];

  if (!data || typeof data === "string") return details;

  addDetail(details, splitCsvValidationMessage(getValueIgnoreCase(data, "message")));
  addDetail(details, data.errors);
  addDetail(details, data.validationErrors);
  addDetail(details, data.failures);
  addDetail(details, data.details);

  return [...new Set(details)].filter(Boolean);
}

export function getApiErrorMessage(data, fallback) {
  if (typeof data === "string") return data;
  const candidate =
    getValueIgnoreCase(data, "message") ||
    getValueIgnoreCase(data, "title") ||
    getValueIgnoreCase(data, "error");
  return typeof candidate === "string" ? getApiErrorSummary(candidate) : fallback;
}

export class ApiError extends Error {
  constructor(message, { status, details = [], data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
    this.data = data;
  }
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
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Throw a specific error for 403 so pages can show the right UI
  if (response.status === 403) {
    throw new ForbiddenError();
  }

  const data = await parseApiResponse(response);

  if (!response.ok) {
    const details = getApiErrorDetails(data);
    const message = getApiErrorMessage(
      data,
      response.status >= 500
        ? "The server could not process this request. Please check the details and try again."
        : "Request failed. Please try again."
    );
    throw new ApiError(message, { status: response.status, details, data });
  }

  return data;
}
