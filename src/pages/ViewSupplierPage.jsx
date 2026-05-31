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
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';

import { useNavigate, useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { DeleteSupplierModal } from '../ui/DeleteSupplierModal';

// ------- Enums -------
// supplierStatus: 0 = Active, 1 = Inactive
// badge: "TopPerformer" | "Standard" | "ReliablePartner" | "AtRisk" | "At Risk" | "Average"

function mapStatus(supplierStatus) {
  return supplierStatus === 0 ? 'Active' : 'Inactive';
}

function mapBadgeLabel(badge) {
  const map = {
    TopPerformer: 'Top Performer',
    ReliablePartner: 'Reliable Partner',
    AtRisk: 'At Risk',
    'At Risk': 'At Risk',
    Standard: 'Standard',
    Average: 'Average',
  };
  return map[badge] || badge || '—';
}

function getBadgeStyle(badge) {
  const label = mapBadgeLabel(badge);
  switch (label) {
    case 'Top Performer':   return 'bg-green-100 text-green-700 border-green-200';
    case 'Reliable Partner': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Standard':
    case 'Average':          return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'At Risk':          return 'bg-red-100 text-red-700 border-red-200';
    default:                 return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

// ------- CopyButton -------
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
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ------- Main Page -------
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
          // Enums
          status: mapStatus(data.supplierStatus),
          badge: data.badge || '',
          // Performance
          onTimePercentage: Math.round(data.onTimePercentage ?? 0),
          leadTime: data.leadTime != null ? Number(data.leadTime).toFixed(1) : null,
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

  if (loading) return <div className="p-6 text-gray-500 text-sm">Loading supplier...</div>;
  if (error)   return <div className="p-6 text-red-600 text-sm">Error: {error}</div>;

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

  const addressLine = [supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ');

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
                supplier.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {supplier.status}
              </span>
              {supplier.badge && (
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getBadgeStyle(supplier.badge)}`}>
                  <Award className="w-3.5 h-3.5 inline mr-1" />
                  {mapBadgeLabel(supplier.badge)}
                </span>
              )}
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

      {/* PERFORMANCE STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* On-Time Delivery */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">On-Time Delivery</div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              supplier.onTimePercentage >= 90 ? 'bg-green-100' :
              supplier.onTimePercentage >= 75 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`w-5 h-5 ${
                supplier.onTimePercentage >= 90 ? 'text-green-600' :
                supplier.onTimePercentage >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-3">{supplier.onTimePercentage}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                supplier.onTimePercentage >= 90 ? 'bg-green-500' :
                supplier.onTimePercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(supplier.onTimePercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Lead Time */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Lead Time</div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {supplier.leadTime ?? '—'}
          </div>
          <div className="text-sm text-gray-500">days average</div>
        </div>

        {/* Badge */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Supplier Badge</div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-1">{mapBadgeLabel(supplier.badge)}</div>
          <div className="text-sm text-gray-500">Performance rating</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Contact Information</h2>
            </div>

            <div className="divide-y divide-gray-100">
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

              {supplier.phone && (
                <div className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#15aaad]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">Phone</div>
                    <div className="text-sm text-gray-900">{supplier.phone}</div>
                    {supplier.alternativePhone && (
                      <div className="text-sm text-gray-500 mt-0.5">
                        {supplier.alternativePhone} <span className="text-xs">(Alt)</span>
                      </div>
                    )}
                  </div>
                  <CopyButton value={supplier.alternativePhone ? `${supplier.phone}, ${supplier.alternativePhone}` : supplier.phone} />
                </div>
              )}

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

        {/* RIGHT — Business Details & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900">Business Details</h2>
            </div>
            <div className="divide-y divide-gray-100">
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