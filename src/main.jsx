import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router";
import { ScrollToTop } from "./components/ScrollToTop.jsx";

import { DashboardPage } from "./pages/DashboardPage.jsx";

import ProductsPage from "./pages/products";
import { ViewProductPage } from "./pages/ViewProductPage";
import { EditProductPage } from "./pages/EditProductPage.jsx";

import { AddItemPage } from "./pages/AddItemPage";
import "./index.css";
import { Sidebar } from "./components/Sidebar";
import { Addstockpage } from "./pages/Addstockpage";
import { Stockoutpage } from "./pages/Stockoutpage";
import { Inventory } from "./pages/Inventory";
import { StockOutLogPage } from "./pages/StockOutLogPage";
import { StockInlogs } from "./pages/StockInlogs";
import { Header } from "./components/Header";
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

import { AuthProvider } from "./contexts/AuthContext";
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
      <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/products/view-product/:id" element={<ProtectedRoute><ViewProductPage /></ProtectedRoute>} />
      <Route path="/products/edit-product/:id" element={<ProtectedRoute><EditProductPage /></ProtectedRoute>} />

      {/* Inventory */}
      <Route path="/add-item" element={<ProtectedRoute><AddItemPage /></ProtectedRoute>} />
      <Route path="/add-stock" element={<ProtectedRoute><Addstockpage /></ProtectedRoute>} />
      <Route path="/stock-out" element={<ProtectedRoute><Stockoutpage /></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />

      {/* Transactions */}
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
      <Route path="/transactions/:transactionId" element={<ProtectedRoute><ViewTransactionPage /></ProtectedRoute>} />
      <Route path="/stock-out-log" element={<ProtectedRoute><StockOutLogPage /></ProtectedRoute>} />
      <Route path="/stock-in-logs" element={<ProtectedRoute><StockInlogs /></ProtectedRoute>} />

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
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

      {/* Profile */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Unauthorized */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export function AppShell() {
  const location = useLocation();
  const isPublic = publicPaths.has(location.pathname);

  if (isPublic) {
    return <AppRoutes />;
  }

  return (
    <div className="flex h-screen bg-[#f6f8fa]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);