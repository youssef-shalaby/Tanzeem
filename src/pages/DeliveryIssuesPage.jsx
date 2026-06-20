import { Search, AlertTriangle, XCircle, ChevronLeft, ChevronRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { PageLoadingState } from '../components/LoadingStates';
import { formatAppDate } from '../utils/dateTime';

// ============================
// Design system styles (matching Dashboard)
// ============================
const DELIVERY_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .delivery-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
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
  .db-search-input {
    width: 100%; padding: 9px 14px 9px 36px;
    background: #f5f6f3; border: 1px solid transparent;
    border-radius: 100px; font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s, background .2s;
  }
  .db-search-input::placeholder { color: #aaa; }
  .db-search-input:focus { background: #fff; border-color: rgba(15,140,90,.3); }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: .5px; padding: 10px 16px; text-align: left; background: #f9faf7; }
  .db-table td { padding: 12px 16px; font-size: 13px; color: #1a1a18; border-top: 1px solid rgba(0,0,0,.05); }
  .db-table tr:hover td { background: #f9faf7; }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-skeleton { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:10px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

const ISSUE_TYPE_LABELS = {
  0: 'Damaged',
  1: 'Missing',
  2: 'Defective',
  3: 'Incorrect',
  4: 'Other',
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
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        page_size: itemsPerPage,
      });
      if (searchQuery.trim()) params.set('searchTerm', searchQuery.trim());

      fetch(`/api/DeliveryIssues?${params.toString()}`, {
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
          if (cancelled) return;
          setIssues(data.data || []);
          setTotalCount(data.totalCount || 0);
          setTotalPages(data.totalPages || 1);
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err.message);
          setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [currentPage, searchQuery]);

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

  const stats = {
    total: totalCount,
    itemsAffected: issues.reduce((sum, i) => sum + (i.itemsAffected || 0), 0),
    discrepancy: issues.reduce((sum, i) => sum + (i.discrepancy || 0), 0),
  };
  const hasIssueSearch = searchQuery.trim() !== '';

  if (loading) return (
    <PageLoadingState
      className="delivery-root"
      title="Loading delivery issues"
      detail="Checking open discrepancies and affected order items."
    />
  );
  if (error) return <div className="delivery-root p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="delivery-root space-y-6">
      <style>{DELIVERY_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-heading">
        <h1 className="db-section-title">Delivery Issues</h1>
        <p className="app-page-subtitle">Track delivery discrepancies, affected items, and follow-up actions.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Issues" value={stats.total} sub="Open delivery records" icon={AlertTriangle} iconColor="#66706a" iconBgColor="bg-gray-100" className="db-fade-in" />
        <StatCard title="Items Affected" value={stats.itemsAffected} sub="Units requiring review" subColor="#d97706" icon={AlertTriangle} iconColor="#f97316" iconBgColor="bg-orange-100" className="db-fade-in" />
        <StatCard title="Total Discrepancy" value={`-${stats.discrepancy}`} sub="Units short or damaged" subColor="#dc2626" icon={XCircle} iconColor="#ef4444" iconBgColor="bg-red-100" className="db-fade-in" />
      </div>

      {/* Search Card */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Search Issues</span>
        </div>
        <div className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by issue ID, order ID, or supplier..."
              className="db-search-input pl-11"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Issues Table Card */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Issue Log</span>
        </div>
        <div className="app-table-frame overflow-x-auto">
          {issues.length === 0 ? (
            <EmptyState
              icon={hasIssueSearch ? Search : CheckCircle2}
              tone={hasIssueSearch ? 'blue' : 'green'}
              title={hasIssueSearch ? 'No delivery issues match this search' : 'No delivery issues'}
              message={
                hasIssueSearch
                  ? 'Delivery issues matching the current issue ID, order ID, or supplier search will appear here.'
                  : 'When delivered orders have missing, damaged, defective, or incorrect items, they will appear here for follow-up.'
              }
              actions={
                hasIssueSearch
                  ? [
                      {
                        label: 'Clear search',
                        icon: RotateCcw,
                        variant: 'secondary',
                        onClick: () => setSearchQuery(''),
                      },
                    ]
                  : []
              }
            />
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Order ID</th>
                  <th>Date Received</th>
                  <th>Supplier</th>
                  <th>Issue Types</th>
                  <th className="text-center">Items Affected</th>
                  <th className="text-center">Discrepancy</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="font-medium">{issue.stringId}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/orders/${issue.orderId}`)}
                        className="text-[#0f8c5a] hover:underline text-sm"
                      >
                        ORD-{issue.orderId}
                      </button>
                    </td>
                    <td>
                      {formatAppDate(issue.recievedDate, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td>{issue.supplierName}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {getIssueTypeLabels(issue.items).map((type, idx) => (
                          <span key={idx} className="db-stat-pill pill-red">
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-center">{issue.itemsAffected}</td>
                    <td className="text-center">
                      <span className="text-sm font-medium text-orange-600">-{issue.discrepancy}</span>
                    </td>
                    <td className="text-center">
                      <button
                        onClick={() => navigate(`/delivery-issues/${issue.id}`)}
                        className="db-secondary-btn"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} — {totalCount} total issues
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="db-icon-btn disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-[#0f8c5a] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="db-icon-btn disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
