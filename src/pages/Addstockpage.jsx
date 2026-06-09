import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { X, Search, Plus, FileText, Loader2 } from 'lucide-react';

// ============================
// Design system styles (green accent)
// ============================
const ADD_STOCK_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .add-stock-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-input {
    width: 100%; padding: 9px 14px;
    background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s;
  }
  .db-input:focus { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .db-select {
    padding: 8px 14px; background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #444; cursor: pointer; outline: none; transition: border-color .2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
  }
  .db-select:hover { border-color: #0f8c5a; }
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
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 500; }
  .db-badge-teal { background: #e6f7f5; color: #0f8c5a; }
  .stock-flow-search {
    display: flex; align-items: center; gap: 8px;
    min-height: 40px; border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px; background: #fff; transition: border-color .2s, box-shadow .2s;
  }
  .stock-flow-search:focus-within { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .stock-flow-item {
    position: relative; border: 1px solid rgba(0,0,0,.08);
    border-radius: 14px; background: #fafbf8; padding: 20px;
  }
  .stock-flow-readonly {
    display: flex; align-items: center; gap: 8px; min-height: 40px;
    border: 1px solid rgba(0,0,0,.08); border-radius: 12px;
    background: #fff; padding: 8px 12px; font-size: 13px; color: #1a1a18;
  }
  .stock-flow-summary {
    border: 1px solid rgba(0,0,0,.08); border-radius: 14px;
    background: #fafbf8; padding: 20px;
  }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('tanzeem_auth'))?.token || null;
  } catch {
    return null;
  }
}

// Maps to TransactionSource enum on the backend
const SOURCE_REASON_MAP = {
  'Received from Supplier': 7,
  'Production': 8,
  'Customer Return': 9,
  'Found/Recovered': 10,
  'Transfer from Other Location': 11,
  'Inventory Adjustment': 12,
};

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
    source: 'Received from Supplier',
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

// Product search dropdown component (refactored with green accent)
// Updated ProductSearchInput component (for both Addstockpage and Stockoutpage)
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
        const res = await fetch(`/api/Products/Get-Products-Dropdown-Menu?searchQuery=${encodeURIComponent(value)}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Products API error:', err);
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
      <label className="app-form-label">Product</label>
      <div className="stock-flow-search">
        <div className="pl-3">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, SKU, or barcode..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setShowDropdown(true)}
          className="flex-1 py-2 pr-3 text-sm bg-transparent focus:outline-none"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        {isLoading && (
          <div className="pr-3">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
      {showDropdown && (results.length > 0 || isLoading) && (
        <div className="app-menu absolute z-20 mt-1 w-full max-h-56 overflow-y-auto">
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
                  className="app-menu-item w-full text-left"
                >
                  <div className="text-sm font-medium text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    SKU: {p.sku}
                    {p.barcode && ` · Barcode: ${p.barcode}`}
                    {p.costPrice > 0 && ` · $${Number(p.costPrice).toFixed(2)}`}
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

export function Addstockpage() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;
  });
  const [supplierReference, setSupplierReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [stockItems, setStockItems] = useState([createEmptySlot()]);

  const handleProductSelect = (slotId, product) => {
    const p = norm(product);
    setStockItems(prev => prev.map(item =>
      item.id === slotId ? {
        ...item,
        productName:     p.name,
        sku:             p.sku,
        barcode:         p.barcode,
        unitPrice:       p.costPrice,
        totalPrice:      p.costPrice * item.quantity,
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
    setStockItems(prev => prev.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity, totalPrice: (parseInt(newQuantity) || 0) * item.unitPrice }
        : item
    ));
  };

  const handleSourceChange = (id, newSource) => {
    setStockItems(prev => prev.map(item =>
      item.id === id ? { ...item, source: newSource } : item
    ));
  };

  const handleRemoveItem = (id) => {
    if (stockItems.length > 1) {
      setStockItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddSlot = () => {
    setStockItems(prev => [...prev, createEmptySlot()]);
  };

  const grandTotal = stockItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const allSelected = stockItems.every(item => item.productSelected);

  const handleConfirm = async () => {
    if (!allSelected) return;
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const primarySource = stockItems[0]?.source || 'Received from Supplier';
    const sourceReasonCode = SOURCE_REASON_MAP[primarySource] ?? 7;

    const payload = {
      id: 0,
      transactionId: crypto.randomUUID(),
      type: 1,
      createdAt: parseDate(selectedDate),
      status: 4,
      value: grandTotal,
      totalTransactedItems: stockItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0),
      sourceReason: sourceReasonCode,
      referenceNumber: supplierReference || '',
      notes: notes || '',
      preformedBy: '',
      transactionItemDtos: stockItems.map(item => ({
        quantityOfTransactedItem: parseInt(item.quantity) || 1,
        unitPrice: item.costPrice,
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
    <div className="add-stock-root space-y-6">
      <style>{ADD_STOCK_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="app-page-title">Add Stock</h1>
          <p className="app-page-subtitle">Search for products to replenish inventory from suppliers or returns.</p>
        </div>
        <button onClick={() => navigate('/inventory')} className="db-icon-btn" aria-label="Close add stock">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Card */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Stock Addition</span>
        </div>
        <div className="p-6 space-y-6">

          {/* Items List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Items to Add ({stockItems.length})
              </div>
              <button onClick={handleAddSlot} className="db-secondary-btn">
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>

            {stockItems.map((item, index) => (
              <div key={item.id} className="stock-flow-item db-fade-in">
                {stockItems.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="db-icon-btn absolute top-4 right-4 text-red-600"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <div className="space-y-4">
                  <div className="db-badge db-badge-teal w-fit">
                    Item #{index + 1}
                  </div>

                  <ProductSearchInput item={item} onProductSelect={handleProductSelect} />

                  {item.productSelected && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="app-form-label">Barcode</label>
                          <div className="stock-flow-readonly">
                            <span className="flex-1">{item.barcode || '—'}</span>
                            <span className="text-gray-400 text-xs">#</span>
                          </div>
                        </div>
                        <div>
                          <label className="app-form-label">Unit Price (Cost)</label>
                          <div className="stock-flow-readonly">
                            <span className="text-gray-500">$</span>
                            <span className="flex-1 text-sm text-gray-900">{item.unitPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="app-form-label">Quantity to Add</label>
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
                              className="db-input pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                          <label className="app-form-label">Total Price</label>
                          <div className="stock-flow-readonly">
                            <span className="text-gray-500">$</span>
                            <span className="flex-1 text-sm text-gray-900">{item.totalPrice.toFixed(2)}</span>
                            <span className="text-xs text-gray-400">Calculated</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="app-form-label">Batch Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                        <input
                          type="text"
                          value={item.batchNumber}
                          onChange={(e) => setStockItems(prev => prev.map(s => s.id === item.id ? { ...s, batchNumber: e.target.value } : s))}
                          placeholder="Enter batch number..."
                          className="db-input"
                        />
                      </div>

                      <div>
                        <label className="app-form-label">Source</label>
                        <div className="relative">
                          <select
                            value={item.source}
                            onChange={(e) => handleSourceChange(item.id, e.target.value)}
                            className="db-select w-full"
                          >
                            <option>Received from Supplier</option>
                            <option>Customer Return</option>
                            <option>Production</option>
                            <option>Found/Recovered</option>
                            <option>Transfer from Other Location</option>
                            <option>Inventory Adjustment</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Section */}
          <div className="border-t border-gray-100 pt-6">
            <div className="stock-flow-summary space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-semibold text-gray-900">{stockItems.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total Quantity:</span>
                <span className="font-semibold text-gray-900">
                  {stockItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-base font-semibold text-gray-900">Grand Total:</span>
                <span className="text-xl font-semibold text-[#0f8c5a]">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="app-form-label">Date Added</label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="db-input"
                />
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
            <div>
              <label className="app-form-label">Supplier Reference (Optional)</label>
              <input
                type="text"
                value={supplierReference}
                onChange={(e) => setSupplierReference(e.target.value)}
                placeholder="Enter PO number or supplier invoice number"
                className="db-input"
              />
            </div>
          </div>

          <div>
            <label className="app-form-label">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional details about this stock addition..."
              rows={4}
              className="db-input resize-none"
            />
          </div>

          {submitError && (
            <div className="app-alert-danger">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="app-success-panel">
              Stock added successfully! Redirecting...
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <Link to="/inventory" className="db-secondary-btn">Cancel</Link>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || !allSelected}
            title={!allSelected ? 'Please select a product for all items' : ''}
            className="db-primary-btn"
          >
            {isSubmitting ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <FileText className="w-[18px] h-[18px]" />}
            {isSubmitting ? 'Submitting...' : 'Confirm Stock Addition'}
          </button>
        </div>
      </div>
    </div>
  );
}
