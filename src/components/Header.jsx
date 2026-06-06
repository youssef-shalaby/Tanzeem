import { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Shield, LogOut, UserCircle } from 'lucide-react';
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

export function Header() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const role = currentUser?.role || 'staff';

  const getRoleColor = () => {
    switch (role) {
      case 'admin':   return 'bg-purple-600';
      case 'manager': return 'bg-blue-600';
      case 'staff':   return 'bg-green-600';
      default:        return 'bg-gray-600';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':   return 'Admin';
      case 'manager': return 'Manager';
      case 'staff':   return 'Staff';
      default:        return role;
    }
  };

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
        const count = data.data.filter((n) => !n.isRead).length;
        setUnreadCount(count);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Close dropdown when clicking outside
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
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-4">

          {/* Search — grows to fill available space */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
              />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3 flex-shrink-0">

            {/* Role badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <Shield className="w-4 h-4 text-gray-500" />
              <span className={`text-xs font-semibold text-white px-2 py-0.5 rounded ${getRoleColor()}`}>
                {getRoleLabel()}
              </span>
            </div>

            {/* Notifications */}
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

            {/* User avatar + dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="w-9 h-9 rounded-lg bg-[#15aaad] flex items-center justify-center hover:bg-[#0d8082] transition-colors"
              >
                <User className="w-[18px] h-[18px] text-white" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {currentUser?.email || ''}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => { setIsUserMenuOpen(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-gray-500" />
                      Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
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