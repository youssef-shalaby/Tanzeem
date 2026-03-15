import { ArrowLeft, Package, Edit, Trash2, Star, DollarSign, BarChart3, ShoppingCart, AlertTriangle, Archive } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';
import { useState } from 'react';
import { DeleteProductModal } from '../ui/DeleteProductModal';

const products = [
  {
    id: 1,
    name: 'Wireless Mouse',
    sku: 'WM-002',
    category: 'Electronics',
    price: 19.99,
    costPrice: 12.00,
    stockLevel: 234,
    reorderLevel: 50,
    expiryDate: '12/31/2025',
    rating: 4.5,
    status: 'Active',
    description: 'Ergonomic wireless mouse with 2.4GHz connectivity and adjustable DPI settings. Features a comfortable grip design and long battery life.',
    totalSold: 1245,
    revenue: 24880.55,
    lastRestocked: '02/15/2024',
    supplier: 'Tech Global Supplies',
    barcode: '978-3-16-148410-0',
    weight: '0.15 kg',
    dimensions: '12 x 6 x 4 cm',
  },
  {
    id: 2,
    name: 'USB-C Cable',
    sku: 'UC-003',
    category: 'Accessories',
    price: 12.99,
    costPrice: 6.00,
    stockLevel: 567,
    reorderLevel: 100,
    expiryDate: 'N/A',
    rating: 4.8,
    status: 'Active',
    description: 'Durable USB-C charging cable with fast charging support. Compatible with most USB-C devices.',
    totalSold: 2389,
    revenue: 31021.11,
    lastRestocked: '03/01/2024',
    supplier: 'Tech Global Supplies',
    barcode: '978-3-16-148410-1',
    weight: '0.05 kg',
    dimensions: '200 cm length',
  },
  {
    id: 3,
    name: 'HDMI Cable',
    sku: 'HC-006',
    category: 'Accessories',
    price: 8.99,
    costPrice: 4.50,
    stockLevel: 445,
    reorderLevel: 80,
    expiryDate: 'N/A',
    rating: 4.6,
    status: 'Active',
    description: 'High-speed HDMI cable 2m with 4K support and gold-plated connectors.',
    totalSold: 1876,
    revenue: 16861.24,
    lastRestocked: '02/28/2024',
    supplier: 'Premium Electronics Ltd',
    barcode: '978-3-16-148410-2',
    weight: '0.12 kg',
    dimensions: '200 cm length',
  },
  {
    id: 4,
    name: 'Laptop Stand',
    sku: 'LS-001',
    category: 'Office Supplies',
    price: 29.99,
    costPrice: 18.00,
    stockLevel: 123,
    reorderLevel: 30,
    expiryDate: 'N/A',
    rating: 4.7,
    status: 'Active',
    description: 'Adjustable aluminum laptop stand with ergonomic design. Suitable for laptops up to 17 inches.',
    totalSold: 567,
    revenue: 17004.33,
    lastRestocked: '02/10/2024',
    supplier: 'Office Essentials Inc.',
    barcode: '978-3-16-148410-3',
    weight: '0.85 kg',
    dimensions: '28 x 22 x 5 cm',
  },
  {
    id: 5,
    name: 'Webcam HD',
    sku: 'WC-008',
    category: 'Electronics',
    price: 59.99,
    costPrice: 35.00,
    stockLevel: 89,
    reorderLevel: 25,
    expiryDate: '06/30/2026',
    rating: 4.4,
    status: 'Active',
    description: '1080p HD webcam with built-in microphone and auto-focus. Perfect for video conferencing and streaming.',
    totalSold: 423,
    revenue: 25374.77,
    lastRestocked: '03/05/2024',
    supplier: 'Tech Global Supplies',
    barcode: '978-3-16-148410-4',
    weight: '0.25 kg',
    dimensions: '8 x 6 x 6 cm',
  },
  {
    id: 6,
    name: 'Office Chair',
    sku: 'OC-884',
    category: 'Furniture',
    price: 149.00,
    costPrice: 90.00,
    stockLevel: 45,
    reorderLevel: 15,
    expiryDate: 'N/A',
    rating: 4.9,
    status: 'Active',
    description: 'Ergonomic office chair with lumbar support and adjustable height. Features breathable mesh back and cushioned seat.',
    totalSold: 234,
    revenue: 34866.00,
    lastRestocked: '01/20/2024',
    supplier: 'Office Essentials Inc.',
    barcode: '978-3-16-148410-5',
    weight: '12.5 kg',
    dimensions: '65 x 60 x 110 cm',
  },
  {
    id: 7,
    name: 'Monitor 24"',
    sku: 'MN-005',
    category: 'Electronics',
    price: 199.99,
    costPrice: 130.00,
    stockLevel: 67,
    reorderLevel: 20,
    expiryDate: '03/15/2026',
    rating: 4.6,
    status: 'Active',
    description: '24-inch Full HD monitor with IPS panel and ultra-slim bezels. Features HDMI and DisplayPort connectivity.',
    totalSold: 189,
    revenue: 37798.11,
    lastRestocked: '02/25/2024',
    supplier: 'Premium Electronics Ltd',
    barcode: '978-3-16-148410-6',
    weight: '3.2 kg',
    dimensions: '54 x 42 x 18 cm',
  },
  {
    id: 8,
    name: 'Wireless Keyboard',
    sku: 'WK-004',
    category: 'Electronics',
    price: 49.99,
    costPrice: 28.00,
    stockLevel: 178,
    reorderLevel: 40,
    expiryDate: 'N/A',
    rating: 4.5,
    status: 'Active',
    description: 'Wireless mechanical keyboard with RGB backlighting and programmable keys. Includes wrist rest for comfort.',
    totalSold: 789,
    revenue: 39441.11,
    lastRestocked: '03/02/2024',
    supplier: 'Tech Global Supplies',
    barcode: '978-3-16-148410-7',
    weight: '0.95 kg',
    dimensions: '44 x 13 x 3 cm',
  },
];

export function ViewProductPage() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const product = products.find(p => p.id === parseInt(productId || '1'));

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Link
          to="/products"
          className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    console.log('Deleting product:', product.id);
    setDeleteModalOpen(false);
    navigate('/products');
  };

  const profitMargin = ((product.price - product.costPrice) / product.price * 100).toFixed(1);
  const stockStatus = product.stockLevel <= product.reorderLevel ? 'Low Stock' :
                      product.stockLevel <= product.reorderLevel * 2 ? 'Medium Stock' : 'In Stock';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/products')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Product Details - SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/products/edit-product/${product.id}`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-[18px] h-[18px]" />
            Edit Product
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-[18px] h-[18px]" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${
          product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {product.status}
        </span>
        <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${
          stockStatus === 'In Stock' ? 'bg-green-100 text-green-700' :
          stockStatus === 'Medium Stock' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {stockStatus}
        </span>
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-gray-900">{product.rating} Rating</span>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Current Stock</div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Archive className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">{product.stockLevel}</div>
          <div className="text-sm text-gray-600">Reorder at {product.reorderLevel}</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">${product.revenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">{product.totalSold} units sold</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Profit Margin</div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">{profitMargin}%</div>
          <div className="text-sm text-gray-600">Profit: ${(product.price - product.costPrice).toFixed(2)}/unit</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Unit Price</div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">${product.price}</div>
          <div className="text-sm text-gray-600">Cost: ${product.costPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Information */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Product Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Product Name</div>
              <div className="text-sm text-gray-900">{product.name}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">SKU</div>
              <div className="text-sm text-gray-900 font-mono">{product.sku}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Category</div>
              <div className="text-sm text-gray-900">{product.category}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Barcode</div>
              <div className="text-sm text-gray-900 font-mono">{product.barcode}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Supplier</div>
              <div className="text-sm text-gray-900">{product.supplier}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Status</div>
              <div className="text-sm text-gray-900">{product.status}</div>
            </div>
          </div>
        </div>

        {/* Stock & Pricing Details */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Stock & Pricing Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Current Stock Level</div>
              <div className="text-sm text-gray-900">{product.stockLevel} units</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Reorder Level</div>
              <div className="text-sm text-gray-900">{product.reorderLevel} units</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Last Restocked</div>
              <div className="text-sm text-gray-900">{product.lastRestocked}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Expiry Date</div>
              <div className="text-sm text-gray-900">{product.expiryDate}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Weight</div>
              <div className="text-sm text-gray-900">{product.weight}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Dimensions</div>
              <div className="text-sm text-gray-900">{product.dimensions}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      {product.description && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        </div>
      )}

      {/* Low Stock Warning */}
      {product.stockLevel <= product.reorderLevel && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-1">Low Stock Alert</h3>
              <p className="text-sm text-red-700">
                This product's stock level ({product.stockLevel} units) is at or below the reorder level ({product.reorderLevel} units).
                Consider restocking soon to avoid stock-outs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        productName={product.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}