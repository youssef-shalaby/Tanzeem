import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

const EMPTY_FORM = {
  productName: '',
  sku: '',
  category: '',
  sellingPrice: '',
  costPrice: '',
  stockLevel: '',
  reorderLevel: '',
  expiryDate: '',
  barcode: '',
  description: '',
  status: 'Active',
};

function productToForm(p) {
  return {
    productName: p.name || '',
    sku: p.sku || '',
    category: p.category || '',
    sellingPrice: String(p.sellingPrice ?? p.price ?? ''),
    costPrice: String(p.costPrice ?? ''),
    stockLevel: String(p.stock ?? p.stockLevel ?? ''),
    reorderLevel: String(p.reorderLevel ?? ''),
    expiryDate: (() => {
      if (!p.expiryDate || p.expiryDate === 'N/A' || p.expiryDate === '—') return '';
      const d = new Date(p.expiryDate);
      return d.getFullYear() >= 2099 ? '' : d.toISOString().split('T')[0];
    })(),
    barcode: p.barcode && p.barcode !== '—' ? p.barcode : '',
    description: p.description || '',
    status: p.status || 'Active',
  };
}

export function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch product by id — use router state if available to avoid extra round-trip
  useEffect(() => {
    if (!id) { setLoading(false); return; }

    fetch(`/api/Products/Get-Product/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const raw = data?.data ?? data;
        setFormData(productToForm(raw));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    // Matches the Swagger PUT payload exactly
    const payload = {
      name: formData.productName,
      sku: formData.sku,
      category: formData.category,
      stock: parseInt(formData.stockLevel, 10) || 0,
      costPrice: parseFloat(formData.costPrice) || 0,
      sellingPrice: parseFloat(formData.sellingPrice) || 0,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : "2099-12-31T00:00:00.000Z",
      barcode: formData.barcode || '',
      description: formData.description,
      reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
      status: formData.status,
    };

    try {
      const res = await fetch(`/api/Products/Update-Product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = 'Failed to save product.';
        try { msg = JSON.parse(text)?.message || msg; } catch {
          // Keep the fallback message when the API returns non-JSON text.
        }
        throw new Error(msg);
      }

      navigate('/products');
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-sm text-gray-500">
      Loading product...
    </div>
  );

  if (!id) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">Product not found. Please go back and try again.</p>
      <button
        onClick={() => navigate('/products')}
        className="db-primary-btn"
      >
        Back to Products
      </button>
    </div>
  );

  return (
    <div className="view-product-root space-y-6">
      {/* Header */}
      <div className="app-page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="db-icon-btn"
            aria-label="Back to products"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="app-page-heading">
            <h1 className="app-page-title">Edit Product</h1>
            <p className="app-page-subtitle">Update product information.</p>
          </div>
        </div>
      </div>

      {/* Save error banner */}
      {saveError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="db-card">
          <div className="p-6 space-y-6">

            {/* Basic Information */}
            <div>
              <h3 className="app-form-section-title">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="app-form-label">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                    className="db-input"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="app-form-label">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className="db-input"
                    placeholder="Enter SKU"
                    required
                  />
                </div>

                <div>
                  <label className="app-form-label">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="db-input"
                    placeholder="Enter category"
                    required
                  />
                </div>

                <div>
                  <label className="app-form-label">
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                    className="db-input"
                    placeholder="Enter barcode"
                  />
                </div>

                <div>
                  <label className="app-form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="db-select w-full"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="app-form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="db-input resize-none"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="app-form-section-title">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="app-form-label">
                    Selling Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => handleChange('sellingPrice', e.target.value)}
                    className="db-input"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="app-form-label">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    className="db-input"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div>
              <h3 className="app-form-section-title">Stock Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="app-form-label">
                    Current Stock Level <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockLevel}
                    onChange={(e) => handleChange('stockLevel', e.target.value)}
                    className="db-input"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="app-form-label">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) => handleChange('reorderLevel', e.target.value)}
                    className="db-input"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="app-form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className="db-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="db-secondary-btn disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="db-primary-btn disabled:opacity-60"
            >
              <Save className="w-[18px] h-[18px]" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
