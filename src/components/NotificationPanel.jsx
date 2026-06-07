import { X, Package, TruckIcon, Clock, Skull } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// ============================
// Design system colors & helpers
// ============================
const GREEN_PRIMARY = '#0f8c5a';
const GREEN_HOVER = '#0a6b45';

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
    case 1:  return { Icon: Skull,     color: 'text-orange-600', bg: 'bg-orange-100' };
    case 2:  return { Icon: Clock,     color: 'text-yellow-600', bg: 'bg-yellow-100' };
    case 4:  return { Icon: TruckIcon, color: 'text-blue-600',   bg: 'bg-blue-100'   };
    default: return { Icon: Package,   color: 'text-gray-600',   bg: 'bg-gray-100'   };
  }
}

function formatTime(createdAt) {
  if (!createdAt) return '';
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationPanel({ isOpen, onClose, onUnreadCountChange, onMarkAllRead }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/Notification?Page=1&Page_Size=20', { headers: authHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.data) setNotifications(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
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
      .catch((err) => console.error('mark-all-read failed:', err));
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {localUnread > 0 && (
                <span className="px-2 py-0.5 text-white text-xs font-semibold rounded-full" style={{ backgroundColor: GREEN_PRIMARY }}>
                  {localUnread}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {localUnread > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm font-medium transition-colors"
              style={{ color: GREEN_PRIMARY }}
              onMouseEnter={(e) => e.currentTarget.style.color = GREEN_HOVER}
              onMouseLeave={(e) => e.currentTarget.style.color = GREEN_PRIMARY}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-600">
                You're all caught up! We'll notify you when something important happens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => {
                const { Icon, color, bg } = getNotificationMeta(n.type);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                      !n.isRead ? 'bg-[#0f8c5a]/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {n.title}
                          </h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: GREEN_PRIMARY }} />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">{n.message}</p>
                        <span className="text-xs text-gray-400">{formatTime(n.createdAt)}</span>
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
          <div className="px-6 py-4 border-t border-gray-200">
            <button
              onClick={() => { navigate('/alerts'); onClose(); }}
              className="w-full py-2.5 text-sm font-medium transition-colors"
              style={{ color: GREEN_PRIMARY }}
              onMouseEnter={(e) => e.currentTarget.style.color = GREEN_HOVER}
              onMouseLeave={(e) => e.currentTarget.style.color = GREEN_PRIMARY}
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}