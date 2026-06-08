import { useState, useRef, useEffect } from 'react';
import { X, ScanLine, Sparkles, Loader2, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';

// ============================
// Design system styles (green accent)
// ============================
const ADD_ITEM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .add-item-root { font-family: 'DM Sans', sans-serif; }
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
  .db-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 500; }
  .db-badge-teal { background: #e6f7f5; color: #0f8c5a; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .cat-combobox { position: relative; width: 100%; }
  .cat-input-wrap { display: flex; align-items: center; width: 100%; padding: 9px 14px; padding-right: 36px; background: #fff; border: 1px solid rgba(0,0,0,.12); border-radius: 12px; font-size: 13px; font-family: 'DM Sans',sans-serif; color: #1a1a18; transition: border-color .2s; box-sizing: border-box; cursor: text; }
  .cat-input-wrap:focus-within { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .cat-input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-size: 13px; font-family: 'DM Sans',sans-serif; color: #1a1a18; min-width: 0; }
  .cat-chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none; transition: transform .2s; }
  .cat-chevron.open { transform: translateY(-50%) rotate(180deg); }
  .cat-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 50; background: #fff; border: 1px solid rgba(0,0,0,.1); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.1); overflow: hidden; max-height: 220px; overflow-y: auto; }
  .cat-option { padding: 9px 14px; font-size: 13px; font-family: 'DM Sans',sans-serif; color: #1a1a18; cursor: pointer; transition: background .12s; }
  .cat-option:hover { background: #f9faf7; }
  .cat-option.new-hint { color: #0f8c5a; font-weight: 500; }
  .cat-option.new-hint:hover { background: rgba(15,140,90,.06); }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

const CATEGORIES = [
  'Electronics',
  'Accessories',
  'Office Supplies',
  'Furniture',
  'Food & Beverage',
  'Health & Beauty',
  'Beverages',
  'Stationery',
  'Home Appliances',
  'Footwear',
];

const emptyProduct = () => ({
  id: Date.now().toString(),
  productName: '',
  sku: '',
  barcode: '',
  category: '',
  description: '',
  unitPrice: '',
  costPrice: '',
  stock: '',
  reorderLevel: '',
  expiryDate: '',
  status: 'Active',
});


function CategoryCombobox({ value, onChange, categories, onAddCategory }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value || '');
  const wrapRef = useRef(null);

  // Sync inputVal when value changes externally (e.g. AI suggest apply)
  useEffect(() => { setInputVal(value || ''); }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = inputVal.trim()
    ? categories.filter(c => c.toLowerCase().includes(inputVal.toLowerCase()))
    : categories;

  const isNew = inputVal.trim() && !categories.some(c => c.toLowerCase() === inputVal.trim().toLowerCase());

  const select = (cat) => {
    onChange(cat);
    setInputVal(cat);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = inputVal.trim();
      if (!trimmed) return;
      if (isNew) onAddCategory(trimmed);
      select(trimmed);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="cat-combobox" ref={wrapRef}>
      <div className="cat-input-wrap" onClick={() => setOpen(true)}>
        <input
          type="text"
          value={inputVal}
          placeholder="Select or type a category…"
          onChange={(e) => { setInputVal(e.target.value); onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          required
        />
      </div>
      <ChevronDown size={14} className={`cat-chevron${open ? ' open' : ''}`} />
      {open && (filtered.length > 0 || isNew) && (
        <div className="cat-dropdown">
          {filtered.map(c => (
            <div key={c} className="cat-option" onMouseDown={() => select(c)}>{c}</div>
          ))}
          {isNew && (
            <div className="cat-option new-hint" onMouseDown={() => { onAddCategory(inputVal.trim()); select(inputVal.trim()); }}>
              + Add "{inputVal.trim()}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AddItemPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([emptyProduct()]);
  const [aiSuggesting, setAiSuggesting] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [categories, setCategories] = useState(CATEGORIES);

  const handleAddCategory = (cat) => {
    setCategories(prev => prev.includes(cat) ? prev : [...prev, cat]);
  };

  const handleChange = (id, field, value) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleScanBarcode = (id) => {
    alert('Barcode scanning feature would be activated here');
  };

  const handleAISuggestCategory = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product || (!product.productName && !product.description)) {
      alert('Please enter a product name or description first');
      return;
    }

    setAiSuggesting(prev => ({ ...prev, [id]: true }));
    setAiSuggestions(prev => ({ ...prev, [id]: '' }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: `You are a product categorization assistant. Given a product name and description, respond with ONLY the single best matching category from this list, nothing else:
${CATEGORIES.join(', ')}

Product name: ${product.productName}
Description: ${product.description}

Category:`,
            },
          ],
        }),
      });

      const data = await response.json();
      const suggested = data.content?.[0]?.text?.trim();
      const matched = CATEGORIES.find(c => c.toLowerCase() === suggested?.toLowerCase()) || suggested;

      setAiSuggestions(prev => ({ ...prev, [id]: matched }));
    } catch (err) {
      console.error('AI suggestion failed:', err);
    } finally {
      setAiSuggesting(prev => ({ ...prev, [id]: false }));
    }
  };

  const applyAISuggestion = (id) => {
    const suggestion = aiSuggestions[id];
    if (suggestion) {
      handleChange(id, 'category', suggestion);
      setAiSuggestions(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const dismissAISuggestion = (id) => {
    setAiSuggestions(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const addProduct = () => {
    setProducts(prev => [...prev, emptyProduct()]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const token = getToken();

    try {
      await Promise.all(
        products.map(async (product) => {
          const payload = {
            name: product.productName,
            sku: product.sku,
            category: product.category,
            stock: parseInt(product.stock, 10) || 0,
            costPrice: parseFloat(product.costPrice) || 0,
            sellingPrice: parseFloat(product.unitPrice) || 0,
            expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString() : "2099-12-31T00:00:00.000Z",
            barcode: product.barcode || '',
            description: product.description || '',
            reorderLevel: parseInt(product.reorderLevel, 10) || 0,
            status: product.status,
          };

          const res = await fetch('/api/Products/Create-Product', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const text = await res.text();
            let msg = `Failed to create "${product.productName}".`;
            try { msg = JSON.parse(text)?.message || msg; } catch {}
            throw new Error(msg);
          }

          return res;
        })
      );

      navigate('/products');
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="add-item-root space-y-6">
      <style>{ADD_ITEM_STYLES}</style>

      {/* Header – exactly like Addstockpage */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="db-section-title">Add New Products</h1>
          <p className="text-sm text-gray-600 mt-1">Add one or multiple products at once</p>
        </div>
        <button onClick={() => navigate(-1)} className="db-icon-btn">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Submit error banner */}
      {submitError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {products.map((product, index) => (
          <div key={product.id} className="relative border border-gray-200 rounded-xl p-5 bg-white">
            {/* Product header */}
            <div className="flex items-center justify-between mb-4">
              <div className="db-badge db-badge-teal">Product #{index + 1}</div>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Basic Information */}
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={product.productName}
                  onChange={(e) => handleChange(product.id, 'productName', e.target.value)}
                  required
                  className="db-input"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">SKU <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => handleChange(product.id, 'sku', e.target.value)}
                    required
                    className="db-input"
                    placeholder="Enter SKU"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Barcode</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={product.barcode}
                      onChange={(e) => handleChange(product.id, 'barcode', e.target.value)}
                      className="db-input pr-10"
                      placeholder="Enter barcode"
                    />
                    <button
                      type="button"
                      onClick={() => handleScanBarcode(product.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Scan barcode"
                    >
                      <ScanLine className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => handleAISuggestCategory(product.id)}
                    disabled={aiSuggesting[product.id]}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f8c5a]/10 text-[#0f8c5a] text-xs font-medium rounded-lg hover:bg-[#0f8c5a]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiSuggesting[product.id] ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analyzing...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" />AI Suggest</>
                    )}
                  </button>
                </div>
                <CategoryCombobox
                  value={product.category}
                  onChange={(val) => handleChange(product.id, 'category', val)}
                  categories={categories}
                  onAddCategory={handleAddCategory}
                />

                {aiSuggestions[product.id] && (
                  <div className="mt-3 p-3 bg-[#0f8c5a]/10 border border-[#0f8c5a]/20 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#0f8c5a]" />
                        <span className="text-sm text-gray-900">
                          AI suggests: <span className="font-semibold text-[#0f8c5a]">{aiSuggestions[product.id]}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => applyAISuggestion(product.id)}
                          className="px-3 py-1 bg-[#0f8c5a] text-white text-xs font-medium rounded hover:bg-[#0a6b45] transition-colors">
                          Apply
                        </button>
                        <button type="button" onClick={() => dismissAISuggestion(product.id)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <textarea
                  value={product.description}
                  onChange={(e) => handleChange(product.id, 'description', e.target.value)}
                  rows={3}
                  className="db-input resize-none"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Pricing & Stock – separate section inside the same card */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Pricing & Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Unit Price (Selling) <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0f8c5a]/20 focus-within:border-[#0f8c5a] bg-white">
                    <span className="pl-3 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={product.unitPrice}
                      onChange={(e) => handleChange(product.id, 'unitPrice', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      className="flex-1 py-2 pr-3 text-sm bg-transparent focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Cost Price <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0f8c5a]/20 focus-within:border-[#0f8c5a] bg-white">
                    <span className="pl-3 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={product.costPrice}
                      onChange={(e) => handleChange(product.id, 'costPrice', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      className="flex-1 py-2 pr-3 text-sm bg-transparent focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Initial Stock Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => handleChange(product.id, 'stock', e.target.value)}
                    required
                    min="0"
                    className="db-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Reorder Level <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={product.reorderLevel}
                    onChange={(e) => handleChange(product.id, 'reorderLevel', e.target.value)}
                    required
                    min="0"
                    className="db-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Expiry Date</label>
                  <input
                    type="date"
                    value={product.expiryDate}
                    onChange={(e) => handleChange(product.id, 'expiryDate', e.target.value)}
                    className="db-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Status <span className="text-red-500">*</span></label>
                  <select
                    value={product.status}
                    onChange={(e) => handleChange(product.id, 'status', e.target.value)}
                    required
                    className="db-select w-full"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Product – dashed border like Addstockpage */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#0f8c5a] transition-colors">
          <button
            type="button"
            onClick={addProduct}
            className="w-full flex items-center justify-center gap-2 text-[#0f8c5a] font-medium hover:text-[#0a6b45] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Product
          </button>
        </div>

        {/* Action Buttons – exactly as in Addstockpage */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="db-secondary-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="db-primary-btn"
          >
            {submitting
              ? 'Saving...'
              : `Add ${products.length} ${products.length === 1 ? 'Product' : 'Products'}`}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddItemPage;