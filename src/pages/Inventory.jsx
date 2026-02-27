import { Plus, Download, Upload, List, Package, ShoppingCart, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router';

export function Inventory() {
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
          <div className="text-3xl font-semibold text-gray-900 mb-2">1,240</div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <span>↑</span>
            <span>+12 this week</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Low Stock Alerts</div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">12</div>
          <div className="text-sm text-orange-600">Requires attention</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Pending Orders</div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">5</div>
          <div className="text-sm text-blue-600">To be processed</div>
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

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <List className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Products</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            View the complete inventory list. Filter by category, status, or supplier.
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          <button className="text-[#15aaad] text-sm font-medium hover:underline">View all history</button>
        </div>

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
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">#TRX-9923</td>
                <td className="px-5 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                    Stock In
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-900">150x Office Chair - Black</td>
                <td className="px-5 py-4 text-sm text-gray-600">Today, 10:23 AM</td>
                <td className="px-5 py-4 text-sm text-green-600 font-medium">Completed</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">#TRX-9922</td>
                <td className="px-5 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                    Stock Out
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-900">2x Monitor Stand 24"</td>
                <td className="px-5 py-4 text-sm text-gray-600">Yesterday, 4:15 PM</td>
                <td className="px-5 py-4 text-sm text-green-600 font-medium">Completed</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">#TRX-9921</td>
                <td className="px-5 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                    Stock In
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-900">500x USB-C Cables</td>
                <td className="px-5 py-4 text-sm text-gray-600">Yesterday, 2:00 PM</td>
                <td className="px-5 py-4 text-sm text-green-600 font-medium">Completed</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">#TRX-9920</td>
                <td className="px-5 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700">
                    Adjustment
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-900">15x Wireless Mouse - Damaged</td>
                <td className="px-5 py-4 text-sm text-gray-600">Yesterday, 11:30 AM</td>
                <td className="px-5 py-4 text-sm text-green-600 font-medium">Completed</td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-gray-900">#TRX-9919</td>
                <td className="px-5 py-4">
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                    Stock In
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-900">75x Laptop Stand - Silver</td>
                <td className="px-5 py-4 text-sm text-gray-600">2 days ago, 3:45 PM</td>
                <td className="px-5 py-4 text-sm text-green-600 font-medium">Completed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}