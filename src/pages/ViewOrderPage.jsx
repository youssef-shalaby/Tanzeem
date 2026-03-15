import { ArrowLeft, Download, Printer, Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

export function ViewOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Mock order data - in real app, fetch based on orderId
  const order = {
    id: 'ORD-3492',
    date: 'Oct 24, 2023',
    time: '10:42 AM',
    status: 'Delivered',
    supplier: {
      name: 'Acme Corp',
      email: 'supplier@acme.com',
      phone: '+1 (555) 123-4567',
      address: '123 Business St, Suite 100, New York, NY 10001'
    },
    shippingAddress: '456 Warehouse Ave, Building B, Los Angeles, CA 90001',
    expectedDelivery: 'Oct 28, 2023',
    deliveredDate: 'Oct 27, 2023',
    items: [
      { id: 1, product: 'Laptop Stand', sku: 'LS-001', quantity: 50, price: 15.00, total: 750.00 },
      { id: 2, product: 'Wireless Mouse', sku: 'WM-002', quantity: 100, price: 5.00, total: 500.00 },
    ],
    subtotal: 1250.00,
    tax: 125.00,
    shipping: 0,
    total: 1375.00,
    notes: 'Please handle with care. Fragile items included.'
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Shipped':
        return <Package className="w-5 h-5" />;
      case 'Pending':
        return <Clock className="w-5 h-5" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Shipped':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Delivered':
        return 'bg-green-100 text-green-700';
      case 'Cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
            <p className="text-sm text-gray-600 mt-1">Order {order.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Order Status</h2>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${getStatusStyle(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  <span className="text-sm text-gray-600">on {order.date} at {order.time}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
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
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">${item.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${item.total.toFixed(2)}</td>
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
                  <span className="font-medium text-gray-900">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium text-gray-900">${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Supplier Information</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Name</div>
                  <div className="text-gray-900 font-medium">{order.supplier.name}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Email</div>
                  <div className="text-gray-900">{order.supplier.email}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Phone</div>
                  <div className="text-gray-900">{order.supplier.phone}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Address</div>
                  <div className="text-gray-900">{order.supplier.address}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-sm text-gray-900">
                {order.shippingAddress}
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Order Notes</h2>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-6 sticky top-8">
            <div>
              <h2 className="font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium text-gray-900">{order.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="text-gray-900">{order.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expected Delivery</span>
                  <span className="text-gray-900">{order.expectedDelivery}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Actions</h2>
              <div className="space-y-2">
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20">
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered" selected>Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                {order.status === 'Delivered' ? (
                  <button
                    onClick={() => navigate(`/orders/${orderId}/confirm-delivery`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
                  >
                    <CheckCircle className="w-[18px] h-[18px]" />
                    Confirm & Update Stock
                  </button>
                ) : (
                  <button className="w-full px-4 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}