import { ArrowLeft, Package, Edit, Trash2, DollarSign, BarChart3, AlertTriangle, Archive } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { DeleteProductModal } from '../ui/DeleteProductModal';
import { useAuth } from '../contexts/AuthContext';

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
    expiryDate: (() => {
      if (!raw.expiryDate) return '—';
      const d = new Date(raw.expiryDate);
      return d.getFullYear() >= 2099 ? '—' : d.toLocaleDateString();
    })(),
    barcode: raw.barcode || '—',
    description: raw.description || '',
    reorderLevel: raw.reorderLevel ?? 0,
    status: raw.status || '—',
  };
}

export function ViewProductPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { id } = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;

      if (!id) {
        setError('No product ID provided.');
        setLoading(false);
        return;
      }

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
          if (cancelled) return;
          setProduct(normalize(data?.data ?? data));
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err.message);
          setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [id]);

  const handleDelete = () => { setDeleteModalOpen(false); navigate('/products'); };

  if (loading) return (
    <div className="view-product-root flex items-center justify-center h-96 text-sm text-gray-500">
      Loading product...
    </div>
  );
  if (error) return (
    <div className="view-product-root flex flex-col items-center justify-center h-96">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={() => navigate('/products')} className="db-primary-btn">Back to Products</button>
    </div>
  );
  if (!product) return (
    <div className="view-product-root flex flex-col items-center justify-center h-96">
      <Package className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
      <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
      <Link to="/products" className="db-primary-btn">Back to Products</Link>
    </div>
  );

  const profitMargin = product.sellingPrice > 0
    ? ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1)
    : '0.0';

  const stockStatus =
    product.stock <= product.reorderLevel ? 'Low Stock' :
    product.stock <= product.reorderLevel * 2 ? 'Medium Stock' : 'In Stock';

  const stockStatusStyle =
    stockStatus === 'Low Stock' ? 'pill-red' :
    stockStatus === 'Medium Stock' ? 'pill-yellow' :
    'pill-green';

  const statusStyle =
    product.status === 'Active' ? 'pill-green' :
    product.status === 'Inactive' ? 'bg-gray-100 text-gray-600' :
    'bg-red-100 text-red-700';
  const canEditProduct = can('edit_products');
  const canDeleteProduct = can('delete_products');

  return (
    <div className="view-product-root space-y-6">
      {/* HEADER */}
      <div className="app-page-header">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/products')} className="db-icon-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="db-section-title">{product.name}</h1>
            <p className="text-sm text-gray-500">SKU: {product.sku} · ID: {product.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canEditProduct && (
            <button
              onClick={() => navigate(`/products/edit-product/${product.id}`, { state: { product } })}
              className="db-secondary-btn"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
          )}
          {canDeleteProduct && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="db-danger-btn"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS (Dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Selling Price</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">${Number(product.sellingPrice).toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">Cost: ${Number(product.costPrice).toFixed(2)}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#0f8c5a]/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-[#0f8c5a]" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Profit Margin</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{profitMargin}%</div>
              <div className="text-xs text-gray-500 mt-1">
                ${(product.sellingPrice - product.costPrice).toFixed(2)} per unit
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Stock Level</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{product.stock}</div>
              <span className={`db-stat-pill ${stockStatusStyle} mt-1 inline-block`}>
                {stockStatus}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Archive className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Product Information */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Product Information</span>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: 'Name', value: product.name },
              { label: 'SKU', value: product.sku },
              { label: 'Barcode', value: product.barcode },
              { label: 'Category', value: product.category },
              {
                label: 'Status',
                value: (
                  <span className={`db-stat-pill ${statusStyle}`}>
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
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Pricing</span>
          </div>
          <div className="p-5 space-y-3">
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
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Stock & Inventory</span>
          </div>
          <div className="p-5 space-y-3">
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
            <div className="mx-5 mb-5 flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <p className="text-xs text-red-700">Stock is at or below the reorder level. Consider restocking soon.</p>
            </div>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Description</span>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
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
