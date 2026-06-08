import {
  Mail,
  Edit2,
  User as UserIcon,
  Shield,
  IdCard,
  X,
  Check,
  Loader2,
  Clock,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

// ============================
// Design system styles
// ============================
const PROFILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .profile-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); display: flex; align-items: center; justify-content: space-between; }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
  .db-input {
    width: 100%; padding: 9px 14px;
    background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s;
    box-sizing: border-box;
  }
  .db-input:focus { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .db-skeleton { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:10px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

// ── helpers ────────────────────────────────────────────────────────────────
function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}
const authHeaders = () => ({
  "Content-Type": "application/json",
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

function formatAuditTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

// Audit log entries can come with various field names; this normalises them
function normaliseAudit(entry) {
  return {
    id: entry.id ?? entry.auditId ?? Math.random(),
    action: entry.action ?? entry.actionName ?? entry.eventType ?? entry.type ?? "Action",
    detail: entry.description ?? entry.detail ?? entry.details ?? entry.message ?? entry.entityName ?? "",
    time: entry.createdAt ?? entry.timestamp ?? entry.date ?? entry.actionDate ?? null,
    // pick a dot colour by action keyword
    color: (() => {
      const a = (entry.action ?? entry.actionName ?? entry.eventType ?? "").toLowerCase();
      if (a.includes("add") || a.includes("create") || a.includes("stock in")) return "#0f8c5a";
      if (a.includes("delete") || a.includes("remove") || a.includes("out")) return "#ef4444";
      if (a.includes("update") || a.includes("edit") || a.includes("modify")) return "#3b82f6";
      if (a.includes("report") || a.includes("generate")) return "#f59e0b";
      return "#8b5cf6";
    })(),
  };
}

// ── role config ────────────────────────────────────────────────────────────
const roleConfig = {
  1: { // admin
    avatarGradient: "from-purple-500 to-purple-700",
    roleLabel: "Admin",
    roleBadge: "bg-purple-100 text-purple-700 border-purple-200",
    roleIcon: "text-purple-600",
    roleIconBg: "bg-purple-100",
  },
  2: { // manager
    avatarGradient: "from-blue-500 to-blue-700",
    roleLabel: "Manager",
    roleBadge: "bg-blue-100 text-blue-700 border-blue-200",
    roleIcon: "text-blue-600",
    roleIconBg: "bg-blue-100",
  },
  3: { // staff
    avatarGradient: "from-green-500 to-green-700",
    roleLabel: "Staff",
    roleBadge: "bg-green-100 text-green-700 border-green-200",
    roleIcon: "text-green-600",
    roleIconBg: "bg-green-100",
  },
};

// Also support string role names from currentUser.role
function resolveConfig(role) {
  if (typeof role === "number") return roleConfig[role] ?? roleConfig[3];
  const map = { admin: roleConfig[1], manager: roleConfig[2], staff: roleConfig[3] };
  return map[String(role).toLowerCase()] ?? roleConfig[3];
}

// ── Edit Profile Modal ─────────────────────────────────────────────────────
function EditProfileModal({ profile, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: profile?.name ?? "",
    email: profile?.email ?? "",
    phoneNumber: profile?.phoneNumber ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      // PUT endpoint — replace with actual endpoint when available
      const res = await fetch("/api/BusinessCore/Update-Profile", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      onSaved(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.45)" }}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl db-fade-in"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#1a1a18" }}>
              Edit Profile
            </h2>
            <p style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
              Update your personal information
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "none",
              background: "#f5f6f3", display: "flex", alignItems: "center",
              justifyContent: "center", cursor: "pointer",
            }}
          >
            <X size={16} color="#666" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>
              Full Name
            </label>
            <input
              className="db-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>
              Email Address
            </label>
            <input
              className="db-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#888", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>
              Phone Number
            </label>
            <input
              className="db-input"
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              placeholder="+971-50-000-0000"
            />
          </div>

          {error && (
            <div style={{ fontSize: 13, color: "#ef4444", padding: "8px 12px", background: "#fde8e8", borderRadius: 10 }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button className="db-secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="db-primary-btn" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ProfilePage ───────────────────────────────────────────────────────
export function ProfilePage() {
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  // Fetch profile from API
  useEffect(() => {
    fetch("/api/BusinessCore/Get-Profile", { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, []);

  // Fetch audit logs (user-scoped)
  useEffect(() => {
    fetch("/api/AuditLogs/Get-Audits-User?pageNumber=1&pageSize=8", {
      headers: authHeaders(),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const items = data?.data ?? data ?? [];
        setAudits(Array.isArray(items) ? items.map(normaliseAudit) : []);
      })
      .catch(() => {})
      .finally(() => setLoadingAudits(false));
  }, []);

  // Resolve display values — prefer live API data, fall back to Auth context
  const displayName = profile?.name ?? currentUser?.name ?? "—";
  const displayEmail = profile?.email ?? currentUser?.email ?? "—";
  const displayPhone = profile?.phoneNumber || "—";
  const displayUserId = profile?.userId ?? currentUser?.id ?? "—";
  const displayCompanyId = currentUser?.companyId ?? "—";
  const role = profile?.role ?? currentUser?.role;
  const config = resolveConfig(role);

  const handleSaved = (updated) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  return (
    <div className="profile-root space-y-6">
      <style>{PROFILE_STYLES}</style>

      <h1 className="db-section-title">Profile</h1>

      {/* ── Personal Information ── */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Personal Information</span>
        </div>
        <div className="p-6">
          {loadingProfile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div className="db-skeleton" style={{ width: 80, height: 80, borderRadius: "50%" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="db-skeleton" style={{ height: 22, width: 180 }} />
                <div className="db-skeleton" style={{ height: 14, width: 100 }} />
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${config.avatarGradient} flex items-center justify-center flex-shrink-0`}
                >
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: "#1a1a18", marginBottom: 4 }}>
                    {displayName}
                  </h2>
                  <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
                    {config.roleLabel}
                  </p>
                  <span className="db-stat-pill pill-green">Active</span>
                </div>
              </div>
              <button className="db-secondary-btn" onClick={() => setShowEdit(true)}>
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Account Information ── */}
      <div className="db-card db-fade-in" style={{ animationDelay: ".05s" }}>
        <div className="db-card-header">
          <span className="db-card-title">Account Information</span>
        </div>
        <div className="p-6">
          {loadingProfile ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="db-skeleton" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="db-skeleton" style={{ height: 11, width: 80, marginBottom: 6 }} />
                    <div className="db-skeleton" style={{ height: 14, width: 140 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".4px", fontWeight: 500 }}>
                    Email Address
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18" }}>{displayEmail}</div>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <IdCard className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".4px", fontWeight: 500 }}>
                    Phone Number
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18" }}>{displayPhone}</div>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#0f8c5a]/10 flex items-center justify-center flex-shrink-0">
                  <IdCard className="w-5 h-5 text-[#0f8c5a]" />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".4px", fontWeight: 500 }}>
                    User ID
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18" }}>{displayUserId || "—"}</div>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full ${config.roleIconBg} flex items-center justify-center flex-shrink-0`}>
                  <Shield className={`w-5 h-5 ${config.roleIcon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 3, textTransform: "uppercase", letterSpacing: ".4px", fontWeight: 500 }}>
                    Role
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.roleBadge}`}
                  >
                    {config.roleLabel}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity (Audit Logs) ── */}
      <div className="db-card db-fade-in" style={{ animationDelay: ".1s" }}>
        <div className="db-card-header">
          <span className="db-card-title">Recent Activity</span>
          <Activity size={15} color="#888" />
        </div>
        <div className="p-6">
          {loadingAudits ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="db-skeleton" style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="db-skeleton" style={{ height: 13, width: "60%", marginBottom: 6 }} />
                    <div className="db-skeleton" style={{ height: 11, width: "80%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : audits.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#888", fontSize: 13 }}>
              <Clock size={28} color="#ccc" style={{ margin: "0 auto 8px" }} />
              No recent activity found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {audits.map((audit, index) => (
                <div key={audit.id ?? index} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div
                    style={{
                      width: 8, height: 8, borderRadius: "50%", marginTop: 5,
                      flexShrink: 0, background: audit.color,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18" }}>
                      {audit.action}
                    </div>
                    {audit.detail && (
                      <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{audit.detail}</div>
                    )}
                    {audit.time && (
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>
                        {formatAuditTime(audit.time)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {showEdit && (
        <EditProfileModal
          profile={{ name: displayName, email: displayEmail, phoneNumber: displayPhone }}
          onClose={() => setShowEdit(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}