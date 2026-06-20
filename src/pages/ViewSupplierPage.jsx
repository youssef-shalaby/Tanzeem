import {
  ArrowLeft,
  MapPin,
  Globe,
  PhoneCall,
  Edit,
  Trash2,
  AlertCircle,
  Copy,
  Check,
  User,
  FileText,
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';

import { useNavigate, useParams, Link } from 'react-router-dom';
import { Children, createElement, isValidElement, useState, useEffect } from 'react';
import { DeleteSupplierModal } from '../ui/DeleteSupplierModal';
import { ToneIcon } from '../components/ToneIcon';
import { PageLoadingState } from '../components/LoadingStates';
import { formatAppDate } from '../utils/dateTime';

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
  .db-danger-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(220,38,38,.18);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #dc2626; cursor: pointer; transition: background .15s, border-color .15s;
  }
  .db-danger-btn:hover { background: #fef2f2; border-color: rgba(220,38,38,.28); }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .supplier-details-card {
    padding: 4px 0;
  }
  .supplier-detail-group {
    padding: 18px 20px;
    border-top: 1px solid var(--app-line);
  }
  .supplier-detail-group:first-child { border-top: 0; }
  .supplier-detail-group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    color: var(--app-ink);
    font-size: 13px;
    font-weight: 650;
  }
  .supplier-detail-grid {
    display: grid;
    border: 1px solid var(--app-line);
    border-radius: 12px;
    background: var(--app-soft);
    overflow: hidden;
  }
  .supplier-detail-tile {
    min-width: 0;
    display: grid;
    grid-template-columns: minmax(130px, 210px) minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-top: 1px solid var(--app-line);
  }
  .supplier-detail-tile:first-child {
    border-top: 0;
  }
  .supplier-detail-label {
    color: var(--app-subtle);
    font-size: 12px;
    font-weight: 600;
  }
  .supplier-detail-value {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    color: var(--app-ink);
    font-size: 13px;
    font-weight: 500;
    margin-top: 0;
  }
  .supplier-detail-value.is-multiline { align-items: flex-start; line-height: 1.6; white-space: pre-line; }
  .supplier-detail-value a {
    min-width: 0;
    color: var(--app-green);
    text-decoration: none;
  }
  .supplier-detail-value a:hover { text-decoration: underline; }
  .supplier-copy-btn {
    opacity: 0;
    transform: translateX(-2px);
    transition: opacity .15s, transform .15s, background .15s, color .15s;
  }
  .supplier-detail-tile:hover .supplier-copy-btn,
  .supplier-detail-tile:focus-within .supplier-copy-btn {
    opacity: 1;
    transform: translateX(0);
  }
  .supplier-empty-line {
    color: var(--app-subtle);
    font-size: 13px;
  }
  .supplier-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 18px;
  }
  .supplier-stat-body {
    min-height: 118px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }
  .supplier-stat-main {
    min-width: 0;
  }
  .supplier-stat-value {
    color: var(--app-ink);
    font-size: 26px;
    font-weight: 650;
    line-height: 1.05;
  }
  .supplier-stat-value.is-serif {
    font-family: 'DM Serif Display', serif;
    font-weight: 500;
    font-size: 30px;
  }
  .supplier-stat-sub {
    color: var(--app-muted);
    font-size: 13px;
    line-height: 1.4;
    margin-top: 5px;
  }
  .supplier-stat-progress {
    width: 132px;
    height: 5px;
    margin-top: 10px;
    border-radius: 999px;
    background: #e5e7eb;
    overflow: hidden;
  }
  .supplier-stat-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: #f3b300;
  }
  .supplier-activity-list {
    display: grid;
    padding: 6px 20px;
  }
  .supplier-activity-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid var(--app-line);
    padding: 12px 0;
    color: inherit;
    text-decoration: none;
  }
  .supplier-activity-item:first-child { border-top: 0; }
  .supplier-activity-item:hover .supplier-activity-title { color: var(--app-green); }
  .supplier-activity-title {
    color: var(--app-ink);
    font-size: 13px;
    font-weight: 650;
  }
  .supplier-activity-copy {
    color: var(--app-subtle);
    font-size: 12px;
    margin-top: 2px;
  }
  .supplier-activity-meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex-shrink: 0;
    color: var(--app-subtle);
    font-size: 12px;
  }
  .supplier-activity-empty {
    color: var(--app-subtle);
    font-size: 13px;
    padding: 16px 20px 20px;
  }
  @media (max-width: 760px) {
    .supplier-stat-grid { grid-template-columns: 1fr; }
    .supplier-detail-tile { grid-template-columns: 1fr; gap: 5px; }
    .supplier-activity-item { align-items: flex-start; flex-direction: column; }
    .supplier-activity-meta { justify-content: flex-start; }
    .supplier-copy-btn { opacity: 1; transform: none; }
  }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

// ------- Helper Functions -------
function mapStatus(supplierStatus) {
  return supplierStatus === 1 ? 'Active' : 'Inactive';
}

function getOnTimePercentage(value) {
  if (value === null || value === undefined || value === '') return null;
  const percentage = Number(value);
  return Number.isFinite(percentage) ? Math.round(percentage) : null;
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
  return map[badge] || badge || 'Not rated';
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

function isPlaceholderValue(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return !normalized || normalized === 'n/a' || normalized === 'na' || normalized === 'none' || normalized === 'null';
}

function normalizeOptionalText(value) {
  return isPlaceholderValue(value) ? '' : String(value).trim();
}

function formatTel(phone) {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`;
}

function getListFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

function getOrderId(order) {
  return order?.id ?? order?.orderId ?? order?.orderID;
}

function orderMatchesSupplier(order, supplier) {
  if (!order || !supplier) return false;
  const orderSupplierId = order.supplierId ?? order.SupplierId;
  if (orderSupplierId && supplier.id) return String(orderSupplierId) === String(supplier.id);
  const orderSupplierName = normalizeOptionalText(order.supplierName ?? order.SupplierName).toLowerCase();
  return !!orderSupplierName && orderSupplierName === supplier.name.toLowerCase();
}

function issueMatchesSupplier(issue, supplier) {
  if (!issue || !supplier) return false;
  const issueSupplierId = issue.supplierId ?? issue.SupplierId;
  if (issueSupplierId && supplier.id) return String(issueSupplierId) === String(supplier.id);
  const issueSupplierName = normalizeOptionalText(issue.supplierName ?? issue.SupplierName).toLowerCase();
  return !!issueSupplierName && issueSupplierName === supplier.name.toLowerCase();
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
      className="supplier-copy-btn p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0"
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-green-500" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function DetailTile({ label, value, href, copyValue, multiline = false }) {
  if (!value) return null;

  return (
    <div className="supplier-detail-tile">
      <div className="supplier-detail-label">{label}</div>
      <div className={`supplier-detail-value ${multiline ? 'is-multiline' : ''}`}>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="truncate">
            {value}
          </a>
        ) : multiline ? (
          <span>{value}</span>
        ) : (
          <span className="truncate">{value}</span>
        )}
        {copyValue && <CopyButton value={copyValue} />}
      </div>
    </div>
  );
}

function DetailGroup({ icon, title, children, emptyText }) {
  const items = Children.toArray(children).filter((child) => {
    if (!isValidElement(child)) return Boolean(child);
    return !isPlaceholderValue(child.props.value);
  });
  const hasItems = items.length > 0;

  return (
    <section className="supplier-detail-group">
      <div className="supplier-detail-group-title">
        {createElement(icon, { className: "w-4 h-4 text-[var(--app-green)]" })}
        {title}
      </div>
      {hasItems ? (
        <div className="supplier-detail-grid">{items}</div>
      ) : (
        <div className="supplier-empty-line">{emptyText}</div>
      )}
    </section>
  );
}

function SupplierStatCard({ title, value, sub, icon, tone, serif = false, progress }) {
  return (
    <div className="db-card">
      <div className="db-card-header">
        <span className="db-card-title">{title}</span>
      </div>
      <div className="supplier-stat-body">
        <div className="supplier-stat-main">
          <div className={`supplier-stat-value ${serif ? 'is-serif' : ''}`}>{value}</div>
          {progress !== undefined && (
            <div className="supplier-stat-progress" aria-hidden="true">
              <div
                className="supplier-stat-progress-fill"
                style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
              />
            </div>
          )}
          {sub && <div className="supplier-stat-sub">{sub}</div>}
        </div>
        <ToneIcon icon={icon} tone={tone} size="md" iconClassName="w-5 h-5" />
      </div>
    </div>
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
  const [relatedOrders, setRelatedOrders] = useState([]);
  const [relatedIssues, setRelatedIssues] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

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
          name: data.supplierName || 'Unnamed supplier',
          contactPerson: normalizeOptionalText(data.contactPersonName),
          email: normalizeOptionalText(data.email),
          phone: normalizeOptionalText(data.phoneNumberOne),
          alternativePhone: normalizeOptionalText(data.phoneNumberTwo),
          address: normalizeOptionalText(data.street),
          city: normalizeOptionalText(data.city),
          country: normalizeOptionalText(data.country),
          website: normalizeOptionalText(data.websiteURL),
          taxId: normalizeOptionalText(data.tax_Id),
          notes: normalizeOptionalText(data.notes),
          status: mapStatus(data.supplierStatus),
          badge: data.badge || '',
          onTimePercentage: getOnTimePercentage(data.onTimePercentage),
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

  useEffect(() => {
    if (!supplier) return;

    let isCancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!isCancelled) setRelatedLoading(true);
    }, 0);

    Promise.allSettled([
      fetch('/api/Order?page=1&page_size=100', {
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      }).then((res) => (res.ok ? res.json() : null)),
      fetch('/api/DeliveryIssues?page=1&page_size=100', {
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      }).then((res) => (res.ok ? res.json() : null)),
    ])
      .then(([ordersResult, issuesResult]) => {
        if (isCancelled) return;

        const orders = ordersResult.status === 'fulfilled'
          ? getListFromResponse(ordersResult.value).filter((order) => orderMatchesSupplier(order, supplier)).slice(0, 3)
          : [];
        const issues = issuesResult.status === 'fulfilled'
          ? getListFromResponse(issuesResult.value).filter((issue) => issueMatchesSupplier(issue, supplier)).slice(0, 3)
          : [];

        setRelatedOrders(orders);
        setRelatedIssues(issues);
      })
      .finally(() => {
        if (!isCancelled) setRelatedLoading(false);
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [supplier]);

  const handleDelete = () => {
    setDeleteModalOpen(false);
    navigate('/suppliers');
  };

  const formatWebsite = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
  };

  if (loading) return (
    <PageLoadingState
      className="view-supplier-root"
      title="Loading supplier"
      detail="Fetching supplier contact details, performance, and recent activity."
      variant="detail"
    />
  );
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
  const headerMeta = [
    supplier.contactPerson ? `Contact: ${supplier.contactPerson}` : null,
    [supplier.city, supplier.country].filter(Boolean).join(', '),
  ].filter(Boolean);

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
            <p className="app-page-subtitle">
              {headerMeta.length > 0 ? headerMeta.join(' | ') : 'Supplier profile'}
            </p>
          </div>
        </div>

        <div className="app-page-actions">
          {supplier.phone && (
            <a className="db-secondary-btn" href={formatTel(supplier.phone)}>
              <PhoneCall className="w-[18px] h-[18px]" />
              Call Supplier
            </a>
          )}
          <Link
            to={`/suppliers/edit-supplier/${supplier.id}`}
            className="db-secondary-btn"
          >
            <Edit className="w-[18px] h-[18px]" />
            Edit Supplier
          </Link>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="db-danger-btn"
          >
            <Trash2 className="w-[18px] h-[18px]" />
            Delete
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="space-y-6">
        <div className="supplier-stat-grid">
          <SupplierStatCard
            title="On-Time Delivery"
            value={supplier.onTimePercentage === null ? 'Not available' : `${supplier.onTimePercentage}%`}
            icon={TrendingUp}
            tone={supplier.onTimePercentage === null || supplier.onTimePercentage >= 75 ? 'amber' : 'red'}
            serif={supplier.onTimePercentage !== null}
            progress={supplier.onTimePercentage ?? 0}
          />
          <SupplierStatCard
            title="Lead Time"
            value={supplier.leadTime ?? 'Not available'}
            sub={supplier.leadTime ? 'days average' : ''}
            icon={Clock}
            tone="amber"
            serif={!!supplier.leadTime}
          />
          <SupplierStatCard
            title="Supplier Badge"
            value={mapBadgeLabel(supplier.badge)}
            sub="Performance rating"
            icon={Award}
            tone="blue"
          />
        </div>

        {/* Supplier Details */}
        <div className="space-y-6">
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Supplier Details</span>
            </div>
            <div className="supplier-details-card">
              <DetailGroup icon={User} title="Contact" emptyText="No contact details added.">
                <DetailTile label="Contact person" value={supplier.contactPerson} />
                <DetailTile label="Email" value={supplier.email} copyValue={supplier.email} />
                <DetailTile label="Phone" value={supplier.phone} copyValue={supplier.phone} />
                <DetailTile label="Alternative phone" value={supplier.alternativePhone} copyValue={supplier.alternativePhone} />
              </DetailGroup>

              <DetailGroup icon={MapPin} title="Location" emptyText="No location details added.">
                <DetailTile label="Address" value={supplier.address} copyValue={supplier.address} />
                <DetailTile label="City" value={supplier.city} />
                <DetailTile label="Country" value={supplier.country} />
                <DetailTile label="Full address" value={addressLine} copyValue={addressLine} />
              </DetailGroup>

              <DetailGroup icon={Globe} title="Business" emptyText="No business identifiers added.">
                <DetailTile label="Website" value={supplier.website} href={supplier.website ? formatWebsite(supplier.website) : ''} />
                <DetailTile label="Tax ID / VAT" value={supplier.taxId} copyValue={supplier.taxId} />
              </DetailGroup>

              <DetailGroup icon={FileText} title="Notes" emptyText="No supplier notes added.">
                <DetailTile label="Supplier notes" value={supplier.notes} multiline />
              </DetailGroup>
            </div>
          </div>

          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Recent Activity</span>
            </div>
            {relatedLoading ? (
              <div className="supplier-activity-list">
                {[1, 2, 3].map((item) => (
                  <div className="db-skeleton h-14" key={item} />
                ))}
              </div>
            ) : relatedOrders.length === 0 && relatedIssues.length === 0 ? (
              <div className="supplier-activity-empty">No recent orders or delivery issues found for this supplier.</div>
            ) : (
              <div className="supplier-activity-list">
                {relatedOrders.map((order) => {
                  const orderId = getOrderId(order);
                  const orderDate = order.orderDate ?? order.createdAt ?? order.date;
                  return (
                    <Link to={`/orders/${orderId}`} className="supplier-activity-item" key={`order-${orderId}`}>
                      <div>
                        <div className="supplier-activity-title">{order.stringId || `Order ${orderId}`}</div>
                        <div className="supplier-activity-copy">Purchase order</div>
                      </div>
                      <div className="supplier-activity-meta">
                        <span>{orderDate ? formatAppDate(orderDate, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}</span>
                        <span className="db-stat-pill pill-blue">Order</span>
                      </div>
                    </Link>
                  );
                })}
                {relatedIssues.map((issue) => (
                  <Link to={`/delivery-issues/${issue.id}`} className="supplier-activity-item" key={`issue-${issue.id}`}>
                    <div>
                      <div className="supplier-activity-title">{issue.stringId || `Issue ${issue.id}`}</div>
                      <div className="supplier-activity-copy">Delivery issue</div>
                    </div>
                    <div className="supplier-activity-meta">
                      <span>{issue.recievedDate ? formatAppDate(issue.recievedDate, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}</span>
                      <span className="db-stat-pill pill-red">Issue</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
