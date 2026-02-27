import { useState } from 'react';
import { X, Search, Plus, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

export function Stockoutpage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('01/24/2026');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [stockOutItems, setStockOutItems] = useState([
    {
      id: 1,
      productName: 'Office Chair - Ergonomic',
      sku: 'OC-884',
      barcode: '8809123456789',
      unitPrice: 149.00,
      quantity: 2,
      totalPrice: 298.00,
      reason: 'Sold to Customer',
    }
  ]);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 0) {
      setStockOutItems(stockOutItems.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      ));
    }
  };

  const handleReasonChange = (id, newReason) => {
    setStockOutItems(stockOutItems.map(item =>
      item.id === id ? { ...item, reason: newReason } : item
    ));
  };

  const handleRemoveItem = (id) => {
    if (stockOutItems.length > 1) {
      setStockOutItems(stockOutItems.filter(item => item.id !== id));
    }
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now(),
      productName: 'New Product',
      sku: 'SKU-000',
      barcode: '0000000000000',
      unitPrice: 0.00,
      quantity: 1,
      totalPrice: 0.00,
      reason: 'Sold to Customer',
    };
    setStockOutItems([...stockOutItems, newItem]);
  };

  const grandTotal = stockOutItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stock Out</h1>
          <p className="text-sm text-gray-600 mt-1">Scan or search for items to remove from inventory and track reasons.</p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Search Product */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">Search Product</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name/SKU/barcode to remove items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border-2 border-[#15aaad] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                />
              </div>
              <button
                onClick={handleAddItem}
                className="p-2.5 bg-[#15aaad] text-white rounded-lg hover:bg-[#0d8082] transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Items to Remove ({stockOutItems.length})
              </div>
              <button
                onClick={handleAddItem}
                className="text-sm text-[#15aaad] hover:text-[#0d8082] font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>

            {stockOutItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-5 relative">
                {stockOutItems.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="space-y-4">
                  <div className="text-xs font-semibold text-[#15aaad] uppercase tracking-wide">
                    Item #{index + 1}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Product Name</label>
                    <input
                      type="text"
                      value={`${item.productName} (SKU: ${item.sku})`}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">Barcode</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={item.barcode}
                          readOnly
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">Unit Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="text"
                          value={item.unitPrice.toFixed(2)}
                          readOnly
                          className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">Quantity to Remove</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-1 py-0.5 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-1 py-0.5 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-900 mb-2 block">Total Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input
                          type="text"
                          value={item.totalPrice.toFixed(2)}
                          readOnly
                          className="w-full pl-8 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">Calculated</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Reason for Stock Out</label>
                    <div className="relative">
                      <select
                        value={item.reason}
                        onChange={(e) => handleReasonChange(item.id, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                      >
                        <option>Sold to Customer</option>
                        <option>Damaged</option>
                        <option>Expired</option>
                        <option>Lost</option>
                        <option>Returned to Supplier</option>
                        <option>Stolen</option>
                        <option>Sample/Demo</option>
                        <option>Internal Use</option>
                      </select>
                      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="text-sm font-semibold text-gray-900">{stockOutItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Quantity:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stockOutItems.reduce((sum, item) => sum + item.quantity, 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Total Value:</span>
                <span className="text-xl font-semibold text-red-600">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">Date Removed</label>
            <div className="relative">
              <input
                type="text"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details here..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <Link to="/products" className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </Link>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
            <Check className="w-[18px] h-[18px]" />
            Confirm Stock Deduction
          </button>
        </div>
      </div>
    </div>
  );
}