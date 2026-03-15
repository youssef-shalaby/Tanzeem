import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

const mockProducts = {
  '1': { productName: 'Wireless Mouse', sku: 'WM-002', category: 'Electronics', price: '19.99', costPrice: '12.00', stockLevel: '234', reorderLevel: '50', expiryDate: '2025-12-31', description: 'Ergonomic wireless mouse with 2.4GHz connectivity', status: 'Active' },
  '2': { productName: 'USB-C Cable', sku: 'UC-003', category: 'Accessories', price: '12.99', costPrice: '6.00', stockLevel: '567', reorderLevel: '100', expiryDate: '', description: 'Durable USB-C charging cable', status: 'Active' },
  '3': { productName: 'HDMI Cable', sku: 'HC-006', category: 'Accessories', price: '8.99', costPrice: '4.50', stockLevel: '445', reorderLevel: '80', expiryDate: '', description: 'High-speed HDMI cable 2m', status: 'Active' },
  '4': { productName: 'Laptop Stand', sku: 'LS-001', category: 'Office Supplies', price: '29.99', costPrice: '18.00', stockLevel: '123', reorderLevel: '30', expiryDate: '', description: 'Adjustable aluminum laptop stand', status: 'Active' },
  '5': { productName: 'Webcam HD', sku: 'WC-008', category: 'Electronics', price: '59.99', costPrice: '35.00', stockLevel: '89', reorderLevel: '25', expiryDate: '2026-06-30', description: '1080p HD webcam with built-in microphone', status: 'Active' },
  '6': { productName: 'Office Chair', sku: 'OC-884', category: 'Furniture', price: '149.00', costPrice: '90.00', stockLevel: '45', reorderLevel: '15', expiryDate: '', description: 'Ergonomic office chair with lumbar support', status: 'Active' },
  '7': { productName: 'Monitor 24"', sku: 'MN-005', category: 'Electronics', price: '199.99', costPrice: '130.00', stockLevel: '67', reorderLevel: '20', expiryDate: '2026-03-15', description: '24-inch Full HD monitor', status: 'Active' },
  '8': { productName: 'Wireless Keyboard', sku: 'WK-004', category: 'Electronics', price: '49.99', costPrice: '28.00', stockLevel: '178', reorderLevel: '40', expiryDate: '', description: 'Wireless mechanical keyboard', status: 'Active' },
};

export function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState(
    mockProducts[id || '1'] || {
      productName: '',
      sku: '',
      category: '',
      price: '',
      costPrice: '',
      stockLevel: '',
      reorderLevel: '',
      expiryDate: '',
      description: '',
      status: 'Active',
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product updated:', formData);
    navigate(-1);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Edit Product</h1>
          <p className="text-sm text-gray-600">Update product information</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleChange('productName', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="Enter SKU"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad] resize-none"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className='md:col-span-2'>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="0.00"
                    required
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => handleChange('costPrice', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="0.00"
                  />
                </div> */}
              </div>
            </div>

            {/* Stock Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Stock Level <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.stockLevel}
                    onChange={(e) => handleChange('stockLevel', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => handleChange('reorderLevel', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
            >
              <Save className="w-[18px] h-[18px]" />
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
