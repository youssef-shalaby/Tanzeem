import { useState, useEffect } from 'react';
import { Plus, Download, Upload, List, Package, ShoppingCart, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const INV_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .inv-root { font-family: 'DM Sans', sans-serif; }
  .inv-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .inv-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); display:flex; align-items:center; justify-content:space-between; }
  .inv-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .inv-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .inv-skeleton { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%); background-size:200% 100%; animation: inv-shimmer 1.4s infinite; border-radius:10px; }
  @keyframes inv-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .inv-fade-in { animation: invFadeIn .4s ease both; }
  @keyframes invFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .inv-table th { font-size:11px; font-weight:500; color:#888; text-transform:uppercase; letter-spacing:.5px; padding:10px 20px; text-align:left; }
  .inv-table td { padding:13px 20px; font-size:13px; color:#1a1a18; border-top:1px solid rgba(0,0,0,.05); }
  .inv-table tr:hover td { background:#f9faf7; }
  .inv-pill { display:inline-flex; align-items:center; font-size:11px; font-weight:500; padding:3px 8px; border-radius:100px; }
  .pill-green  { background:#d6f5e8; color:#0a6b45; }
  .pill-red    { background:#fde8e8; color:#9b1c1c; }
  .pill-amber  { background:#fef3c7; color:#8b5e00; }
  .pill-blue   { background:#dbeafe; color:#1e40af; }
  .inv-action-card {
    background:#fff; border-radius:16px; border:1px solid rgba(0,0,0,.07);
    padding:24px; text-decoration:none; color:inherit;
    transition: border-color .2s, box-shadow .2s;
    display:block;
  }
  .inv-action-card:hover { border-color:#0f8c5a; box-shadow:0 4px 20px rgba(15,140,90,.08); }
  .inv-icon-circle { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:16px; flex-shrink:0; }
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

const STATUS_LABEL = (s) => (s === 4 ? 'Completed' : 'Pending');
const STATUS_PILL  = (s) => (s === 4 ? 'pill-green' : 'pill-amber');

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

const ACTION_CARDS = [
  {
    to: '/add-item',
    icon: Plus,
    iconColor: '#0f8c5a',
    iconBg: 'rgba(15,140,90,.1)',
    title: 'Add New Item',
    desc: 'Register new SKUs into the system with detailed specifications and initial stock.',
  },
  {
    to: '/add-stock',
    icon: Download,
    iconColor: '#0f8c5a',
    iconBg: 'rgba(15,140,90,.1)',
    title: 'Add Stock',
    desc: 'Replenish inventory levels from suppliers. Log incoming shipments and adjust quantities.',
  },
  {
    to: '/stock-out',
    icon: Upload,
    iconColor: '#ef4444',
    iconBg: 'rgba(239,68,68,.1)',
    title: 'Stock Out',
    desc: 'Record sales, internal usage, or damaged goods. Deduct items from current inventory.',
  },
  {
    to: '/products',
    icon: List,
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
        setTransactions(sorted);
        setProducts(Array.isArray(prodData) ? prodData : []);
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
  const pendingCount      = transactions.filter(t => t.status !== 4).length;
  const recentTransactions = transactions.slice(0, 5);

  const stats = [
    {
      title: 'Total SKUs',
      value: loading ? null : totalSKUs.toLocaleString(),
      sub: 'Active products',
      subColor: '#888',
      icon: Package,
      iconColor: '#15aaad',
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
      title: 'Pending Transactions',
      value: loading ? null : pendingCount,
      sub: pendingCount > 0 ? 'To be processed' : 'All up to date',
      subColor: pendingCount > 0 ? '#3b82f6' : '#0f8c5a',
      icon: ShoppingCart,
      iconColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,.1)',
    },
  ];

  return (
    <div className="inv-root space-y-6">
      <style>{INV_STYLES}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="inv-section-title">Inventory</h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="inv-card inv-fade-in"
              style={{ padding: '22px 24px', animationDelay: `${i * 0.05}s` }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 13, color: '#888', fontWeight: 400 }}>{stat.title}</span>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color={stat.iconColor} />
                </div>
              </div>
              {stat.value === null ? (
                <div className="inv-skeleton" style={{ height: 36, width: 80, marginBottom: 10 }} />
              ) : (
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 600, color: '#1a1a18', marginBottom: 6 }}>
                  {stat.value}
                </div>
              )}
              <div style={{ fontSize: 12, color: stat.subColor, fontWeight: 400 }}>{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {ACTION_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.to}
              to={card.to}
              className="inv-action-card inv-fade-in"
              style={{ animationDelay: `${0.1 + i * 0.04}s` }}
            >
              <div className="inv-icon-circle" style={{ background: card.iconBg }}>
                <Icon size={20} color={card.iconColor} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a18', marginBottom: 6 }}>{card.title}</div>
              <p style={{ fontSize: 13, color: '#666', fontWeight: 300, lineHeight: 1.55, margin: 0 }}>{card.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 16 }}>
                <span style={{ fontSize: 12, color: '#0f8c5a', fontWeight: 500 }}>Go</span>
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
            style={{ fontSize: 13, color: '#0f8c5a', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="inv-skeleton" style={{ height: 40 }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#ef4444' }}>
            Failed to load: {error}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', fontSize: 13, color: '#888' }}>
            No transactions yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="inv-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Items</th>
                  <th>Date</th>
                  <th>Status</th>
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
                    <td style={{ color: '#666' }}>{formatDate(tx.createdAt)}</td>
                    <td>
                      <span className={`inv-pill ${STATUS_PILL(tx.status)}`}>
                        {STATUS_LABEL(tx.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}