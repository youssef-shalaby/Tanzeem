import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import ProductsPage from './pages/products'
import { AddItemPage } from './pages/AddItemPage'
import './index.css'
import { Sidebar } from './components/Sidebar'
import { Addstockpage } from './pages/Addstockpage'
import { Stockoutpage } from './pages/Stockoutpage'
import { Inventory} from './pages/Inventory'
import { StockOutLogPage } from './pages/StockOutLogPage'
// import { StockLogsPage } from './pages/StockLogsPage'
import { StockInlogs } from './pages/StockInlogs'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex h-screen bg-[#f6f8fa]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/add-item" element={<AddItemPage />} />
            <Route path="/add-stock" element={<Addstockpage />} />
            <Route path="/stock-out" element={<Stockoutpage />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/stock-out-log" element={<StockOutLogPage />} />
            {/* <Route path="/stock-logs" element={<StockLogsPage />} /> */}
            <Route path="/stock-in-logs" element={<StockInlogs />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  </StrictMode>
)