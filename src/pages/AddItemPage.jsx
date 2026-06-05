import { useState } from 'react';
import { X, ScanLine, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

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
  stock: '',
  reorderLevel: '',
  expiryDate: '',
  status: 'Active',
});

export function AddItemPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([emptyProduct()]);
  const [aiSuggesting, setAiSuggesting] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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
      const results = await Promise.all(
        products.map(async (product) => {
          const payload = {
            name: product.productName,
            sku: product.sku,
            category: product.category,
            stock: parseInt(product.stock, 10) || 0,
            costPrice: 0,
            sellingPrice: parseFloat(product.unitPrice) || 0,
            expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString() : null,
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Products</h1>
          <p className="text-sm text-gray-600 mt-1">Add one or multiple products at once</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
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
          <div key={product.id} className="space-y-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0">

            {/* Product Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[#15aaad]">{index + 1}</span>
                </div>
                <h2 className="font-semibold text-gray-900">
                  {product.productName || `Product ${index + 1}`}
                </h2>
              </div>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-5">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={product.productName}
                    onChange={(e) => handleChange(product.id, 'productName', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => handleChange(product.id, 'sku', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="Enter SKU"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={product.barcode}
                      onChange={(e) => handleChange(product.id, 'barcode', e.target.value)}
                      className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                    <button
                      type="button"
                      onClick={() => handleAISuggestCategory(product.id)}
                      disabled={aiSuggesting[product.id]}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#15aaad]/10 text-[#15aaad] text-xs font-medium rounded-lg hover:bg-[#15aaad]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {aiSuggesting[product.id] ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analyzing...</>
                      ) : (
                        <><Sparkles className="w-3.5 h-3.5" />AI Suggest</>
                      )}
                    </button>
                  </div>
                  <select
                    value={product.category}
                    onChange={(e) => handleChange(product.id, 'category', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {aiSuggestions[product.id] && (
                    <div className="mt-2 p-3 bg-[#15aaad]/10 border border-[#15aaad]/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#15aaad]" />
                          <span className="text-sm text-gray-900">
                            AI suggests: <span className="font-semibold text-[#15aaad]">{aiSuggestions[product.id]}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => applyAISuggestion(product.id)}
                            className="px-3 py-1 bg-[#15aaad] text-white text-xs font-medium rounded hover:bg-[#0d8082] transition-colors">
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => handleChange(product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad] resize-none"
                    placeholder="Enter product description"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-5">Pricing & Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (Selling) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={product.unitPrice}
                      onChange={(e) => handleChange(product.id, 'unitPrice', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => handleChange(product.id, 'stock', e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={product.reorderLevel}
                    onChange={(e) => handleChange(product.id, 'reorderLevel', e.target.value)}
                    required
                    min="0"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={product.expiryDate}
                    onChange={(e) => handleChange(product.id, 'expiryDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
                  <select
                    value={product.status}
                    onChange={(e) => handleChange(product.id, 'status', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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

        {/* Add Another Product */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-[#15aaad] transition-colors">
          <button
            type="button"
            onClick={addProduct}
            className="w-full flex items-center justify-center gap-2 text-[#15aaad] font-medium hover:text-[#0d8082] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Another Product
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors font-medium disabled:opacity-60"
          >
            {submitting
              ? 'Saving...'
              : `Add ${products.length} ${products.length === 1 ? 'Product' : 'Products'}`}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddItemPage;