import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { X, Search, Plus, FileText } from 'lucide-react';

export function Addstockpage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState('01/22/2026');
  const [supplierReference, setSupplierReference] = useState('');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [stockItems, setStockItems] = useState([
    {
      id: 1,
      productName: 'Office Chair - Ergonomic',
      sku: 'OC-884',
      barcode: '8809123456789',
      unitPrice: 149.00,
      quantity: 50,
      totalPrice: 7450.00,
      source: 'Received from Supplier',
    }
  ]);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 0) {
      setStockItems(stockItems.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      ));
    }
  };

  const handleSourceChange = (id, newSource) => {
    setStockItems(stockItems.map(item =>
      item.id === id ? { ...item, source: newSource } : item
    ));
  };

  const handleRemoveItem = (id) => {
    if (stockItems.length > 1) {
      setStockItems(stockItems.filter(item => item.id !== id));
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
      source: 'Received from Supplier',
    };
    setStockItems([...stockItems, newItem]);
  };

  const grandTotal = stockItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add Stock</h1>
          <p className="text-sm text-gray-600 mt-1">Scan or search for items to replenish inventory from suppliers or returns.</p>
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
                  placeholder="Search by name/SKU/barcode to add items..."
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
                Items to Add ({stockItems.length})
              </div>
              <button
                onClick={handleAddItem}
                className="text-sm text-[#15aaad] hover:text-[#0d8082] font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>

            {stockItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-5 relative">
                {stockItems.length > 1 && (
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
                      <label className="text-sm font-medium text-gray-900 mb-2 block">Quantity to Add</label>
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
                    <label className="text-sm font-medium text-gray-900 mb-2 block">Source</label>
                    <div className="relative">
                      <select
                        value={item.source}
                        onChange={(e) => handleSourceChange(item.id, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                      >
                        <option>Received from Supplier</option>
                        <option>Customer Return</option>
                        <option>Production</option>
                        <option>Found/Recovered</option>
                        <option>Transfer from Other Location</option>
                        <option>Inventory Adjustment</option>
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
                <span className="text-sm font-semibold text-gray-900">{stockItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Quantity:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stockItems.reduce((sum, item) => sum + item.quantity, 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Grand Total:</span>
                <span className="text-xl font-semibold text-[#15aaad]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Date Added</label>
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
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">Supplier Reference (Optional)</label>
              <input
                type="text"
                value={supplierReference}
                onChange={(e) => setSupplierReference(e.target.value)}
                placeholder="Enter PO number or supplier invoice number"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-900 mb-2 block">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details about this stock addition..."
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
            <FileText className="w-[18px] h-[18px]" />
            Confirm Stock Addition
          </button>
        </div>
      </div>
    </div>
  );
}