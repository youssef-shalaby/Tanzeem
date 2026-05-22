import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit,
  Trash2,
  AlertCircle,
  Copy,
  Check,
  User,
  Hash,
} from 'lucide-react';

import { useNavigate, useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { DeleteSupplierModal } from '../ui/DeleteSupplierModal';

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
      title="Copy to clipboard"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5" />
      }
    </button>
  );
}

export function ViewSupplierPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    fetch(`/api/Supplier/${supplierId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch supplier');
        return res.json();
      })
      .then((data) => {
        setSupplier({
          id: data.id,
          name: data.supplierName || 'N/A',
          contactPerson: data.contactPersonName || '',
          email: data.email || '',
          phone: data.phoneNumberOne || '',
          alternativePhone: data.phoneNumberTwo || '',
          address: data.street || '',
          city: data.city || '',
          country: data.country || '',
          website: data.websiteURL || '',
          taxId: data.tax_Id || '',
          notes: data.notes || '',
          status: data.supplierStatus === 1 ? 'Active' : 'Inactive',
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [supplierId]);

  const handleDelete = () => {
    setDeleteModalOpen(false);
    navigate('/suppliers');
  };

  const formatWebsite = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  const addressLine = [supplier?.address, supplier?.city, supplier?.country]
    .filter(Boolean)
    .join(', ');

  if (loading) return <div className="p-6 text-gray-500">Loading supplier...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-600 mb-6">The supplier you're looking for doesn't exist.</p>
        <Link to="/suppliers" className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
          Back to Suppliers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/suppliers')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">{supplier.name}</h1>
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                supplier.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {supplier.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Supplier Details</p>
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

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Contact Information (wider) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Contact Information</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Email */}
              {supplier.email && (
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#15aaad]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Email</div>
                    <a href={`mailto:${supplier.email}`} className="text-sm text-[#15aaad] hover:underline truncate block">
                      {supplier.email}
                    </a>
                  </div>
                  <CopyButton value={supplier.email} />
                </div>
              )}

              {/* Phone */}
              {supplier.phone && (
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#15aaad]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                    <div className="text-sm text-gray-900">{supplier.phone}</div>
                    {supplier.alternativePhone && (
                      <div className="text-sm text-gray-500 mt-0.5">{supplier.alternativePhone} <span className="text-xs">(Alt)</span></div>
                    )}
                  </div>
                  <CopyButton value={supplier.alternativePhone ? `${supplier.phone}, ${supplier.alternativePhone}` : supplier.phone} />
                </div>
              )}

              {/* Address */}
              {addressLine && (
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#15aaad]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">Address</div>
                    <div className="text-sm text-gray-900">{addressLine}</div>
                  </div>
                  <CopyButton value={addressLine} />
                </div>
              )}

              {/* Website */}
              {supplier.website && (
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-[#15aaad]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Website</div>
                    <a
                      href={formatWebsite(supplier.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#15aaad] hover:underline truncate block"
                    >
                      {supplier.website}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {supplier.notes && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-900">Notes</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{supplier.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Business Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Business Details</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Contact Person */}
              {supplier.contactPerson && (
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Contact Person</div>
                    <div className="text-sm font-medium text-gray-900 truncate">{supplier.contactPerson}</div>
                  </div>
                </div>
              )}

              {/* Tax ID */}
              {supplier.taxId && (
                <div className="flex items-center gap-3 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Hash className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Tax ID / VAT</div>
                    <div className="text-sm font-medium text-gray-900 truncate">{supplier.taxId}</div>
                  </div>
                  <CopyButton value={supplier.taxId} />
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-4 space-y-2">
              {supplier.email && (
                <a
                  href={`mailto:${supplier.email}`}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Mail className="w-4 h-4 text-gray-400" />
                  Send Email
                </a>
              )}
              {supplier.website && (
                <a
                  href={formatWebsite(supplier.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                  Visit Website
                </a>
              )}
              <Link
                to={`/suppliers/edit-supplier/${supplier.id}`}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-400" />
                Edit Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteSupplierModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        supplierId={supplier.id}
        supplierName={supplier.name}
        onConfirm={handleDelete}
      />
    </div>
  );
}