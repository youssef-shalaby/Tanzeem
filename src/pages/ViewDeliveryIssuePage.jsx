import { ArrowLeft, AlertTriangle, Package, Calendar, User, FileText } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState, useEffect } from 'react';

const ISSUE_TYPE_LABELS = {
  0: 'Other',
  1: 'Damaged',
  2: 'Missing',
  3: 'Defective',
  4: 'Incorrect',
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
    fetch(`/api/DeliveryIssues/${issueId}`)
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

  if (loading) return <div className="p-6 text-gray-500">Loading issue details...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!issue) return null;

  const formattedDate = new Date(issue.recievedDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const formattedTime = new Date(issue.recievedDate).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit'
  });

  const totalDiscrepancy = issue.discrepancy || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Issue Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              Issue {issue.stringId} • Order ORD-{issue.orderId}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/orders/${issue.orderId}`)}
          className="px-4 py-2 text-sm text-[#15aaad] border border-[#15aaad] rounded-lg hover:bg-[#15aaad]/5 transition-colors"
        >
          View Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Issue Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 text-lg mb-4">Issue Overview</h2>
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

          {/* Affected Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Affected Items ({issue.items?.length || 0})
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {issue.items?.map((item, index) => {
                const totalIssueQty = item.issues?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                const received = item.orderedQuantity - totalIssueQty;
                return (
                  <div key={index} className="rounded-lg p-5 bg-orange-50 border-2 border-orange-200">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-md">
                            <AlertTriangle className="w-4 h-4" />
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
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">Notes</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{issue.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Supplier Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Supplier Information</h2>
            <div className="space-y-3 text-sm">
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
            <button className="w-full mt-4 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
              Contact Supplier
            </button>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
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
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Resolution Notes</h2>
            <textarea
              rows={4}
              placeholder="Add notes about the resolution..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 resize-none"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
            <button
              onClick={() => alert('Resolution notes saved!')}
              className="w-full mt-3 px-4 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}