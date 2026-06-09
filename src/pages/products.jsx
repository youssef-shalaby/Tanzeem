import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  Package,
  Tags,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { CSVUploadModal } from "../ui/CSVUploadModal";
import { CSVReviewModal } from "../ui/CSVReviewModal";
import { DeleteProductModal } from "../ui/DeleteProductModal";
import { useAuth } from "../contexts/AuthContext";
import { StatCard } from "../components/StatCard";

const ITEMS_PER_PAGE = 8;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

function ProductActionMenu({ position, onClose, onView, onEdit, onDelete, canEdit, canDelete }) {
  if (!position) return null;

  return createPortal(
    <>
      <button className="fixed inset-0 z-40 cursor-default" onClick={onClose} aria-label="Close product actions" />
      <div
        className="app-menu fixed z-50 w-48 py-1"
        style={{ top: position.top, left: position.left }}
      >
        <button onClick={onView} className="app-menu-item">
          <Eye className="w-4 h-4" />
          View Details
        </button>
        {canEdit && (
          <button onClick={onEdit} className="app-menu-item">
            <Edit className="w-4 h-4" />
            Edit Product
          </button>
        )}
        {canDelete && (
          <button onClick={onDelete} className="app-menu-item danger">
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>
    </>,
    document.body
  );
}

export function ProductsPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const canCreateProducts = can("create_products");
  const canEditProducts = can("edit_products");
  const canDeleteProducts = can("delete_products");

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterId, setFilterId] = useState("all");
  const [sortId, setSortId] = useState("");

  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });

  // ================================
  // FETCH PRODUCTS FROM DATABASE
  // ================================
  useEffect(() => {
    let url = "/api/Products/Get-Products";
    const params = new URLSearchParams();

    if (searchQuery) params.append("searchTerm", searchQuery);
    if (filterId !== "all") params.append("filterId", filterId);
    if (sortId !== "") params.append("sortId", sortId);

    const query = params.toString();
    if (query) url += `?${query}`;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);

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
          if (cancelled) return;
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
          if (cancelled) return;
          console.error("Fetch operation error:", err);
          setError(err.message || "Failed to process product data.");
          setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
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
  const activeProducts = productsList.filter((product) => product.status === "Active").length;

  const toggleActionMenu = (productId, event) => {
    if (openDropdown === productId) {
      setOpenDropdown(null);
      setMenuPosition(null);
      return;
    }

    const menuWidth = 192;
    const menuHeight = 44 + (canEditProducts ? 44 : 0) + (canDeleteProducts ? 44 : 0);
    const rect = event.currentTarget.getBoundingClientRect();
    const left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, rect.right - menuWidth));
    const preferredTop = rect.top;
    const top = preferredTop + menuHeight > window.innerHeight - 12
      ? Math.max(12, rect.top - menuHeight - 8)
      : preferredTop;

    setOpenDropdown(productId);
    setMenuPosition({ top, left });
  };

  const productStats = [
    {
      title: "Total products",
      value: productsList.length.toLocaleString(),
      sub: "Tracked SKUs",
      icon: Package,
      iconColor: "#0f8c5a",
      iconBg: "#e9f8f1",
      subColor: "#66706a",
    },
    {
      title: "Categories",
      value: totalCategories,
      sub: "Product groups",
      icon: Tags,
      iconColor: "#2c5f8a",
      iconBg: "#e8f0fe",
      subColor: "#66706a",
    },
    {
      title: "Active products",
      value: activeProducts.toLocaleString(),
      sub: "Available for operations",
      icon: Eye,
      iconColor: "#5b21b6",
      iconBg: "#f1ebff",
      subColor: "#0a6b45",
    },
  ];

  return (
    <div className="products-root space-y-6">
      {/* HEADER */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="db-section-title">Products</h1>
          <p className="app-page-subtitle">Maintain item records, SKUs, categories, stock levels, and pricing.</p>
        </div>
        <div className="app-page-actions">
          {canCreateProducts && (
            <>
              <button onClick={() => setCsvModalOpen(true)} className="db-secondary-btn">
                <Upload className="w-[18px] h-[18px]" />
                Import CSV
              </button>
              <Link to="/add-item" className="db-primary-btn">
                <Plus className="w-[18px] h-[18px]" />
                Add Product
              </Link>
            </>
          )}
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {productStats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            sub={stat.sub}
            subColor={stat.subColor}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
            loading={loading}
            className="db-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          />
        ))}
      </div>

      {error && (
        <div className="app-alert-danger">
          Error loading product data: {error}
        </div>
      )}

      {/* SEARCH + FILTER + SORT */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <div>
            <span className="db-card-title">Find products</span>
            <div style={{ color: "#66706a", fontSize: 12, marginTop: 3 }}>
              Search, filter, and sort the product catalog.
            </div>
          </div>
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
          <span className="db-card-title">Product list</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center">
              <div className="db-skeleton h-10 mb-3" />
              <div className="db-skeleton h-10 mb-3" />
              <div className="db-skeleton h-10 mb-3" />
            </div>
          ) : error ? (
            <div className="app-empty">Product data could not be loaded.</div>
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
                          onClick={(event) => toggleActionMenu(product.id, event)}
                          className="db-icon-btn"
                          aria-label={`Open actions for ${product.name}`}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdown === product.id && (
                          <ProductActionMenu
                            position={menuPosition}
                            canEdit={canEditProducts}
                            canDelete={canDeleteProducts}
                            onClose={() => {
                              setOpenDropdown(null);
                              setMenuPosition(null);
                            }}
                            onView={() => {
                              setOpenDropdown(null);
                              setMenuPosition(null);
                              navigate(`/products/view-product/${product.id}`, { state: { product } });
                            }}
                            onEdit={() => {
                              setOpenDropdown(null);
                              setMenuPosition(null);
                              navigate(`/products/edit-product/${product.id}`);
                            }}
                            onDelete={() => {
                              setOpenDropdown(null);
                              setMenuPosition(null);
                              setDeleteModal({ isOpen: true, product });
                            }}
                          />
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
                  className={`min-w-9 h-9 px-3 text-sm rounded-[10px] transition-colors ${
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
                  className={`min-w-9 h-9 px-3 text-sm rounded-[10px] border border-gray-200 hover:bg-gray-50 ${
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
