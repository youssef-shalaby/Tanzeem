import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import ProductsPage from './pages/products'
import { AddItemPage } from './pages/AddItemPage'
import './index.css'
import { Sidebar } from './components/Sidebar'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className="flex h-screen bg-[#f6f8fa]">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/add-item" element={<AddItemPage />} />
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  </StrictMode>
)