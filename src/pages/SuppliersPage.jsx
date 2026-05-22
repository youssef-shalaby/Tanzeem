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
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);

    fetch(`/api/Supplier?page=${currentPage}&page_size=${itemsPerPage}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch suppliers');
        }
        return res.json();
      })
      .then((data) => {
        // MAP API RESPONSE TO FRONTEND STRUCTURE (Only fields from Database)
        const mappedSuppliers = (data.data || []).map((supplier) => ({
          id: supplier.id,
          name: supplier.supplierName || 'N/A',
          email: supplier.email || '',
          status: supplier.supplierStatus === 0 ? 'Active' : 'Inactive', // 0 maps to Active
        }));

        setSuppliersList(mappedSuppliers);
        setTotalCount(data.totalCount || 0);

        const pages = data.totalPages && data.totalPages > 0 ? data.totalPages : 1;
        setTotalPages(pages);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage]);

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
      name: item.name || item.supplierName,
      email: item.email || '',
      status: item.status || 'Active',
    }));

    setSuppliersList((prev) => [...newSuppliers, ...prev]);
    setReviewModalOpen(false);
  };

  const getSupplierById = (id) => suppliersList.find((s) => s.id === id);

  const filteredSuppliers = suppliersList.filter((supplier) => {
    const name = supplier.name?.toLowerCase() || '';
    const email = supplier.email?.toLowerCase() || '';

    return (
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase())
    );
  });

  const activeCount = suppliersList.filter((s) => s.status === 'Active').length;
  const inactiveCount = suppliersList.length - activeCount;

  if (loading) {
    return <div className="p-6 text-gray-500">Loading suppliers...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-[18px] h-[18px]" />
            Import CSV
          </button>

          <Link
            to="/suppliers/add"
            className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
          >
            <Plus className="w-[18px] h-[18px]" />
            Add Supplier
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Suppliers</div>
          <div className="text-2xl font-semibold text-gray-900">{totalCount}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Active Suppliers</div>
          <div className="text-2xl font-semibold text-green-600">{activeCount}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Inactive Suppliers</div>
          <div className="text-2xl font-semibold text-gray-400">{inactiveCount}</div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        {/* SEARCH */}
        <div className="p-5 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            />
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-visible">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-500">
                    No suppliers found.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {/* NAME */}
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {supplier.name}
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {supplier.email || '—'}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                          supplier.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-sm">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(openDropdown === supplier.id ? null : supplier.id)
                          }
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
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
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} — {totalCount} total suppliers
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    currentPage === page ? 'bg-[#15aaad] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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