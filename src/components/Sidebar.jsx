import { Link, useLocation } from "react-router";
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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// feature key must match the keys in FEATURE_PROBES in AuthContext.
// No feature key = always visible (backend never blocks it for any role).
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard",       path: "/dashboard",       feature: "dashboard" },
  { icon: Package,         label: "Inventory",       path: "/inventory" },
  { icon: Box,             label: "Products",        path: "/products" },
  { icon: Bell,            label: "Alerts",          path: "/alerts",          feature: "alerts" },
  { icon: ShoppingCart,    label: "Orders",          path: "/orders",          feature: "orders" },
  { icon: Users,           label: "Suppliers",       path: "/suppliers",       feature: "suppliers" },
  { icon: TrendingUp,      label: "Analytics",       path: "/analytics",       feature: "analytics" },
  { icon: AlertTriangle,   label: "Delivery Issues", path: "/delivery-issues", feature: "delivery-issues" },
];

const bottomMenuItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: User,     label: "Profile",  path: "/profile" },
];

export function Sidebar() {
  const location = useLocation();
  const { isFeatureAllowed } = useAuth();

  const visibleMenu = menuItems.filter(
    (item) => !item.feature || isFeatureAllowed(item.feature)
  );

  const visibleBottom = bottomMenuItems.filter(
    (item) => !item.feature || isFeatureAllowed(item.feature)
  );

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
        {visibleMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                isActive
                  ? "bg-[#15aaad] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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
        {visibleBottom.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                isActive
                  ? "bg-[#15aaad] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
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