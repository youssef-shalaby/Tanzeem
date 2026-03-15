import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { ScrollToTop } from './components/ScrollToTop.jsx';

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
import { ViewOrderPage } from "./pages/ViewOrderPage.jsx";
import { ConfirmDeliveryPage } from "./pages/ConfirmDeliveryPage.jsx";

import { SuppliersPage } from "./pages/SuppliersPage.jsx";
import { ViewSupplierPage } from "./pages/ViewSupplierPage.jsx";
import { EditSupplierPage } from "./pages/EditSupplierPage.jsx";
import { AddSupplierPage } from "./pages/AddSupplierPage.jsx";

import { ViewTransactionPage } from "./pages/ViewTransactionPage";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex h-screen bg-[#f6f8fa]">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/dashboard" element={<DashboardPage />} />

              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/view-product/:id" element={<ViewProductPage />} />
              <Route path="/products/edit-product/:id" element={<EditProductPage />} />

              <Route path="/add-item" element={<AddItemPage />} />
              <Route path="/add-stock" element={<Addstockpage />} />
              <Route path="/stock-out" element={<Stockoutpage />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/:transactionId" element={<ViewTransactionPage />} />
              <Route path="/stock-out-log" element={<StockOutLogPage />} />
              <Route path="/stock-in-logs" element={<StockInlogs />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderId" element={<ViewOrderPage />} />
              <Route path="/orders/:orderId/confirm-delivery" element={<ConfirmDeliveryPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/suppliers/view-supplier/:supplierId" element={<ViewSupplierPage />} />
              <Route path="/suppliers/edit-supplier/:supplierId" element={<EditSupplierPage />} />
              <Route path="/suppliers/add" element={<AddSupplierPage />} />
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>,
);