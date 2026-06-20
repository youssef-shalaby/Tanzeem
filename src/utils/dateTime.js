const DATE_INPUT_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATETIME_WITHOUT_ZONE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,7})?)?$/;
const US_DATE_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

function toLocalDate(year, month, day) {
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function parseAppDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const text = String(value).trim();
  if (!text) return null;

  const dateInputMatch = text.match(DATE_INPUT_RE);
  if (dateInputMatch) {
    return toLocalDate(dateInputMatch[1], dateInputMatch[2], dateInputMatch[3]);
  }

  const usDateMatch = text.match(US_DATE_RE);
  if (usDateMatch) {
    return toLocalDate(usDateMatch[3], usDateMatch[1], usDateMatch[2]);
  }

  const normalizedText = ISO_DATETIME_WITHOUT_ZONE_RE.test(text) ? `${text}Z` : text;
  const parsed = new Date(normalizedText);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toIsoTimestamp(value, fallback = null) {
  const parsed = parseAppDate(value);
  if (parsed) return parsed.toISOString();
  return fallback;
}

export function toDateInputValue(value = new Date()) {
  const parsed = parseAppDate(value);
  if (!parsed) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatAppDate(value, options = {}) {
  const parsed = parseAppDate(value);
  return parsed ? parsed.toLocaleDateString("en-US", options) : "-";
}

export function formatAppTime(value, options = {}) {
  const parsed = parseAppDate(value);
  return parsed ? parsed.toLocaleTimeString("en-US", options) : "-";
}

export function formatAppDateTime(value, options = {}) {
  const parsed = parseAppDate(value);
  return parsed ? parsed.toLocaleString("en-US", options) : "-";
}

export function formatRelativeTime(value, now = Date.now()) {
  const parsed = parseAppDate(value);
  if (!parsed) return "-";

  const diffMinutes = Math.floor((Number(now) - parsed.getTime()) / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return formatAppDate(parsed);
}

export function compareAppDatesDesc(a, b) {
  const left = parseAppDate(a)?.getTime() ?? 0;
  const right = parseAppDate(b)?.getTime() ?? 0;
  return right - left;
}

export function isSameLocalMonth(value, reference = new Date()) {
  const parsed = parseAppDate(value);
  const compareTo = parseAppDate(reference);
  if (!parsed || !compareTo) return false;

  return parsed.getMonth() === compareTo.getMonth() && parsed.getFullYear() === compareTo.getFullYear();
}
