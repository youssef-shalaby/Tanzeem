import { Search, Eye, AlertTriangle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

// issueType numbers → labels  (0 = Other/Unknown as a safe fallback for unmapped backend values)
const ISSUE_TYPE_LABELS = {
  0: 'Other',
  1: 'Damaged',
  2: 'Missing',
  3: 'Defective',
  4: 'Incorrect',
};


function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}
export function DeliveryIssuesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [issues, setIssues] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/DeliveryIssues?page=${currentPage}&page_size=${itemsPerPage}`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch delivery issues');
        return res.json();
      })
      .then((data) => {
        setIssues(data.data || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage]);

  // Collect unique issue type labels across all items in a delivery issue
  const getIssueTypeLabels = (items) => {
    const types = new Set();
    items?.forEach(item =>
      item.issues?.forEach(i => {
        const label = ISSUE_TYPE_LABELS[i.issueType] ?? `Type ${i.issueType}`;
        types.add(label);
      })
    );
    return [...types];
  };

  const filteredIssues = issues.filter((issue) => {
    const id = issue.stringId?.toLowerCase() || '';
    const orderId = String(issue.orderId);
    const supplier = issue.supplierName?.toLowerCase() || '';
    return (
      id.includes(searchQuery.toLowerCase()) ||
      orderId.includes(searchQuery) ||
      supplier.includes(searchQuery.toLowerCase())
    );
  });

  const stats = {
    total: totalCount,
    itemsAffected: issues.reduce((sum, i) => sum + (i.itemsAffected || 0), 0),
    discrepancy: issues.reduce((sum, i) => sum + (i.discrepancy || 0), 0),
  };

  if (loading) return <div className="p-6 text-gray-500">Loading delivery issues...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Delivery Issues</h1>
        <p className="text-sm text-gray-600 mt-1">Track and manage delivery discrepancies and issues</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Issues</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Items Affected</p>
              <p className="text-2xl font-semibold text-orange-600">{stats.itemsAffected}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Discrepancy</p>
              <p className="text-2xl font-semibold text-red-600">-{stats.discrepancy}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by issue ID, order ID, or supplier..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Issue ID</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date Received</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Types</th>
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Items Affected</th>
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Discrepancy</th>
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                    No delivery issues found.
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{issue.stringId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/orders/${issue.orderId}`)}
                        className="text-sm text-[#15aaad] hover:underline"
                      >
                        ORD-{issue.orderId}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(issue.recievedDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{issue.supplierName}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {getIssueTypeLabels(issue.items).map((type, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-center">{issue.itemsAffected}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-orange-600">-{issue.discrepancy}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/delivery-issues/${issue.id}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} — {totalCount} total issues
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                    currentPage === page ? 'bg-[#15aaad] text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}