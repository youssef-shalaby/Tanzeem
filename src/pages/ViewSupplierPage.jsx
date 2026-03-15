import { ArrowLeft, Mail, Phone, MapPin, Globe, Star, Edit, Trash2, Package, TrendingUp, Clock, Award, AlertCircle } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';
import { useState } from 'react';
import { DeleteSupplierModal } from '../ui/DeleteSupplierModal';

const suppliers = [
  {
    id: 1,
    name: 'Tech Global Supplies',
    contactPerson: 'Michael Chen',
    email: 'contact@techglobal.com',
    phone: '+1 (555) 123-4567',
    alternativePhone: '+1 (555) 123-4568',
    address: '123 Tech Street',
    city: 'Silicon Valley',
    state: 'CA',
    zipCode: '94025',
    country: 'United States',
    website: 'www.techglobal.com',
    taxId: 'TAX-12345678',
    paymentTerms: 'Net 30',
    leadTime: '7-10 days',
    category: 'Electronics',
    productsSupplied: 45,
    status: 'Active',
    rating: 4.8,
    onTimePercentage: 95,
    qualityScore: 4.8,
    badge: 'Top Performer',
    totalOrders: 234,
    completedOrders: 223,
    notes: 'Reliable supplier with excellent track record. Preferred for electronic components.',
  },
  {
    id: 2,
    name: 'Office Essentials Inc.',
    contactPerson: 'Sarah Williams',
    email: 'info@officeessentials.com',
    phone: '+1 (555) 234-5678',
    alternativePhone: '+1 (555) 234-5679',
    address: '456 Business Ave',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    website: 'www.officeessentials.com',
    taxId: 'TAX-87654321',
    paymentTerms: 'Net 45',
    leadTime: '5-7 days',
    category: 'Office Supplies',
    productsSupplied: 32,
    status: 'Active',
    rating: 4.5,
    onTimePercentage: 88,
    qualityScore: 4.5,
    badge: 'Reliable Partner',
    totalOrders: 156,
    completedOrders: 138,
    notes: 'Good for office supplies and stationery items.',
  },
  {
    id: 3,
    name: 'Premium Electronics Ltd',
    contactPerson: 'David Kumar',
    email: 'sales@premiumelectronics.com',
    phone: '+1 (555) 345-6789',
    alternativePhone: '+1 (555) 345-6790',
    address: '789 Electronics Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'United States',
    website: 'www.premiumelectronics.com',
    taxId: 'TAX-11223344',
    paymentTerms: 'Net 15',
    leadTime: '3-5 days',
    category: 'Electronics',
    productsSupplied: 67,
    status: 'Active',
    rating: 4.9,
    onTimePercentage: 98,
    qualityScore: 4.9,
    badge: 'Top Performer',
    totalOrders: 389,
    completedOrders: 381,
    notes: 'Premium quality electronics supplier with fastest delivery times.',
  },
];

export function ViewSupplierPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const supplier = suppliers.find(s => s.id === parseInt(supplierId || '1'));

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-600 mb-6">The supplier you're looking for doesn't exist.</p>
        <Link
          to="/suppliers"
          className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
        >
          Back to Suppliers
        </Link>
      </div>
    );
  }

  const handleDelete = () => {
    console.log('Deleting supplier:', supplier.id);
    setDeleteModalOpen(false);
    navigate('/suppliers');
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Top Performer':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Reliable Partner':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Average':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/suppliers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{supplier.name}</h1>
            <p className="text-sm text-gray-600 mt-1">Supplier Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/suppliers/edit-supplier/${supplier.id}`}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-[18px] h-[18px]" />
            Edit Supplier
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

      {/* Status Badge and Rating */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1.5 rounded-md text-sm font-medium ${
          supplier.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {supplier.status}
        </span>
        <span className={`px-3 py-1.5 rounded-md text-sm font-medium border ${getBadgeColor(supplier.badge)}`}>
          <Award className="w-4 h-4 inline mr-1.5" />
          {supplier.badge}
        </span>
        <div className="flex items-center gap-1.5">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-gray-900">{supplier.rating} Rating</span>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">On-Time Delivery</div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">{supplier.onTimePercentage}%</div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                supplier.onTimePercentage >= 90 ? 'bg-green-500' :
                supplier.onTimePercentage >= 75 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${supplier.onTimePercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Quality Score</div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">{supplier.qualityScore}</div>
          <div className="text-sm text-gray-600">Out of 5.0</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Orders</div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">{supplier.totalOrders}</div>
          <div className="text-sm text-gray-600">{supplier.completedOrders} completed</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Lead Time</div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">{supplier.leadTime}</div>
          <div className="text-sm text-gray-600">Average delivery</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Email</div>
                <a href={`mailto:${supplier.email}`} className="text-sm text-[#15aaad] hover:underline break-all">
                  {supplier.email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Phone</div>
                <div className="text-sm text-gray-900">{supplier.phone}</div>
                {supplier.alternativePhone && (
                  <div className="text-sm text-gray-600 mt-0.5">{supplier.alternativePhone} (Alt)</div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Address</div>
                <div className="text-sm text-gray-900">
                  {supplier.address}<br />
                  {supplier.city}, {supplier.state} {supplier.zipCode}<br />
                  {supplier.country}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Website</div>
                <a
                  href={`https://${supplier.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#15aaad] hover:underline break-all"
                >
                  {supplier.website}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Contact Person</div>
              <div className="text-sm text-gray-900">{supplier.contactPerson}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Category</div>
              <div className="text-sm text-gray-900">{supplier.category}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Tax ID / VAT Number</div>
              <div className="text-sm text-gray-900">{supplier.taxId}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Payment Terms</div>
              <div className="text-sm text-gray-900">{supplier.paymentTerms}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Products Supplied</div>
              <div className="text-sm text-gray-900">{supplier.productsSupplied} products</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {supplier.notes && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-700 leading-relaxed">{supplier.notes}</p>
          </div>
        </div>
      )}

      {/* Delete Supplier Modal */}
      <DeleteSupplierModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        supplierName={supplier.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}
