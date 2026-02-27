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
    'Received from Supplier': 'bg-green-100 text-green-700',
    'Customer Return': 'bg-blue-100 text-blue-700',
    'Production': 'bg-purple-100 text-purple-700',
    'Found/Recovered': 'bg-orange-100 text-orange-700',
    'Transfer from Other Location': 'bg-indigo-100 text-indigo-700',
    'Inventory Adjustment': 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/add-stock"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Add Stock Logs</h1>
            <p className="text-sm text-gray-600 mt-1">Complete history of all stock additions</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
          <Download className="w-[18px] h-[18px]" />
          Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
          <div className="text-2xl font-semibold text-gray-900">328</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Items Added</div>
          <div className="text-2xl font-semibold text-gray-900">2,456</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-semibold text-gray-900">$89,342</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-2xl font-semibold text-gray-900">127</div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name, SKU, or log ID..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-[18px] h-[18px] text-gray-600" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
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
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sourceColors[log.source] || 'bg-gray-100 text-gray-700'}`}>
                      {log.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.addedBy}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${log.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/stock-logs/${log.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
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
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-3 py-2 bg-[#15aaad] text-white text-sm rounded-lg">1</button>
            <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">2</button>
            <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">3</button>
            <span className="px-2 text-gray-600">...</span>
            <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">41</button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}