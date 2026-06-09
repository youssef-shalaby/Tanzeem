import { createElement, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Database, FileText, User } from "lucide-react";
import "../styles/account.css";

function actionPill(action) {
  const normalized = String(action || "").toLowerCase();
  if (normalized.includes("create") || normalized.includes("insert") || normalized.includes("add")) return "pill-green";
  if (normalized.includes("delete") || normalized.includes("remove")) return "pill-red";
  if (normalized.includes("update") || normalized.includes("edit")) return "pill-amber";
  return "pill-blue";
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function prettyValue(value) {
  if (!value) return "-";
  if (typeof value !== "string") return JSON.stringify(value, null, 2);
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function parseAuditValue(value) {
  if (!value || value === "-") return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function fieldLabel(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAuditValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "number") return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function comparableValue(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function auditSummary(action, entityName) {
  const normalized = String(action || "").toLowerCase();
  const entity = entityName || "record";
  if (normalized.includes("delete") || normalized.includes("remove")) {
    return {
      title: `${entity} removed`,
      copy: "The record was deleted. These are the values that existed before removal.",
      mode: "delete",
    };
  }
  if (normalized.includes("create") || normalized.includes("insert") || normalized.includes("add")) {
    return {
      title: `${entity} created`,
      copy: "A new record was added with the values shown below.",
      mode: "create",
    };
  }
  return {
    title: `${entity} updated`,
    copy: "The fields below show what changed on this record.",
    mode: "update",
  };
}

function countLabel(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="account-card pad">
      <div className="flex items-center gap-3">
        <span className="settings-nav-icon bg-[#f0f2ee] text-[#66706a]">
          {createElement(icon, { className: "w-4 h-4" })}
        </span>
        <div className="min-w-0">
          <div className="account-meta-label !text-[#7c8580]">{label}</div>
          <div className="text-sm font-semibold truncate">{value || "-"}</div>
        </div>
      </div>
    </div>
  );
}

export function AuditDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [log] = useState(location.state?.log || null);
  const returnTo = location.state?.returnTo;

  const values = useMemo(() => {
    const oldRecord = parseAuditValue(log?.oldValue);
    const newRecord = parseAuditValue(log?.newValue);
    const fields = Array.from(new Set([
      ...Object.keys(oldRecord || {}),
      ...Object.keys(newRecord || {}),
    ]));
    const summary = auditSummary(log?.action, log?.entityName);
    const fieldChanges = fields.map((field) => {
      const oldValue = oldRecord?.[field];
      const newValue = newRecord?.[field];
      const changed = comparableValue(oldValue) !== comparableValue(newValue);
      return { field, oldValue, newValue, changed };
    });
    const visibleFields = summary.mode === "update"
      ? fieldChanges.filter((field) => field.changed)
      : fieldChanges;
    const changedCount = fieldChanges.filter((field) => field.changed).length;
    const unchangedCount = fieldChanges.filter((field) => !field.changed).length;
    const hasNoDetectedUpdateDiff = summary.mode === "update" && fieldChanges.length > 0 && changedCount === 0;

    return {
      oldRecord,
      newRecord,
      oldValue: prettyValue(log?.oldValue),
      newValue: prettyValue(log?.newValue),
      fields,
      fieldChanges,
      visibleFields,
      changedCount,
      unchangedCount,
      hasNoDetectedUpdateDiff,
      summary,
    };
  }, [log]);

  return (
    <div className="account-root account-page">
      <div className="account-shell max-w-5xl">
        <button className="account-btn secondary mb-4" onClick={() => (returnTo ? navigate(returnTo) : navigate(-1))}>
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <header className="account-hero app-soft-hero">
          <div>
            <span className="account-kicker">
              <FileText className="w-3.5 h-3.5" />
              Audit trail
            </span>
            <h1 className="account-title">Audit log details</h1>
            <p className="account-subtitle">Inspect the actor, timestamp, entity key, and before/after payload for this recorded change.</p>
          </div>
          {log && (
            <div className="account-hero-meta">
              <div className="account-meta-tile">
                <div className="account-meta-label">Action</div>
                <div className="account-meta-value">{log.action || "Action"}</div>
              </div>
              <div className="account-meta-tile">
                <div className="account-meta-label">Entity</div>
                <div className="account-meta-value">{log.entityName || "-"}</div>
              </div>
              <div className="account-meta-tile">
                <div className="account-meta-label">Log ID</div>
                <div className="account-meta-value">{log.id || id}</div>
              </div>
            </div>
          )}
        </header>

        {!log ? (
          <div className="account-card mt-5">
            <div className="account-empty app-context-panel">
              <div className="account-empty-icon"><FileText className="w-5 h-5" /></div>
              <div className="account-empty-title">Audit log not available</div>
              <div className="account-empty-copy">Open audit details from the Settings audit table. The backend does not expose a single-record audit endpoint yet.</div>
            </div>
          </div>
        ) : (
          <main className="account-stack mt-5">
            <div className="account-grid-3">
              <DetailItem icon={User} label="Performed by" value={log.userName || log.userId} />
              <DetailItem icon={Calendar} label="Timestamp" value={formatDate(log.createdAt)} />
              <DetailItem icon={Database} label="Primary key" value={log.entityPrimaryKey} />
            </div>

            <div className="account-card">
              <div className="account-card-head">
                <div>
                  <div className="account-card-title">{log.entityName || "Entity change"}</div>
                  <div className="account-card-copy">Recorded system change</div>
                </div>
                <span className={`account-pill ${actionPill(log.action)}`}>{log.action || "Action"}</span>
              </div>
              <div className="account-card-body">
                {values.fields.length > 0 ? (
                  <div className="audit-change-card">
                    <div className="audit-change-intro">
                      <div>
                        <div className="audit-change-title">{values.summary.title}</div>
                        <div className="audit-change-copy">
                          {values.hasNoDetectedUpdateDiff
                            ? "This audit was recorded as an update, but the previous and new snapshots are identical."
                            : values.summary.copy}
                        </div>
                      </div>
                      <span className={`account-pill ${actionPill(log.action)}`}>{log.action || "Action"}</span>
                    </div>

                    {values.summary.mode === "update" && (
                      <div className={`audit-diff-summary ${values.hasNoDetectedUpdateDiff ? "warning" : ""}`}>
                        {values.hasNoDetectedUpdateDiff ? (
                          <>
                            <span>Update recorded</span>
                            <span>Previous values unavailable</span>
                          </>
                        ) : (
                          <>
                            <span>{countLabel(values.changedCount, "field")} changed</span>
                            <span>{countLabel(values.unchangedCount, "field")} unchanged hidden</span>
                          </>
                        )}
                      </div>
                    )}

                    {values.visibleFields.length > 0 ? (
                      <div className={`audit-field-table ${values.summary.mode}`}>
                        <div className="audit-field-head">
                          <span>{values.summary.mode === "update" ? "Changed field" : "Field"}</span>
                          {values.summary.mode !== "create" && <span>Previous value</span>}
                          {values.summary.mode !== "delete" && <span>New value</span>}
                        </div>
                        {values.visibleFields.map(({ field, oldValue, newValue, changed }) => (
                          <div className={`audit-field-row ${changed ? "changed" : ""}`} key={field}>
                            <div className="audit-field-name">{fieldLabel(field)}</div>
                            {values.summary.mode !== "create" && (
                              <div className="audit-field-value audit-field-old">{formatAuditValue(oldValue)}</div>
                            )}
                            {values.summary.mode !== "delete" && (
                              <div className="audit-field-value audit-field-new">{formatAuditValue(newValue)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`audit-no-diff ${values.hasNoDetectedUpdateDiff ? "warning" : ""}`}>
                        <div className="audit-no-diff-title">
                          {values.hasNoDetectedUpdateDiff ? "Previous value was not captured" : "No field-level changes detected"}
                        </div>
                        <div className="audit-no-diff-copy">
                          {values.hasNoDetectedUpdateDiff
                            ? "The backend marked this record as updated, but sent the after-state as both the previous and new value. The actual old value cannot be highlighted from this audit payload."
                            : "This update log contains before and after payloads, but every comparable field has the same value."}
                        </div>
                      </div>
                    )}

                    {values.summary.mode === "update" && values.unchangedCount > 0 && (
                      <details className="audit-raw-details audit-unchanged-details">
                        <summary>{values.hasNoDetectedUpdateDiff ? "Show captured fields" : "Show unchanged fields"}</summary>
                        <div className="audit-field-table update mt-4">
                          <div className="audit-field-head">
                            <span>Field</span>
                            <span>Previous value</span>
                            <span>New value</span>
                          </div>
                          {values.fieldChanges.filter((field) => !field.changed).map(({ field, oldValue, newValue }) => (
                            <div className="audit-field-row muted" key={field}>
                              <div className="audit-field-name">{fieldLabel(field)}</div>
                              <div className="audit-field-value">{formatAuditValue(oldValue)}</div>
                              <div className="audit-field-value">{formatAuditValue(newValue)}</div>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ) : (
                  <div className="audit-change-card">
                    <div className="audit-change-intro">
                      <div>
                        <div className="audit-change-title">{values.summary.title}</div>
                        <div className="audit-change-copy">This change was recorded as an unstructured payload.</div>
                      </div>
                    </div>
                    <details className="audit-raw-details">
                      <summary>View raw payload</summary>
                      <div className="account-grid-2 mt-4">
                        <div>
                          <div className="account-label">Old value</div>
                          <pre className="account-code">{values.oldValue}</pre>
                        </div>
                        <div>
                          <div className="account-label">New value</div>
                          <pre className="account-code">{values.newValue}</pre>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
