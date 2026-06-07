import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Upload,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { CSVUploadModal } from "../ui/CSVUploadModal";
import { CSVReviewModal } from "../ui/CSVReviewModal";
import { DeleteProductModal } from "../ui/DeleteProductModal";

const ITEMS_PER_PAGE = 8;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

// Shared design system styles – green accent (#0f8c5a)
const PRODUCTS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .products-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-select {
    padding: 8px 14px; background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #444; cursor: pointer; outline: none; transition: border-color .2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
  }
  .db-select:hover { border-color: #0f8c5a; }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: .5px; padding: 10px 16px; text-align: left; background: #f9faf7; }
  .db-table td { padding: 12px 16px; font-size: 13px; color: #1a1a18; border-top: 1px solid rgba(0,0,0,.05); }
  .db-table tr:hover td { background: #f9faf7; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
  .pill-amber { background: #fef3c7; color: #8b5e00; }
  .pill-gray { background: #f3f4f6; color: #4b5563; }
  .db-search-input {
    width: 100%; padding: 9px 14px 9px 36px;
    background: #f5f6f3; border: 1px solid transparent;
    border-radius: 100px; font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s, background .2s;
  }
  .db-search-input::placeholder { color: #aaa; }
  .db-search-input:focus { background: #fff; border-color: rgba(15,140,90,.3); }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-skeleton { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:10px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

export function ProductsPage() {
  const navigate = useNavigate();

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState("all");
  const [sortId, setSortId] = useState("");

  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  // ================================
  // FETCH PRODUCTS FROM DATABASE
  // ================================
  useEffect(() => {
    setLoading(true);
    setError(null);

    let url = "/api/Products/Get-Products";
    const params = new URLSearchParams();

    if (searchQuery) params.append("searchTerm", searchQuery);
    if (filterId !== "all") params.append("filterId", filterId);
    if (sortId !== "") params.append("sortId", sortId);

    const query = params.toString();
    if (query) url += `?${query}`;

    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const rawArray = Array.isArray(data) ? data : (data?.data || []);

        const normalizedProducts = rawArray.map((product, index) => ({
          id: product.id || index + 1,
          name: product.name || "Unnamed Product",
          sku: product.sku || "—",
          category: product.category || "Uncategorized",
          stockLevel: product.stock !== null && product.stock !== undefined ? product.stock : 0,
          price: product.sellingPrice ?? product.price ?? 0,
          costPrice: product.costPrice ?? 0,
          expiryDate: product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : "N/A",
          status: product.status || "Active",
          barcode: product.barcode || "—",
          description: product.description || "",
          reorderLevel: product.reorderLevel ?? 0,
        }));

        setProductsList(normalizedProducts);

        if (filterId === "all") {
          const unique = [...new Map(
            rawArray
              .filter((p) => p.categoryId && p.category)
              .map((p) => [p.categoryId, { id: p.categoryId, name: p.category }])
          ).values()];
          setCategories(unique);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch operation error:", err);
        setError(err.message || "Failed to process product data.");
        setLoading(false);
      });
  }, [searchQuery, filterId, sortId]);

  // ================================
  // CSV IMPORT
  // ================================
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
      stockLevel: parseInt(item.stocklevel || item.stockLevel || item.stock || "0", 10) || 0,
      price: parseFloat(item.price || item.sellingPrice || "0") || 0,
      expiryDate: item.expirydate || item.expiryDate || "N/A",
      status: "Active",
    }));

    setProductsList((prev) => [...newProducts, ...prev]);
    setReviewModalOpen(false);
  };

  // ================================
  // DELETE
  // ================================
  const handleDeleteConfirm = () => {
    setProductsList((prev) => prev.filter((p) => p.id !== deleteModal.product.id));
    setDeleteModal({ isOpen: false, product: null });
  };

  // ================================
  // CLIENT-SIDE PAGINATION
  // ================================
  const totalPages = Math.ceil(productsList.length / ITEMS_PER_PAGE);
  const paginatedProducts = productsList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const start = productsList.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, productsList.length);

  // Stats cards data
  const totalCategories = [...new Set(productsList.map((p) => p.category))].length;

  return (
    <div className="products-root space-y-6">
      <style>{PRODUCTS_STYLES}</style>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="db-section-title">Products</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCsvModalOpen(true)} className="db-secondary-btn">
            <Upload className="w-[18px] h-[18px]" />
            Import CSV
          </button>
          <Link to="/add-item" className="db-primary-btn">
            <Plus className="w-[18px] h-[18px]" />
            Add Product
          </Link>
        </div>
      </div>

      {/* STATS CARDS (matching Dashboard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Total Products</span>
          </div>
          <div className="p-5">
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? <div className="db-skeleton w-20 h-8" /> : productsList.length.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Categories</span>
          </div>
          <div className="p-5">
            <div className="text-2xl font-semibold text-gray-900">
              {loading ? <div className="db-skeleton w-20 h-8" /> : totalCategories}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER + SORT */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Filter & Sort</span>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, SKU, or category..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="db-search-input pl-11"
              />
            </div>

            {/* Filter */}
            <select
              value={filterId}
              onChange={(e) => {
                setFilterId(e.target.value);
                setCurrentPage(1);
              }}
              className="db-select"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortId}
              onChange={(e) => {
                setSortId(e.target.value);
                setCurrentPage(1);
              }}
              className="db-select"
            >
              <option value="">Default Sort</option>
              <option value="1">Name A → Z</option>
              <option value="2">Price (Selling)</option>
              <option value="3">Quantity (Stock)</option>
            </select>
          </div>
        </div>
      </div>

      {/* PRODUCTS TABLE CARD */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Product List</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="db-skeleton h-10 mb-3" />
              <div className="db-skeleton h-10 mb-3" />
              <div className="db-skeleton h-10 mb-3" />
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">Error loading data: {error}</div>
          ) : (
            <table className="db-table w-full">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Price</th>
                  <th>Expiry Date</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="font-medium">{product.name}</td>
                    <td>{product.sku}</td>
                    <td>
                      <span className="db-stat-pill pill-blue">
                        {product.category}
                      </span>
                    </td>
                    <td>{product.stockLevel}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.expiryDate}</td>
                    <td>{product.reorderLevel}</td>
                    <td>
                      <span className={`db-stat-pill ${
                        product.status === "Active" ? "pill-green" : "pill-amber"
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === product.id ? null : product.id)}
                          className="db-icon-btn"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdown === product.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute right-0 top-full z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  navigate(`/products/view-product/${product.id}`, { state: { product } });
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
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && !error && productsList.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Showing {start} to {end} of {productsList.length.toLocaleString()} products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="db-icon-btn disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-[#0f8c5a] text-white"
                      : "border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              {totalPages > 3 && <span className="px-2 text-gray-600">...</span>}
              {totalPages > 3 && (
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  className={`px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 ${
                    currentPage === totalPages ? "bg-[#0f8c5a] text-white border-[#0f8c5a]" : ""
                  }`}
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="db-icon-btn disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS (unchanged) */}
      <CSVUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        type="products"
        onUploadComplete={handleCSVUpload}
      />
      <CSVReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        data={importedData}
        type="products"
        onConfirmImport={handleConfirmImport}
      />
      <DeleteProductModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        productName={deleteModal.product?.name || ""}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default ProductsPage;