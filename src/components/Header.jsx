import { useState, useEffect, useRef } from 'react';
import { Bell, Shield, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { NotificationPanel } from './NotificationPanel';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

const ROLE_CONFIG = {
  admin:   { label: "Admin",   bg: "#1e2820", color: "#5de0a5", border: "rgba(15,140,90,.3)" },
  manager: { label: "Manager", bg: "#1a1e2e", color: "#93b4f5", border: "rgba(59,130,246,.3)" },
  staff:   { label: "Staff",   bg: "#1e1a28", color: "#c4a8f5", border: "rgba(139,92,246,.3)" },
};

export function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const role   = currentUser?.role || 'staff';
  const config = ROLE_CONFIG[role] || { label: role, bg: "#1e1e1e", color: "#aaa", border: "rgba(255,255,255,.15)" };

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
          color: #666; cursor: pointer; transition: background .15s, color .15s; position: relative;
        }
        .hdr-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
        .hdr-notif-dot { position: absolute; top: 7px; right: 7px; width: 7px; height: 7px; background: #0f8c5a; border-radius: 50%; border: 1.5px solid #fff; }
        .hdr-notif-count {
          position: absolute; top: -4px; right: -4px;
          min-width: 18px; height: 18px; padding: 0 4px;
          background: #0f8c5a; color: #fff; font-size: 10px; font-weight: 600;
          border-radius: 100px; display: flex; align-items: center; justify-content: center;
        }
        .hdr-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          background: #1e2820; color: #5de0a5;
          font-size: 12px; font-weight: 600; cursor: pointer; border: none;
          transition: opacity .15s; letter-spacing: .5px;
        }
        .hdr-avatar:hover { opacity: .85; }
        .hdr-dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          width: 200px; background: #fff; border: 1px solid rgba(0,0,0,.08);
          border-radius: 14px; box-shadow: 0 8px 32px rgba(0,0,0,.1);
          z-index: 50; overflow: hidden;
          animation: dropIn .15s ease both;
        }
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .hdr-dropdown-info { padding: 14px 16px; border-bottom: 1px solid rgba(0,0,0,.06); }
        .hdr-dropdown-name { font-size: 13px; font-weight: 500; color: #1a1a18; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hdr-dropdown-email { font-size: 11px; color: #888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hdr-menu-btn {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; font-size: 13px; font-family: 'DM Sans', sans-serif;
          background: none; border: none; cursor: pointer; text-align: left;
          transition: background .15s; color: #444;
        }
        .hdr-menu-btn:hover { background: #f5f6f3; }
        .hdr-menu-btn.danger { color: #c0392b; }
        .hdr-menu-btn.danger:hover { background: #fff5f5; }
      `}</style>

      <header className="hdr-root" style={{ background: "#fff", borderBottom: "1px solid rgba(0,0,0,.07)", padding: "10px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>

          {/* Right controls - now directly on the right since search is removed */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>

            {/* Role pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 10px", borderRadius: 100,
              background: config.bg, border: `1px solid ${config.border}`,
            }}>
              <Shield size={12} color={config.color} />
              <span style={{ fontSize: 11, fontWeight: 500, color: config.color, letterSpacing: ".2px" }}>
                {config.label}
              </span>
            </div>

            {/* Notifications */}
            <button className="hdr-icon-btn" onClick={() => setIsNotificationPanelOpen(true)}>
              <Bell size={17} />
              {unreadCount > 0 && (
                unreadCount === 1
                  ? <span className="hdr-notif-dot" />
                  : <span className="hdr-notif-count">{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>

            {/* Avatar + dropdown */}
            <div style={{ position: "relative" }} ref={userMenuRef}>
              <button className="hdr-avatar" onClick={() => setIsUserMenuOpen((p) => !p)}>
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