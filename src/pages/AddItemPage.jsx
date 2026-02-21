import { useState } from 'react';
import { X, ScanLine, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

export function AddItemPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    {
      id: '1',
      productName: '',
      sku: '',
      barcode: '',
      category: '',
      supplier: '',
      description: '',
      unitPrice: '',
      costPrice: '',
      stock: '',
      reorderLevel: '',
      expiryDate: '',
      status: 'Active',
    }
  ]);

  const [aiSuggesting, setAiSuggesting] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Products submitted:', products);
    navigate('/products');
  };

  const handleChange = (id, field, value) => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const handleScanBarcode = (id) => {
    console.log('Scanning barcode for product:', id);
    alert('Barcode scanning feature would be activated here');
  };

  const handleAISuggestCategory = (id) => {
    const product = products.find(p => p.id === id);
    if (!product || (!product.productName && !product.description)) {
      alert('Please enter a product name or description first');
      return;
    }

    setAiSuggesting({ ...aiSuggesting, [id]: true });
    setAiSuggestions({ ...aiSuggestions, [id]: '' });

    setTimeout(() => {
      const productText = `${product.productName} ${product.description}`.toLowerCase();
      let suggestedCategory = 'Office Supplies';

      if (productText.includes('mouse') || productText.includes('keyboard') || productText.includes('laptop') || productText.includes('phone') || productText.includes('usb') || productText.includes('cable') || productText.includes('charger')) {
        suggestedCategory = 'Electronics';
      } else if (productText.includes('chair') || productText.includes('desk') || productText.includes('table') || productText.includes('shelf')) {
        suggestedCategory = 'Furniture';
      } else if (productText.includes('pen') || productText.includes('notebook') || productText.includes('paper') || productText.includes('stapler')) {
        suggestedCategory = 'Office Supplies';
      } else if (productText.includes('bag') || productText.includes('case') || productText.includes('headphone') || productText.includes('watch')) {
        suggestedCategory = 'Accessories';
      } else if (productText.includes('food') || productText.includes('snack') || productText.includes('drink') || productText.includes('coffee')) {
        suggestedCategory = 'Food & Beverage';
      } else if (productText.includes('soap') || productText.includes('shampoo') || productText.includes('cream') || productText.includes('sanitizer')) {
        suggestedCategory = 'Health & Beauty';
      }

      setAiSuggestions({ ...aiSuggestions, [id]: suggestedCategory });
      setAiSuggesting({ ...aiSuggesting, [id]: false });
    }, 1500);
  };

  const applyAISuggestion = (id) => {
    const suggestion = aiSuggestions[id];
    if (suggestion) {
      handleChange(id, 'category', suggestion);
      const newSuggestions = { ...aiSuggestions };
      delete newSuggestions[id];
      setAiSuggestions(newSuggestions);
    }
  };

  const dismissAISuggestion = (id) => {
    const newSuggestions = { ...aiSuggestions };
    delete newSuggestions[id];
    setAiSuggestions(newSuggestions);
  };

  const addProduct = () => {
    const newProduct = {
      id: Date.now().toString(),
      productName: '',
      sku: '',
      barcode: '',
      category: '',
      supplier: '',
      description: '',
      unitPrice: '',
      costPrice: '',
      stock: '',
      reorderLevel: '',
      expiryDate: '',
      status: 'Active',
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Add New Products</h1>
          <p className="text-sm text-gray-600 mt-1">Add one or multiple products at once</p>
        </div>
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {products.map((product, index) => (
          <div key={product.id} className="space-y-6 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
            {/* Product Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-teal-500">{index + 1}</span>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={product.productName}
                    onChange={(e) => handleChange(product.id, 'productName', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => handleChange(product.id, 'sku', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                      className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Category *</label>
                    <button
                      type="button"
                      onClick={() => handleAISuggestCategory(product.id)}
                      disabled={aiSuggesting[product.id]}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 text-teal-500 text-xs font-medium rounded-lg hover:bg-teal-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                  </select>
                  {aiSuggestions[product.id] && (
                    <div className="mt-2 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-teal-500" />
                          <span className="text-sm text-gray-900">
                            AI suggests: <span className="font-semibold text-teal-500">{aiSuggestions[product.id]}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => applyAISuggestion(product.id)}
                            className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded hover:bg-teal-600 transition-colors">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                  <select
                    value={product.supplier}
                    onChange={(e) => handleChange(product.id, 'supplier', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="">Select supplier</option>
                    <option value="TechCorp">TechCorp</option>
                    <option value="GadgetHub">GadgetHub</option>
                    <option value="ConnectPro">ConnectPro</option>
                    <option value="DisplayTech">DisplayTech</option>
                    <option value="Global Trade Co">Global Trade Co</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={product.description}
                    onChange={(e) => handleChange(product.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={product.costPrice}
                      onChange={(e) => handleChange(product.id, 'costPrice', e.target.value)}
                      required step="0.01"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (Selling) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input type="number" value={product.unitPrice}
                      onChange={(e) => handleChange(product.id, 'unitPrice', e.target.value)}
                      required step="0.01"
                      className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                      placeholder="0.00" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock Quantity *</label>
                  <input type="number" value={product.stock}
                    onChange={(e) => handleChange(product.id, 'stock', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="0" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level *</label>
                  <input type="number" value={product.reorderLevel}
                    onChange={(e) => handleChange(product.id, 'reorderLevel', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    placeholder="0" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input type="date" value={product.expiryDate}
                    onChange={(e) => handleChange(product.id, 'expiryDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select value={product.status}
                    onChange={(e) => handleChange(product.id, 'status', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Product */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-teal-500 transition-colors">
          <button type="button" onClick={addProduct}
            className="w-full flex items-center justify-center gap-2 text-teal-500 font-medium hover:text-teal-600 transition-colors">
            <Plus className="w-5 h-5" />
            Add Another Product
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button type="submit"
            className="flex-1 px-6 py-2.5 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors font-medium">
            Add {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </button>
          <button type="button" onClick={() => navigate('/products')}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddItemPage;