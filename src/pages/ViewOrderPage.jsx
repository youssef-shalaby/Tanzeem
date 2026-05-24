import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Package, Clock, XCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router';

export function ViewOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const [confirmationData, setConfirmationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stateOrder = location.state?.order;

    fetch(`/api/Order/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch order details.');
        return res.json();
      })
      .then((data) => {
        setConfirmationData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (stateOrder) {
          setConfirmationData({
            id: stateOrder.id,
            stringId: stateOrder.stringId || `#${stateOrder.id}`,
            supplierName: stateOrder.supplierName,
            status: stateOrder.status || 'Pending',
            items: [],
          });
          setLoading(false);
        } else {
          setError(err.message);
          setLoading(false);
        }
      });
  }, [orderId, location.state]);

  const normalizeStatus = (status) => {
    if (!status) return 'Pending';
    const normalized = String(status).toLowerCase().trim();
    if (normalized.includes('deliver')) return 'Delivered';
    if (normalized.includes('cancel')) return 'Cancelled';
    return 'Pending';
  };

  const getStatusIcon = (status) => {
    switch (normalizeStatus(status)) {
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'Delivered': return <CheckCircle className="w-5 h-5" />;
      case 'Cancelled': return <XCircle className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading order details...</div>;
  if (error || !confirmationData) return <div className="p-6 text-sm text-red-600">Failed to render: {error}</div>;

  const orderIdDisplay = confirmationData.stringId || confirmationData.orderStringId || `#${confirmationData.id}`;
  const orderStatus = normalizeStatus(confirmationData.status || confirmationData.orderStatus);

  // /api/Order/{id} returns `items`, /api/Order/View_Order_Confirm returns `itemsConfirmResponseDtos`
  // Normalize both into a common shape for the table
  const rawItems = confirmationData.items || confirmationData.itemsConfirmResponseDtos || [];
  const items = rawItems.map((item) => ({
    productId: item.productId,
    productName: item.productName || `Product #${item.productId}`,
    sku: item.sku || '—',
    quantity: item.quantity || item.orderedQuantity || 0,
    price: item.price || 0,
  }));

  const subtotal = confirmationData.subTotal ?? confirmationData.subtotal ?? items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = confirmationData.taxes ?? subtotal * 0.1;
  const shipping = confirmationData.shippingCost ?? 0;
  const total = confirmationData.total ?? subtotal + tax + shipping;

  const orderDate = confirmationData.orderDate
    ? new Date(confirmationData.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const expectedDelivery = confirmationData.expectedDeliveryDate
    ? new Date(confirmationData.expectedDeliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const receivedDate = confirmationData.recievedDeliveryDate || confirmationData.receivedDeliveryDate
    ? new Date(confirmationData.recievedDeliveryDate || confirmationData.receivedDeliveryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-600 mt-1">Order {orderIdDisplay}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Order Status</h2>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${getStatusStyle(orderStatus)}`}>
                    {getStatusIcon(orderStatus)}
                    {orderStatus}
                  </span>
                  {orderDate && <span className="text-sm text-gray-600">on {orderDate}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Supplier */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Supplier Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Name</div>
                <div className="text-gray-900 font-medium">{confirmationData.supplierName || '—'}</div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>

            {items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm text-right text-gray-900">${Number(item.price).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm font-medium text-right text-gray-900">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-2 max-w-sm ml-auto">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">${Number(subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium text-gray-900">${Number(tax).toFixed(2)}</span>
                    </div>
                    {shipping > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium text-gray-900">${Number(shipping).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-semibold text-gray-900">${Number(total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-6 py-10 text-sm text-gray-400 text-center">
                No items available for this order.
              </div>
            )}
          </div>

          {/* Notes */}
          {confirmationData.notes && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Order Notes</h2>
              <p className="text-sm text-gray-700">{confirmationData.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-6 sticky top-8">
            {/* Order Info */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium text-gray-900">{orderIdDisplay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="text-gray-900">{orderDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expected Delivery</span>
                  <span className="text-gray-900">{expectedDelivery}</span>
                </div>
                {receivedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Received Date</span>
                    <span className="text-gray-900">{receivedDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-gray-900">{orderStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span className="text-gray-900">{items.length}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {orderStatus !== 'Delivered' && (
              <div className="pt-6 border-t border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-3">Actions</h2>
                <button
                  onClick={() =>
                    navigate(`/orders/${orderId}/confirm-delivery`, {
                      state: {
                        order: confirmationData,
                        items: items.map((i) => ({
                          productId: i.productId,
                          orderedQuantity: i.quantity,
                          sku: i.sku,
                          price: i.price,
                        })),
                      },
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Confirm & Update Stock
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}