import { useState, useMemo, useCallback, useRef } from "react";
import {
  Plus, Upload, Search, Filter, Package, Layers,
  MoreVertical, ChevronLeft, ChevronRight,
  X, FileText, Check,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const initialProducts = [
  { id: 1, name: "Wireless Mouse",    sku: "WM-002", category: "Electronics",    price: 19.99,  stockLevel: 234, expiryDate: "12/31/2025", rating: 4.5 },
  { id: 2, name: "USB-C Cable",       sku: "UC-003", category: "Accessories",    price: 12.99,  stockLevel: 567, expiryDate: "N/A",        rating: 4.8 },
  { id: 3, name: "HDMI Cable",        sku: "HC-006", category: "Accessories",    price: 8.99,   stockLevel: 445, expiryDate: "N/A",        rating: 4.6 },
  { id: 4, name: "Laptop Stand",      sku: "LS-001", category: "Office Supplies",price: 29.99,  stockLevel: 123, expiryDate: "N/A",        rating: 4.7 },
  { id: 5, name: "Webcam HD",         sku: "WC-008", category: "Electronics",    price: 59.99,  stockLevel: 89,  expiryDate: "06/30/2026", rating: 4.4 },
  { id: 6, name: "Office Chair",      sku: "OC-884", category: "Furniture",      price: 149.00, stockLevel: 45,  expiryDate: "N/A",        rating: 4.9 },
  { id: 7, name: 'Monitor 24"',       sku: "MN-005", category: "Electronics",    price: 199.99, stockLevel: 67,  expiryDate: "03/15/2026", rating: 4.6 },
  { id: 8, name: "Wireless Keyboard", sku: "WK-004", category: "Electronics",    price: 49.99,  stockLevel: 178, expiryDate: "N/A",        rating: 4.5 },
];

const ITEMS_PER_PAGE = 8;

// ─── CSV Upload Modal ──────────────────────────────────────────────────────────

function CSVUploadModal({ isOpen, onClose, onUploadComplete }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const parseCSV = useCallback((text) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setError("CSV file must have a header row and at least one data row.");
      return;
    }
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, ""));
    const data = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row = {};
      headers.forEach((header, i) => { row[header] = values[i] || ""; });
      return row;
    });
    onUploadComplete(data);
    setFile(null);
    setError("");
  }, [onUploadComplete]);

  const handleFile = useCallback((f) => {
    if (!f.name.endsWith(".csv")) { setError("Please upload a .csv file."); return; }
    setError("");
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) parseCSV(e.target.result); };
    reader.readAsText(f);
  }, [parseCSV]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Import Products CSV</h2>
          <button onClick={() => { onClose(); setFile(null); setError(""); }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-5">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
              dragOver ? "border-teal-500 bg-teal-50" : "border-gray-300 hover:border-teal-300"
            }`}
          >
            <input ref={inputRef} type="file" accept=".csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-teal-500" />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">Processing...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-10 h-10 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">Drop your CSV file here, or click to browse</p>
                <p className="text-xs text-gray-500">Supports .csv files</p>
              </div>
            )}
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── CSV Review Modal ──────────────────────────────────────────────────────────

function CSVReviewModal({ isOpen, onClose, data, onConfirmImport }) {
  if (!isOpen || data.length === 0) return null;
  const headers = Object.keys(data[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Review Import</h2>
            <p className="text-sm text-gray-500 mt-0.5">{data.length} product{data.length !== 1 ? "s" : ""} found in CSV</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="overflow-auto flex-1 p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                {headers.map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-2 text-gray-900">{row[h]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors text-gray-900">
            Cancel
          </button>
          <button onClick={() => onConfirmImport(data)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors">
            <Check className="w-4 h-4" />
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Products Table ────────────────────────────────────────────────────────────

function ProductsTable({ products }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            {["Product Name","SKU","Category","Stock","Price","Expiry Date","Actions"].map((h) => (
              <th key={h} className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{p.sku}</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{p.category}</span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{p.stockLevel}</td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">${p.price.toFixed(2)}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{p.expiryDate}</td>
              <td className="px-6 py-4">
                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end   = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const result = [1];
    if (currentPage > 3) result.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) result.push(i);
    if (currentPage < totalPages - 2) result.push("...");
    result.push(totalPages);
    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-500">Showing {start} to {end} of {totalItems.toLocaleString()} products</p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        {pages.map((page, i) =>
          page === "..." ? (
            <span key={`e${i}`} className="px-2 text-gray-400 text-sm">...</span>
          ) : (
            <button key={page} onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                page === currentPage ? "bg-teal-500 text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-900"
              }`}>
              {page}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ProductsPage() {
  const [csvModalOpen,    setCsvModalOpen]    = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [importedData,    setImportedData]    = useState([]);
  const [productsList,    setProductsList]    = useState(initialProducts);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [currentPage,     setCurrentPage]     = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters,     setShowFilters]     = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(productsList.map((p) => p.category))),
    [productsList]
  );

  const filteredProducts = useMemo(() => {
    let list = productsList;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory) list = list.filter((p) => p.category === selectedCategory);
    return list;
  }, [productsList, searchQuery, selectedCategory]);

  const totalPages      = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCSVUpload = (data) => {
    setImportedData(data);
    setCsvModalOpen(false);
    setReviewModalOpen(true);
  };

  const handleConfirmImport = (data) => {
    const newProducts = data.map((item, i) => ({
      id:         productsList.length + i + 1,
      name:       item.name       || "Untitled",
      sku:        item.sku        || `SKU-${productsList.length + i + 1}`,
      category:   item.category   || "Uncategorized",
      price:      parseFloat(item.price) || 0,
      stockLevel: parseInt(item.stocklevel || item.stockLevel || item.stock || "0") || 0,
      expiryDate: item.expirydate || item.expiryDate || item["expiry date"] || "N/A",
      rating:     0,
    }));
    setProductsList([...newProducts, ...productsList]);
    setReviewModalOpen(false);
    setCurrentPage(1);
  };

  const handleSearch = (value) => { setSearchQuery(value); setCurrentPage(1); };
  const handleCategoryFilter = (cat) => { setSelectedCategory(cat); setCurrentPage(1); setShowFilters(false); };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => setCsvModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-[18px] h-[18px]" />
              Import CSV
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors">
              <Plus className="w-[18px] h-[18px]" />
              Add Product
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg"><Package className="w-5 h-5 text-teal-500" /></div>
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-semibold text-gray-900">{productsList.length.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg"><Layers className="w-5 h-5 text-teal-500" /></div>
              <div>
                <p className="text-sm text-gray-500">Categories</p>
                <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200">
          {/* Search & Filter */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20" />
              </div>
              <div className="relative">
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2.5 border text-sm rounded-lg transition-colors ${
                    selectedCategory ? "border-teal-500 bg-teal-50 text-teal-600" : "border-gray-200 hover:bg-gray-50 text-gray-900"
                  }`}>
                  <Filter className="w-[18px] h-[18px]" />
                  {selectedCategory || "Filter"}
                </button>
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-10 p-2">
                    <button onClick={() => handleCategoryFilter(null)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        !selectedCategory ? "bg-teal-50 text-teal-600 font-medium" : "text-gray-900 hover:bg-gray-50"
                      }`}>All Categories</button>
                    {categories.map((cat) => (
                      <button key={cat} onClick={() => handleCategoryFilter(cat)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                          selectedCategory === cat ? "bg-teal-50 text-teal-600 font-medium" : "text-gray-900 hover:bg-gray-50"
                        }`}>{cat}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table + Pagination */}
          <div className="p-6 space-y-4">
            {paginatedProducts.length > 0 ? (
              <ProductsTable products={paginatedProducts} />
            ) : (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No products found matching your search.</p>
              </div>
            )}
            {filteredProducts.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredProducts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </div>
      </div>

      <CSVUploadModal  isOpen={csvModalOpen}    onClose={() => setCsvModalOpen(false)}    onUploadComplete={handleCSVUpload} />
      <CSVReviewModal  isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} data={importedData} onConfirmImport={handleConfirmImport} />
    </div>
  );
}

export default ProductsPage;
