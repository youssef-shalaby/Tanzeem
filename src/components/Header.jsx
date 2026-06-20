import { useState, useEffect, useRef } from 'react';
import { Bell, Building2, Check, ChevronDown, Shield, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationPanel } from './NotificationPanel';
import { getRoleLabel, normalizeRoleKey } from '../config/permissions';
import { getApiErrorMessage, parseApiResponse } from '../services/api';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

function getSwitchBranchToken(data) {
  if (typeof data === "string" && data.split(".").length === 3) return data;
  return data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken || null;
}

const ROLE_CONFIG = {
  light: {
    admin:   { bg: "#f1ebff", color: "#5b21b6", border: "rgba(124,58,237,.18)" },
    manager: { bg: "#e8f0ff", color: "#1d4ed8", border: "rgba(37,99,235,.18)" },
    staff:   { bg: "#d6f5e8", color: "#0a6b45", border: "rgba(15,140,90,.18)" },
  },
  dark: {
    admin:   { bg: "rgba(168,85,247,.14)", color: "#d6b8ff", border: "rgba(168,85,247,.24)" },
    manager: { bg: "rgba(96,165,250,.14)", color: "#acd0ff", border: "rgba(96,165,250,.24)" },
    staff:   { bg: "rgba(53,201,135,.14)", color: "#8af0bc", border: "rgba(53,201,135,.24)" },
  },
};

export function Header({ theme = "light", onToggleTheme }) {
  const navigate = useNavigate();
  const { currentUser, logout, setSession } = useAuth();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [branches, setBranches] = useState([]);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [switchingBranchId, setSwitchingBranchId] = useState(null);
  const [branchError, setBranchError] = useState("");
  const userMenuRef = useRef(null);
  const branchMenuRef = useRef(null);

  const role   = normalizeRoleKey(currentUser?.role || currentUser?.roleId);
  const isAdmin = role === "admin";
  const roleTheme = theme === "dark" ? ROLE_CONFIG.dark : ROLE_CONFIG.light;
  const config = roleTheme[role] || { bg: "var(--app-gray-bg)", color: "var(--app-gray-text)", border: "var(--app-line)" };
  const roleLabel = getRoleLabel(role);
  const currentBranchId = currentUser?.branchId ? String(currentUser.branchId) : "";
  const currentBranch = branches.find((branch) => String(branch.id) === currentBranchId);
  const currentBranchLabel = currentBranch?.name || (currentBranchId ? `Branch ${currentBranchId}` : "Branch");

  // Initials from name
  const initials = (currentUser?.name || "U")
    .split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const fetchUnreadCount = () => {
    const token = getToken();
    fetch('/api/Notification?Page=1&Page_Size=100', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.data) return;
        setUnreadCount(data.data.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchUnreadCount(); }, []);

  useEffect(() => {
    if (!isAdmin) {
      setBranches([]);
      return;
    }

    let ignore = false;
    const token = getToken();

    fetch('/api/Branch/Get-Branches-Menu', {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (ignore) return;
        const rows = Array.isArray(data) ? data : data?.data || data?.items || data?.result || [];
        setBranches(rows.map((branch) => ({
          id: branch.id ?? branch.Id ?? branch.branchId ?? branch.BranchId,
          name: branch.name ?? branch.Name ?? branch.branchName ?? branch.BranchName ?? "Branch",
        })).filter((branch) => branch.id));
      })
      .catch(() => {
        if (!ignore) setBranches([]);
      });

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (branchMenuRef.current && !branchMenuRef.current.contains(e.target)) {
        setIsBranchMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchBranch = async (branch) => {
    if (!branch?.id || String(branch.id) === currentBranchId) {
      setIsBranchMenuOpen(false);
      return;
    }

    setBranchError("");
    setSwitchingBranchId(branch.id);

    try {
      const token = getToken();
      const response = await fetch(`/api/BusinessCore/Switch-Branch?newBranchId=${encodeURIComponent(branch.id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(getApiErrorMessage(data, `Branch switch failed with HTTP ${response.status}.`));
      }

      const nextToken = getSwitchBranchToken(data);
      if (nextToken) {
        await setSession(nextToken);
        setIsBranchMenuOpen(false);
        window.location.reload();
        return;
      }

      setBranchError(`Branch switched. Sign in again if data does not refresh for ${branch.name}.`);
      setIsBranchMenuOpen(false);
    } catch (error) {
      setBranchError(error.message || "Branch switch failed.");
    } finally {
      setSwitchingBranchId(null);
    }
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/signin');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .hdr-root {
          font-family: 'DM Sans', sans-serif;
          position: relative;
          z-index: var(--app-z-header);
          isolation: isolate;
        }
        .hdr-icon-btn {
          width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
          display: flex; align-items: center; justify-content: center;
          color: var(--app-muted); cursor: pointer; transition: background .15s, color .15s; position: relative;
        }
        .hdr-icon-btn:hover { background: var(--app-soft); color: var(--app-ink); }
        .hdr-branch { position: relative; }
        .hdr-branch-btn {
          height: 36px; max-width: 210px; border-radius: 12px; border: 1px solid var(--app-line);
          background: var(--app-soft); color: var(--app-ink); display: inline-flex; align-items: center;
          gap: 7px; padding: 0 10px; cursor: pointer; font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600; transition: background .15s, border-color .15s;
        }
        .hdr-branch-btn:hover { background: var(--app-control-bg-hover); border-color: var(--app-line-strong); }
        .hdr-branch-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hdr-branch-menu {
          position: absolute; right: 0; top: calc(100% + 8px); width: 250px; max-height: 310px; overflow: auto;
          background: var(--app-panel); border: 1px solid var(--app-line); border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,.1); z-index: var(--app-z-header-dropdown);
          padding: 6px; animation: dropIn .15s ease both;
        }
        .hdr-branch-option {
          width: 100%; min-height: 38px; border: 0; border-radius: 10px; background: transparent;
          color: var(--app-ink); display: flex; align-items: center; justify-content: space-between;
          gap: 10px; padding: 8px 10px; cursor: pointer; font: inherit; text-align: left;
        }
        .hdr-branch-option:hover { background: var(--app-soft); }
        .hdr-branch-option.is-active { color: var(--app-green-dark); background: var(--app-success-bg); }
        .hdr-branch-option span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .hdr-branch-empty { padding: 9px 10px; color: var(--app-muted); font-size: 12px; }
        .hdr-notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; background: var(--app-green); border-radius: 50%; border: 1.5px solid var(--app-panel); }
        .hdr-notif-count {
          position: absolute; top: -4px; right: -4px;
          min-width: 18px; height: 18px; padding: 0 4px;
          background: var(--app-green); color: #fff; font-size: 10px; font-weight: 600;
          border-radius: 100px; display: flex; align-items: center; justify-content: center;
        }
        .hdr-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #edf8f2; color: #0a6b45;
          font-size: 12px; font-weight: 600; cursor: pointer; border: none;
          box-shadow: inset 0 0 0 1px rgba(15,140,90,.14);
          transition: opacity .15s; letter-spacing: .5px;
        }
        .hdr-avatar:hover { opacity: .85; }
        :root[data-theme="dark"] .hdr-avatar {
          background: var(--app-panel-raised);
          color: var(--app-green);
          box-shadow: inset 0 0 0 1px var(--app-line);
        }
        .hdr-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          width: 200px; background: var(--app-panel); border: 1px solid var(--app-line);
          border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,.1);
          z-index: var(--app-z-header-dropdown); overflow: hidden;
          animation: dropIn .15s ease both;
        }
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .hdr-dropdown-info { padding: 14px 16px; border-bottom: 1px solid var(--app-line); }
        .hdr-dropdown-name { font-size: 13px; font-weight: 500; color: var(--app-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hdr-dropdown-email { font-size: 11px; color: var(--app-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hdr-menu-btn {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; font-size: 13px; font-family: 'DM Sans', sans-serif;
          background: none; border: none; cursor: pointer; text-align: left;
          transition: background .15s; color: var(--app-ink);
        }
        .hdr-menu-btn:hover { background: var(--app-soft); }
        .hdr-menu-btn.danger { color: var(--app-danger-text); }
        .hdr-menu-btn.danger:hover { background: var(--app-danger-bg); }
      `}</style>

      <header className="hdr-root" style={{ background: "var(--app-panel)", borderBottom: "1px solid var(--app-line)", padding: "10px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          {/* Right controls - now directly on the right since search is removed */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>

            {isAdmin && (
              <div className="hdr-branch" ref={branchMenuRef}>
                <button
                  className="hdr-branch-btn"
                  type="button"
                  onClick={() => setIsBranchMenuOpen((open) => !open)}
                  aria-label="Switch branch"
                  title="Switch branch"
                >
                  <Building2 size={14} />
                  <span className="hdr-branch-label">{currentBranchLabel}</span>
                  <ChevronDown size={14} />
                </button>

                {isBranchMenuOpen && (
                  <div className="hdr-branch-menu">
                    {branches.length === 0 ? (
                      <div className="hdr-branch-empty">No branches available</div>
                    ) : branches.map((branch) => {
                      const isActive = String(branch.id) === currentBranchId;
                      const isSwitching = String(switchingBranchId) === String(branch.id);

                      return (
                        <button
                          className={`hdr-branch-option ${isActive ? "is-active" : ""}`}
                          key={branch.id}
                          type="button"
                          onClick={() => switchBranch(branch)}
                          disabled={!!switchingBranchId}
                        >
                          <span>{branch.name} - ID {branch.id}</span>
                          {isActive && <Check size={14} />}
                          {isSwitching && <span>...</span>}
                        </button>
                      );
                    })}
                    {branchError && <div className="hdr-branch-empty">{branchError}</div>}
                  </div>
                )}
              </div>
            )}

            {/* Role pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 100,
              background: config.bg, border: `1px solid ${config.border}`,
            }} data-tour="header-role">
              <Shield size={12} color={config.color} />
              <span style={{ fontSize: 11, fontWeight: 500, color: config.color, letterSpacing: ".2px" }}>
                {roleLabel}
              </span>
            </div>

            <button
              className="hdr-icon-btn"
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Notifications */}
            <button className="hdr-icon-btn" onClick={() => setIsNotificationPanelOpen(true)} data-tour="header-notifications">
              <Bell size={17} />
              {unreadCount > 0 && (
                unreadCount === 1
                  ? <span className="hdr-notif-dot" />
                  : <span className="hdr-notif-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>

            {/* Avatar + dropdown */}
            <div style={{ position: "relative" }} ref={userMenuRef}>
              <button className="hdr-avatar" onClick={() => setIsUserMenuOpen((p) => !p)} data-tour="header-profile">
                {initials}
              </button>

              {isUserMenuOpen && (
                <div className="hdr-dropdown">
                  <div className="hdr-dropdown-info">
                    <div className="hdr-dropdown-name">{currentUser?.name || "User"}</div>
                    <div className="hdr-dropdown-email">{currentUser?.email || ""}</div>
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    <button className="hdr-menu-btn" onClick={() => { setIsUserMenuOpen(false); navigate('/profile'); }}>
                      <UserCircle size={15} />
                      Profile
                    </button>
                    <button className="hdr-menu-btn danger" onClick={handleLogout}>
                      <LogOut size={15} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        onUnreadCountChange={fetchUnreadCount}
        onMarkAllRead={() => setUnreadCount(0)}
      />
    </>
  );
}
