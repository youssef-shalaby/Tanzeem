import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { ScrollToTop } from "./components/ScrollToTop.jsx";
import "./index.css";
import "./styles/app.css";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { GuidedTour } from "./components/GuidedTour.jsx";
import { PageLoadingState } from "./components/LoadingStates.jsx";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const lazyPage = (loader, exportName = "default") => {
  const load = () => loader().then((module) => ({ default: module[exportName] ?? module.default }));
  const Component = lazy(load);
  Component.preload = load;
  return Component;
};

const DashboardPage = lazyPage(() => import("./pages/DashboardPage.jsx"), "DashboardPage");
const ProductsPage = lazyPage(() => import("./pages/products"));
const ViewProductPage = lazyPage(() => import("./pages/ViewProductPage"), "ViewProductPage");
const EditProductPage = lazyPage(() => import("./pages/EditProductPage.jsx"), "EditProductPage");
const AddItemPage = lazyPage(() => import("./pages/AddItemPage"), "AddItemPage");
const Addstockpage = lazyPage(() => import("./pages/Addstockpage"), "Addstockpage");
const Stockoutpage = lazyPage(() => import("./pages/Stockoutpage"), "Stockoutpage");
const Inventory = lazyPage(() => import("./pages/Inventory"), "Inventory");
const TransactionsPage = lazyPage(() => import("./pages/TransactionPage"), "TransactionsPage");
const ViewTransactionPage = lazyPage(() => import("./pages/ViewTransactionPage"), "ViewTransactionPage");
const OrdersPage = lazyPage(() => import("./pages/OrdersPage.jsx"), "OrdersPage");
const CreateOrderPage = lazyPage(() => import("./pages/CreateOrderPage"), "CreateOrderPage");
const ViewOrderPage = lazyPage(() => import("./pages/ViewOrderPage.jsx"), "ViewOrderPage");
const ConfirmDeliveryPage = lazyPage(() => import("./pages/ConfirmDeliveryPage.jsx"), "ConfirmDeliveryPage");
const SuppliersPage = lazyPage(() => import("./pages/SuppliersPage.jsx"), "SuppliersPage");
const ViewSupplierPage = lazyPage(() => import("./pages/ViewSupplierPage.jsx"), "ViewSupplierPage");
const EditSupplierPage = lazyPage(() => import("./pages/EditSupplierPage.jsx"), "EditSupplierPage");
const AddSupplierPage = lazyPage(() => import("./pages/AddSupplierPage.jsx"), "AddSupplierPage");
const AlertsPage = lazyPage(() => import("./pages/AlertsPage"), "AlertsPage");
const AnalyticsPage = lazyPage(() => import("./pages/AnalyticsPage.jsx"), "AnalyticsPage");
const DeliveryIssuesPage = lazyPage(() => import("./pages/DeliveryIssuesPage.jsx"), "DeliveryIssuesPage");
const ViewDeliveryIssuePage = lazyPage(() => import("./pages/ViewDeliveryIssuePage.jsx"), "ViewDeliveryIssuePage");
const SettingsPage = lazyPage(() => import("./pages/SettingsPage"), "SettingsPage");
const ProfilePage = lazyPage(() => import("./pages/ProfilePage"), "ProfilePage");
const UnauthorizedPage = lazyPage(() => import("./pages/UnauthorizedPage"));
const SignupPage = lazyPage(() => import("./pages/SignupPage.jsx"), "SignupPage");
const SigninPage = lazyPage(() => import("./pages/SigninPage.jsx"), "SigninPage");
const LandingPage = lazyPage(() => import("./pages/PublicPages.jsx"), "LandingPage");
const AboutPage = lazyPage(() => import("./pages/PublicPages.jsx"), "AboutPage");
const FeaturesPage = lazyPage(() => import("./pages/PublicPages.jsx"), "FeaturesPage");
const PricingPage = lazyPage(() => import("./pages/PublicPages.jsx"), "PricingPage");
const PaymentPage = lazyPage(() => import("./pages/PublicPages.jsx"), "PaymentPage");
const WelcomePage = lazyPage(() => import("./pages/PublicPages.jsx"), "WelcomePage");
const AuditDetailPage = lazyPage(() => import("./pages/AuditDetailPage"), "AuditDetailPage");

const privatePages = [
  DashboardPage,
  ProductsPage,
  ViewProductPage,
  EditProductPage,
  AddItemPage,
  Addstockpage,
  Stockoutpage,
  Inventory,
  TransactionsPage,
  ViewTransactionPage,
  OrdersPage,
  CreateOrderPage,
  ViewOrderPage,
  ConfirmDeliveryPage,
  SuppliersPage,
  ViewSupplierPage,
  EditSupplierPage,
  AddSupplierPage,
  AlertsPage,
  AnalyticsPage,
  DeliveryIssuesPage,
  ViewDeliveryIssuePage,
  SettingsPage,
  ProfilePage,
  AuditDetailPage,
];

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
  const location = useLocation();
  const isPublic = publicPaths.has(location.pathname);

  return (
    <Suspense fallback={<RouteLoading isPublic={isPublic} />}>
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
    </Suspense>
  );
}

function RouteLoading({ isPublic = false }) {
  if (isPublic) return null;

  return (
    <PageLoadingState
      className="app-route-loading"
      title="Loading"
      detail="Preparing this view."
    />
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

  useEffect(() => {
    if (isPublic) return undefined;

    const preloadPrivatePages = () => {
      privatePages.forEach((Page) => Page.preload?.());
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preloadPrivatePages, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(preloadPrivatePages, 300);
    return () => window.clearTimeout(timerId);
  }, [isPublic]);

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
          z-index: var(--app-z-mobile-sidebar);
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
          z-index: var(--app-z-mobile-backdrop);
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
