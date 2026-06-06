import { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Check, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('tanzeem_auth'))?.token || null;
  } catch {
    return null;
  }
}

// Maps to TransactionSource enum on the backend
const REASON_CODE_MAP = {
  'Sold to Customer': 13,        // Selling = 13
  'Returned to Supplier': 9,     // Return = 9
  'Damaged': 12,                 // Adjustment = 12
  'Expired': 12,                 // Adjustment = 12
  'Lost': 10,                    // Recovered = 10
  'Stolen': 10,                  // Recovered = 10
  'Sample/Demo': 8,              // Production = 8
  'Internal Use': 8,             // Production = 8
};

// Normalize API response — handles camelCase, PascalCase, and sparse dropdown shape
// Dropdown endpoint only returns: id, name, sku, price
function norm(product) {
  const p = product;
  const price = p.price ?? p.Price ?? 0;
  return {
    id:           p.id           ?? p.Id           ?? 0,
    name:         p.name         ?? p.Name         ?? '',
    sku:          p.sku          ?? p.Sku          ?? p.SKU          ?? '',
    barcode:      p.barcode      ?? p.Barcode      ?? '',
    costPrice:    p.costPrice    ?? p.CostPrice    ?? p.cost_price   ?? price,
    sellingPrice: p.sellingPrice ?? p.SellingPrice ?? p.selling_price ?? price,
    categoryId:   p.categoryId   ?? p.CategoryId   ?? 0,
    category:     p.category     ?? p.Category     ?? '',
    stock:        p.stock        ?? p.Stock        ?? 0,
    expiryDate:   p.expiryDate   ?? p.ExpiryDate   ?? null,
    description:  p.description  ?? p.Description  ?? '',
    reorderLevel: p.reorderLevel ?? p.ReorderLevel ?? 0,
    status:       p.status       ?? p.Status       ?? 'Active',
    batchNumber:  p.batchNumber  ?? p.BatchNumber  ?? '',
  };
}

function parseDate(dateStr) {
  const [month, day, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
}

function createEmptySlot() {
  return {
    id: Date.now() + Math.random(),
    productName: '',
    sku: '',
    barcode: '',
    unitPrice: 0,
    quantity: 1,
    totalPrice: 0,
    reason: 'Sold to Customer',
    category: '',
    stock: 0,
    costPrice: 0,
    sellingPrice: 0,
    expiryDate: null,
    description: '',
    reorderLevel: 0,
    status: 'Active',
    batchNumber: '',
    productSelected: false,
  };
}

// Per-item search dropdown component
function ProductSearchInput({ item, onProductSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (value) => {
    setQuery(value);
    setShowDropdown(true);
    clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`/api/Products/Get-Products-Dropdown-Menu?searchQuery=${encodeURIComponent(value)}`, {          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        console.log('Products API response:', JSON.stringify(data, null, 2));
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleSelect = (product) => {
    const p = norm(product);
    onProductSelect(item.id, p);
    setQuery(`${p.name} (SKU: ${p.sku})`);
    setShowDropdown(false);
    setResults([]);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="text-sm font-medium text-gray-900 mb-2 block">Product</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}
      </div>
      {showDropdown && (results.length > 0 || isLoading) && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {isLoading && results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No products found</div>
          ) : (
            results.map((product) => {
              const p = norm(product);
              return (
                <button
                  key={p.id || p.sku}
                  onClick={() => handleSelect(product)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    SKU: {p.sku}
                    {p.barcode && ` · Barcode: ${p.barcode}`}
                    {p.stock > 0 && ` · In stock: ${p.stock}`}
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export function Stockoutpage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Start with one empty slot
  const [stockOutItems, setStockOutItems] = useState([createEmptySlot()]);

  const handleProductSelect = (slotId, product) => {
    const p = norm(product);
    setStockOutItems(prev => prev.map(item =>
      item.id === slotId ? {
        ...item,
        productName:     p.name,
        sku:             p.sku,
        barcode:         p.barcode,
        unitPrice:       p.sellingPrice || p.costPrice,
        totalPrice:      (p.sellingPrice || p.costPrice) * item.quantity,
        productId:       p.id,
        categoryId:      p.categoryId,
        category:        p.category,
        stock:           p.stock,
        costPrice:       p.costPrice,
        sellingPrice:    p.sellingPrice,
        expiryDate:      p.expiryDate,
        description:     p.description,
        reorderLevel:    p.reorderLevel,
        status:          p.status,
        batchNumber:     p.batchNumber,
        productSelected: true,
      } : item
    ));
  };

  const handleQuantityChange = (id, newQuantity) => {
    setStockOutItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, totalPrice: (parseInt(newQuantity) || 0) * item.unitPrice }
        : item
    ));
  };

  const handleReasonChange = (id, newReason) => {
    setStockOutItems(prev => prev.map(item =>
      item.id === id ? { ...item, reason: newReason } : item
    ));
  };

  const handleRemoveItem = (id) => {
    if (stockOutItems.length > 1) {
      setStockOutItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddSlot = () => {
    setStockOutItems(prev => [...prev, createEmptySlot()]);
  };

  const grandTotal = stockOutItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const allSelected = stockOutItems.every(item => item.productSelected);

  const handleConfirm = async () => {
    if (!allSelected) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const primaryReason = stockOutItems[0]?.reason || 'Sold to Customer';
    const sourceReasonCode = REASON_CODE_MAP[primaryReason] ?? 13;

    const payload = {
      id: 0,
      transactionId: crypto.randomUUID(),
      type: 2,
      createdAt: parseDate(selectedDate),
      status: 4,
      value: grandTotal,
      totalTransactedItems: stockOutItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
      sourceReason: sourceReasonCode,
      referenceNumber: '',
      notes: notes || '',
      preformedBy: '',
      transactionItemDtos: stockOutItems.map(item => ({
        quantityOfTransactedItem: parseInt(item.quantity) || 1,
        unitPrice: item.unitPrice,
        batchNumber: item.batchNumber || '',
        product: {
          id: item.productId || 0,
          name: item.productName,
          sku: item.sku,
          category: item.category || '',
          categoryId: item.categoryId || 0,
          stock: item.stock || 0,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice || 0,
          expiryDate: item.expiryDate || new Date().toISOString(),
          barcode: item.barcode,
          description: item.description || '',
          reorderLevel: item.reorderLevel || 0,
          status: item.status || 'Active',
        }
      }))
    };

    try {
      const token = getToken();
      const response = await fetch('/api/Transaction/Create-Transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      setSubmitSuccess(true);
      setTimeout(() => navigate('/inventory'), 1500);
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Stock Out</h1>
          <p className="text-sm text-gray-600 mt-1">Search for items to remove from inventory and track reasons.</p>
        </div>
        <button type="button" onClick={() => navigate('/inventory')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">

          {/* Items List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Items to Remove ({stockOutItems.length})
              </div>
              <button type="button" onClick={handleAddSlot} className="text-sm text-[#15aaad] hover:text-[#0d8082] font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>

            {stockOutItems.map((item, index) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-5 relative">
                {stockOutItems.length > 1 && (
                  <button
                    type="button"
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

                  {/* Product Search */}
                  <ProductSearchInput item={item} onProductSelect={handleProductSelect} />

                  {/* Product details — only shown after selection */}
                  {item.productSelected && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-900 mb-2 block">Barcode</label>
                          <div className="relative">
                            <input type="text" value={item.barcode} readOnly className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">#</span>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-900 mb-2 block">Unit Price (Selling)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input type="text" value={item.unitPrice.toFixed(2)} readOnly className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900" />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-900 mb-2 block">Quantity to Remove</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleQuantityChange(item.id, val === '' ? '' : Math.abs(parseInt(val)) || '');
                              }}
                              onBlur={() => {
                                const val = parseInt(item.quantity);
                                if (!val || val < 1) handleQuantityChange(item.id, 1);
                              }}
                              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                              <button type="button" onClick={() => handleQuantityChange(item.id, (parseInt(item.quantity) || 1) + 1)} className="px-1 py-0.5 text-gray-400 hover:text-gray-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                              </button>
                              <button type="button" onClick={() => handleQuantityChange(item.id, Math.max(1, (parseInt(item.quantity) || 1) - 1))} className="px-1 py-0.5 text-gray-400 hover:text-gray-600">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-900 mb-2 block">Total Value</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                            <input type="text" value={item.totalPrice.toFixed(2)} readOnly className="w-full pl-8 pr-20 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900" />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">Calculated</span>
                          </div>
                        </div>
                      </div>

                      {/* Batch Number — editable, pre-filled if product has one */}
                      <div>
                        <label className="text-sm font-medium text-gray-900 mb-2 block">Batch Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => setStockOutItems(prev => prev.map(s => s.id === item.id ? { ...s, batchNumber: e.target.value } : s))}
                          placeholder="Enter batch number..."
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                        />
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
                          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Items:</span>
                <span className="text-sm font-semibold text-gray-900">{stockOutItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Quantity:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stockOutItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)} units
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
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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

          {/* Error / Success feedback */}
          {submitError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              Stock deducted successfully! Redirecting...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <Link to="/products" className="px-6 py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Cancel
          </Link>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !allSelected}
            title={!allSelected ? 'Please select a product for all items' : ''}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <Check className="w-[18px] h-[18px]" />}
            {isSubmitting ? 'Submitting...' : 'Confirm Stock Deduction'}
          </button>
        </div>
      </div>
    </div>
  );
}