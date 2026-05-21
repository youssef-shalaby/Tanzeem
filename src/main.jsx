import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
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

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex h-screen bg-[#f6f8fa]">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-8">
              <Routes>
                {/* Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredPermission="view_dashboard">
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Products */}
                <Route
                  path="/products"
                  element={
                    <ProtectedRoute requiredPermission="view_products">
                      <ProductsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/products/view-product/:id"
                  element={
                    <ProtectedRoute requiredPermission="view_products">
                      <ViewProductPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/products/edit-product/:id"
                  element={
                    <ProtectedRoute requiredPermission="edit_products">
                      <EditProductPage />
                    </ProtectedRoute>
                  }
                />

                {/* Inventory */}
                <Route
                  path="/add-item"
                  element={
                    <ProtectedRoute requiredPermission="edit_products">
                      <AddItemPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/add-stock"
                  element={
                    <ProtectedRoute requiredPermission="edit_products">
                      <Addstockpage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/stock-out"
                  element={
                    <ProtectedRoute requiredPermission="edit_products">
                      <Stockoutpage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute requiredPermission="view_products">
                      <Inventory />
                    </ProtectedRoute>
                  }
                />

                {/* Transactions */}
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute requiredPermission="view_transactions">
                      <TransactionsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/transactions/:transactionId"
                  element={
                    <ProtectedRoute requiredPermission="view_transactions">
                      <ViewTransactionPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/stock-out-log"
                  element={
                    <ProtectedRoute requiredPermission="view_transactions">
                      <StockOutLogPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/stock-in-logs"
                  element={
                    <ProtectedRoute requiredPermission="view_transactions">
                      <StockInlogs />
                    </ProtectedRoute>
                  }
                />

                {/* Orders */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute requiredPermission="view_orders">
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders/create"
                  element={
                    <ProtectedRoute requiredPermission="manage_orders">
                      <CreateOrderPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders/:orderId"
                  element={
                    <ProtectedRoute requiredPermission="view_orders">
                      <ViewOrderPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/orders/:orderId/confirm-delivery"
                  element={
                    <ProtectedRoute requiredPermission="manage_orders">
                      <ConfirmDeliveryPage />
                    </ProtectedRoute>
                  }
                />

                {/* Suppliers */}
                <Route
                  path="/suppliers"
                  element={
                    <ProtectedRoute requiredPermission="view_suppliers">
                      <SuppliersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/suppliers/view-supplier/:supplierId"
                  element={
                    <ProtectedRoute requiredPermission="view_suppliers">
                      <ViewSupplierPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/suppliers/edit-supplier/:supplierId"
                  element={
                    <ProtectedRoute requiredPermission="manage_suppliers">
                      <EditSupplierPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/suppliers/add"
                  element={
                    <ProtectedRoute requiredPermission="manage_suppliers">
                      <AddSupplierPage />
                    </ProtectedRoute>
                  }
                />

                {/* Alerts */}
                <Route
                  path="/alerts"
                  element={
                    <ProtectedRoute requiredPermission="view_alerts">
                      <AlertsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Analytics */}
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute requiredPermission="view_analytics">
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Delivery Issues */}
                <Route
                  path="/delivery-issues"
                  element={
                    <ProtectedRoute requiredPermission="view_orders">
                      <DeliveryIssuesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/delivery-issues/:issueId"
                  element={
                    <ProtectedRoute requiredPermission="view_orders">
                      <ViewDeliveryIssuePage />
                    </ProtectedRoute>
                  }
                />

                {/* Settings */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute requiredPermission="view_settings">
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Profile */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute requiredPermission="view_profile">
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Unauthorized */}
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Redirect */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
