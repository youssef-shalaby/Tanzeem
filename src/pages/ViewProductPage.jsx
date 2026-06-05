import { ArrowLeft, Package, Edit, Trash2, DollarSign, BarChart3, AlertTriangle, Archive } from 'lucide-react';
import { useNavigate, useLocation, useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { DeleteProductModal } from '../ui/DeleteProductModal';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

function normalize(raw) {
  return {
    id: raw.id,
    name: raw.name,
    sku: raw.sku,
    category: raw.category,
    categoryId: raw.categoryId,
    stock: raw.stock ?? 0,
    costPrice: raw.costPrice ?? 0,
    sellingPrice: raw.sellingPrice ?? raw.price ?? 0,
    expiryDate: raw.expiryDate
      ? new Date(raw.expiryDate).toLocaleDateString()
      : '—',
    barcode: raw.barcode || '—',
    description: raw.description || '',
    reorderLevel: raw.reorderLevel ?? 0,
    status: raw.status || '—',
  };
}

export function ViewProductPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [product, setProduct] = useState(() => {
    const raw = location.state?.product;
    return raw ? normalize(raw) : null;
  });
  const [loading, setLoading] = useState(!location.state?.product);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.product) return;
    if (!id) { setError('No product ID provided.'); setLoading(false); return; }

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
        setProduct(normalize(data?.data ?? data));
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [id]);

  const handleDelete = () => { setDeleteModalOpen(false); navigate('/products'); };

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-sm text-gray-500">Loading product...</div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center h-96">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={() => navigate('/products')} className="px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg">Back to Products</button>
    </div>
  );
  if (!product) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Package className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
      <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
      <Link to="/products" className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">Back to Products</Link>
    </div>
  );

  const profitMargin = product.sellingPrice > 0
    ? ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1)
    : '0.0';

  const stockStatus =
    product.stock <= product.reorderLevel ? 'Low Stock' :
    product.stock <= product.reorderLevel * 2 ? 'Medium Stock' : 'In Stock';

  const stockStatusStyle =
    stockStatus === 'Low Stock' ? 'bg-red-100 text-red-700' :
    stockStatus === 'Medium Stock' ? 'bg-yellow-100 text-yellow-700' :
    'bg-green-100 text-green-700';

  const statusStyle =
    product.status === 'Active' ? 'bg-green-100 text-green-700' :
    product.status === 'Inactive' ? 'bg-gray-100 text-gray-600' :
    'bg-red-100 text-red-700';

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/products')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">SKU: {product.sku} · ID: {product.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/products/edit-product/${product.id}`, { state: { product } })}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Selling Price</div>
            <div className="w-10 h-10 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#15aaad]" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">${Number(product.sellingPrice).toFixed(2)}</div>
          <div className="text-xs text-gray-500 mt-1">Cost: ${Number(product.costPrice).toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Profit Margin</div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{profitMargin}%</div>
          <div className="text-xs text-gray-500 mt-1">
            ${(product.sellingPrice - product.costPrice).toFixed(2)} per unit
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Stock Level</div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Archive className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-semibold text-gray-900">{product.stock}</div>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${stockStatusStyle}`}>
            {stockStatus}
          </span>
        </div>
      </div>

      {/* DETAIL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Product Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Product Information</h2>
          <div className="space-y-3">
            {[
              { label: 'Name', value: product.name },
              { label: 'SKU', value: product.sku },
              { label: 'Barcode', value: product.barcode },
              { label: 'Category', value: product.category },
              {
                label: 'Status',
                value: (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}>
                    {product.status}
                  </span>
                ),
              },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Pricing</h2>
          <div className="space-y-3">
            {[
              { label: 'Selling Price', value: `$${Number(product.sellingPrice).toFixed(2)}` },
              { label: 'Cost Price', value: `$${Number(product.costPrice).toFixed(2)}` },
              { label: 'Profit per Unit', value: `$${(product.sellingPrice - product.costPrice).toFixed(2)}` },
              { label: 'Profit Margin', value: `${profitMargin}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stock & Inventory */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Stock & Inventory</h2>
          <div className="space-y-3">
            {[
              { label: 'Current Stock', value: product.stock },
              { label: 'Reorder Level', value: product.reorderLevel },
              { label: 'Expiry Date', value: product.expiryDate },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>

          {product.stock <= product.reorderLevel && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs text-red-700">Stock is at or below the reorder level. Consider restocking soon.</p>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}
      </div>

      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        productName={product.name}
        productId={product.id}
        onConfirm={handleDelete}
      />
    </div>
  );
}