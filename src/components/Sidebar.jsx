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
import { useAuth } from '../contexts/AuthContext'; // adjust path as needed
import { permissions } from '../config/permissions'; // adjust path as needed

// Map each nav item to the permission required to see it
const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',        path: '/dashboard',        permission: 'view_dashboard' },
  { icon: Package,         label: 'Inventory',        path: '/inventory',        permission: 'view_products' },
  { icon: Box,             label: 'Products',         path: '/products',         permission: 'view_products' },
  { icon: Bell,            label: 'Alerts',           path: '/alerts',           permission: 'view_alerts' },
  { icon: ShoppingCart,    label: 'Orders',           path: '/orders',           permission: 'view_orders' },
  { icon: Users,           label: 'Suppliers',        path: '/suppliers',        permission: 'view_suppliers' },
  { icon: TrendingUp,      label: 'Analytics',        path: '/analytics',        permission: 'view_analytics' },
  { icon: AlertTriangle,   label: 'Delivery Issues',  path: '/delivery-issues',  permission: 'view_delivery_issues' },
];

const bottomMenuItems = [
  { icon: Settings, label: 'Settings', path: '/settings', permission: 'view_settings' },
  { icon: User,     label: 'Profile',  path: '/profile',  permission: 'view_profile' },
];

export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useAuth(); // expects user.role to be 'admin' | 'manager' | 'staff'

  const userPermissions = permissions[currentUser?.role] ?? [];
  const hasPermission = (permission) => userPermissions.includes(permission);

  const visibleMenuItems = menuItems.filter((item) => hasPermission(item.permission));
  const visibleBottomItems = bottomMenuItems.filter((item) => hasPermission(item.permission));

  return (
    <div className="w-[240px] bg-[#1a1d1f] flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center">
          <img src="/logo.svg" alt="Tanzeem Logo" className="w-36 h-12" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {visibleMenuItems.map((item) => {
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
        {visibleBottomItems.map((item) => {
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