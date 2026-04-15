import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export function CreateOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefillItem = location.state?.prefillItem;

  const [formData, setFormData] = useState({
    orderId: '',
    supplierName: '',
    supplierEmail: '',
    supplierPhone: '',
    shippingAddress: '',
    orderDate: '',
    expectedDelivery: '',
    notes: '',
  });

  const [orderItems, setOrderItems] = useState([
    prefillItem
      ? { id: 1, product: prefillItem.product, sku: prefillItem.sku, quantity: prefillItem.quantity, price: prefillItem.price }
      : { id: 1, product: '', sku: '', quantity: 1, price: 0 }
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addOrderItem = () => {
    setOrderItems([
      ...orderItems,
      { id: Date.now(), product: '', sku: '', quantity: 1, price: 0 }
    ]);
  };

  const removeOrderItem = (id) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    }
  };

  const updateOrderItem = (id, field, value) => {
    setOrderItems(orderItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Order created:', { formData, orderItems });
    navigate('/orders');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Order</h1>
          {prefillItem && (
            <p className="text-sm text-[#15aaad] mt-1">
              Pre-filled from alert: <span className="font-medium">{prefillItem.product}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => navigate('/orders')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Supplier Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-5">Supplier Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order ID *
                  </label>
                  <input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="e.g., ORD-3493"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Date *
                  </label>
                  <input
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="Enter supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="supplierEmail"
                    value={formData.supplierEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="supplier@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="supplierPhone"
                    value={formData.supplierPhone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address *
                </label>
                <textarea
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  placeholder="Enter complete shipping address"
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Order Items</h2>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#15aaad] hover:bg-[#15aaad]/10 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 p-4 bg-[#f6f8fa] rounded-lg">
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                      <select
                        value={item.product}
                        onChange={(e) => updateOrderItem(item.id, 'product', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white"
                      >
                        <option value="">Select product</option>
                        <option value="Laptop Stand">Laptop Stand</option>
                        <option value="Wireless Mouse">Wireless Mouse</option>
                        <option value="USB-C Cable">USB-C Cable</option>
                        <option value="Monitor 24 inch">Monitor 24 inch</option>
                        <option value="Wireless Keyboard">Wireless Keyboard</option>
                        <option value="Desk Lamp">Desk Lamp</option>
                        <option value="HDMI Cable">HDMI Cable</option>
                        <option value="Laptop Charger">Laptop Charger</option>
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                      <input
                        type="text"
                        value={item.sku}
                        onChange={(e) => updateOrderItem(item.id, 'sku', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                        placeholder="SKU"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateOrderItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeOrderItem(item.id)}
                        disabled={orderItems.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-5">Additional Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    name="expectedDelivery"
                    value={formData.expectedDelivery}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  placeholder="Add any special instructions or notes..."
                />
              </div>
            </div>
          </div>

          {/* Order Summary sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-5">Order Summary</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span className="font-medium text-gray-900">${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-semibold text-gray-900">${calculateTotal().toFixed(2)}</span>
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
                >
                  Create Order
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="w-full px-6 py-3 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}