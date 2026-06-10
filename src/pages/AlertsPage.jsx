import {
  AlertTriangle, Clock, XCircle, Package, Info,
  Bell, ChevronRight, Skull,
} from 'lucide-react';
import { createElement, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { StatCard } from '../components/StatCard';
import { ToneIcon } from '../components/ToneIcon';

// ============================
// Design system styles (green accent)
// ============================
const ALERTS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .alerts-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
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
  .alerts-feed { overflow: hidden; }
  .alerts-feed-item {
    border-top: 1px solid var(--app-line);
    transition: background .15s;
  }
  .alerts-feed-item:first-child { border-top: 0; }
  .alerts-feed-item:hover { background: var(--app-soft); }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-skeleton { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:10px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

// ─── Enums ────────────────────────────────────────────────────────────────────
function getAlertMeta(alert) {
  switch (alert.type) {
    case 1: // Dead Stock
      return {
        icon: Skull,
        tone: 'amber',
        category: 'dead-stock',
        action: alert.productId ? 'View Product' : null,
      };
    case 2: // Expiry
      return {
        icon: Clock,
        tone: 'amber',
        category: 'expiry',
        action: 'Review',
      };
    case 4: // Order Pending
      return {
        icon: Package,
        tone: 'blue',
        category: 'orders',
        action: 'View Order',
      };
    default: // LowStock / unknown
      return {
        icon: AlertTriangle,
        tone: alert.priority === 'Critical' ? 'red' : 'amber',
        category: 'stock',
        action: 'Reorder Now',
      };
  }
}

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

export function AlertsPage() {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const itemsPerPage = 15;

  // Fetch dashboard counts
  useEffect(() => {
    fetch('/api/Alert/mini_Alert_dashboard', {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setDashboard(data); })
      .catch(() => {});
  }, []);

  // Fetch alerts list
  useEffect(() => {
    let isCancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!isCancelled) setLoading(true);
    }, 0);
    const params = new URLSearchParams({
      Page: currentPage,
      Page_Size: itemsPerPage,
    });

    fetch(`/api/Alert?${params}`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to fetch alerts');
        return r.json();
      })
      .then((data) => {
        if (isCancelled) return;
        setAlerts(data.data || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages > 0 ? data.totalPages : 1);
        setLoading(false);
      })
      .catch(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [currentPage]);

  // Filtering
  const filteredAlerts = alerts.filter((alert) => {
    const meta = getAlertMeta(alert);
    const categoryMatch = selectedCategory === 'all' || meta.category === selectedCategory;
    const priorityMatch = filterPriority === 'all' ||
      alert.priority?.toLowerCase() === filterPriority.toLowerCase();
    return categoryMatch && priorityMatch;
  });

  // Category counts (from current page)
  const countByCategory = (cat) =>
    cat === 'all' ? alerts.length : alerts.filter((a) => getAlertMeta(a).category === cat).length;

  const categories = [
    { id: 'all',       name: 'All Alerts',       icon: Bell,          color: 'text-gray-500' },
    { id: 'stock',     name: 'Stock Issues',      icon: AlertTriangle, color: 'text-red-600' },
    { id: 'expiry',    name: 'Expiry Warnings',   icon: Clock,         color: 'text-yellow-600' },
    { id: 'orders',    name: 'Order Updates',     icon: Package,       color: 'text-blue-600' },
    { id: 'dead-stock',name: 'Dead Stock',        icon: Skull,         color: 'text-orange-600' },
  ];

  // Action handler
  const handleAction = (alert) => {
    const meta = getAlertMeta(alert);
    if (meta.category === 'orders') {
      const match = alert.alertDescription?.match(/#(\d+)/);
      if (match) navigate(`/orders/${match[1]}`);
    } else if (meta.category === 'dead-stock' && alert.productId) {
      navigate(`/products/view-product/${alert.productId}`);
    } else if (meta.category === 'stock' && alert.productId) {
      navigate(`/products/view-product/${alert.productId}`);
    } else if (meta.category === 'expiry' && alert.productId) {
      navigate(`/products/view-product/${alert.productId}`);
    }
  };

  return (
    <div className="alerts-root space-y-6">
      <style>{ALERTS_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="db-section-title">Alerts & Notifications</h1>
          <p className="app-page-subtitle">
            {totalCount > 0 ? `${totalCount} active alerts across all categories` : 'No active alerts'}
          </p>
        </div>
      </div>

      {/* Stats Cards (from mini_Alert_dashboard) - matching Dashboard stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Critical" value={dashboard?.criticalCount ?? '—'} sub="Requires immediate action" subColor="#dc2626" icon={AlertTriangle} iconColor="#ef4444" iconBgColor="bg-red-100" className="db-fade-in" />
        <StatCard title="Warnings" value={dashboard?.warningCount ?? '—'} sub="Review soon" subColor="#d97706" icon={AlertTriangle} iconColor="#eab308" iconBgColor="bg-yellow-100" className="db-fade-in" />
        <StatCard title="Dead Stock" value={dashboard?.deadCount ?? '—'} sub="No movement detected" subColor="#ea580c" icon={Skull} iconColor="#f97316" iconBgColor="bg-orange-100" className="db-fade-in" />
        <StatCard title="Info" value={dashboard?.infoCount ?? '—'} sub="Updates available" subColor="#2563eb" icon={Info} iconColor="#3b82f6" iconBgColor="bg-blue-100" className="db-fade-in" />
      </div>

      {/* Main Content (Category Sidebar + Alert List) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar — Categories */}
        <div className="col-span-3">
          <div className="db-card db-fade-in">
            <div className="db-card-header">
              <span className="db-card-title">Categories</span>
            </div>
            <div className="p-4">
              <div className="space-y-1">
                {categories.map(({ id, name, icon, color }) => {
                  const isActive = selectedCategory === id;
                  const count = countByCategory(id);
                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedCategory(id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                        isActive ? 'bg-[#0f8c5a]/10 text-[#0f8c5a]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {createElement(icon, { className: `w-[18px] h-[18px] ${isActive ? 'text-[#0f8c5a]' : color}` })}
                        <span className="font-medium">{name}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-[#0f8c5a] text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Alert List */}
        <div className="col-span-9">
          <div className="db-card db-fade-in">
            <div className="db-card-header flex items-center justify-between flex-wrap gap-3">
              <span className="db-card-title">Alert Feed</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Priority:</span>
                <div className="flex gap-2">
                  {['all', 'Critical', 'Warning', 'Info'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        filterPriority === p
                          ? 'bg-[#0f8c5a] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p === 'all' ? 'All' : p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center">
                <div className="db-skeleton h-16 mb-3" />
                <div className="db-skeleton h-16 mb-3" />
                <div className="db-skeleton h-16" />
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">No alerts in this category.</div>
            ) : (
              <div className="alerts-feed">
                {filteredAlerts.map((alert, idx) => {
                  const meta = getAlertMeta(alert);
                  const Icon = meta.icon;

                  return (
                    <div key={idx} className="alerts-feed-item p-5">
                      <div className="flex items-start gap-4">
                        <ToneIcon icon={Icon} tone={meta.tone} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-sm">{alert.alertTitle}</h3>
                              <span className={`db-stat-pill ${
                                alert.priority === 'Critical' ? 'pill-red' :
                                alert.priority === 'Warning'  ? 'pill-yellow' :
                                'pill-blue'
                              }`}>
                                {alert.priority}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{alert.alertDescription}</p>
                          <p className="text-xs text-gray-400 mb-2">{alert.alertSubTitle}</p>
                          {meta.action && (
                            <button
                              onClick={() => handleAction(alert)}
                              className="flex items-center gap-1 px-3 py-1.5 text-[#0f8c5a] text-xs font-medium hover:bg-[#0f8c5a]/5 rounded-md transition-colors"
                            >
                              {meta.action}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} — {totalCount} total alerts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="db-icon-btn disabled:opacity-40"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[#0f8c5a] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="db-icon-btn disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
