import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Upload,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { DeleteSupplierModal } from '../ui/DeleteSupplierModal';
import { CSVUploadModal } from '../ui/CSVUploadModal';
import { CSVReviewModal } from '../ui/CSVReviewModal';

// ============================
// Helper functions
// ============================
function mapStatus(supplierStatus) {
  return supplierStatus === 1 ? 'Active' : 'Inactive';
}

function mapBadgeLabel(badge) {
  const map = {
    TopPerformer: 'Top Performer',
    Standard: 'Standard',
    ReliablePartner: 'Reliable Partner',
    'At Risk': 'At Risk',
    AtRisk: 'At Risk',
    Average: 'Average',
  };
  return map[badge] || badge || 'N/A';
}

function getBadgeStyle(badge) {
  const label = mapBadgeLabel(badge);
  switch (label) {
    case 'Top Performer':
      return 'pill-green';
    case 'Reliable Partner':
      return 'pill-blue';
    case 'Standard':
    case 'Average':
      return 'pill-amber';
    case 'At Risk':
      return 'pill-red';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

function mapSupplier(supplier) {
  return {
    id: supplier.id,
    name: supplier.supplierName || 'N/A',
    email: supplier.email || '',
    status: mapStatus(supplier.supplierStatus),
    onTimePercentage: Math.round(supplier.onTimePercentage ?? 0),
    leadTime: supplier.leadTime != null ? `${Number(supplier.leadTime).toFixed(1)} days` : 'N/A',
    qualityScore: supplier.qualityScore != null ? Number(supplier.qualityScore).toFixed(1) : null,
    badge: supplier.badge || '',
    phoneNumberOne: supplier.phoneNumberOne || '',
    city: supplier.city || '',
    country: supplier.country || '',
  };
}

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

// ============================
// Design system styles (green accent)
// ============================
const SUPPLIERS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .suppliers-root { font-family: 'DM Sans', sans-serif; }
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
  .pill-red { background: #fde8e8; color: #9b1c1c; }
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
  .progress-bar-bg { background: #e9ecef; border-radius: 9999px; height: 6px; width: 80px; }
  .progress-bar-fill { height: 6px; border-radius: 9999px; transition: width 0.2s ease; }
`;

export function SuppliersPage() {
  const navigate = useNavigate();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);

  const [suppliersList, setSuppliersList] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    setLoading((prev) => (suppliersList.length === 0 ? true : prev));
    setSearching(true);
    setError(null);

    const params = new URLSearchParams({
      page: currentPage,
      page_size: itemsPerPage,
    });

    if (searchQuery) {
      params.append('searchTerm', searchQuery);
    }

    fetch(`/api/Supplier?${params.toString()}`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch suppliers');
        return res.json();
      })
      .then((data) => {
        const mapped = (data.data || []).map(mapSupplier);
        setSuppliersList(mapped);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages > 0 ? data.totalPages : 1);
        setLoading(false);
        setSearching(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
        setSearching(false);
      });
  }, [currentPage, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 700);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = (supplierId) => {
    setSuppliersList((prev) => prev.filter((s) => s.id !== supplierId));
    setDeleteModalOpen(null);
  };

  const handleCSVUpload = (data) => {
    setImportedData(data);
    setCsvModalOpen(false);
    setReviewModalOpen(true);
  };

  const handleConfirmImport = (data) => {
    const newSuppliers = data.map((item, index) => ({
      id: suppliersList.length + index + 1,
      name: item.name || item.supplierName || 'N/A',
      email: item.email || '',
      status: item.status || 'Active',
      onTimePercentage: parseInt(item.onTimePercentage || item.ontimepercentage || '0'),
      leadTime: item.leadTime || item.leadtime || 'N/A',
      qualityScore: item.qualityScore || null,
      badge: item.badge || '',
    }));
    setSuppliersList((prev) => [...newSuppliers, ...prev]);
    setReviewModalOpen(false);
  };

  const getSupplierById = (id) => suppliersList.find((s) => s.id === id);

  const activeCount = suppliersList.filter((s) => s.status === 'Active').length;
  const inactiveCount = suppliersList.length - activeCount;

  if (loading) {
    return (
      <div className="suppliers-root">
        <div className="flex items-center justify-center p-12 text-gray-500 text-sm">
          <div className="db-skeleton h-10 w-48" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suppliers-root p-6 text-red-600 text-sm">Error: {error}</div>
    );
  }

  return (
    <div className="suppliers-root space-y-6">
      <style>{SUPPLIERS_STYLES}</style>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="db-section-title">Suppliers</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setCsvModalOpen(true)} className="db-secondary-btn">
            <Upload className="w-[18px] h-[18px]" />
            Import CSV
          </button>
          <Link to="/suppliers/add" className="db-primary-btn">
            <Plus className="w-[18px] h-[18px]" />
            Add Supplier
          </Link>
        </div>
      </div>

      {/* STATS CARDS (Dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Total Suppliers</span>
          </div>
          <div className="p-5">
            <div className="text-2xl font-semibold text-gray-900">{totalCount}</div>
          </div>
        </div>
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Active Suppliers</span>
          </div>
          <div className="p-5">
            <div className="text-2xl font-semibold text-green-600">{activeCount}</div>
          </div>
        </div>
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Inactive Suppliers</span>
          </div>
          <div className="p-5">
            <div className="text-2xl font-semibold text-gray-400">{inactiveCount}</div>
          </div>
        </div>
      </div>

      {/* MAIN TABLE CARD */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Supplier Directory</span>
        </div>

        {/* SEARCH */}
        <div className="p-5 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="db-search-input pl-11"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className={`overflow-x-auto transition-opacity duration-200 ${searching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <table className="db-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>On-Time %</th>
                <th>Lead Time</th>
                <th>Badge</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                suppliersList.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="font-medium">{supplier.name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar-bg">
                          <div
                            className={`progress-bar-fill ${
                              supplier.onTimePercentage >= 90
                                ? 'bg-green-500'
                                : supplier.onTimePercentage >= 75
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(supplier.onTimePercentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-900 font-medium whitespace-nowrap">
                          {supplier.onTimePercentage}%
                        </span>
                      </div>
                    </td>
                    <td>{supplier.leadTime}</td>
                    <td>
                      <span className={`db-stat-pill ${getBadgeStyle(supplier.badge)}`}>
                        {mapBadgeLabel(supplier.badge)}
                      </span>
                    </td>
                    <td>
                      <span className={`db-stat-pill ${supplier.status === 'Active' ? 'pill-green' : 'bg-gray-100 text-gray-600'}`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td>
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === supplier.id ? null : supplier.id)}
                          className="db-icon-btn"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdown === supplier.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute right-0 top-full z-50 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  navigate(`/suppliers/view-supplier/${supplier.id}`);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  navigate(`/suppliers/edit-supplier/${supplier.id}`);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Supplier
                              </button>
                              <button
                                onClick={() => {
                                  setOpenDropdown(null);
                                  setDeleteModalOpen(supplier.id);
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} — {totalCount} total suppliers
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="db-icon-btn disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-[#0f8c5a] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="db-icon-btn disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <DeleteSupplierModal
        isOpen={deleteModalOpen !== null}
        onClose={() => setDeleteModalOpen(null)}
        supplierId={deleteModalOpen}
        supplierName={getSupplierById(deleteModalOpen)?.name || ''}
        onConfirm={() => handleDelete(deleteModalOpen)}
      />
      <CSVUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        type="suppliers"
        onUploadComplete={handleCSVUpload}
      />
      <CSVReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        data={importedData}
        type="suppliers"
        onConfirmImport={handleConfirmImport}
      />
    </div>
  );
}