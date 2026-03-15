import { ArrowLeft, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';

export function ConfirmDeliveryPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Mock order data - in real app, fetch based on orderId
  const order = {
    id: orderId || 'ORD-3492',
    date: 'Oct 24, 2023',
    deliveredDate: 'Oct 27, 2023',
    supplier: {
      name: 'Acme Corp',
    },
    items: [
      { id: 1, product: 'Laptop Stand', sku: 'LS-001', orderedQty: 50, price: 15.00 },
      { id: 2, product: 'Wireless Mouse', sku: 'WM-002', orderedQty: 100, price: 5.00 },
    ],
  };

  // Initialize item details state
  const [itemDetails, setItemDetails] = useState(
    order.items.reduce((acc, item) => ({
      ...acc,
      [item.id]: {
        damaged: 0,
        missing: 0,
        incorrect: 0,
        defective: 0,
        other: 0,
        notes: ''
      }
    }), {})
  );

  const [generalNotes, setGeneralNotes] = useState('');

  const handleItemChange = (itemId, field, value) => {
    setItemDetails(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
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
    const breakdown = getIssueBreakdown(itemId);
    return breakdown.damaged + breakdown.missing + breakdown.incorrect + breakdown.defective + breakdown.other;
  };

  const getReceivedGood = (itemId, orderedQty) => {
    const totalIssues = getTotalIssues(itemId);
    return orderedQty - totalIssues;
  };

  const handleConfirmDelivery = () => {
    const hasUnexplainedIssues = order.items.some(item => {
      const totalIssues = getTotalIssues(item.id);
      const hasNotes = itemDetails[item.id]?.notes?.trim();
      return totalIssues > 0 && !hasNotes;
    });

    if (hasUnexplainedIssues) {
      alert('Please add notes for items with issues');
      return;
    }

    const issueReport = {
      orderId: order.id,
      items: order.items
        .filter(item => getTotalIssues(item.id) > 0)
        .map(item => {
          const breakdown = getIssueBreakdown(item.id);
          const issueTypes = [];
          if (breakdown.damaged > 0) issueTypes.push({ type: 'damaged', quantity: breakdown.damaged });
          if (breakdown.missing > 0) issueTypes.push({ type: 'missing', quantity: breakdown.missing });
          if (breakdown.incorrect > 0) issueTypes.push({ type: 'incorrect', quantity: breakdown.incorrect });
          if (breakdown.defective > 0) issueTypes.push({ type: 'defective', quantity: breakdown.defective });
          if (breakdown.other > 0) issueTypes.push({ type: 'other', quantity: breakdown.other });

          return {
            ...item,
            ordered: item.orderedQty,
            received: getReceivedGood(item.id, item.orderedQty),
            issueTypes,
            notes: itemDetails[item.id]?.notes
          };
        }),
      generalNotes,
      stockUpdates: order.items.map(item => ({
        productId: item.id,
        sku: item.sku,
        quantityToAdd: getReceivedGood(item.id, item.orderedQty)
      }))
    };

    console.log('Processing delivery confirmation:', issueReport);

    const hasIssues = issueReport.items.length > 0;
    // eslint-disable-next-line react-hooks/purity
    const issueNumber = Math.floor(Math.random() * 1000);
    if (hasIssues) {
      alert(`Stock updated successfully!\n\nDelivery issue #ISS-${issueNumber} has been created and logged for review.\n\nYou can view all delivery issues in the Delivery Issues page.`);
    } else {
      alert('Stock updated successfully! No issues reported.');
    }

    navigate(`/orders/${orderId}`);
  };

  const getTotalDiscrepancy = () => {
    return order.items.reduce((total, item) => {
      return total + getTotalIssues(item.id);
    }, 0);
  };

  const hasDiscrepancies = getTotalDiscrepancy() > 0;
  const itemsWithIssues = order.items.filter(item => getTotalIssues(item.id) > 0).length;

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
            <p className="text-sm text-gray-600 mt-1">Order {order.id} • Review and confirm received quantities</p>
          </div>
        </div>
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

      {/* Order Information */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Order Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Order ID</span>
            <p className="font-medium text-gray-900 mt-1">{order.id}</p>
          </div>
          <div>
            <span className="text-gray-600">Supplier</span>
            <p className="font-medium text-gray-900 mt-1">{order.supplier.name}</p>
          </div>
          <div>
            <span className="text-gray-600">Delivered Date</span>
            <p className="font-medium text-gray-900 mt-1">{order.deliveredDate}</p>
          </div>
        </div>
      </div>

      {/* Items Review */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Review Items & Report Issues</h2>
          <p className="text-sm text-gray-600 mt-1">Confirm received quantities and specify problem quantities by type</p>
        </div>

        <div className="p-6 space-y-5">
          {order.items.map((item) => {
            const ordered = item.orderedQty;
            const totalIssues = getTotalIssues(item.id);
            const receivedGood = getReceivedGood(item.id, item.orderedQty);
            const hasDifference = totalIssues > 0;

            return (
              <div
                key={item.id}
                className={`rounded-lg p-5 border-2 transition-colors ${
                  hasDifference
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Item Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">{item.product}</h3>
                      {hasDifference && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-md">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {totalIssues > 0 ? `${totalIssues} short` : `${Math.abs(totalIssues)} extra`}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">SKU: {item.sku}</span>
                      <span className="text-sm text-gray-600">Unit Price: ${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Quantity Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Ordered Quantity</label>
                    <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900">
                      {item.orderedQty} units
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">
                      Received (Good) Quantity
                    </label>
                    <div className={`px-4 py-2.5 rounded-lg text-sm font-semibold ${
                      receivedGood === ordered
                        ? 'bg-gray-50 border border-gray-200 text-gray-700'
                        : 'bg-green-50 border border-green-300 text-green-700'
                    }`}>
                      {receivedGood} units
                      <span className="text-xs ml-2 font-normal opacity-75">(Auto-calculated)</span>
                    </div>
                  </div>
                </div>

                {/* Issue Breakdown */}
                <div className="pt-4 border-t border-gray-300 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-900">
                        Issue Breakdown {totalIssues > 0 && <span className="text-red-500">*</span>}
                      </label>
                      <div className="text-sm">
                        <span className="text-gray-600">Total Issues: </span>
                        <span className={`font-semibold ${totalIssues === 0 ? 'text-gray-900' : totalIssues <= ordered ? 'text-orange-600' : 'text-red-600'}`}>
                          {totalIssues}
                        </span>
                        {totalIssues > ordered && (
                          <span className="ml-2 text-red-600 text-xs">
                            (Cannot exceed ordered quantity!)
                          </span>
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
                            value={itemDetails[item.id]?.[field] || ''}
                            onChange={(e) => handleItemChange(item.id, field, parseInt(e.target.value) || 0)}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Visual breakdown summary */}
                    {totalIssues > 0 && (
                      <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs font-medium text-gray-900 mb-2">Issue Summary:</p>
                        <div className="flex flex-wrap gap-2">
                          {itemDetails[item.id]?.damaged > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700">
                              Damaged: {itemDetails[item.id].damaged}
                            </span>
                          )}
                          {itemDetails[item.id]?.missing > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                              Missing: {itemDetails[item.id].missing}
                            </span>
                          )}
                          {itemDetails[item.id]?.incorrect > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                              Incorrect: {itemDetails[item.id].incorrect}
                            </span>
                          )}
                          {itemDetails[item.id]?.defective > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                              Defective: {itemDetails[item.id].defective}
                            </span>
                          )}
                          {itemDetails[item.id]?.other > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              Other: {itemDetails[item.id].other}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes - Only shown if there are issues */}
                  {totalIssues > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">
                        Notes <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Explain the issues in detail... (e.g., 'Box packaging was damaged on arrival causing internal damage to 5 units')"
                        className="w-full px-4 py-3 border border-orange-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white resize-none"
                        value={itemDetails[item.id]?.notes || ''}
                        onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Item Summary */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="grid grid-cols-3 gap-4 text-sm">
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
              </div>
            );
          })}
        </div>
      </div>

      {/* General Notes Section */}
      {hasDiscrepancies && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">General Notes (Optional)</label>
            <textarea
              rows={4}
              placeholder="Add any general notes about the delivery or issues..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 resize-none"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Items</span>
            <span className="font-medium text-gray-900">{order.items.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Ordered Units</span>
            <span className="font-medium text-gray-900">
              {order.items.reduce((sum, item) => sum + item.orderedQty, 0)} units
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Received (Good) Units</span>
            <span className="font-medium text-green-600">
              {order.items.reduce((sum, item) => sum + getReceivedGood(item.id, item.orderedQty), 0)} units
            </span>
          </div>
          {hasDiscrepancies && (
            <>
              <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-orange-600 font-medium">Total Issues</span>
                <span className="font-semibold text-orange-600">
                  {order.items.reduce((sum, item) => sum + getTotalIssues(item.id), 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-600 font-medium">Items with Issues</span>
                <span className="font-semibold text-orange-600">
                  {itemsWithIssues} of {order.items.length}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelivery}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
        >
          <CheckCircle className="w-[18px] h-[18px]" />
          Confirm & Update Stock
        </button>
      </div>
    </div>
  );
}