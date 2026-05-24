import { ArrowLeft, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { useState, useEffect } from 'react';

const ISSUE_TYPE_MAP = { damaged: 0, missing: 1, incorrect: 2, defective: 3, other: 4 };

export function ConfirmDeliveryPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [itemDetails, setItemDetails] = useState({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const stateOrder = location.state?.order;
    const stateItems = location.state?.items ?? stateOrder?.itemsConfirmResponseDtos;

    // If navigation state already contains items, use them directly
    if (stateItems?.length) {
      const base = stateOrder || {};
      setOrder({ ...base, itemsConfirmResponseDtos: stateItems });
      initItemDetails(stateItems);
      setLoading(false);
      return;
    }

    // Otherwise fetch from View_Order_Confirm
    fetch(`/api/Order/View_Order_Confirm/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load order.');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        initItemDetails(data.itemsConfirmResponseDtos || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch order details.');
        setLoading(false);
      });
  }, [orderId]);

  const initItemDetails = (itemList) => {
    const initial = {};
    itemList.forEach((item) => {
      initial[item.productId] = { damaged: 0, missing: 0, incorrect: 0, defective: 0, other: 0, notes: '' };
    });
    setItemDetails(initial);
  };

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

    const payload = {
      orderId: order.orderId ?? order.id ?? parseInt(orderId),
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to confirm delivery.');
        navigate(`/orders/${orderId}`);
      })
      .catch((err) => {
        alert(err.message);
        setSubmitting(false);
      });
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading procurement snapshot details...</div>;
  if (error || !order) return <div className="p-6 text-sm text-red-600">Failed to render: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Confirm Delivery & Update Stock</h1>
            <p className="text-sm text-gray-600 mt-1">Order {order.orderStringId} • Review and confirm received quantities</p>
          </div>
        </div>
      </div>

      {/* Delivery date */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Actual Delivery Date *</label>
        <input
          type="date"
          value={receivedDate}
          onChange={(e) => setReceivedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none w-full sm:w-64"
        />
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Verify Received Quantities</h3>
            <p className="text-sm text-blue-800">
              Confirm the actual quantities received for each item. If there are any issues, specify the exact quantity for each problem type
              (damaged, missing, incorrect, defective, or other). Stock will only be updated with confirmed good quantities.
            </p>
          </div>
        </div>
      </div>

      {/* Discrepancy Alert */}
      {hasDiscrepancies && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
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
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">Order Items</h2>
        </div>
        <div className="p-6 space-y-6">
          {order.itemsConfirmResponseDtos?.map((item) => {
            const totalIssues = getTotalIssues(item.productId);
            const ordered = item.orderedQuantity;
            const receivedGood = getReceivedGood(item.productId, ordered);

            return (
              <div
                key={item.productId}
                className={`p-5 rounded-xl border-2 ${totalIssues > 0 ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 bg-gray-50/50'}`}
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
                    <label className="text-sm font-medium text-gray-700">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white"
                          value={itemDetails[item.productId]?.[field] || ''}
                          onChange={(e) => handleItemChange(item.productId, field, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>

                  {totalIssues > 0 && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs font-medium text-gray-900 mb-2">Issue Summary:</p>
                      <div className="flex flex-wrap gap-2">
                        {itemDetails[item.productId]?.damaged > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">Damaged: {itemDetails[item.productId].damaged}</span>}
                        {itemDetails[item.productId]?.missing > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">Missing: {itemDetails[item.productId].missing}</span>}
                        {itemDetails[item.productId]?.incorrect > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">Incorrect: {itemDetails[item.productId].incorrect}</span>}
                        {itemDetails[item.productId]?.defective > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">Defective: {itemDetails[item.productId].defective}</span>}
                        {itemDetails[item.productId]?.other > 0 && <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">Other: {itemDetails[item.productId].other}</span>}
                      </div>
                    </div>
                  )}
                </div>

                {totalIssues > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">
                      Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain the issues in detail..."
                      className="w-full px-4 py-3 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white resize-none"
                      value={itemDetails[item.productId]?.notes || ''}
                      onChange={(e) => handleItemChange(item.productId, 'notes', e.target.value)}
                    />
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-300 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Good Stock:</span>
                    <p className="font-semibold text-green-600">{receivedGood} units</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Issues:</span>
                    <p className="font-semibold text-orange-600">{totalIssues} units</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <p className="font-semibold text-gray-900">{receivedGood + totalIssues} / {ordered}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Notes */}
      {hasDiscrepancies && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Additional Information</h2>
          <label className="text-sm font-medium text-gray-900 mb-2 block">General Notes (Optional)</label>
          <textarea
            rows={4}
            placeholder="Add any general notes about the delivery or issues..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 resize-none"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
          />
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="space-y-3">
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
          className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelivery}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-[18px] h-[18px]" />
          {submitting ? 'Confirming...' : 'Confirm & Update Stock'}
        </button>
      </div>
    </div>
  );
}