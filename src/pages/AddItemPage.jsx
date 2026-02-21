import { useState } from 'react';
import { X, ScanLine, Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Sidebar } from '../components/Sidebar';

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
    },
  ]);

  const [aiSuggesting, setAiSuggesting] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Products submitted:', products);
    navigate('/products');
  };

  const handleChange = (id, field, value) => {
    setProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, [field]: value } : product
      )
    );
  };

  const handleScanBarcode = (id) => {
    alert('Barcode scanning feature would be activated here');
  };

  const handleAISuggestCategory = (id) => {
    const product = products.find(p => p.id === id);

    if (!product || (!product.productName && !product.description)) {
      alert('Please enter a product name or description first');
      return;
    }

    setAiSuggesting(prev => ({ ...prev, [id]: true }));
    setAiSuggestions(prev => ({ ...prev, [id]: '' }));

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

      setAiSuggestions(prev => ({ ...prev, [id]: suggestedCategory }));
      setAiSuggesting(prev => ({ ...prev, [id]: false }));
    }, 1500);
  };

  const applyAISuggestion = (id) => {
    const suggestion = aiSuggestions[id];
    if (!suggestion) return;
    handleChange(id, 'category', suggestion);
    setAiSuggestions(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const dismissAISuggestion = (id) => {
    setAiSuggestions(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const addProduct = () => {
    setProducts(prev => [...prev, {
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
    }]);
  };

  const removeProduct = (id) => {
    setProducts(prev => prev.length > 1 ? prev.filter(product => product.id !== id) : prev);
  };

  return (
    <div className="flex h-screen bg-[#f6f8fa]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Add New Products</h1>
              <p className="text-sm text-gray-600 mt-1">Add one or multiple products at once</p>
            </div>
            <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {products.map((product, index) => (
              <div key={product.id} className="space-y-6 pb-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{product.productName || `Product ${index + 1}`}</h2>
                  {products.length > 1 && (
                    <button type="button" onClick={() => removeProduct(product.id)} className="text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={product.productName}
                  onChange={e => handleChange(product.id, 'productName', e.target.value)}
                  placeholder="Product Name"
                  className="w-full border p-2 rounded"
                  required
                />

                <input
                  type="text"
                  value={product.sku}
                  onChange={e => handleChange(product.id, 'sku', e.target.value)}
                  placeholder="SKU"
                  className="w-full border p-2 rounded"
                  required
                />

                <div className="relative">
                  <input
                    type="text"
                    value={product.barcode}
                    onChange={e => handleChange(product.id, 'barcode', e.target.value)}
                    placeholder="Barcode"
                    className="w-full border p-2 rounded pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => handleScanBarcode(product.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    <ScanLine size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleAISuggestCategory(product.id)}
                    disabled={aiSuggesting[product.id]}
                    className="flex items-center gap-2 text-sm text-[#15aaad]"
                  >
                    {aiSuggesting[product.id] ? (
                      <><Loader2 size={14} className="animate-spin" />Analyzing...</>
                    ) : (
                      <><Sparkles size={14} />AI Suggest</>
                    )}
                  </button>

                  <select
                    value={product.category}
                    onChange={e => handleChange(product.id, 'category', e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select category</option>
                    <option>Electronics</option>
                    <option>Accessories</option>
                    <option>Office Supplies</option>
                    <option>Furniture</option>
                    <option>Food & Beverage</option>
                    <option>Health & Beauty</option>
                  </select>

                  {aiSuggestions[product.id] && (
                    <div className="flex gap-2">
                      <button type="button" onClick={() => applyAISuggestion(product.id)} className="bg-[#15aaad] text-white px-3 py-1 rounded text-xs">Apply</button>
                      <button type="button" onClick={() => dismissAISuggestion(product.id)} className="bg-gray-200 px-3 py-1 rounded text-xs">Dismiss</button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <button type="button" onClick={addProduct} className="flex items-center gap-2 text-[#15aaad]">
              <Plus size={16} />
              Add Another Product
            </button>

            <button type="submit" className="w-full bg-[#15aaad] text-white py-2 rounded">
              Add {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}