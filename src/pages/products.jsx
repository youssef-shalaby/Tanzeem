import { useState, useMemo } from 'react';
import {
  Plus, Search, Upload, Filter, MoreVertical,
  ChevronLeft, ChevronRight, Eye, Edit, Trash2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { CSVUploadModal } from '../ui/CSVUploadModal';
import { CSVReviewModal } from '../ui/CSVReviewModal';
import { DeleteProductModal } from '../ui/DeleteProductModal';

const initialProducts = [
  { id: 1, name: 'Wireless Mouse', sku: 'WM-002', category: 'Electronics', price: 19.99, stockLevel: 234, expiryDate: '12/31/2025', rating: 4.5 },
  { id: 2, name: 'USB-C Cable', sku: 'UC-003', category: 'Accessories', price: 12.99, stockLevel: 567, expiryDate: 'N/A', rating: 4.8 },
  { id: 3, name: 'HDMI Cable', sku: 'HC-006', category: 'Accessories', price: 8.99, stockLevel: 445, expiryDate: 'N/A', rating: 4.6 },
  { id: 4, name: 'Laptop Stand', sku: 'LS-001', category: 'Office Supplies', price: 29.99, stockLevel: 123, expiryDate: 'N/A', rating: 4.7 },
  { id: 5, name: 'Webcam HD', sku: 'WC-008', category: 'Electronics', price: 59.99, stockLevel: 89, expiryDate: '06/30/2026', rating: 4.4 },
  { id: 6, name: 'Office Chair', sku: 'OC-884', category: 'Furniture', price: 149.00, stockLevel: 45, expiryDate: 'N/A', rating: 4.9 },
  { id: 7, name: 'Monitor 24"', sku: 'MN-005', category: 'Electronics', price: 199.99, stockLevel: 67, expiryDate: '03/15/2026', rating: 4.6 },
  { id: 8, name: 'Wireless Keyboard', sku: 'WK-004', category: 'Electronics', price: 49.99, stockLevel: 178, expiryDate: 'N/A', rating: 4.5 },
];

const ITEMS_PER_PAGE = 8;

export function ProductsPage() {
  const navigate = useNavigate();
  const [productsList, setProductsList] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  const handleCSVUpload = (data) => {
    setImportedData(data);
    setCsvModalOpen(false);
    setReviewModalOpen(true);
  };

  const handleConfirmImport = (data) => {
    const newProducts = data.map((item, index) => ({
      id: productsList.length + index + 1,
      name: item.name,
      sku: item.sku,
      category: item.category,
      price: parseFloat(item.price) || 0,
      stockLevel: parseInt(item.stocklevel || item.stockLevel || item.stock || '0'),
      expiryDate: item.expirydate || item.expiryDate || item['expiry date'] || 'N/A',
      rating: 0
    }));
    setProductsList(prev => [...newProducts, ...prev]);
    setReviewModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    setProductsList(prev => prev.filter(p => p.id !== deleteModal.product.id));
    setDeleteModal({ isOpen: false, product: null });
  };

  const filteredProducts = useMemo(() => {
    return productsList.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [productsList, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-[18px] h-[18px]" />
            Import CSV
          </button>
          <Link
            to="/add-item"
            className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
          >
            <Plus className="w-[18px] h-[18px]" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Products</div>
          <div className="text-2xl font-semibold text-gray-900">{productsList.length.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Categories</div>
          <div className="text-2xl font-semibold text-gray-900">
            {[...new Set(productsList.map(p => p.category))].length}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-[18px] h-[18px] text-gray-600" />
              Filter
            </button>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="overflow-visible">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{product.stockLevel}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.expiryDate}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {openDropdown === product.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 top-full z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  navigate(`/products/view-product/${product.id}`);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  navigate(`/products/edit-product/${product.id}`);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Product
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  setDeleteModal({ isOpen: true, product });
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredProducts.length === 0 ? 0 : start} to {end} of {filteredProducts.length.toLocaleString()} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-[#15aaad] text-white'
                      : 'border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 3 && <span className="px-2 text-gray-600">...</span>}
              {totalPages > 3 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                    currentPage === totalPages ? 'bg-[#15aaad] text-white border-[#15aaad]' : ''
                  }`}
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        type="products"
        onUploadComplete={handleCSVUpload}
      />

      {/* CSV Review Modal */}
      <CSVReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        data={importedData}
        type="products"
        onConfirmImport={handleConfirmImport}
      />

      {/* Delete Product Modal */}
      <DeleteProductModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        productName={deleteModal.product?.name || ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default ProductsPage;