import { X, Package, AlertTriangle, TruckIcon, Clock, CheckCircle } from 'lucide-react';

export function NotificationPanel({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) {
  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'low-stock':
        return { Icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'critical':
        return { Icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' };
      case 'order':
        return { Icon: TruckIcon, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'delivery':
        return { Icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'success':
        return { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      default:
        return { Icon: Package, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>

              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-[#15aaad] text-white text-xs font-semibold rounded-full">
                  {unreadCount}
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

          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-[#15aaad] hover:text-[#0d8082] font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>

              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No notifications
              </h3>

              <p className="text-sm text-gray-600">
                You're all caught up! We'll notify you when something important happens.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const { Icon, color, bg } = getNotificationIcon(notification.type);

                return (
                  <button
                    key={notification.id}
                    onClick={() => onMarkAsRead(notification.id)}
                    className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-[#15aaad]/5' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className={`text-sm font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h4>

                          {!notification.read && (
                            <span className="w-2 h-2 bg-[#15aaad] rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <span className="text-xs text-gray-500">
                          {notification.time}
                        </span>
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
            <button className="w-full py-2.5 text-sm font-medium text-[#15aaad] hover:text-[#0d8082] transition-colors">
              View All Notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
}