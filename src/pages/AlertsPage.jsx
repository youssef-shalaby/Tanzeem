import {
  AlertTriangle, Clock, XCircle, Package, Info,
  Filter, Bell, ChevronRight, Skull,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// ─── Enums ────────────────────────────────────────────────────────────────────
// alert.type:     0=LowStock, 1=DeadStock, 2=Expiry, 3=?, 4=OrderPending
// alert.priority: "Critical" | "Warning" | "Info"

function getAlertMeta(alert) {
  switch (alert.type) {
    case 1: // Dead Stock
      return {
        icon: Skull,
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        category: 'dead-stock',
        action: alert.productId ? 'View Product' : null,
      };
    case 2: // Expiry
      return {
        icon: Clock,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        category: 'expiry',
        action: 'Review',
      };
    case 4: // Order Pending
      return {
        icon: Package,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        category: 'orders',
        action: 'View Order',
      };
    default: // LowStock / unknown
      return {
        icon: AlertTriangle,
        iconBg: alert.priority === 'Critical' ? 'bg-red-100' : 'bg-yellow-100',
        iconColor: alert.priority === 'Critical' ? 'text-red-600' : 'text-yellow-600',
        category: 'stock',
        action: 'Reorder Now',
      };
  }
}

function priorityFilterStyle(priority, active) {
  if (active) return 'bg-[#15aaad] text-white';
  return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
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
    setLoading(true);
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
        setAlerts(data.data || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages > 0 ? data.totalPages : 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentPage]);

  // ─── Filtering ──────────────────────────────────────────────────────────────
  const filteredAlerts = alerts.filter((alert) => {
    const meta = getAlertMeta(alert);
    const categoryMatch = selectedCategory === 'all' || meta.category === selectedCategory;
    const priorityMatch = filterPriority === 'all' ||
      alert.priority?.toLowerCase() === filterPriority.toLowerCase();
    return categoryMatch && priorityMatch;
  });

  // ─── Category counts (from current page) ────────────────────────────────────
  const countByCategory = (cat) =>
    cat === 'all' ? alerts.length : alerts.filter((a) => getAlertMeta(a).category === cat).length;

  const categories = [
    { id: 'all',       name: 'All Alerts',       icon: Bell,          color: 'text-gray-500' },
    { id: 'stock',     name: 'Stock Issues',      icon: AlertTriangle, color: 'text-red-600' },
    { id: 'expiry',    name: 'Expiry Warnings',   icon: Clock,         color: 'text-yellow-600' },
    { id: 'orders',    name: 'Order Updates',     icon: Package,       color: 'text-blue-600' },
    { id: 'dead-stock',name: 'Dead Stock',        icon: Skull,         color: 'text-orange-600' },
  ];

  // ─── Action handler ─────────────────────────────────────────────────────────
  const handleAction = (alert) => {
    const meta = getAlertMeta(alert);
    if (meta.category === 'orders') {
      // Extract order number from description e.g. "Order #25 is waiting..."
      const match = alert.alertDescription?.match(/#(\d+)/);
      if (match) navigate(`/orders/${match[1]}`);
    } else if (meta.category === 'dead-stock' && alert.productId) {
      navigate(`/products/${alert.productId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alerts & Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            {totalCount > 0 ? `${totalCount} active alerts across all categories` : 'No active alerts'}
          </p>
        </div>
      </div>

      {/* Stats from mini_Alert_dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Critical</div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {dashboard?.criticalCount ?? '—'}
          </div>
          <div className="text-xs text-red-600 font-medium">Requires immediate action</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Warnings</div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {dashboard?.warningCount ?? '—'}
          </div>
          <div className="text-xs text-yellow-600 font-medium">Review soon</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Dead Stock</div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Skull className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {dashboard?.deadCount ?? '—'}
          </div>
          <div className="text-xs text-orange-600 font-medium">No movement detected</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Info</div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {dashboard?.infoCount ?? '—'}
          </div>
          <div className="text-xs text-blue-600 font-medium">Updates available</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Sidebar — Categories */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">Categories</h3>
            <div className="space-y-1">
              {categories.map(({ id, name, icon: Icon, color }) => {
                const isActive = selectedCategory === id;
                const count = countByCategory(id);
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedCategory(id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive ? 'bg-[#15aaad]/10 text-[#15aaad]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#15aaad]' : color}`} />
                      <span className="font-medium">{name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#15aaad] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right — Alert List */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl border border-gray-200">

            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Priority:</span>
                <div className="flex gap-2">
                  {['all', 'Critical', 'Warning', 'Info'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        filterPriority === p
                          ? 'bg-[#15aaad] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {p === 'all' ? 'All' : p}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{filteredAlerts.length} alerts</span>
            </div>

            {/* Alerts List */}
            {loading ? (
              <div className="p-10 text-center text-sm text-gray-500">Loading alerts...</div>
            ) : filteredAlerts.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">No alerts in this category.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAlerts.map((alert, idx) => {
                  const meta = getAlertMeta(alert);
                  const Icon = meta.icon;

                  return (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${meta.iconBg}`}>
                          <Icon className={`w-5 h-5 ${meta.iconColor}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-sm">{alert.alertTitle}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                alert.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                alert.priority === 'Warning'  ? 'bg-yellow-100 text-yellow-700' :
                                'bg-blue-100 text-blue-700'
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
                              className="flex items-center gap-1 px-3 py-1.5 text-[#15aaad] text-xs font-medium hover:bg-[#15aaad]/5 rounded-md transition-colors"
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
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} — {totalCount} total alerts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                  >‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg ${
                        currentPage === page ? 'bg-[#15aaad] text-white' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >{page}</button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                  >›</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}