import { createElement, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Building2,
  Check,
  Clock,
  Edit2,
  IdCard,
  Loader2,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const PROFILE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  .profile-root {
    font-family: 'DM Sans', sans-serif;
    color: #1a1a18;
    width: 100%;
    max-width: 1240px;
    margin: 0 auto;
  }

  .profile-shell {
    display: block;
  }

  .profile-hero {
    position: relative;
    overflow: hidden;
    min-height: 206px;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,.08);
    background:
      linear-gradient(135deg, rgba(15,140,90,.09), rgba(255,255,255,0) 58%),
      #fff;
    padding: 22px;
    color: #1a1a18;
  }

  .profile-hero::after {
    content: "";
    position: absolute;
    right: 24px;
    bottom: 0;
    width: 168px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(15,140,90,0), rgba(15,140,90,.36));
  }

  .profile-hero-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    position: relative;
    z-index: 1;
  }

  .profile-identity {
    display: flex;
    align-items: center;
    gap: 18px;
    min-width: 0;
  }

  .profile-avatar {
    width: 68px;
    height: 68px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: .5px;
    box-shadow: inset 0 0 0 1px rgba(15,140,90,.1), 0 12px 28px rgba(15,23,42,.07);
    flex: 0 0 auto;
  }

  .profile-avatar-admin {
    background: #f1ebff;
    color: #5b21b6;
  }

  .profile-avatar-manager {
    background: #e8f0ff;
    color: #1d4ed8;
  }

  .profile-avatar-staff {
    background: #d6f5e8;
    color: #0a6b45;
  }

  .profile-kicker {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 9px;
    padding: 5px 10px;
    border-radius: 999px;
    background: #e9f8f1;
    color: #0a6b45;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .4px;
    text-transform: uppercase;
  }

  .profile-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(28px, 4.4vw, 36px);
    line-height: 1;
    letter-spacing: 0;
    margin: 0;
    max-width: 620px;
  }

  .profile-subtitle {
    color: #66706a;
    font-size: 13px;
    line-height: 1.6;
    margin: 10px 0 0;
    max-width: 620px;
  }

  .profile-hero-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .profile-role-chip,
  .profile-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 34px;
    padding: 7px 11px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: #424a45;
    border: 1px solid rgba(0,0,0,.1);
    background: rgba(255,255,255,.72);
    white-space: nowrap;
  }

  .profile-status-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: #5de0a5;
    box-shadow: 0 0 0 4px rgba(15,140,90,.1);
  }

  .profile-hero-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 22px;
    position: relative;
    z-index: 1;
  }

  .profile-hero-tile {
    min-height: 66px;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid rgba(15,140,90,.1);
    background: rgba(255,255,255,.72);
  }

  .profile-tile-label {
    color: #858b84;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .5px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .profile-tile-value {
    color: #1a1a18;
    font-size: 13px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .profile-card {
    background: #fff;
    border: 1px solid rgba(0,0,0,.07);
    border-radius: 16px;
    overflow: hidden;
  }

  .profile-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }

  .profile-card-title {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 14px;
    font-weight: 600;
  }

  .profile-card-title svg {
    color: #0f8c5a;
  }

  .profile-card-body {
    padding: 16px 18px 18px;
  }

  .profile-contact-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .profile-info-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-height: 74px;
    padding: 12px 14px;
    border-radius: 14px;
    background: #f8faf7;
    border: 1px solid rgba(0,0,0,.05);
  }

  .profile-info-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }

  .profile-tone-green {
    background: #d6f5e8;
    color: #0a6b45;
  }

  .profile-tone-blue {
    background: #e8f0ff;
    color: #2563eb;
  }

  .profile-tone-amber {
    background: #fef3c7;
    color: #b45309;
  }

  .profile-tone-purple {
    background: #f1ebff;
    color: #7c3aed;
  }

  .profile-tone-red {
    background: #fde8e8;
    color: #c2410c;
  }

  .profile-tone-gray {
    background: #f0f3ef;
    color: #7b837d;
  }

  .profile-info-label {
    color: #858b84;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .5px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  .profile-info-value {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a18;
    overflow-wrap: anywhere;
  }

  .profile-main-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .profile-activity-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .profile-activity-item {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    gap: 12px;
    padding: 12px;
    border: 1px solid rgba(0,0,0,.055);
    border-radius: 13px;
    background: #f8faf7;
    align-items: flex-start;
  }

  .profile-activity-item:first-child {
    border-top: 1px solid rgba(0,0,0,.055);
  }

  .profile-activity-dot {
    width: 32px;
    height: 32px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .profile-activity-title {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a18;
  }

  .profile-activity-copy {
    color: #666;
    font-size: 12px;
    margin-top: 3px;
    line-height: 1.45;
  }

  .profile-activity-time {
    color: #969b95;
    font-size: 11px;
    white-space: nowrap;
    padding-top: 2px;
  }


  .profile-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 38px;
    padding: 8px 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background .15s, border-color .15s, color .15s, opacity .15s;
  }

  .profile-button-primary {
    border: 1px solid rgba(93,224,165,.28);
    background: #0f8c5a;
    color: #fff;
  }

  .profile-button-primary:hover {
    background: #0a6b45;
  }

  .profile-button-secondary {
    border: 1px solid rgba(0,0,0,.11);
    background: #fff;
    color: #333;
  }

  .profile-button-secondary:hover {
    background: #f5f6f3;
  }

  .profile-button-ghost {
    border: 1px solid rgba(15,140,90,.18);
    background: #0f8c5a;
    color: #fff;
  }

  .profile-button-ghost:hover {
    background: #0a6b45;
  }

  .profile-button:disabled {
    opacity: .65;
    cursor: not-allowed;
  }

  .profile-empty {
    min-height: 176px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #858b84;
    padding: 24px;
  }

  .profile-empty-icon {
    width: 42px;
    height: 42px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
  }

  .profile-empty-title {
    font-size: 13px;
    font-weight: 600;
    color: #555;
  }

  .profile-empty-copy {
    font-size: 12px;
    margin-top: 4px;
    max-width: 280px;
  }

  .profile-skeleton {
    border-radius: 12px;
    background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%);
    background-size: 200% 100%;
    animation: profileShimmer 1.4s infinite;
  }

  .profile-fade-in {
    animation: profileFadeIn .38s ease both;
  }

  @keyframes profileShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  @keyframes profileFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .profile-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    background: rgba(17,22,20,.52);
  }

  .profile-modal {
    width: min(100%, 460px);
    border-radius: 18px;
    background: #fff;
    box-shadow: 0 24px 80px rgba(0,0,0,.22);
    overflow: hidden;
  }

  .profile-modal-head,
  .profile-modal-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 18px 20px;
    border-bottom: 1px solid rgba(0,0,0,.06);
  }

  .profile-modal-foot {
    border-bottom: 0;
    border-top: 1px solid rgba(0,0,0,.06);
    justify-content: flex-end;
  }

  .profile-modal-title {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    line-height: 1.1;
    margin: 0;
  }

  .profile-modal-copy {
    margin: 4px 0 0;
    color: #777;
    font-size: 13px;
  }

  .profile-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px;
  }

  .profile-field label {
    display: block;
    margin-bottom: 6px;
    color: #777;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: .5px;
    text-transform: uppercase;
  }

  .profile-input {
    width: 100%;
    min-height: 42px;
    border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px;
    padding: 9px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: #1a1a18;
    outline: none;
    box-sizing: border-box;
  }

  .profile-input:focus {
    border-color: #0f8c5a;
    box-shadow: 0 0 0 3px rgba(15,140,90,.1);
  }

  .profile-error {
    border-radius: 12px;
    background: #fde8e8;
    color: #9b1c1c;
    font-size: 13px;
    padding: 10px 12px;
  }

  @media (max-width: 780px) {
    .profile-hero,
    .profile-card-body {
      padding: 18px;
    }

    .profile-hero-top,
    .profile-identity {
      flex-direction: column;
      align-items: flex-start;
    }

    .profile-hero-actions {
      justify-content: flex-start;
    }

    .profile-hero-grid,
    .profile-contact-grid {
      grid-template-columns: 1fr;
    }

    .profile-activity-item {
      grid-template-columns: 34px minmax(0, 1fr);
    }

    .profile-activity-time {
      grid-column: 2;
      padding-top: 0;
    }

  }

  :root[data-theme="dark"] .profile-tone-green {
    background: rgba(47, 186, 120, .105);
    color: #8be6b6;
    box-shadow: inset 0 0 0 1px rgba(47, 186, 120, .1);
  }

  :root[data-theme="dark"] .profile-tone-blue {
    background: rgba(96, 165, 250, .105);
    color: #9bc6fb;
    box-shadow: inset 0 0 0 1px rgba(96, 165, 250, .1);
  }

  :root[data-theme="dark"] .profile-tone-amber {
    background: rgba(245, 158, 11, .11);
    color: #e8c486;
    box-shadow: inset 0 0 0 1px rgba(245, 158, 11, .1);
  }

  :root[data-theme="dark"] .profile-tone-purple {
    background: rgba(168, 85, 247, .105);
    color: #c7b1e6;
    box-shadow: inset 0 0 0 1px rgba(168, 85, 247, .1);
  }

  :root[data-theme="dark"] .profile-tone-red {
    background: rgba(239, 68, 68, .11);
    color: #f2aaa8;
    box-shadow: inset 0 0 0 1px rgba(239, 68, 68, .1);
  }

  :root[data-theme="dark"] .profile-tone-gray {
    background: rgba(238, 242, 239, .075);
    color: #b9c0bb;
    box-shadow: inset 0 0 0 1px rgba(238, 242, 239, .08);
  }

  :root[data-theme="dark"] .profile-avatar-admin {
    background: rgba(168, 85, 247, .12);
    color: #d7c2ff;
    box-shadow: inset 0 0 0 1px rgba(168, 85, 247, .15), 0 14px 28px rgba(0, 0, 0, .24);
  }

  :root[data-theme="dark"] .profile-avatar-manager {
    background: rgba(96, 165, 250, .12);
    color: #bdd8ff;
    box-shadow: inset 0 0 0 1px rgba(96, 165, 250, .14), 0 14px 28px rgba(0, 0, 0, .24);
  }

  :root[data-theme="dark"] .profile-avatar-staff {
    background: rgba(47, 186, 120, .12);
    color: #9feac0;
    box-shadow: inset 0 0 0 1px rgba(47, 186, 120, .14), 0 14px 28px rgba(0, 0, 0, .24);
  }

  :root[data-theme="dark"] .profile-activity-item {
    background: rgba(238, 242, 239, .035) !important;
    border: 1px solid rgba(238, 242, 239, .075) !important;
  }

  :root[data-theme="dark"] .profile-activity-item:hover {
    background: rgba(238, 242, 239, .052) !important;
  }
`;

const ACTIVITY_PREVIEW_SIZE = 5;

const ROLE_CONFIG = {
  1: {
    label: "Admin",
    accent: "#7c3aed",
    soft: "#f1ebff",
    text: "#5b21b6",
  },
  2: {
    label: "Manager",
    accent: "#2563eb",
    soft: "#e8f0ff",
    text: "#1d4ed8",
  },
  3: {
    label: "Staff",
    accent: "#0f8c5a",
    soft: "#d6f5e8",
    text: "#0a6b45",
  },
};

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function roleToId(role) {
  if (typeof role === "number") return role;
  const normalized = String(role || "").toLowerCase();
  if (normalized === "admin") return 1;
  if (normalized === "manager") return 2;
  return 3;
}

function resolveRole(role) {
  return ROLE_CONFIG[roleToId(role)] || ROLE_CONFIG[3];
}

function roleAvatarClass(role) {
  const roleId = roleToId(role);
  if (roleId === 1) return "profile-avatar-admin";
  if (roleId === 2) return "profile-avatar-manager";
  return "profile-avatar-staff";
}

function initialsFor(name) {
  return String(name || "User")
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function formatAuditTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function toneForAction(action) {
  const normalized = String(action || "").toLowerCase();
  if (normalized.includes("delete") || normalized.includes("remove") || normalized.includes("out")) {
    return "red";
  }
  if (normalized.includes("update") || normalized.includes("edit") || normalized.includes("modify")) {
    return "blue";
  }
  if (normalized.includes("report") || normalized.includes("generate")) {
    return "amber";
  }
  return "green";
}

function normaliseAudit(entry) {
  const action = entry.action ?? entry.actionName ?? entry.eventType ?? entry.type ?? "Workspace activity";
  return {
    id: entry.id ?? entry.auditId ?? `${action}-${entry.createdAt ?? entry.timestamp ?? Math.random()}`,
    action,
    detail: entry.description ?? entry.detail ?? entry.details ?? entry.message ?? entry.entityName ?? "",
    time: entry.createdAt ?? entry.timestamp ?? entry.date ?? entry.actionDate ?? null,
  };
}

function InfoItem({ icon, label, value, tone = "green" }) {
  return (
    <div className="profile-info-item">
      <div className={`profile-info-icon profile-tone-${tone}`}>
        {createElement(icon, { size: 18 })}
      </div>
      <div>
        <div className="profile-info-label">{label}</div>
        <div className="profile-info-value">{value || "-"}</div>
      </div>
    </div>
  );
}

function SkeletonBlock({ height = 20, width = "100%", radius = 12 }) {
  return <div className="profile-skeleton" style={{ height, width, borderRadius: radius }} />;
}

function EditProfileModal({ profile, onClose }) {
  const [form, setForm] = useState({
    name: profile?.name || "",
    email: profile?.email || "",
    phoneNumber: profile?.phoneNumber === "-" ? "" : profile?.phoneNumber || "",
  });
  const saving = false;
  const error = "Profile editing is not available yet because the backend does not expose an update-profile endpoint.";

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
      <div className="profile-modal profile-fade-in">
        <div className="profile-modal-head">
          <div>
            <h2 className="profile-modal-title" id="edit-profile-title">Edit Profile</h2>
            <p className="profile-modal-copy">Keep your account details current.</p>
          </div>
          <button className="profile-button profile-button-secondary" onClick={onClose} aria-label="Close edit profile">
            <X size={16} />
          </button>
        </div>

        <div className="profile-form">
          <div className="profile-field">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              className="profile-input"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your full name"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">Email address</label>
            <input
              id="profile-email"
              className="profile-input"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@company.com"
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-phone">Phone number</label>
            <input
              id="profile-phone"
              className="profile-input"
              type="tel"
              value={form.phoneNumber}
              onChange={(event) => setForm((current) => ({ ...current, phoneNumber: event.target.value }))}
              placeholder="+971-50-000-0000"
            />
          </div>

          {error && <div className="profile-error">{error}</div>}
        </div>

        <div className="profile-modal-foot">
          <button className="profile-button profile-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="profile-button profile-button-primary" disabled>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? "Saving" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, can } = useAuth();
  const [profile, setProfile] = useState(null);
  const [audits, setAudits] = useState([]);
  const [auditTotalCount, setAuditTotalCount] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const canOpenAuditTrail = can("view_audit_logs");

  useEffect(() => {
    let active = true;

    fetch("/api/BusinessCore/Get-Profile", { headers: authHeaders() })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setProfile(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    fetch(`/api/AuditLogs/Get-Audits-User?Page=1&Page_Size=${ACTIVITY_PREVIEW_SIZE}`, { headers: authHeaders() })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const items = data?.data ?? data ?? [];
        if (active) {
          const totalCount = data?.totalCount ?? (Array.isArray(items) ? items.length : 0);
          setAudits(Array.isArray(items) ? items.slice(0, ACTIVITY_PREVIEW_SIZE).map(normaliseAudit) : []);
          setAuditTotalCount(totalCount);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingAudits(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const display = useMemo(() => {
    const role = profile?.role ?? currentUser?.role;
    return {
      name: profile?.name ?? currentUser?.name ?? "User",
      email: profile?.email ?? currentUser?.email ?? "-",
      phone: profile?.phoneNumber || currentUser?.phoneNumber || "-",
      userId: profile?.userId ?? currentUser?.id ?? "-",
      companyId: profile?.companyId ?? currentUser?.companyId ?? "-",
      branchId: profile?.branchId ?? currentUser?.branchId ?? "-",
      role,
      roleConfig: resolveRole(role),
    };
  }, [currentUser, profile]);

  const heroTiles = [
    { label: "Email", value: display.email },
    { label: "Company ID", value: display.companyId },
    { label: "Branch", value: display.branchId === "-" ? "Current branch" : `Branch ${display.branchId}` },
  ];

  return (
    <div className="profile-root profile-main-stack">
      <style>{PROFILE_STYLES}</style>

      <section className="profile-hero profile-fade-in">
        <div className="profile-hero-top">
          {loadingProfile ? (
            <div className="profile-identity" style={{ width: "100%" }}>
              <SkeletonBlock width={86} height={86} radius={22} />
              <div style={{ flex: 1, maxWidth: 520 }}>
                <SkeletonBlock width={130} height={14} />
                <div style={{ height: 12 }} />
                <SkeletonBlock width="70%" height={44} />
                <div style={{ height: 12 }} />
                <SkeletonBlock width="88%" height={16} />
              </div>
            </div>
          ) : (
            <>
              <div className="profile-identity">
                <div className={`profile-avatar ${roleAvatarClass(display.role)}`}>
                  {initialsFor(display.name)}
                </div>
                <div>
                  <div className="profile-kicker">
                    <Sparkles size={13} />
                    Account profile
                  </div>
                  <h1 className="profile-title">{display.name}</h1>
                  <p className="profile-subtitle">
                    Your personal workspace identity, contact details, access level, and latest account activity in one place.
                  </p>
                </div>
              </div>

              <div className="profile-hero-actions">
                <span className="profile-status-chip">
                  <span className="profile-status-dot" />
                  Active
                </span>
                <span className="profile-role-chip">
                  <Shield size={14} />
                  {display.roleConfig.label}
                </span>
                <button className="profile-button profile-button-ghost" onClick={() => setShowEdit(true)}>
                  <Edit2 size={15} />
                  Edit
                </button>
              </div>
            </>
          )}
        </div>

        <div className="profile-hero-grid">
          {loadingProfile
            ? [1, 2, 3].map((item) => (
                <div className="profile-hero-tile" key={item}>
                  <SkeletonBlock height={12} width="45%" />
                  <div style={{ height: 12 }} />
                  <SkeletonBlock height={18} width="72%" />
                </div>
              ))
            : heroTiles.map((tile) => (
                <div className="profile-hero-tile" key={tile.label}>
                  <div className="profile-tile-label">{tile.label}</div>
                  <div className="profile-tile-value">{tile.value}</div>
                </div>
              ))}
        </div>
      </section>

      <div className="profile-shell">
        <div className="profile-main-stack">
          <section className="profile-card profile-fade-in" style={{ animationDelay: ".05s" }}>
            <div className="profile-card-header">
              <div className="profile-card-title">
                <UserIcon size={17} />
                Personal information
              </div>
              <button className="profile-button profile-button-secondary" onClick={() => setShowEdit(true)}>
                <Edit2 size={15} />
                Edit details
              </button>
            </div>
            <div className="profile-card-body">
              {loadingProfile ? (
                <div className="profile-contact-grid">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <SkeletonBlock key={item} height={86} />
                  ))}
                </div>
              ) : (
                <div className="profile-contact-grid">
                  <InfoItem icon={Mail} label="Email address" value={display.email} tone="blue" />
                  <InfoItem icon={Phone} label="Phone number" value={display.phone} tone="amber" />
                  <InfoItem icon={IdCard} label="User ID" value={display.userId} tone="green" />
                  <InfoItem icon={Building2} label="Company ID" value={display.companyId} tone="purple" />
                </div>
              )}
            </div>
          </section>

          <section className="profile-card profile-fade-in" style={{ animationDelay: ".1s" }}>
            <div className="profile-card-header">
              <div className="profile-card-title">
                <Activity size={17} />
                My recent activity
              </div>
              {canOpenAuditTrail ? (
                <button className="profile-button profile-button-secondary" onClick={() => navigate("/settings?tab=audit")}>
                  Open audit trail
                </button>
              ) : (
                <span style={{ color: "var(--app-subtle)", fontSize: 12 }}>
                  Latest {audits.length}
                </span>
              )}
            </div>
            <div className="profile-card-body">
              {loadingAudits ? (
                <div className="profile-main-stack">
                  {[1, 2, 3, 4].map((item) => (
                    <SkeletonBlock key={item} height={58} />
                  ))}
                </div>
              ) : audits.length === 0 ? (
                <div className="profile-empty app-context-panel">
                  <div className="profile-empty-icon profile-tone-gray">
                    <Clock size={18} />
                  </div>
                  <div className="profile-empty-title">No recent activity found</div>
                  <div className="profile-empty-copy">Activity related to your account will appear here.</div>
                </div>
              ) : (
                <>
                  <div className="profile-activity-list">
                    {audits.map((audit) => {
                      const tone = toneForAction(audit.action);
                      return (
                        <div className="profile-activity-item" key={audit.id}>
                          <div className={`profile-activity-dot profile-tone-${tone}`}>
                            <Activity size={15} />
                          </div>
                          <div>
                            <div className="profile-activity-title">{audit.action}</div>
                            {audit.detail && <div className="profile-activity-copy">{audit.detail}</div>}
                          </div>
                          <div className="profile-activity-time">{formatAuditTime(audit.time)}</div>
                        </div>
                      );
                    })}
                  </div>
                  {auditTotalCount > audits.length && (
                    <div style={{ color: "var(--app-muted)", fontSize: 12, marginTop: 14 }}>
                      Showing the latest {audits.length} personal events.
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      {showEdit && (
        <EditProfileModal
          profile={{ name: display.name, email: display.email, phoneNumber: display.phone }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
