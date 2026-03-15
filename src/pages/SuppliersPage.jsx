import { useState } from 'react';
import { Plus, Search, Upload, Star, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { DeleteSupplierModal } from '../ui/DeleteSupplierModal';
import { CSVUploadModal } from '../ui/CSVUploadModal';
import { CSVReviewModal } from '../ui/CSVReviewModal';

const suppliers = [
  {
    id: 1,
    name: 'Tech Global Supplies',
    email: 'contact@techglobal.com',
    phone: '+1 (555) 123-4567',
    address: '123 Tech Street, Silicon Valley, CA 94025',
    website: 'www.techglobal.com',
    productsSupplied: 45,
    status: 'Active',
    rating: 4.8,
    onTimePercentage: 95,
    leadTime: '7-10 days',
    qualityScore: 4.8,
    badge: 'Top Performer'
  },
  {
    id: 2,
    name: 'Office Essentials Inc.',
    email: 'info@officeessentials.com',
    phone: '+1 (555) 234-5678',
    address: '456 Business Ave, New York, NY 10001',
    website: 'www.officeessentials.com',
    productsSupplied: 32,
    status: 'Active',
    rating: 4.5,
    onTimePercentage: 88,
    leadTime: '5-7 days',
    qualityScore: 4.5,
    badge: 'Reliable Partner'
  },
  {
    id: 3,
    name: 'Premium Electronics Ltd',
    email: 'sales@premiumelectronics.com',
    phone: '+1 (555) 345-6789',
    address: '789 Electronics Blvd, Austin, TX 78701',
    website: 'www.premiumelectronics.com',
    productsSupplied: 67,
    status: 'Active',
    rating: 4.9,
    onTimePercentage: 98,
    leadTime: '3-5 days',
    qualityScore: 4.9,
    badge: 'Top Performer'
  },
  {
    id: 4,
    name: 'Furniture Masters',
    email: 'contact@furnituremasters.com',
    phone: '+1 (555) 456-7890',
    address: '321 Design Street, Seattle, WA 98101',
    website: 'www.furnituremasters.com',
    productsSupplied: 28,
    status: 'Active',
    rating: 4.6,
    onTimePercentage: 92,
    leadTime: '10-14 days',
    qualityScore: 4.6,
    badge: 'Reliable Partner'
  },
  {
    id: 5,
    name: 'Quick Ship Distributors',
    email: 'support@quickship.com',
    phone: '+1 (555) 567-8901',
    address: '654 Logistics Way, Chicago, IL 60601',
    website: 'www.quickship.com',
    productsSupplied: 53,
    status: 'Pending',
    rating: 4.3,
    onTimePercentage: 78,
    leadTime: '7-9 days',
    qualityScore: 4.3,
    badge: 'Average'
  },
];

export function SuppliersPage() {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(null);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [suppliersList, setSuppliersList] = useState(suppliers);

  const handleDelete = (supplierId) => {
    console.log('Deleting supplier:', supplierId);
    setDeleteModalOpen(null);
  };

  const handleCSVUpload = (data) => {
    console.log('CSV Upload - Received data:', data);
    setImportedData(data);
    setCsvModalOpen(false);
    setReviewModalOpen(true);
  };

  const handleConfirmImport = (data) => {
    console.log('Confirm Import - Received data:', data);
    const newSuppliers = data.map((item, index) => ({
      id: suppliersList.length + index + 1,
      name: item.name,
      onTimePercentage: parseInt(item.ontimepercentage || item.onTimePercentage || item['on-time percentage'] || '0'),
      leadTime: item.leadtime || item.leadTime || item['lead time'] || 'N/A',
      qualityScore: parseFloat(item.qualityscore || item.qualityScore || item['quality score'] || '0'),
      badge: item.badge || 'New Supplier',
      status: item.status || 'Active'
    }));
    console.log('Converted suppliers:', newSuppliers);
    setSuppliersList([...newSuppliers, ...suppliersList]);
    setReviewModalOpen(false);
  };

  const getSupplierById = (id) => {
    return suppliersList.find(s => s.id === id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-[18px] h-[18px]" />
            Import CSV
          </button>
          <Link
            to="/suppliers/add"
            className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
          >
            <Plus className="w-[18px] h-[18px]" />
            Add Supplier
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Suppliers</div>
          <div className="text-2xl font-semibold text-gray-900">89</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Active Suppliers</div>
          <div className="text-2xl font-semibold text-green-600">78</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Inactive Suppliers</div>
          <div className="text-2xl font-semibold text-gray-400">11</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Percentage</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Lead Time</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Score</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Badge</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliersList.map((supplier) => (
                <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{supplier.name}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${
                            supplier.onTimePercentage >= 90 ? 'bg-green-500' :
                            supplier.onTimePercentage >= 75 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${supplier.onTimePercentage}%` }}
                        />
                      </div>
                      <span className="text-gray-900 font-medium">{supplier.onTimePercentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{supplier.leadTime}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium text-gray-900">{supplier.qualityScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      supplier.badge === 'Top Performer' ? 'bg-green-100 text-green-700' :
                      supplier.badge === 'Reliable Partner' ? 'bg-blue-100 text-blue-700' :
                      supplier.badge === 'Average' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {supplier.badge}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      supplier.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === supplier.id ? null : supplier.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>

                      {openDropdown === supplier.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                navigate(`/suppliers/view-supplier/${supplier.id}`);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                navigate(`/suppliers/edit-supplier/${supplier.id}`);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Edit className="w-4 h-4" />
                              Edit Supplier
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                setDeleteModalOpen(supplier.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing 1 to {suppliers.length} of 89 results
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">‹</button>
            <button className="px-3 py-1.5 text-sm bg-[#15aaad] text-white rounded-lg">1</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">2</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">3</button>
            <span className="px-2 text-gray-600">...</span>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">18</button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">›</button>
          </div>
        </div>
      </div>

      {/* Delete Supplier Modal */}
      <DeleteSupplierModal
        isOpen={deleteModalOpen !== null}
        onClose={() => setDeleteModalOpen(null)}
        supplierName={getSupplierById(deleteModalOpen)?.name || ''}
        onConfirm={() => handleDelete(deleteModalOpen)}
      />

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        type="suppliers"
        onUploadComplete={handleCSVUpload}
      />

      {/* CSV Review Modal */}
      <CSVReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        data={importedData}
        type="suppliers"
        onConfirmImport={handleConfirmImport}
      />
    </div>
  );
}
