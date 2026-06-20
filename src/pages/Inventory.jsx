import { useState, useEffect } from 'react';
import { PackagePlus, PackageCheck, PackageMinus, PackageSearch, Package, ShoppingCart, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { formatAppTime, parseAppDate } from '../utils/dateTime';

const INV_STYLES = `
  .inv-action-card {
    background: var(--app-panel);
    border-radius: var(--app-radius-card);
    border: 1px solid var(--app-line);
  }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('tanzeem_auth'))?.token || null;
  } catch { return null; }
}

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const TYPE_LABEL = { 1: 'Stock In', 2: 'Stock Out' };
const TYPE_PILL  = { 1: 'pill-green', 2: 'pill-red' };

function formatDate(isoString) {
  const date = parseAppDate(isoString);
  if (!date) return '-';
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  const timeStr = formatAppTime(date, { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${diffDays} days ago, ${timeStr}`;
}

function transactionLabel(tx) {
  const items = tx.transactionItemDtos ?? [];
  if (items.length === 0) return `${tx.totalTransactedItems} items`;
  if (items.length === 1) {
    const item = items[0];
    return `${item.quantityOfTransactedItem}× ${item.product?.name ?? 'Unknown'}`;
  }
  const first = items[0];
  return `${first.quantityOfTransactedItem}× ${first.product?.name ?? 'Unknown'} +${items.length - 1} more`;
}

function shortId(tx) { return `#TRX-${tx.id}`; }

function hasBranchInventoryProduct(product) {
  return product.stock !== null && product.stock !== undefined;
}

const ACTION_CARDS = [
  {
    to: '/add-item',
    icon: PackagePlus,
    iconColor: '#0f8c5a',
    iconBg: 'rgba(15,140,90,.1)',
    title: 'Add New Item',
    desc: 'Register new SKUs into the system with detailed specifications and initial stock.',
  },
  {
    to: '/add-stock',
    icon: PackageCheck,
    iconColor: '#0f8c5a',
    iconBg: 'rgba(15,140,90,.1)',
    title: 'Add Stock',
    desc: 'Replenish inventory levels from suppliers. Log incoming shipments and adjust quantities.',
  },
  {
    to: '/stock-out',
    icon: PackageMinus,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,.1)',
    title: 'Stock Out',
    desc: 'Record sales, internal usage, or damaged goods. Deduct items from current inventory.',
  },
  {
    to: '/products',
    icon: PackageSearch,
    iconColor: '#8b5cf6',
    iconBg: 'rgba(139,92,246,.1)',
    title: 'Current Products',
    desc: 'View the complete inventory list. Filter by category, status, or supplier.',
  },
];

export function Inventory() {
  const [transactions, setTransactions] = useState([]);
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [txRes, prodRes] = await Promise.all([
          fetch('/api/Transaction/Get-Transactions', { headers: authHeaders() }),
          fetch('/api/Products/Get-Products',        { headers: authHeaders() }),
        ]);
        if (!txRes.ok)   throw new Error(`Transactions: ${txRes.status}`);
        if (!prodRes.ok) throw new Error(`Products: ${prodRes.status}`);
        const [txData, prodData] = await Promise.all([txRes.json(), prodRes.json()]);
        const sorted = [...(Array.isArray(txData) ? txData : [])].sort((a, b) => b.id - a.id);
        const branchProducts = (Array.isArray(prodData) ? prodData : []).filter(hasBranchInventoryProduct);
        setTransactions(sorted);
        setProducts(branchProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSKUs         = products.length;
  const lowStockCount     = products.filter(p => p.stock <= p.reorderLevel).length;
  const recentTransactions = transactions.slice(0, 5);

  const stats = [
    {
      title: 'Total SKUs',
      value: loading ? null : totalSKUs.toLocaleString(),
      sub: 'Active products',
      subColor: 'var(--app-subtle)',
      icon: Package,
      iconColor: '#2c5f8a',
      iconBg: 'rgba(21,170,173,.1)',
    },
    {
      title: 'Low Stock Alerts',
      value: loading ? null : lowStockCount,
      sub: lowStockCount > 0 ? 'Requires attention' : 'All stocked',
      subColor: lowStockCount > 0 ? '#f59e0b' : '#0f8c5a',
      icon: AlertTriangle,
      iconColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,.1)',
    },
    {
      title: 'Transactions',
      value: loading ? null : transactions.length,
      sub: 'Recorded movements',
      subColor: 'var(--app-subtle)',
      icon: ShoppingCart,
      iconColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,.1)',
    },
  ];

  return (
    <div className="inv-root space-y-6">
      <style>{INV_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="inv-section-title">Inventory</h1>
          <p className="app-page-subtitle">Move stock in, stock out, and review recent inventory transactions.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            sub={stat.sub}
            subColor={stat.subColor}
            icon={stat.icon}
            iconColor={stat.iconColor}
            iconBg={stat.iconBg}
            loading={stat.value === null}
            className="inv-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {ACTION_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              state={{ from: "/inventory" }}
              className="inv-action-card app-action-card inv-fade-in"
              style={{ animationDelay: `${0.1 + i * 0.04}s` }}
            >
              <div className="app-action-icon" style={{ background: card.iconBg }}>
                <Icon size={20} color={card.iconColor} />
              </div>
              <div className="app-action-title">{card.title}</div>
              <p className="app-action-copy">{card.desc}</p>
              <div className="app-action-link">
                <span>Open</span>
                <ArrowRight size={12} color="#0f8c5a" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="inv-card inv-fade-in" style={{ animationDelay: '.25s' }}>
        <div className="inv-card-header">
          <span className="inv-card-title">Recent transactions</span>
          <Link
            to="/transactions"
      style={{ fontSize: 13, color: 'var(--app-green)', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div className="app-table-frame" style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="inv-skeleton" style={{ height: 40 }} />
              ))}
            </div>
          ) : error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: 'var(--app-danger-text)', display: 'grid', placeItems: 'center' }}>
              Failed to load: {error}
            </div>
          ) : recentTransactions.length === 0 ? (
            <EmptyState
              compact
              icon={PackageCheck}
              title="Record your first stock movement"
              message="Recent stock in and stock out activity appears here once products start moving."
              actions={[
                { label: 'Add stock', icon: PackageCheck, to: '/add-stock', state: { from: '/inventory' } },
                { label: 'Stock out', icon: PackageMinus, to: '/stock-out', state: { from: '/inventory' }, variant: 'secondary' },
              ]}
            />
          ) : (
            <table className="inv-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Items</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ fontWeight: 500 }}>{shortId(tx)}</td>
                    <td>
                      <span className={`inv-pill ${TYPE_PILL[tx.type] ?? 'pill-blue'}`}>
                        {TYPE_LABEL[tx.type] ?? 'Adjustment'}
                      </span>
                    </td>
                    <td>{transactionLabel(tx)}</td>
                    <td style={{ color: 'var(--app-muted)' }}>{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
