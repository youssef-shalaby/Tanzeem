import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { DeleteProductModal } from "../ui/DeleteProductModal";

const initialProducts = [
  { id: 1, name: "Wireless Mouse", sku: "WM-002", category: "Electronics", price: 19.99, stockLevel: 234, expiryDate: "12/31/2025", rating: 4.5 },
  { id: 2, name: "USB-C Cable", sku: "UC-003", category: "Accessories", price: 12.99, stockLevel: 567, expiryDate: "N/A", rating: 4.8 },
  { id: 3, name: "HDMI Cable", sku: "HC-006", category: "Accessories", price: 8.99, stockLevel: 445, expiryDate: "N/A", rating: 4.6 },
  { id: 4, name: "Laptop Stand", sku: "LS-001", category: "Office Supplies", price: 29.99, stockLevel: 123, expiryDate: "N/A", rating: 4.7 },
  { id: 5, name: "Webcam HD", sku: "WC-008", category: "Electronics", price: 59.99, stockLevel: 89, expiryDate: "06/30/2026", rating: 4.4 },
  { id: 6, name: "Office Chair", sku: "OC-884", category: "Furniture", price: 149.0, stockLevel: 45, expiryDate: "N/A", rating: 4.9 },
  { id: 7, name: 'Monitor 24"', sku: "MN-005", category: "Electronics", price: 199.99, stockLevel: 67, expiryDate: "03/15/2026", rating: 4.6 },
  { id: 8, name: "Wireless Keyboard", sku: "WK-004", category: "Electronics", price: 49.99, stockLevel: 178, expiryDate: "N/A", rating: 4.5 }
];

const ITEMS_PER_PAGE = 8;

function ProductsTable({ products, onDeleteClick }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);

  const handleViewProduct = (id) => {
    navigate(`/products/view-product/${id}`);
    setOpenMenu(null);
  };

  const handleEditProduct = (id) => {
    navigate(`/products/edit-product/${id}`);
    setOpenMenu(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {["Product Name", "SKU", "Category", "Stock", "Price", "Expiry Date", "Actions"].map((h) => (
              <th key={h} className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{p.sku}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                  {p.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{p.stockLevel}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                ${p.price.toFixed(2)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">{p.expiryDate}</td>
              <td className="px-6 py-4 relative">
                <button
                  onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {openMenu === p.id && (
                  <div className="absolute right-6 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => handleViewProduct(p.id)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => handleEditProduct(p.id)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Product
                    </button>
                    <button
                      onClick={() => { onDeleteClick(p); setOpenMenu(null); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-500">
        Showing {start} to {end} of {totalItems.toLocaleString()} products
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [productsList, setProductsList] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState(null);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
  };

  const handleDeleteConfirm = () => {
    setProductsList((prev) => prev.filter((p) => p.id !== productToDelete.id));
    setProductToDelete(null);
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsList, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <Link
            to="/add-item"
            className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white rounded-lg hover:bg-[#0d8082]"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="p-6 space-y-4">
            <ProductsTable
              products={paginatedProducts}
              onDeleteClick={handleDeleteClick}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <DeleteProductModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        productName={productToDelete?.name ?? ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default ProductsPage;