import { Filter, Search, ArrowLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export function StockInlogs() {
  const stockLogs = [
    {
      id: 'LOG-001',
      logId: 'PO-2026-045',
      date: '01/24/2026',
      time: '09:15 AM',
      productName: 'Office Chair - Ergonomic',
      sku: 'OC-884',
      quantity: 50,
      unitPrice: 149.00,
      totalPrice: 7450.00,
      source: 'Received from Supplier',
      addedBy: 'John Admin',
    },
    {
      id: 'LOG-002',
      logId: 'PO-2026-044',
      date: '01/23/2026',
      time: '04:20 PM',
      productName: 'USB-C Cable',
      sku: 'UC-123',
      quantity: 100,
      unitPrice: 19.99,
      totalPrice: 1999.00,
      source: 'Received from Supplier',
      addedBy: 'Sarah Manager',
    },
    {
      id: 'LOG-003',
      logId: 'RTN-2026-012',
      date: '01/23/2026',
      time: '11:00 AM',
      productName: 'Laptop Charger',
      sku: 'LC-556',
      quantity: 30,
      unitPrice: 69.99,
      totalPrice: 2099.70,
      source: 'Customer Return',
      addedBy: 'Sarah Manager',
    },
    {
      id: 'LOG-004',
      logId: 'PO-2026-043',
      date: '01/22/2026',
      time: '10:30 AM',
      productName: 'Monitor Stand',
      sku: 'MS-221',
      quantity: 20,
      unitPrice: 89.90,
      totalPrice: 1798.00,
      source: 'Received from Supplier',
      addedBy: 'John Admin',
    },
    {
      id: 'LOG-005',
      logId: 'PO-2026-042',
      date: '01/21/2026',
      time: '02:15 PM',
      productName: 'Wireless Mouse',
      sku: 'WM-445',
      quantity: 75,
      unitPrice: 29.99,
      totalPrice: 2249.25,
      source: 'Received from Supplier',
      addedBy: 'John Admin',
    },
    {
      id: 'LOG-006',
      logId: 'ADJ-2026-008',
      date: '01/20/2026',
      time: '03:45 PM',
      productName: 'HDMI Cable',
      sku: 'HC-789',
      quantity: 50,
      unitPrice: 24.99,
      totalPrice: 1249.50,
      source: 'Inventory Adjustment',
      addedBy: 'Sarah Manager',
    },
    {
      id: 'LOG-007',
      logId: 'PO-2026-041',
      date: '01/19/2026',
      time: '11:20 AM',
      productName: 'Wireless Keyboard',
      sku: 'WK-332',
      quantity: 40,
      unitPrice: 49.99,
      totalPrice: 1999.60,
      source: 'Received from Supplier',
      addedBy: 'John Admin',
    },
    {
      id: 'LOG-008',
      logId: 'PO-2026-040',
      date: '01/18/2026',
      time: '09:30 AM',
      productName: 'Desk Lamp',
      sku: 'DL-667',
      quantity: 25,
      unitPrice: 44.99,
      totalPrice: 1124.75,
      source: 'Received from Supplier',
      addedBy: 'Mike Staff',
    },
  ];

  const sourceColors = {
    'Received from Supplier': 'pill-green',
    'Customer Return': 'pill-blue',
    'Production': 'pill-purple',
    'Found/Recovered': 'pill-amber',
    'Transfer from Other Location': 'pill-blue',
    'Inventory Adjustment': 'pill-yellow',
  };

  return (
    <div className="db-root db-fade-in space-y-6">
      <div className="app-page-header">
        <div className="flex items-center gap-4">
          <Link
            to="/add-stock"
            className="db-icon-btn"
            aria-label="Back to add stock"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="app-page-heading">
            <h1 className="app-page-title">Add Stock Logs</h1>
            <p className="app-page-subtitle">Complete history of all stock additions.</p>
          </div>
        </div>
        <button className="db-primary-btn">
          <Download className="w-[18px] h-[18px]" />
          Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="db-card app-stat-card">
          <div className="app-stat-label mb-2">Total Transactions</div>
          <div className="app-stat-value">328</div>
        </div>
        <div className="db-card app-stat-card">
          <div className="app-stat-label mb-2">Items Added</div>
          <div className="app-stat-value">2,456</div>
        </div>
        <div className="db-card app-stat-card">
          <div className="app-stat-label mb-2">Total Value</div>
          <div className="app-stat-value">$89,342</div>
        </div>
        <div className="db-card app-stat-card">
          <div className="app-stat-label mb-2">This Month</div>
          <div className="app-stat-value">127</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="db-card">
        <div className="db-card-header">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, SKU, or log ID..."
                className="db-search-input"
              />
            </div>
            <button className="db-secondary-btn">
              <Filter className="w-[18px] h-[18px] text-gray-600" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="db-table">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Log ID</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{log.id}</div>
                    <div className="text-xs text-gray-500">Ref: {log.logId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{log.date}</div>
                    <div className="text-xs text-gray-500">{log.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{log.productName}</div>
                    <div className="text-xs text-gray-500">SKU: {log.sku}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-green-600">+{log.quantity}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`db-stat-pill ${sourceColors[log.source] || 'pill-gray'}`}>
                      {log.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.addedBy}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${log.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/stock-logs/${log.id}`}
                      className="db-secondary-btn"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing 1 to 8 of 328 transactions
          </div>
          <div className="flex items-center gap-2">
            <button className="db-icon-btn disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="db-primary-btn min-w-9 px-3">1</button>
            <button className="db-secondary-btn min-w-9 px-3">2</button>
            <button className="db-secondary-btn min-w-9 px-3">3</button>
            <span className="px-2 text-gray-600">...</span>
            <button className="db-secondary-btn min-w-9 px-3">41</button>
            <button className="db-icon-btn">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
