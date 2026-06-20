import { AlertTriangle, CheckCheck, Clock, Inbox, Package, TruckIcon, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToneIcon } from './ToneIcon';
import { formatRelativeTime } from '../utils/dateTime';

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
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getNotificationMeta(type) {
  switch (type) {
    case 1:  return { Icon: AlertTriangle, label: 'Stock alert', tone: 'amber' };
    case 2:  return { Icon: Clock,         label: 'Pending',     tone: 'amber' };
    case 4:  return { Icon: TruckIcon,     label: 'Delivery',    tone: 'blue' };
    default: return { Icon: Package,       label: 'Inventory',   tone: 'gray' };
  }
}

function formatTime(createdAt) {
  const formatted = formatRelativeTime(createdAt);
  return formatted === '-' ? '' : formatted;
}

export function NotificationPanel({ isOpen, onClose, onUnreadCountChange, onMarkAllRead }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!isCancelled) setLoading(true);
    }, 0);

    fetch('/api/Notification?Page=1&Page_Size=20', { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (isCancelled) return;
        if (data?.data) setNotifications(data.data);
        setLoading(false);
      })
      .catch(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
    const current = notifications.find((n) => n.id === id);
    if (current?.isRead) return;

    fetch(`/api/Notification/mark-as-read/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
    })
      .then((r) => r.ok ? r.json() : null)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
        );
        setTimeout(() => onUnreadCountChange?.(), 300);
      })
      .catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    if (localUnread === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    fetch('/api/Notification/mark-all-read', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({}),
    })
      .then((r) => r.text().then((t) => {
        if (!r.ok) throw new Error(`${r.status}: ${t}`);
        return t ? JSON.parse(t) : null;
      }))
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        onMarkAllRead?.();
        setTimeout(() => onUnreadCountChange?.(), 300);
      })
      .catch((err) => console.error('mark-all-read failed:', err))
      .finally(() => setIsMarkingAll(false));
  };

  const handleClick = (notification) => {
    handleMarkAsRead(notification.id);
    const orderMatch = notification.message?.match(/order\s+(?:Id:)?\s*(\d+)/i);
    if (orderMatch) {
      navigate(`/orders/${orderMatch[1]}`);
      onClose();
    } else if (notification.type === 1) {
      navigate('/alerts');
      onClose();
    }
  };

  const localUnread = notifications.filter((n) => !n.isRead).length;

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .notif-backdrop {
          position: fixed;
          inset: 0;
          z-index: var(--app-z-drawer-backdrop);
          background: rgba(15, 23, 42, .22);
          backdrop-filter: blur(2px);
        }
        .notif-panel {
          font-family: 'DM Sans', sans-serif;
          background: var(--app-panel);
          box-shadow: -14px 0 34px rgba(15, 23, 42, .1);
          border-left: 1px solid var(--app-line);
          z-index: var(--app-z-drawer);
        }
        .notif-header {
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid var(--app-line);
          background: var(--app-wash-bg-soft);
        }
        .notif-header::after {
          content: "";
          position: absolute;
          right: 22px;
          bottom: 0;
          width: 128px;
          height: 3px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(15,140,90,0), rgba(15,140,90,.34));
          pointer-events: none;
        }
        .notif-header > * { position: relative; z-index: 1; }
        .notif-summary {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--app-muted);
          font-size: 13px;
          margin-top: 6px;
        }
        .notif-mark-all {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 34px;
          padding: 0 11px;
          border-radius: 999px;
          border: 1px solid rgba(15,140,90,.14);
          background: var(--app-panel);
          color: var(--app-green-dark);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, border-color .15s, color .15s;
        }
        .notif-mark-all:hover:not(:disabled) {
          background: var(--app-soft);
          border-color: rgba(15,140,90,.24);
        }
        .notif-mark-all:disabled {
          opacity: .55;
          cursor: not-allowed;
        }
        .notif-list {
          display: grid;
          gap: 10px;
          padding: 14px;
        }
        .notif-item {
          width: 100%;
          display: grid;
          grid-template-columns: 40px minmax(0, 1fr);
          gap: 12px;
          padding: 13px;
          border-radius: 14px;
          border: 1px solid transparent;
          background: var(--app-panel);
          text-align: left;
          transition: background .15s, border-color .15s, transform .15s;
        }
        .notif-item:hover {
          background: var(--app-soft);
          border-color: var(--app-line);
        }
        .notif-item.unread {
          background: var(--app-wash-bg-soft);
          border-color: rgba(15,140,90,.12);
        }
        .notif-item-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 5px;
        }
        .notif-title {
          color: var(--app-ink);
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.35;
        }
        .notif-message {
          color: var(--app-muted);
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
        }
        .notif-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
        }
        .notif-type {
          display: inline-flex;
          align-items: center;
          min-height: 22px;
          padding: 0 8px;
          border-radius: 999px;
          background: var(--app-gray-bg);
          color: var(--app-gray-text);
          font-size: 11px;
          font-weight: 700;
        }
        .notif-time {
          color: var(--app-subtle);
          font-size: 11.5px;
          white-space: nowrap;
        }
        .notif-unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--app-green);
          flex: 0 0 auto;
          margin-top: 5px;
        }
        .notif-footer {
          border-top: 1px solid var(--app-line);
          background: var(--app-panel);
        }
        :root[data-theme="dark"] .notif-backdrop {
          background: rgba(0, 0, 0, .5);
        }
        :root[data-theme="dark"] .notif-panel {
          background: var(--app-panel);
          box-shadow: -20px 0 70px rgba(0, 0, 0, .42);
        }
        :root[data-theme="dark"] .notif-item {
          background: var(--app-panel-raised);
          border-color: var(--app-line);
        }
        :root[data-theme="dark"] .notif-item:hover {
          background: #1b2420;
        }
        @media (max-width: 520px) {
          .notif-panel { width: 100vw !important; }
          .notif-list { padding: 12px; }
        }
      `}</style>
      {/* Backdrop */}
      <div className="notif-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="notif-panel fixed top-0 right-0 h-full w-[440px] max-w-[100vw] flex flex-col">
        
        {/* Header */}
        <div className="notif-header px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="app-card-title">Notifications</h2>
                {localUnread > 0 && (
                  <span className="db-stat-pill pill-green">
                    {localUnread}
                  </span>
                )}
              </div>
              <p className="notif-summary">
                {localUnread > 0
                  ? `${localUnread} unread update${localUnread === 1 ? '' : 's'}`
                  : 'Everything is read'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {localUnread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="notif-mark-all"
                  disabled={isMarkingAll}
                >
                  <CheckCheck className="w-4 h-4" />
                  {isMarkingAll ? 'Marking' : 'Mark all'}
                </button>
              )}
              <button
                onClick={onClose}
                className="db-icon-btn"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="db-skeleton h-20" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="app-empty flex h-full flex-col items-center justify-center px-6">
              <ToneIcon icon={Inbox} tone="gray" size="lg" className="mb-4" />
              <h3 className="app-card-title mb-1">No notifications</h3>
              <p className="text-sm text-gray-600 text-center max-w-[280px]">
                You are caught up. New stock, order, and delivery updates will appear here.
              </p>
            </div>
          ) : (
            <div className="notif-list">
              {notifications.map((n) => {
                const { Icon, tone, label } = getNotificationMeta(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`notif-item${!n.isRead ? ' unread' : ''}`}
                  >
                    <ToneIcon icon={Icon} tone={tone} className="notif-icon" />
                    <div className="min-w-0">
                      <div className="notif-item-head">
                        <h4 className="notif-title">
                          {n.title || label}
                        </h4>
                        {!n.isRead && (
                          <span className="notif-unread-dot" aria-label="Unread" />
                        )}
                      </div>
                      <p className="notif-message line-clamp-2">{n.message}</p>
                      <div className="notif-foot">
                        <span className="notif-type">{label}</span>
                        <span className="notif-time">{formatTime(n.createdAt)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notif-footer px-6 py-4">
            <button
              onClick={() => { navigate('/alerts'); onClose(); }}
              className="db-secondary-btn w-full"
            >
              View alert center
            </button>
          </div>
        )}
      </div>
    </>
  );
}
