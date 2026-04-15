import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Box,
  Settings,
  User,
  Bell,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  // Main navigation items – no role prefixes
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Package, label: 'Inventory', path: '/inventory' },
    { icon: Box, label: 'Products', path: '/products' },
    { icon: Bell, label: 'Alerts', path: '/alerts' },
    { icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { icon: Users, label: 'Suppliers', path: '/suppliers' },
    { icon: TrendingUp, label: 'Analytics', path: '/analytics' },
    { icon: AlertTriangle, label: 'Delivery Issues', path: '/delivery-issues' },
  ];

  const bottomMenuItems = [
    { icon: Settings, label: 'Settings', path: '/settings' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="w-[240px] bg-[#1a1d1f] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#15aaad] flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-lg font-semibold">Tanzeem</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                isActive
                  ? 'bg-[#15aaad] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 pb-4 space-y-1">
        {bottomMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                isActive
                  ? 'bg-[#15aaad] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}