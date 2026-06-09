import { useState, useEffect, useRef } from 'react';
import { Bell, Shield, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { NotificationPanel } from './NotificationPanel';
import { getRoleLabel, normalizeRoleKey } from '../config/permissions';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
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
  const { currentUser, logout } = useAuth();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const role   = normalizeRoleKey(currentUser?.role || currentUser?.roleId);
  const roleTheme = theme === "dark" ? ROLE_CONFIG.dark : ROLE_CONFIG.light;
  const config = roleTheme[role] || { bg: "var(--app-gray-bg)", color: "var(--app-gray-text)", border: "var(--app-line)" };
  const roleLabel = getRoleLabel(role);

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
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/signin');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .hdr-root { font-family: 'DM Sans', sans-serif; }
        .hdr-icon-btn {
          width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
          display: flex; align-items: center; justify-content: center;
          color: var(--app-muted); cursor: pointer; transition: background .15s, color .15s; position: relative;
        }
        .hdr-icon-btn:hover { background: var(--app-soft); color: var(--app-ink); }
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
          z-index: 50; overflow: hidden;
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
