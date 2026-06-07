import { ArrowLeft, AlertTriangle, Package, Calendar, User, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';

// ============================
// Design system styles (green accent)
// ============================
const VIEW_ISSUE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .view-issue-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .pill-orange { background: #ffedd5; color: #c2410c; }
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
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

const ISSUE_TYPE_LABELS = {
  0: 'Damaged',
  1: 'Missing',
  2: 'Defective',
  3: 'Incorrect',
  4: 'Other',
};

const ISSUE_TYPE_STYLES = {
  'Other':     'bg-gray-100 text-gray-700',
  'Damaged':   'bg-red-100 text-red-700',
  'Missing':   'bg-orange-100 text-orange-700',
  'Incorrect': 'bg-purple-100 text-purple-700',
  'Defective': 'bg-yellow-100 text-yellow-700',
};

export function ViewDeliveryIssuePage() {
  const navigate = useNavigate();
  const { issueId } = useParams();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetch(`/api/DeliveryIssues/${issueId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch issue');
        return res.json();
      })
      .then((data) => {
        setIssue(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [issueId]);

  if (loading) return <div className="view-issue-root p-6 text-gray-500">Loading issue details...</div>;
  if (error) return <div className="view-issue-root p-6 text-red-600">Error: {error}</div>;
  if (!issue) return null;

  const formattedDate = new Date(issue.recievedDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedTime = new Date(issue.recievedDate).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const totalDiscrepancy = issue.discrepancy || 0;

  return (
    <div className="view-issue-root space-y-6">
      <style>{VIEW_ISSUE_STYLES}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="db-icon-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="db-section-title">Issue Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              Issue {issue.stringId} • Order ORD-{issue.orderId}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/orders/${issue.orderId}`)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#0f8c5a] border border-[#0f8c5a] rounded-full hover:bg-[#0f8c5a]/10 transition-colors"
        >
          View Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Issue Overview */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Issue Overview</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Received Date</span>
                  </div>
                  <p className="font-medium text-gray-900">{formattedDate} at {formattedTime}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <User className="w-4 h-4" />
                    <span>Supplier</span>
                  </div>
                  <p className="font-medium text-gray-900">{issue.supplierName}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Package className="w-4 h-4" />
                    <span>Total Discrepancy</span>
                  </div>
                  <p className="font-medium text-orange-600">-{totalDiscrepancy} units</p>
                </div>
              </div>
            </div>
          </div>

          {/* Affected Items */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Affected Items ({issue.items?.length || 0})</span>
            </div>
            <div className="p-5 space-y-4">
              {issue.items?.map((item, index) => {
                const totalIssueQty = item.issues?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                const received = item.orderedQuantity - totalIssueQty;
                return (
                  <div key={index} className="rounded-xl p-5 bg-orange-50 border border-orange-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                          <span className="db-stat-pill pill-orange">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            -{totalIssueQty} units
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Ordered</p>
                        <p className="text-lg font-semibold text-gray-900">{item.orderedQuantity}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-green-300">
                        <p className="text-xs text-green-600 mb-1">Received (Good)</p>
                        <p className="text-lg font-semibold text-green-600">{received}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-orange-300">
                        <p className="text-xs text-orange-600 mb-1">Total Issues</p>
                        <p className="text-lg font-semibold text-orange-600">{totalIssueQty}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-900 mb-3">Issue Breakdown:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.issues?.map((iss, idx) => {
                          const label = ISSUE_TYPE_LABELS[iss.issueType] ?? `Type ${iss.issueType}`;
                          const style = ISSUE_TYPE_STYLES[label] ?? 'bg-gray-100 text-gray-700';
                          return (
                            <span key={idx} className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${style}`}>
                              {label}: {iss.quantity} units
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* General Notes */}
          {issue.notes && (
            <div className="db-card">
              <div className="db-card-header">
                <span className="db-card-title">Notes</span>
              </div>
              <div className="p-5">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-700 leading-relaxed">{issue.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Supplier Info */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Supplier Information</span>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Name</p>
                <p className="font-medium text-gray-900">{issue.supplierName}</p>
              </div>
              {issue.supplierEmail && (
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="text-gray-900">{issue.supplierEmail}</p>
                </div>
              )}
              {issue.supplierPhone && (
                <div>
                  <p className="text-gray-600 mb-1">Phone</p>
                  <p className="text-gray-900">{issue.supplierPhone}</p>
                </div>
              )}
            </div>
            <div className="px-5 pb-5">
              <button className="w-full db-secondary-btn justify-center">
                Contact Supplier
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Summary</span>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Items Affected</span>
                <span className="font-medium text-gray-900">{issue.itemsAffected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Ordered</span>
                <span className="font-medium text-gray-900">
                  {issue.items?.reduce((sum, i) => sum + i.orderedQuantity, 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Total Discrepancy</span>
                <span className="font-semibold text-orange-600">-{totalDiscrepancy} units</span>
              </div>
            </div>
          </div>

          {/* Resolution Notes */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Resolution Notes</span>
            </div>
            <div className="p-5 space-y-3">
              <textarea
                rows={4}
                placeholder="Add notes about the resolution..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f8c5a]/20 resize-none"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
              <button
                onClick={() => alert('Resolution notes saved!')}
                className="w-full db-primary-btn justify-center"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}