import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import { Menu } from "lucide-react";
import { ScrollToTop } from "./components/ScrollToTop.jsx";

import { DashboardPage } from "./pages/DashboardPage.jsx";

import ProductsPage from "./pages/products";
import { ViewProductPage } from "./pages/ViewProductPage";
import { EditProductPage } from "./pages/EditProductPage.jsx";

import { AddItemPage } from "./pages/AddItemPage";
import "./index.css";
import "./styles/app.css";
import { Sidebar } from "./components/Sidebar";
import { Addstockpage } from "./pages/Addstockpage";
import { Stockoutpage } from "./pages/Stockoutpage";
import { Inventory } from "./pages/Inventory";
import { StockOutLogPage } from "./pages/StockOutLogPage";
import { StockInlogs } from "./pages/StockInlogs";
import { Header } from "./components/Header";
import { GuidedTour } from "./components/GuidedTour.jsx";
import { TransactionsPage } from "./pages/TransactionPage";

import { OrdersPage } from "./pages/OrdersPage.jsx";
import { CreateOrderPage } from "./pages/CreateOrderPage";
import { ViewOrderPage } from "./pages/ViewOrderPage.jsx";
import { ConfirmDeliveryPage } from "./pages/ConfirmDeliveryPage.jsx";

import { SuppliersPage } from "./pages/SuppliersPage.jsx";
import { ViewSupplierPage } from "./pages/ViewSupplierPage.jsx";
import { EditSupplierPage } from "./pages/EditSupplierPage.jsx";
import { AddSupplierPage } from "./pages/AddSupplierPage.jsx";

import { ViewTransactionPage } from "./pages/ViewTransactionPage";

import { AlertsPage } from "./pages/AlertsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage.jsx";
import { DeliveryIssuesPage } from "./pages/DeliveryIssuesPage.jsx";
import { ViewDeliveryIssuePage } from "./pages/ViewDeliveryIssuePage.jsx";

import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import { SignupPage } from "./pages/SignupPage.jsx";
import { SigninPage } from "./pages/SigninPage.jsx";
import {
  AboutPage,
  FeaturesPage,
  LandingPage,
  PaymentPage,
  PricingPage,
  WelcomePage,
} from "./pages/PublicPages.jsx";

import { AuditDetailPage } from "./pages/AuditDetailPage";

const publicPaths = new Set([
  "/",
  "/about",
  "/features",
  "/pricing",
  "/payment",
  "/signup",
  "/signin",
  "/welcome",
]);

const AgentationToolbar = import.meta.env.DEV
  ? lazy(() => import("agentation").then(({ Agentation }) => ({ default: Agentation })))
  : null;

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signin" element={<SigninPage />} />
      <Route path="/welcome" element={<WelcomePage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedRoute feature="dashboard"><DashboardPage /></ProtectedRoute>} />

      {/* Products */}
      <Route path="/products" element={<ProtectedRoute feature="products"><ProductsPage /></ProtectedRoute>} />
      <Route path="/products/view-product/:id" element={<ProtectedRoute feature="products"><ViewProductPage /></ProtectedRoute>} />
      <Route path="/products/edit-product/:id" element={<ProtectedRoute permission="edit_products"><EditProductPage /></ProtectedRoute>} />

      {/* Inventory */}
      <Route path="/add-item" element={<ProtectedRoute permission="create_products"><AddItemPage /></ProtectedRoute>} />
      <Route path="/add-stock" element={<ProtectedRoute permission="create_transactions"><Addstockpage /></ProtectedRoute>} />
      <Route path="/stock-out" element={<ProtectedRoute permission="create_transactions"><Stockoutpage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute feature="inventory"><Inventory /></ProtectedRoute>} />

      {/* Transactions */}
      <Route path="/transactions" element={<ProtectedRoute feature="transactions"><TransactionsPage /></ProtectedRoute>} />
      <Route path="/transactions/:transactionId" element={<ProtectedRoute feature="transactions"><ViewTransactionPage /></ProtectedRoute>} />
      <Route path="/stock-out-log" element={<ProtectedRoute feature="transactions"><StockOutLogPage /></ProtectedRoute>} />
      <Route path="/stock-in-logs" element={<ProtectedRoute feature="transactions"><StockInlogs /></ProtectedRoute>} />

      {/* Orders */}
      <Route path="/orders" element={<ProtectedRoute feature="orders"><OrdersPage /></ProtectedRoute>} />
      <Route path="/orders/create" element={<ProtectedRoute feature="orders"><CreateOrderPage /></ProtectedRoute>} />
      <Route path="/orders/:orderId" element={<ProtectedRoute feature="orders"><ViewOrderPage /></ProtectedRoute>} />
      <Route path="/orders/:orderId/confirm-delivery" element={<ProtectedRoute feature="orders"><ConfirmDeliveryPage /></ProtectedRoute>} />

      {/* Suppliers */}
      <Route path="/suppliers" element={<ProtectedRoute feature="suppliers"><SuppliersPage /></ProtectedRoute>} />
      <Route path="/suppliers/view-supplier/:supplierId" element={<ProtectedRoute feature="suppliers"><ViewSupplierPage /></ProtectedRoute>} />
      <Route path="/suppliers/edit-supplier/:supplierId" element={<ProtectedRoute feature="suppliers"><EditSupplierPage /></ProtectedRoute>} />
      <Route path="/suppliers/add" element={<ProtectedRoute feature="suppliers"><AddSupplierPage /></ProtectedRoute>} />

      {/* Alerts */}
      <Route path="/alerts" element={<ProtectedRoute feature="alerts"><AlertsPage /></ProtectedRoute>} />

      {/* Analytics */}
      <Route path="/analytics" element={<ProtectedRoute feature="analytics"><AnalyticsPage /></ProtectedRoute>} />

      {/* Delivery Issues */}
      <Route path="/delivery-issues" element={<ProtectedRoute feature="delivery-issues"><DeliveryIssuesPage /></ProtectedRoute>} />
      <Route path="/delivery-issues/:issueId" element={<ProtectedRoute feature="delivery-issues"><ViewDeliveryIssuePage /></ProtectedRoute>} />

      {/* Settings */}
      <Route path="/settings" element={<ProtectedRoute feature="settings"><SettingsPage /></ProtectedRoute>} />

      {/* Profile */}
      <Route path="/profile" element={<ProtectedRoute feature="profile"><ProfilePage /></ProtectedRoute>} />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route path="/audit-log/:id" element={<ProtectedRoute permission="view_audit_logs"><AuditDetailPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<RoleFallback />} />
    </Routes>
  );
}

function RoleFallback() {
  const { currentUser, getDefaultRoute } = useAuth();
  return <Navigate to={currentUser ? getDefaultRoute() : "/"} replace />;
}

export function AppShell() {
  const location = useLocation();
  const isPublic = publicPaths.has(location.pathname);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("tanzeem_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [theme, setTheme] = useState(() => {
    try {
      const storedTheme = localStorage.getItem("tanzeem_theme");
      if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
    } catch {
      // Keep light as the stable default when storage is unavailable.
    }

    return "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem("tanzeem_sidebar_collapsed", String(isSidebarCollapsed));
    } catch {
      // Ignore storage failures; the toggle should still work for the current session.
    }
  }, [isSidebarCollapsed]);

  useEffect(() => {
    document.documentElement.dataset.theme = isPublic ? "light" : theme;
    try {
      localStorage.setItem("tanzeem_theme", theme);
    } catch {
      // The selected theme still applies in the current document.
    }
  }, [isPublic, theme]);

  if (isPublic) {
    return <AppRoutes />;
  }

  return (
    <div className="app-shell flex h-screen">
      <style>{`
        .app-mobile-nav-btn {
          display: none;
          position: fixed;
          top: 14px;
          left: 14px;
          z-index: 70;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--app-line-strong);
          background: var(--app-panel);
          color: var(--app-muted);
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(15, 23, 42, .06);
        }
        .app-mobile-nav-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 75;
          background: rgba(15, 23, 42, .34);
        }
        @media (max-width: 900px) {
          .app-mobile-nav-btn { display: inline-flex; }
          .app-mobile-nav-backdrop.is-open { display: block; }
        }
      `}</style>
      <button
        type="button"
        className="app-mobile-nav-btn"
        onClick={() => setIsMobileNavOpen(true)}
        aria-label="Open sidebar"
        title="Open sidebar"
      >
        <Menu size={18} />
      </button>
      <button
        type="button"
        className={`app-mobile-nav-backdrop${isMobileNavOpen ? " is-open" : ""}`}
        onClick={() => setIsMobileNavOpen(false)}
        aria-label="Close sidebar"
      />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileNavOpen}
        onNavigate={() => setIsMobileNavOpen(false)}
        onToggle={() => {
          if (isMobileNavOpen) {
            setIsMobileNavOpen(false);
            return;
          }
          setIsSidebarCollapsed((value) => !value);
        }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")}
        />
        <main className="flex-1 overflow-y-auto p-8" data-tour="page-content">
          <AppRoutes />
        </main>
        <GuidedTour />
      </div>
    </div>
  );
}

function DevelopmentAgentation() {
  if (!AgentationToolbar) return null;

  return (
    <Suspense fallback={null}>
      <AgentationToolbar className="tanzeem-agentation-toolbar" />
    </Suspense>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppShell />
        <DevelopmentAgentation />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
