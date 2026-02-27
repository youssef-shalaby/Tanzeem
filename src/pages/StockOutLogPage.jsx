import { Filter, Search, ArrowLeft, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';

export function StockOutLogPage() {
  const stockOutLogs = [
    {
      id: 1,
      date: '01/19/2026',
      time: '10:45 AM',
      productName: 'Office Chair - Ergonomic',
      sku: 'OC-884',
      quantity: 2,
      unitPrice: 149.00,
      totalPrice: 298.00,
      reason: 'Sold to Customer',
      removedBy: 'John Smith',
      notes: 'Customer order #12345'
    },
    {
      id: 2,
      date: '01/19/2026',
      time: '09:20 AM',
      productName: 'Wireless Mouse',
      sku: 'WM-002',
      quantity: 1,
      unitPrice: 19.99,
      totalPrice: 19.99,
      reason: 'Damaged',
      removedBy: 'Sarah Johnson',
      notes: 'Product damaged during storage'
    },
    {
      id: 3,
      date: '01/18/2026',
      time: '04:30 PM',
      productName: 'Laptop Stand',
      sku: 'LS-001',
      quantity: 3,
      unitPrice: 29.99,
      totalPrice: 89.97,
      reason: 'Sold to Customer',
      removedBy: 'John Smith',
      notes: ''
    },
    {
      id: 4,
      date: '01/18/2026',
      time: '02:15 PM',
      productName: 'USB-C Cable',
      sku: 'UC-003',
      quantity: 5,
      unitPrice: 12.99,
      totalPrice: 64.95,
      reason: 'Expired',
      removedBy: 'Michael Chen',
      notes: 'Warranty period ended'
    },
    {
      id: 5,
      date: '01/18/2026',
      time: '11:00 AM',
      productName: 'Monitor 24"',
      sku: 'MN-005',
      quantity: 1,
      unitPrice: 199.99,
      totalPrice: 199.99,
      reason: 'Returned to Supplier',
      removedBy: 'Sarah Johnson',
      notes: 'Defective unit - RMA #7890'
    },
    {
      id: 6,
      date: '01/17/2026',
      time: '03:45 PM',
      productName: 'HDMI Cable',
      sku: 'HC-006',
      quantity: 10,
      unitPrice: 8.99,
      totalPrice: 89.90,
      reason: 'Sold to Customer',
      removedBy: 'John Smith',
      notes: 'Bulk order'
    },
    {
      id: 7,
      date: '01/17/2026',
      time: '01:20 PM',
      productName: 'Webcam HD',
      sku: 'WC-008',
      quantity: 2,
      unitPrice: 59.99,
      totalPrice: 119.98,
      reason: 'Lost',
      removedBy: 'Michael Chen',
      notes: 'Missing from warehouse'
    },
    {
      id: 8,
      date: '01/17/2026',
      time: '10:30 AM',
      productName: 'Wireless Keyboard',
      sku: 'WK-004',
      quantity: 1,
      unitPrice: 49.99,
      totalPrice: 49.99,
      reason: 'Damaged',
      removedBy: 'Sarah Johnson',
      notes: 'Liquid damage'
    },
  ];

  const reasonColors = {
    'Sold to Customer': 'bg-green-100 text-green-700',
    'Damaged': 'bg-red-100 text-red-700',
    'Expired': 'bg-orange-100 text-orange-700',
    'Lost': 'bg-purple-100 text-purple-700',
    'Returned to Supplier': 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/stock-out"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Stock Out Log</h1>
            <p className="text-sm text-gray-600 mt-1">Complete history of all stock removals</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
          <Download className="w-[18px] h-[18px]" />
          Export Log
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Transactions</div>
          <div className="text-2xl font-semibold text-gray-900">247</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Items Removed</div>
          <div className="text-2xl font-semibold text-gray-900">1,834</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Total Value</div>
          <div className="text-2xl font-semibold text-gray-900">$45,678</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">This Month</div>
          <div className="text-2xl font-semibold text-gray-900">89</div>
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
                placeholder="Search by product name, SKU, or removed by..."
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
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Removed By</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockOutLogs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{log.date}</div>
                    <div className="text-xs text-gray-500">{log.time}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{log.productName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.quantity}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${reasonColors[log.reason] || 'bg-gray-100 text-gray-700'}`}>
                      {log.reason}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.removedBy}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      to={`/stock-out-log/${log.id}`}
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
            Showing 1 to 8 of 247 transactions
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button className="px-3 py-2 bg-[#15aaad] text-white text-sm rounded-lg">1</button>
            <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">2</button>
            <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">3</button>
            <span className="px-2 text-gray-600">...</span>
            <button className="px-3 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">31</button>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}