import { ArrowLeft, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useState, useEffect } from 'react';

// ============================
// Design system styles (green accent)
// ============================
const CONFIRM_DELIVERY_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .confirm-delivery-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
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
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-orange { background: #ffedd5; color: #c2410c; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-input {
    width: 100%; padding: 9px 14px;
    background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s;
  }
  .db-input:focus { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .delivery-info-panel {
    border: 1px solid rgba(0,0,0,.08); border-radius: 14px;
    background: #fafbf8; padding: 20px;
  }
  .delivery-warning-panel {
    border: 1px solid #fed7aa; border-radius: 14px;
    background: #fff7ed; padding: 20px;
  }
  .delivery-item-panel {
    border: 1px solid rgba(0,0,0,.08); border-radius: 14px;
    background: #fafbf8; padding: 20px;
  }
  .delivery-item-panel.has-issues { border-color: #fed7aa; background: #fff7ed; }
  .delivery-metric {
    border: 1px solid rgba(0,0,0,.08); border-radius: 12px;
    background: #fff; padding: 12px;
  }
`;

const ISSUE_TYPE_MAP = { damaged: 0, missing: 1, incorrect: 2, defective: 3, other: 4 };

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function createItemDetails(itemList = []) {
  const initial = {};
  itemList.forEach((item) => {
    initial[item.productId] = { damaged: 0, missing: 0, incorrect: 0, defective: 0, other: 0, notes: '' };
  });
  return initial;
}

export function ConfirmDeliveryPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const stateOrder = location.state?.order;
  const stateItems = location.state?.items ?? stateOrder?.itemsConfirmResponseDtos;
  const hasStateItems = Boolean(stateItems?.length);

  const [order, setOrder] = useState(() => (
    hasStateItems ? { ...(stateOrder || {}), itemsConfirmResponseDtos: stateItems } : null
  ));
  const [loading, setLoading] = useState(() => !hasStateItems);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [itemDetails, setItemDetails] = useState(() => createItemDetails(stateItems || []));
  const [generalNotes, setGeneralNotes] = useState('');
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (hasStateItems) {
      return;
    }

    fetch(`/api/Order/View_Order_Confirm/${orderId}`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load order.');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setItemDetails(createItemDetails(data.itemsConfirmResponseDtos || []));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch order details.');
        setLoading(false);
      });
  }, [orderId, hasStateItems]);

  const handleItemChange = (itemId, field, value) => {
    setItemDetails(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const getIssueBreakdown = (itemId) => {
    const details = itemDetails[itemId];
    return {
      damaged: details?.damaged || 0,
      missing: details?.missing || 0,
      incorrect: details?.incorrect || 0,
      defective: details?.defective || 0,
      other: details?.other || 0,
    };
  };

  const getTotalIssues = (itemId) => {
    const b = getIssueBreakdown(itemId);
    return b.damaged + b.missing + b.incorrect + b.defective + b.other;
  };

  const getReceivedGood = (itemId, orderedQty) => orderedQty - getTotalIssues(itemId);

  const getTotalDiscrepancy = () =>
    order?.itemsConfirmResponseDtos?.reduce((total, item) => total + getTotalIssues(item.productId), 0) ?? 0;

  const hasDiscrepancies = getTotalDiscrepancy() > 0;
  const itemsWithIssues = order?.itemsConfirmResponseDtos?.filter(item => getTotalIssues(item.productId) > 0).length ?? 0;

  const handleConfirmDelivery = () => {
    const hasUnexplainedIssues = order.itemsConfirmResponseDtos?.some(item => {
      const totalIssues = getTotalIssues(item.productId);
      const hasNotes = itemDetails[item.productId]?.notes?.trim();
      return totalIssues > 0 && !hasNotes;
    });

    if (hasUnexplainedIssues) {
      alert('Please add notes for items with issues');
      return;
    }

    setSubmitting(true);

    const resolvedOrderId = order.orderId ?? order.id ?? parseInt(orderId);

    const payload = {
      orderId: resolvedOrderId,
      recievedDate: new Date(receivedDate).toISOString(),
      notes: generalNotes,
      itemsConfirmDtos: order.itemsConfirmResponseDtos?.map((item) => {
        const d = itemDetails[item.productId] || {};
        const itemsIssueDtos = Object.entries(ISSUE_TYPE_MAP)
          .filter(([field]) => d[field] > 0)
          .map(([field, issueType]) => ({ issueType, quantity: d[field] }));
        return { productId: item.productId, notes: d.notes || '', itemsIssueDtos };
      }),
    };

    fetch('/api/Order/ConfirmDelivery', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          let serverMessage = 'Failed to confirm delivery.';
          try {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const json = await res.json();
              serverMessage = json.message || json.title || JSON.stringify(json);
            } else {
              const text = await res.text();
              if (text) serverMessage = text;
            }
          } catch {
            // Keep the fallback error message when the server response cannot be parsed.
          }
          throw new Error(serverMessage);
        }
        navigate(`/orders/${orderId}`);
      })
      .catch((err) => {
        alert(err.message);
        setSubmitting(false);
      });
  };

  if (loading) return <div className="confirm-delivery-root p-6 text-sm text-gray-500">Loading procurement snapshot details...</div>;
  if (error || !order) return <div className="confirm-delivery-root p-6 text-sm text-red-600">Failed to render: {error}</div>;

  return (
    <div className="confirm-delivery-root max-w-4xl mx-auto space-y-6">
      <style>{CONFIRM_DELIVERY_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="db-icon-btn"
            aria-label="Back to order"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="app-page-heading">
            <h1 className="app-page-title">Confirm Delivery & Update Stock</h1>
            <p className="app-page-subtitle">Order {order.orderStringId} • Review and confirm received quantities.</p>
          </div>
        </div>
      </div>

      {/* Delivery date card */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Actual Delivery Date</span>
        </div>
        <div className="p-5">
          <input
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="db-input w-full sm:w-64"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="delivery-info-panel">
        <div className="flex items-start gap-3">
          <div className="app-stat-icon flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Verify Received Quantities</h3>
            <p className="text-sm text-gray-600">
              Confirm the actual quantities received for each item. If there are any issues, specify the exact quantity for each problem type
              (damaged, missing, incorrect, defective, or other). Stock will only be updated with confirmed good quantities.
            </p>
          </div>
        </div>
      </div>

      {/* Discrepancy Alert */}
      {hasDiscrepancies && (
        <div className="delivery-warning-panel">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-600">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900 mb-1">Quantity Discrepancy Detected</h3>
              <p className="text-sm text-orange-800">
                <strong>{itemsWithIssues} item{itemsWithIssues !== 1 ? 's' : ''}</strong> with a total difference of{' '}
                <strong>{Math.abs(getTotalDiscrepancy())} units</strong>. Please break down the issues by type and add notes for each affected item.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Item Cards */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Order Items</span>
        </div>
        <div className="p-5 space-y-6">
          {order.itemsConfirmResponseDtos?.map((item) => {
            const totalIssues = getTotalIssues(item.productId);
            const ordered = item.orderedQuantity;
            const receivedGood = getReceivedGood(item.productId, ordered);

            return (
              <div
                key={item.productId}
                className={`delivery-item-panel ${totalIssues > 0 ? 'has-issues' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gray-900">Product #{item.productId}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{item.sku || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Ordered</p>
                    <p className="text-lg font-semibold text-gray-900">{ordered} units</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="app-form-label">
                      Issue Breakdown {totalIssues > 0 && <span className="text-red-500">*</span>}
                    </label>
                    <div className="text-sm">
                      <span className="text-gray-600">Total Issues: </span>
                      <span className={`font-semibold ${totalIssues === 0 ? 'text-gray-900' : totalIssues <= ordered ? 'text-orange-600' : 'text-red-600'}`}>
                        {totalIssues}
                      </span>
                      {totalIssues > ordered && (
                        <span className="ml-2 text-red-600 text-xs">(Cannot exceed ordered quantity!)</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['damaged', 'missing', 'incorrect', 'defective', 'other'].map((field) => (
                      <div key={field}>
                        <label className="text-xs text-gray-600 mb-1.5 block capitalize">{field}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="db-input"
                          value={itemDetails[item.productId]?.[field] || ''}
                          onChange={(e) => handleItemChange(item.productId, field, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>

                  {totalIssues > 0 && (
                    <div className="mt-3 delivery-metric">
                      <p className="text-xs font-medium text-gray-900 mb-2">Issue Summary:</p>
                      <div className="flex flex-wrap gap-2">
                        {itemDetails[item.productId]?.damaged > 0 && <span className="db-stat-pill pill-green">Damaged: {itemDetails[item.productId].damaged}</span>}
                        {itemDetails[item.productId]?.missing > 0 && <span className="db-stat-pill pill-green">Missing: {itemDetails[item.productId].missing}</span>}
                        {itemDetails[item.productId]?.incorrect > 0 && <span className="db-stat-pill pill-green">Incorrect: {itemDetails[item.productId].incorrect}</span>}
                        {itemDetails[item.productId]?.defective > 0 && <span className="db-stat-pill pill-green">Defective: {itemDetails[item.productId].defective}</span>}
                        {itemDetails[item.productId]?.other > 0 && <span className="db-stat-pill pill-green">Other: {itemDetails[item.productId].other}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {totalIssues > 0 && (
                  <div>
                    <label className="app-form-label">
                      Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain the issues in detail..."
                      className="db-input resize-none"
                      value={itemDetails[item.productId]?.notes || ''}
                      onChange={(e) => handleItemChange(item.productId, 'notes', e.target.value)}
                    />
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="delivery-metric">
                    <span className="text-gray-600">Good Stock:</span>
                    <p className="font-semibold text-green-600">{receivedGood} units</p>
                  </div>
                  <div className="delivery-metric">
                    <span className="text-gray-600">Issues:</span>
                    <p className="font-semibold text-orange-600">{totalIssues} units</p>
                  </div>
                  <div className="delivery-metric">
                    <span className="text-gray-600">Total:</span>
                    <p className="font-semibold text-gray-900">{receivedGood + totalIssues} / {ordered}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Notes (only if discrepancies exist) */}
      {hasDiscrepancies && (
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Additional Information</span>
          </div>
          <div className="p-5">
            <label className="app-form-label">General Notes (Optional)</label>
            <textarea
              rows={4}
              placeholder="Add any general notes about the delivery or issues..."
              className="db-input resize-none"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Summary</span>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Items</span>
            <span className="font-medium text-gray-900">{order.itemsConfirmResponseDtos?.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Ordered Units</span>
            <span className="font-medium text-gray-900">
              {order.itemsConfirmResponseDtos?.reduce((sum, item) => sum + item.orderedQuantity, 0)} units
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Received (Good) Units</span>
            <span className="font-medium text-green-600">
              {order.itemsConfirmResponseDtos?.reduce((sum, item) => sum + getReceivedGood(item.productId, item.orderedQuantity), 0)} units
            </span>
          </div>
          {hasDiscrepancies && (
            <>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-orange-600 font-medium">Total Issues</span>
                <span className="font-semibold text-orange-600">
                  {order.itemsConfirmResponseDtos?.reduce((sum, item) => sum + getTotalIssues(item.productId), 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600 font-medium">Items with Issues</span>
                <span className="font-semibold text-orange-600">{itemsWithIssues} of {order.itemsConfirmResponseDtos?.length}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="db-secondary-btn"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelivery}
          disabled={submitting}
          className="db-primary-btn"
        >
          <CheckCircle className="w-[18px] h-[18px]" />
          {submitting ? 'Confirming...' : 'Confirm & Update Stock'}
        </button>
      </div>
    </div>
  );
}
