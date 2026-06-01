import { X, Package, AlertTriangle, TruckIcon, Clock, CheckCircle, Skull } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// ─── Enums ────────────────────────────────────────────────────────────────────
// type: 1=DeadStock, 2=Expiry, 4=Order/Delivery

function getNotificationMeta(type) {
  switch (type) {
    case 1:  return { Icon: Skull,         color: 'text-orange-600', bg: 'bg-orange-100' };
    case 2:  return { Icon: Clock,         color: 'text-yellow-600', bg: 'bg-yellow-100' };
    case 4:  return { Icon: TruckIcon,     color: 'text-blue-600',   bg: 'bg-blue-100'   };
    default: return { Icon: Package,       color: 'text-gray-600',   bg: 'bg-gray-100'   };
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

export function NotificationPanel({ isOpen, onClose, unreadCount, onUnreadCountChange }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/Notification?Page=1&Page_Size=20')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.data) setNotifications(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isOpen]);

  const handleMarkAsRead = (id) => {
    fetch(`/api/Notification/mark-as-read/${id}`, { method: 'PATCH' })
      .then((r) => r.ok ? r.json() : null)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => n.id === id ? { ...n, isRead: true } : n)
        );
        onUnreadCountChange?.();
      })
      .catch(() => {});
  };

  const handleMarkAllAsRead = () => {
    fetch('/api/Notification/mark-all-read', { method: 'PATCH' })
      .then((r) => r.ok ? r.json() : null)
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        onUnreadCountChange?.();
      })
      .catch(() => {});
  };

  const handleClick = (notification) => {
    handleMarkAsRead(notification.id);
    // Navigate based on message content
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
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {localUnread > 0 && (
                <span className="px-2 py-0.5 bg-[#15aaad] text-white text-xs font-semibold rounded-full">
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
              className="text-sm text-[#15aaad] hover:text-[#0d8082] font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
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
                      !n.isRead ? 'bg-[#15aaad]/5' : ''
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
                            <span className="w-2 h-2 bg-[#15aaad] rounded-full flex-shrink-0 mt-1.5" />
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
              className="w-full py-2.5 text-sm font-medium text-[#15aaad] hover:text-[#0d8082] transition-colors"
            >
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}