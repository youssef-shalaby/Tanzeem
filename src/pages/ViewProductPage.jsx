import { ArrowLeft, Package, Edit, Trash2, Star, DollarSign, BarChart3, ShoppingCart, AlertTriangle, Archive } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { DeleteProductModal } from '../ui/DeleteProductModal';

export function ViewProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/Products/Get-Product/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProduct({
          id: data.id,
          name: data.name || 'Unnamed Product',
          sku: data.sku || '—',
          category: data.category || 'Uncategorized',
          stockLevel: data.stock ?? 0,
          reorderLevel: data.reorderLevel ?? 0,
          price: data.sellingPrice ?? data.price ?? 0,
          costPrice: data.costPrice ?? 0,
          expiryDate: data.expiryDate ? new Date(data.expiryDate).toLocaleDateString() : 'N/A',
          status: data.status || 'Active',
          barcode: data.barcode || '—',
          description: data.description || '',
          supplier: data.supplier || '—',
          weight: data.weight || '—',
          dimensions: data.dimensions || '—',
          lastRestocked: data.lastRestocked ? new Date(data.lastRestocked).toLocaleDateString() : '—',
          totalSold: data.totalSold ?? 0,
          revenue: data.revenue ?? 0,
          rating: data.rating ?? 0,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [productId]);

  const handleDelete = () => {
    setDeleteModalOpen(false);
    navigate('/products');
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-500">Loading product...</div>;
  if (error) return <div className="py-16 text-center text-sm text-red-600">Error: {error}</div>;
  if (!product) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Package className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
      <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
      <Link to="/products" className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
        Back to Products
      </Link>
    </div>
  );

  const profitMargin = ((product.price - product.costPrice) / product.price * 100).toFixed(1);
  const stockStatus = product.stockLevel <= product.reorderLevel ? 'Low Stock' :
                      product.stockLevel <= product.reorderLevel * 2 ? 'Medium Stock' : 'In Stock';

  // ... rest of your JSX unchanged
}