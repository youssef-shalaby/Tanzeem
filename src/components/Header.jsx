import { useState, useEffect } from 'react';
import { Search, Bell, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { NotificationPanel } from './NotificationPanel';

export function Header() {
  const navigate = useNavigate();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const roleSection = 'admin'; // change manually if needed

  const getRoleColor = () => {
    switch (roleSection) {
      case 'admin':   return 'bg-purple-600';
      case 'manager': return 'bg-blue-600';
      case 'staff':   return 'bg-green-600';
      default:        return 'bg-gray-600';
    }
  };

  const getRoleLabel = () => {
    switch (roleSection) {
      case 'admin':   return 'Admin';
      case 'manager': return 'Manager';
      case 'staff':   return 'Staff';
      default:        return roleSection;
    }
  };

  const fetchUnreadCount = () => {
    fetch('/api/Notification?Page=1&Page_Size=100')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.data) return;
        const count = data.data.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${getRoleColor()}`}>
                {getRoleLabel()}
              </span>
            </div>

            <button
              onClick={() => setIsNotificationPanelOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-[18px] h-[18px] text-gray-700" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#15aaad] rounded-full" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#15aaad] text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="w-9 h-9 rounded-lg bg-[#15aaad] flex items-center justify-center hover:bg-[#0d8082] transition-colors"
            >
              <User className="w-[18px] h-[18px] text-white" />
            </button>
          </div>
        </div>
      </header>

      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        onUnreadCountChange={fetchUnreadCount}
      />
    </>
  );
}