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
          stockLevel:
            product.stock !== null && product.stock !== undefined
              ? product.stock
              : 0,
          price: product.sellingPrice ?? product.price ?? 0,
          costPrice: product.costPrice ?? 0,
          expiryDate: product.expiryDate
            ? new Date(product.expiryDate).toLocaleDateString()
            : "N/A",
          status: product.status || "Active",
          barcode: product.barcode || "—",
          description: product.description || "",
          reorderLevel: product.reorderLevel ?? 0,
        }));

        setProductsList(normalizedProducts);

        // Derive unique categories from the full unfiltered product list
        // only when no category filter is active (so we always have the full list)
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
      stockLevel:
        parseInt(item.stocklevel || item.stockLevel || item.stock || "0", 10) || 0,
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
    currentPage * ITEMS_PER_PAGE,
  );

  const start = productsList.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(currentPage * ITEMS_PER_PAGE, productsList.length);

  return (
    <div className="space-y-6">
      {/* HEADER */}
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

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Products</div>
          <div className="text-2xl font-semibold text-gray-900">
            {productsList.length.toLocaleString()}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Categories</div>
          <div className="text-2xl font-semibold text-gray-900">
            {[...new Set(productsList.map((p) => p.category))].length}
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER + SORT */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            />
          </div>

          {/* Filter */}
          <select
            value={filterId}
            onChange={(e) => {
              setFilterId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white"
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
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white"
          >
            <option value="">Default Sort</option>
            <option value="1">Name A → Z</option>
            <option value="2">Price (Selling)</option>
            <option value="3">Quantity (Stock)</option>
          </select>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        <div className="space-y-4 p-6">
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-500">
              Loading products from database...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-sm text-red-600">
              Error loading data: {error}
            </div>
          ) : (
            <>
              <div className="overflow-visible min-h-[550px]">
                <table className="w-full min-w-[700px] table-fixed">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product Name
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.stockLevel}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.expiryDate}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdown(openDropdown === product.id ? null : product.id)
                              }
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
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-sm text-gray-500"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Showing {start} to {end} of {productsList.length.toLocaleString()} products
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>

                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        currentPage === page
                          ? "bg-[#15aaad] text-white"
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
                      className={`px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors ${
                        currentPage === totalPages ? "bg-[#15aaad] text-white border-[#15aaad]" : ""
                      }`}
                    >
                      {totalPages}
                    </button>
                  )}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MODALS */}
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