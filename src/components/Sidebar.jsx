import { Link, useLocation } from "react-router-dom";
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
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/tanzeemGreenLight.svg";
import IconLogo from "../assets/TanzeemGreenIcon.svg";

const menuItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/dashboard",
    feature: "dashboard",
    tour: "nav-dashboard",
  },
  { icon: Package, label: "Inventory", path: "/inventory", feature: "inventory", tour: "nav-inventory" },
  { icon: RefreshCw, label: "Transactions", path: "/transactions", feature: "transactions", tour: "nav-transactions" },
  { icon: Box, label: "Products", path: "/products", feature: "products", tour: "nav-products" },
  { icon: Bell, label: "Alerts", path: "/alerts", feature: "alerts", tour: "nav-alerts" },
  { icon: ShoppingCart, label: "Orders", path: "/orders", feature: "orders", tour: "nav-orders" },
  { icon: Users, label: "Suppliers", path: "/suppliers", feature: "suppliers", tour: "nav-suppliers" },
  {
    icon: TrendingUp,
    label: "Analytics",
    path: "/analytics",
    feature: "analytics",
    tour: "nav-analytics",
  },
  {
    icon: AlertTriangle,
    label: "Delivery Issues",
    path: "/delivery-issues",
    feature: "delivery-issues",
    tour: "nav-delivery-issues",
  },
];

const bottomMenuItems = [
  { icon: Settings, label: "Settings", path: "/settings", feature: "settings", tour: "nav-settings" },
  { icon: User, label: "Profile", path: "/profile", feature: "profile", tour: "nav-profile" },
];


export function Sidebar({ isCollapsed = false, isMobileOpen = false, onNavigate, onToggle }) {
  const location = useLocation();
  const { isFeatureAllowed, permissionsReady } = useAuth();

  const visibleMenu = permissionsReady
    ? menuItems.filter((item) => !item.feature || isFeatureAllowed(item.feature))
    : [];
  const visibleBottom = permissionsReady
    ? bottomMenuItems.filter((item) => !item.feature || isFeatureAllowed(item.feature))
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .sb-root { font-family: 'DM Sans', sans-serif; transition: width .18s ease, transform .2s ease; position: relative; }
        .sb-logo-link { display: flex; align-items: center; min-width: 0; text-decoration: none; overflow: hidden; }
        .sb-logo-mark { width: 110px; height: auto; display: block; flex: 0 0 auto; }
        .sb-logo-icon { display: none; width: 32px; height: auto; }
        .sb-root.collapsed .sb-logo-word { display: none; }
        .sb-root.collapsed .sb-logo-icon { display: block; }
        .sb-toggle {
          position: absolute;
          top: 14px;
          right: -38px;
          z-index: 5;
          width: 32px; height: 32px; border-radius: 10px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid rgba(238,242,239,.12);
          background: #1b1f20;
          color: #a9afaa;
          box-shadow: 0 10px 24px rgba(0,0,0,.18);
          cursor: pointer;
          transition: background .15s, color .15s, border-color .15s, transform .15s;
        }
        .sb-toggle:hover { background: #222728; color: #d8ded9; border-color: rgba(238,242,239,.18); transform: translateX(1px); }
        .sb-wordmark { font-family: 'DM Serif Display', serif; font-size: 18px; color: #fff; letter-spacing: -0.2px; line-height: 1; }
        .sb-wordmark span { color: #0f8c5a; }
        .sb-divider { height: 1px; background: rgba(255,255,255,.07); margin: 10px 16px; transition: margin .18s ease; }
        .sb-label { font-size: 10px; font-weight: 500; letter-spacing: .8px; text-transform: uppercase; color: rgba(255,255,255,.25); padding: 0 12px; margin-bottom: 4px; transition: opacity .12s ease; }
        .sb-link {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          font-size: 13.5px; font-weight: 400; color: rgba(255,255,255,.45);
          text-decoration: none; transition: background .15s, color .15s;
          min-height: 36px;
          position: relative;
          outline: none;
        }
        .sb-link:hover { background: rgba(255,255,255,.055); color: rgba(255,255,255,.82); }
        .sb-link:focus-visible {
          color: rgba(255,255,255,.88);
          box-shadow:
            inset 0 0 0 1px rgba(88,216,154,.56),
            0 0 0 3px rgba(88,216,154,.13);
        }
        .sb-link.active { background: rgba(238,242,239,.075); color: #8be6b6; }
        .sb-link.active:focus-visible {
          background: rgba(88,216,154,.13);
          box-shadow:
            inset 0 0 0 1px rgba(139,230,182,.62),
            0 0 0 3px rgba(88,216,154,.14);
        }
        .sb-link.active .sb-link-dot { opacity: 1; }
        .sb-link-dot { width: 5px; height: 5px; border-radius: 50%; background: #2fba78; margin-left: auto; opacity: 0; transition: opacity .15s; flex-shrink:0; }
        .sb-link-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: opacity .12s ease; }
        .sb-link-icon { width: 16px; height: 16px; flex: 0 0 auto; }
        .sb-root.collapsed .sb-divider { margin-left: 12px; margin-right: 12px; }
        .sb-root.collapsed .sb-label,
        .sb-root.collapsed .sb-link-text,
        .sb-root.collapsed .sb-link-dot { opacity: 0; width: 0; overflow: hidden; pointer-events: none; }
        .sb-root.collapsed .sb-label { height: 0; margin: 0; padding: 0; }
        .sb-root.collapsed .sb-link-text,
        .sb-root.collapsed .sb-link-dot { display: none; margin: 0; }
        .sb-root.collapsed .sb-link {
          width: 40px;
          height: 40px;
          min-height: 40px;
          display: grid;
          place-items: center;
          justify-content: center;
          padding: 0;
          gap: 0;
          margin: 0 auto;
        }
        .sb-root.collapsed .sb-link.active { background: rgba(238,242,239,.075); }
        .sb-root.collapsed .sb-link.active::before {
          content: "";
          position: absolute;
          left: -7px;
          top: 12px;
          bottom: 12px;
          width: 3px;
          border-radius: 999px;
          background: #58d89a;
        }
        .sb-root.collapsed .sb-link-icon { width: 20px; height: 20px; }
        .sb-loading-nav { display: grid; gap: 8px; padding: 6px 12px; }
        .sb-loading-line {
          height: 34px;
          border-radius: 10px;
          background: rgba(255,255,255,.045);
        }
        .sb-root.collapsed .sb-loading-nav { padding: 6px 14px; }
        .sb-root.collapsed .sb-loading-line { width: 40px; height: 40px; margin: 0 auto; }
        @media (max-width: 900px) {
          .sb-root {
            position: fixed !important;
            inset: 0 auto 0 0;
            width: 240px !important;
            z-index: var(--app-z-mobile-sidebar);
            transform: translateX(-100%);
            box-shadow: 20px 0 44px rgba(15, 23, 42, .18);
          }
          .sb-root.mobile-open { transform: translateX(0); }
          .sb-root.collapsed .sb-logo-word { display: block; }
          .sb-root.collapsed .sb-logo-icon { display: none; }
          .sb-root.collapsed .sb-label {
            height: auto;
            margin-bottom: 4px;
            padding: 0 12px;
            opacity: 1;
            width: auto;
          }
          .sb-root.collapsed .sb-link {
            width: auto;
            height: auto;
            min-height: 36px;
            display: flex;
            justify-content: flex-start;
            padding: 9px 12px;
            gap: 10px;
            margin: 0;
          }
          .sb-root.collapsed .sb-link-text {
            display: inline;
            width: auto;
            opacity: 1;
          }
          .sb-root.collapsed .sb-link-dot {
            display: block;
            width: 5px;
          }
          .sb-root.collapsed .sb-link.active::before { display: none; }
          .sb-root.collapsed .sb-link-icon { width: 16px; height: 16px; }
          .sb-toggle {
            top: 18px;
            right: 14px;
            color: rgba(255,255,255,.72);
            background: rgba(255,255,255,.05);
            border-color: rgba(255,255,255,.1);
            box-shadow: none;
          }
          .sb-toggle:hover {
            background: rgba(255,255,255,.09);
            color: #fff;
            transform: none;
          }
        }
      `}</style>

      <div
        className={`sb-root${isCollapsed ? " collapsed" : ""}${isMobileOpen ? " mobile-open" : ""}`}
        style={{
          width: isCollapsed ? 72 : 220,
          background: "#101314",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          flex: "0 0 auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: isCollapsed ? "18px 12px 12px" : "20px 12px 14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
          }}
        >
          <Link
            to="/dashboard"
            className="sb-logo-link"
            title="Tanzeem"
          >
            <img
              src={Logo}
              alt="Tanzeem"
              className="sb-logo-mark sb-logo-word"
            />
            <img
              src={IconLogo}
              alt="Tanzeem"
              className="sb-logo-icon"
            />
          </Link>
        </div>

        <button
          type="button"
          className="sb-toggle"
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>

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
          {!permissionsReady && (
            <div className="sb-loading-nav" aria-label="Loading navigation">
              <span className="sb-loading-line" />
              <span className="sb-loading-line" />
              <span className="sb-loading-line" />
            </div>
          )}
          {permissionsReady && visibleMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sb-link${isActive ? " active" : ""}`}
                data-tour={item.tour}
                title={isCollapsed ? item.label : undefined}
                aria-label={isCollapsed ? item.label : undefined}
                onClick={onNavigate}
              >
                <Icon className="sb-link-icon" strokeWidth={1.8} />
                <span className="sb-link-text">{item.label}</span>
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
          {!permissionsReady && (
            <div className="sb-loading-nav" aria-label="Loading navigation">
              <span className="sb-loading-line" />
              <span className="sb-loading-line" />
            </div>
          )}
          {permissionsReady && visibleBottom.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sb-link${isActive ? " active" : ""}`}
                data-tour={item.tour}
                title={isCollapsed ? item.label : undefined}
                aria-label={isCollapsed ? item.label : undefined}
                onClick={onNavigate}
              >
                <Icon className="sb-link-icon" strokeWidth={1.8} />
                <span className="sb-link-text">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
