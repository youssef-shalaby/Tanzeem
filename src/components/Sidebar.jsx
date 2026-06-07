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
import Logo from "../assets/tanzeemGreenLight.svg";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    feature: "dashboard",
  },
  { icon: Package, label: "Inventory", path: "/inventory" },
  { icon: Box, label: "Products", path: "/products" },
  { icon: Bell, label: "Alerts", path: "/alerts", feature: "alerts" },
  { icon: ShoppingCart, label: "Orders", path: "/orders", feature: "orders" },
  { icon: Users, label: "Suppliers", path: "/suppliers", feature: "suppliers" },
  {
    icon: TrendingUp,
    label: "Analytics",
    path: "/analytics",
    feature: "analytics",
  },
  {
    icon: AlertTriangle,
    label: "Delivery Issues",
    path: "/delivery-issues",
    feature: "delivery-issues",
  },
];

const bottomMenuItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
  { icon: User, label: "Profile", path: "/profile" },
];


export function Sidebar() {
  const location = useLocation();
  const { isFeatureAllowed } = useAuth();

  const visibleMenu = menuItems.filter(
    (item) => !item.feature || isFeatureAllowed(item.feature),
  );
  const visibleBottom = bottomMenuItems.filter(
    (item) => !item.feature || isFeatureAllowed(item.feature),
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .sb-root { font-family: 'DM Sans', sans-serif; }
        .sb-wordmark { font-family: 'DM Serif Display', serif; font-size: 18px; color: #fff; letter-spacing: -0.2px; line-height: 1; }
        .sb-wordmark span { color: #0f8c5a; }
        .sb-divider { height: 1px; background: rgba(255,255,255,.07); margin: 10px 16px; }
        .sb-label { font-size: 10px; font-weight: 500; letter-spacing: .8px; text-transform: uppercase; color: rgba(255,255,255,.25); padding: 0 12px; margin-bottom: 4px; }
        .sb-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          font-size: 13.5px; font-weight: 400; color: rgba(255,255,255,.45);
          text-decoration: none; transition: background .15s, color .15s;
        }
        .sb-link:hover { background: rgba(255,255,255,.06); color: rgba(255,255,255,.85); }
        .sb-link.active { background: rgba(15,140,90,.18); color: #5de0a5; }
        .sb-link.active .sb-link-dot { opacity: 1; }
        .sb-link-dot { width: 5px; height: 5px; border-radius: 50%; background: #0f8c5a; margin-left: auto; opacity: 0; transition: opacity .15s; flex-shrink:0; }
      `}</style>

      <div
        className="sb-root"
        style={{
          width: 220,
          background: "#111614",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "20px 16px 14px 20px" }}>
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "left",
              textDecoration: "none",
            }}
          >
            <img
              src={Logo}
              alt="Tanzeem"
              style={{
                width: "110px",
                height: "auto",
                display: "block",
              }}
            />
          </Link>
        </div>

        <div className="sb-divider" />

        {/* Main nav */}
        <nav
          style={{
            flex: 1,
            padding: "8px 8px 0",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <div className="sb-label">Menu</div>
          {visibleMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sb-link${isActive ? " active" : ""}`}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
                <div className="sb-link-dot" />
              </Link>
            );
          })}
        </nav>

        <div className="sb-divider" />

        {/* Bottom nav */}
        <div
          style={{
            padding: "0 8px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {visibleBottom.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sb-link${isActive ? " active" : ""}`}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
