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

// ============================
// Design system styles (green accent)
// ============================
const VIEW_SUPPLIER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .view-supplier-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
  .pill-amber { background: #fef3c7; color: #8b5e00; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .supplier-detail-stack { overflow: hidden; }
  .supplier-detail-item {
    border-top: 1px solid var(--app-line);
  }
  .supplier-detail-item:first-child { border-top: 0; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

// ------- Helper Functions -------
function mapStatus(supplierStatus) {
  return supplierStatus === 1 ? 'Active' : 'Inactive';
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
    case 'Top Performer':   return 'pill-green';
    case 'Reliable Partner': return 'pill-blue';
    case 'Standard':
    case 'Average':          return 'pill-amber';
    case 'At Risk':          return 'pill-red';
    default:                 return 'bg-gray-100 text-gray-600';
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

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
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
    let isCancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!isCancelled) setLoading(true);
    }, 0);

    fetch(`/api/Supplier/${supplierId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch supplier');
        return res.json();
      })
      .then((data) => {
        if (isCancelled) return;
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
          status: mapStatus(data.supplierStatus),
          badge: data.badge || '',
          onTimePercentage: Math.round(data.onTimePercentage ?? 0),
          leadTime: data.leadTime != null ? Number(data.leadTime).toFixed(1) : null,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [supplierId]);

  const handleDelete = () => {
    setDeleteModalOpen(false);
    navigate('/suppliers');
  };

  const formatWebsite = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  if (loading) return <div className="view-supplier-root p-6 text-gray-500 text-sm">Loading supplier...</div>;
  if (error)   return <div className="view-supplier-root p-6 text-red-600 text-sm">Error: {error}</div>;

  if (!supplier) {
    return (
      <div className="view-supplier-root flex flex-col items-center justify-center h-96">
        <style>{VIEW_SUPPLIER_STYLES}</style>
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-600 mb-6">The supplier you're looking for doesn't exist.</p>
        <Link to="/suppliers" className="db-primary-btn">Back to Suppliers</Link>
      </div>
    );
  }

  const addressLine = [supplier.address, supplier.city, supplier.country].filter(Boolean).join(', ');

  return (
    <div className="view-supplier-root space-y-6">
      <style>{VIEW_SUPPLIER_STYLES}</style>

      {/* HEADER */}
      <div className="app-page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/suppliers')} className="db-icon-btn" aria-label="Back to suppliers">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="app-page-heading">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="app-page-title">{supplier.name}</h1>
              <span className={`db-stat-pill ${supplier.status === 'Active' ? 'pill-green' : 'bg-gray-100 text-gray-500'}`}>
                {supplier.status}
              </span>
              {supplier.badge && (
                <span className={`db-stat-pill ${getBadgeStyle(supplier.badge)}`}>
                  <Award className="w-3.5 h-3.5 inline mr-1" />
                  {mapBadgeLabel(supplier.badge)}
                </span>
              )}
            </div>
            <p className="app-page-subtitle">Supplier details.</p>
          </div>
        </div>

        <div className="app-page-actions">
          <Link
            to={`/suppliers/edit-supplier/${supplier.id}`}
            className="db-secondary-btn"
          >
            <Edit className="w-[18px] h-[18px]" />
            Edit Supplier
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-full hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-[18px] h-[18px]" />
            Delete
          </button>
        </div>
      </div>

      {/* PERFORMANCE STATS (dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">On-Time Delivery</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{supplier.onTimePercentage}%</div>
              <div className="w-32 mt-2 bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    supplier.onTimePercentage >= 90 ? 'bg-green-500' :
                    supplier.onTimePercentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(supplier.onTimePercentage, 100)}%` }}
                />
              </div>
            </div>
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
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Lead Time</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">{supplier.leadTime ?? '—'}</div>
              <div className="text-xs text-gray-500 mt-1">days average</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Supplier Badge</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold text-gray-900">{mapBadgeLabel(supplier.badge)}</div>
              <div className="text-xs text-gray-500 mt-1">Performance rating</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — Contact Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Contact Information</span>
            </div>
            <div className="supplier-detail-stack">
              {supplier.email && (
                <div className="supplier-detail-item flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#0f8c5a]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-[#0f8c5a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Email</div>
                    <a href={`mailto:${supplier.email}`} className="text-sm text-[#0f8c5a] hover:underline truncate block">
                      {supplier.email}
                    </a>
                  </div>
                  <CopyButton value={supplier.email} />
                </div>
              )}

              {supplier.phone && (
                <div className="supplier-detail-item flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#0f8c5a]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-[#0f8c5a]" />
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
                <div className="supplier-detail-item flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#0f8c5a]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-[#0f8c5a]" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-0.5">Address</div>
                    <div className="text-sm text-gray-900">{addressLine}</div>
                  </div>
                  <CopyButton value={addressLine} />
                </div>
              )}

              {supplier.website && (
                <div className="supplier-detail-item flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-lg bg-[#0f8c5a]/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-4 h-4 text-[#0f8c5a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">Website</div>
                    <a
                      href={formatWebsite(supplier.website)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[#0f8c5a] hover:underline truncate block"
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
            <div className="db-card">
              <div className="db-card-header">
                <span className="db-card-title">Notes</span>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{supplier.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT — Business Details & Quick Actions */}
        <div className="space-y-6">
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Business Details</span>
            </div>
            <div className="supplier-detail-stack">
              {supplier.contactPerson && (
                <div className="supplier-detail-item flex items-center gap-3 px-6 py-4">
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
                <div className="supplier-detail-item flex items-center gap-3 px-6 py-4">
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
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Quick Actions</span>
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
