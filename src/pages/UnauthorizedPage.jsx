import { ArrowLeft, Home, LockKeyhole, ShieldOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRoleLabel } from "../config/permissions";
import { useAuth } from "../contexts/AuthContext";

const UNAUTHORIZED_STYLES = `
  .unauthorized-root {
    font-family: 'DM Sans', sans-serif;
    color: var(--app-ink);
    width: calc(100% + 64px);
    min-height: calc(100vh - 65px);
    margin: -32px;
    background:
      radial-gradient(circle at 50% 22%, rgba(15, 140, 90, .105), rgba(15, 140, 90, 0) 34%),
      linear-gradient(180deg, var(--app-panel) 0, rgba(255, 255, 255, 0) 210px),
      var(--app-page);
  }
  .unauthorized-shell {
    min-height: inherit;
    width: 100%;
  }
  .unauthorized-panel {
    min-height: inherit;
    background: transparent;
    position: relative;
    overflow: hidden;
  }
  .unauthorized-main {
    position: relative;
    z-index: 1;
    min-height: inherit;
    padding: clamp(42px, 7vw, 88px) 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    max-width: 1080px;
    margin: 0 auto;
  }
  .unauthorized-illustration {
    width: min(360px, 72vw);
    color: rgba(15, 140, 90, .18);
    margin-bottom: 26px;
  }
  .unauthorized-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--app-panel);
    color: #b91c1c;
    border: 1px solid rgba(185, 28, 28, .16);
    box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
    margin-bottom: 16px;
  }
  .unauthorized-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    padding: 6px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--app-panel) 78%, transparent);
    border: 1px solid rgba(15, 140, 90, .14);
    color: var(--app-green-dark);
    font-size: 12px;
    font-weight: 700;
    margin-bottom: 18px;
  }
  .unauthorized-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(34px, 4.2vw, 58px);
    font-weight: 500;
    line-height: 1.08;
    margin: 0;
    letter-spacing: 0;
    max-width: 24ch;
    text-wrap: balance;
  }
  .unauthorized-copy {
    color: var(--app-muted);
    font-size: 15px;
    line-height: 1.7;
    max-width: 56ch;
    margin: 18px 0 0;
    text-wrap: pretty;
  }
  .unauthorized-meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 24px;
  }
  .unauthorized-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-top: 30px;
  }
  @media (max-width: 860px) {
    .unauthorized-root { min-height: calc(100vh - 65px); }
    .unauthorized-main { min-height: 62vh; padding: 36px 24px; }
    .unauthorized-title { font-size: 34px; max-width: 20ch; }
  }
  :root[data-theme="dark"] .unauthorized-root {
    background:
      radial-gradient(circle at 50% 22%, rgba(47, 186, 120, .055), rgba(47, 186, 120, 0) 34%),
      linear-gradient(180deg, rgba(18, 24, 21, .96) 0, rgba(18, 24, 21, 0) 230px),
      var(--app-page);
  }
  :root[data-theme="dark"] .unauthorized-illustration {
    color: rgba(47, 186, 120, .1);
  }
  :root[data-theme="dark"] .unauthorized-icon {
    background: var(--app-panel-raised);
    color: var(--app-danger-text);
    border-color: rgba(239, 68, 68, .28);
    box-shadow: none;
  }
  :root[data-theme="dark"] .unauthorized-kicker {
    background: var(--app-panel-raised);
    border-color: var(--app-line);
    color: var(--app-success-text);
  }
  @media (max-width: 640px) {
    .unauthorized-shell { padding: 0; }
    .unauthorized-title { font-size: 31px; }
    .unauthorized-actions .db-secondary-btn,
    .unauthorized-actions .db-primary-btn {
      width: 100%;
      justify-content: center;
    }
  }
`;

function ForbiddenIllustration(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 145" aria-hidden="true" {...props}>
      <text
        x="180"
        y="116"
        fill="currentColor"
        textAnchor="middle"
        fontFamily="DM Serif Display, Georgia, serif"
        fontSize="142"
        fontWeight="500"
      >
        403
      </text>
    </svg>
  );
}

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { currentUser, getDefaultRoute } = useAuth();
  const roleLabel = currentUser ? getRoleLabel(currentUser.role || currentUser.roleId) : "Signed out";
  const defaultRoute = getDefaultRoute?.() || "/inventory";

  return (
    <div className="unauthorized-root">
      <style>{UNAUTHORIZED_STYLES}</style>
      <div className="unauthorized-shell">
        <section className="unauthorized-panel">
          <div className="unauthorized-main">
            <ForbiddenIllustration className="unauthorized-illustration" />

            <div className="unauthorized-icon">
              <ShieldOff className="w-7 h-7" />
            </div>

            <div className="unauthorized-kicker">
              <LockKeyhole className="w-3.5 h-3.5" />
              Access restricted
            </div>
            <h1 className="unauthorized-title">You do not have access to this page.</h1>
            <p className="unauthorized-copy">
              This action is not available for your current role. Return to your workspace, or ask an administrator to
              update your permissions if this page is part of your daily work.
            </p>

            <div className="unauthorized-meta">
              <span className="app-pill pill-gray">Current role: {roleLabel}</span>
              <span className="app-pill pill-red">Permission required</span>
            </div>

            <div className="unauthorized-actions">
              <button className="db-secondary-btn" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
                Go back
              </button>
              <button className="db-primary-btn" onClick={() => navigate(defaultRoute)}>
                <Home className="w-4 h-4" />
                Open my workspace
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
