import { useState, useEffect } from 'react';
import { Plus, Download, Upload, List, Package, ShoppingCart, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('tanzeem_auth'))?.token || null;
  } catch {
    return null;
  }
}

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// type: 1 = Stock In, 2 = Stock Out
const TYPE_LABEL = { 1: 'Stock In', 2: 'Stock Out' };
const TYPE_STYLE = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-red-100 text-red-700',
};

// status: 4 = Completed, others = Pending
const STATUS_LABEL = (s) => (s === 4 ? 'Completed' : 'Pending');
const STATUS_STYLE = (s) => (s === 4 ? 'text-green-600' : 'text-orange-500');

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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
    return `${item.quantityOfTransactedItem}x ${item.product?.name ?? 'Unknown'}`;
  }
  const first = items[0];
  return `${first.quantityOfTransactedItem}x ${first.product?.name ?? 'Unknown'} +${items.length - 1} more`;
}

function shortId(tx) {
  return `#TRX-${tx.id}`;
}

export function Inventory() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [txRes, prodRes] = await Promise.all([
          fetch('/api/Transaction/Get-Transactions', { headers: authHeaders() }),
          fetch('/api/Products/Get-Products', { headers: authHeaders() }),
        ]);

        if (!txRes.ok) throw new Error(`Transactions: ${txRes.status}`);
        if (!prodRes.ok) throw new Error(`Products: ${prodRes.status}`);

        const [txData, prodData] = await Promise.all([txRes.json(), prodRes.json()]);

        // Sort transactions newest first by id
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

  // Derived stats from real data
  const totalSKUs = products.length;
  const lowStockCount = products.filter(p => p.stock <= p.reorderLevel).length;
  const pendingCount = transactions.filter(t => t.status !== 4).length;
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total SKUs</div>
            <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-[#15aaad]" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-16 bg-gray-100 rounded animate-pulse mb-2" />
          ) : (
            <div className="text-3xl font-semibold text-gray-900 mb-2">{totalSKUs.toLocaleString()}</div>
          )}
          <div className="text-sm text-gray-400">Active products</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Low Stock Alerts</div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-10 bg-gray-100 rounded animate-pulse mb-2" />
          ) : (
            <div className="text-3xl font-semibold text-gray-900 mb-2">{lowStockCount}</div>
          )}
          <div className="text-sm text-orange-600">{lowStockCount > 0 ? 'Requires attention' : 'All stocked'}</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Pending Transactions</div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-10 bg-gray-100 rounded animate-pulse mb-2" />
          ) : (
            <div className="text-3xl font-semibold text-gray-900 mb-2">{pendingCount}</div>
          )}
          <div className="text-sm text-blue-600">{pendingCount > 0 ? 'To be processed' : 'All up to date'}</div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link to="/add-item" className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-[#15aaad]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add New Item</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Register new SKUs into the system with detailed specifications and initial stock.
          </p>
        </Link>

        <Link to="/add-stock" className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Stock</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Replenish inventory levels from suppliers. Log incoming shipments and adjust quantities.
          </p>
        </Link>

        <Link to="/stock-out" className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stock Out</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Record sales, internal usage, or damaged goods. Deduct items from current inventory.
          </p>
        </Link>

        <Link to="/products" className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <List className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Products</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            View the complete inventory list. Filter by category, status, or supplier.
          </p>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          <Link to="/transactions" className="text-[#15aaad] text-sm font-medium hover:underline">View all history</Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center text-sm text-red-500">
            Failed to load: {error}
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            No transactions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Transaction ID</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Items</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{shortId(tx)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${TYPE_STYLE[tx.type] ?? 'bg-blue-100 text-blue-700'}`}>
                        {TYPE_LABEL[tx.type] ?? 'Adjustment'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">{transactionLabel(tx)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{formatDate(tx.createdAt)}</td>
                    <td className={`px-5 py-4 text-sm font-medium ${STATUS_STYLE(tx.status)}`}>
                      {STATUS_LABEL(tx.status)}
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