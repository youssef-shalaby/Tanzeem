import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  ArrowUpCircle,
  ArrowDownCircle,
  Package,
  Eye,
} from "lucide-react";
import { Link } from "react-router";

const transactions = [
  {
    id: "TXN-8901",
    date: "Jan 24, 2026",
    time: "02:45 PM",
    type: "Stock In",
    productName: "Office Chair - Ergonomic",
    sku: "OC-884",
    quantity: 50,
    unitPrice: 149.0,
    totalValue: 7450.0,
    source: "Received from Supplier",
    performedBy: "John Admin",
    reference: "PO-2024-001",
  },
  {
    id: "TXN-8900",
    date: "Jan 24, 2026",
    time: "11:30 AM",
    type: "Stock Out",
    productName: "Wireless Mouse",
    sku: "WM-445",
    quantity: 15,
    unitPrice: 25.99,
    totalValue: 389.85,
    source: "Sold to Customer",
    performedBy: "Sarah Manager",
  },
  {
    id: "TXN-8899",
    date: "Jan 23, 2026",
    time: "04:20 PM",
    type: "Stock In",
    productName: "USB-C Cable (2m)",
    sku: "CB-203",
    quantity: 200,
    unitPrice: 8.5,
    totalValue: 1700.0,
    source: "Received from Supplier",
    performedBy: "John Admin",
    reference: "PO-2024-002",
  },
  {
    id: "TXN-8898",
    date: "Jan 23, 2026",
    time: "02:15 PM",
    type: "Stock Out",
    productName: "Laptop Stand",
    sku: "LS-112",
    quantity: 3,
    unitPrice: 45.0,
    totalValue: 135.0,
    source: "Damaged",
    performedBy: "Mike Staff",
  },
  {
    id: "TXN-8897",
    date: "Jan 23, 2026",
    time: "10:00 AM",
    type: "Adjustment",
    productName: "Desk Lamp - LED",
    sku: "DL-556",
    quantity: -2,
    unitPrice: 32.0,
    totalValue: -64.0,
    source: "Inventory Count Correction",
    performedBy: "Sarah Manager",
  },
  {
    id: "TXN-8896",
    date: "Jan 22, 2026",
    time: "05:30 PM",
    type: "Stock In",
    productName: "Notebook A4",
    sku: "NB-778",
    quantity: 500,
    unitPrice: 3.25,
    totalValue: 1625.0,
    source: "Customer Return",
    performedBy: "Mike Staff",
  },
  {
    id: "TXN-8895",
    date: "Jan 22, 2026",
    time: "01:45 PM",
    type: "Stock Out",
    productName: "Wireless Keyboard",
    sku: "WK-334",
    quantity: 8,
    unitPrice: 68.0,
    totalValue: 544.0,
    source: "Sold to Customer",
    performedBy: "Sarah Manager",
  },
  {
    id: "TXN-8894",
    date: "Jan 22, 2026",
    time: "09:20 AM",
    type: "Stock In",
    productName: 'Monitor 27" 4K',
    sku: "MN-990",
    quantity: 25,
    unitPrice: 425.0,
    totalValue: 10625.0,
    source: "Received from Supplier",
    performedBy: "John Admin",
    reference: "PO-2024-003",
  },
  {
    id: "TXN-8893",
    date: "Jan 21, 2026",
    time: "03:50 PM",
    type: "Stock Out",
    productName: "HDMI Cable (3m)",
    sku: "HC-445",
    quantity: 12,
    unitPrice: 12.99,
    totalValue: 155.88,
    source: "Sold to Customer",
    performedBy: "Mike Staff",
  },
  {
    id: "TXN-8892",
    date: "Jan 21, 2026",
    time: "11:15 AM",
    type: "Adjustment",
    productName: "Printer Paper A4",
    sku: "PP-223",
    quantity: 10,
    unitPrice: 4.5,
    totalValue: 45.0,
    source: "Found/Recovered",
    performedBy: "Sarah Manager",
  },
];

export function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = transactions.filter((txn) => {
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "stock-in" && txn.type === "Stock In") ||
      (typeFilter === "stock-out" && txn.type === "Stock Out") ||
      (typeFilter === "adjustment" && txn.type === "Adjustment");

    const matchesSearch =
      searchQuery === "" ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.sku.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const getTypeStyle = (type) => {
    switch (type) {
      case "Stock In":
        return {
          badge: "bg-green-100 text-green-700 border-green-200",
          icon: ArrowUpCircle,
          iconColor: "text-green-600",
        };
      case "Stock Out":
        return {
          badge: "bg-red-100 text-red-700 border-red-200",
          icon: ArrowDownCircle,
          iconColor: "text-red-600",
        };
      case "Adjustment":
        return {
          badge: "bg-blue-100 text-blue-700 border-blue-200",
          icon: RefreshCw,
          iconColor: "text-blue-600",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Package,
          iconColor: "text-gray-600",
        };
    }
  };

  // Calculate stats
  const totalStockIn = transactions
    .filter((t) => t.type === "Stock In")
    .reduce((sum, t) => sum + t.totalValue, 0);

  const totalStockOut = transactions
    .filter((t) => t.type === "Stock Out")
    .reduce((sum, t) => sum + t.totalValue, 0);

  const totalAdjustments = transactions
    .filter((t) => t.type === "Adjustment")
    .reduce((sum, t) => sum + Math.abs(t.totalValue), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Transaction History
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete record of all inventory movements and adjustments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/add-stock"
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowUpCircle className="w-[18px] h-[18px] text-gray-600" />
            Add Stock
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
            <Download className="w-[18px] h-[18px]" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Stock In</div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">
            ${totalStockIn.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>
              {transactions.filter((t) => t.type === "Stock In").length}{" "}
              transactions
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Stock Out</div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">
            ${totalStockOut.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>
              {transactions.filter((t) => t.type === "Stock Out").length}{" "}
              transactions
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Adjustments</div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">
            ${totalAdjustments.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>
              {transactions.filter((t) => t.type === "Adjustment").length}{" "}
              transactions
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Product Name, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-[18px] h-[18px] text-gray-600" />
            Date Range
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-[18px] h-[18px] text-gray-600" />
            More Filters
          </button>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === "all"
                ? "bg-[#15aaad] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setTypeFilter("stock-in")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === "stock-in"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Stock In
          </button>
          <button
            onClick={() => setTypeFilter("stock-out")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === "stock-out"
                ? "bg-red-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Stock Out
          </button>
          <button
            onClick={() => setTypeFilter("adjustment")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              typeFilter === "adjustment"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Adjustments
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source/Reason
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performed By
                </th>
                <th className="text-center px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => {
                const { badge, icon: Icon, iconColor } = getTypeStyle(txn.type);
                return (
                  <tr
                    key={txn.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {txn.id}
                      {txn.reference && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {txn.reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{txn.date}</div>
                      <div className="text-xs text-gray-500">{txn.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full ${badge.replace("text-", "bg-").replace("-700", "-100")} flex items-center justify-center`}
                        >
                          <Icon className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        <span
                          className={`inline-flex px-3 py-1 rounded-md text-xs font-medium border ${badge}`}
                        >
                          {txn.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {txn.productName}
                      </div>
                      <div className="text-xs text-gray-500">
                        SKU: {txn.sku}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          txn.quantity > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {txn.quantity > 0 ? "+" : ""}
                        {txn.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          txn.totalValue > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {txn.totalValue > 0 ? "+" : ""}$
                        {Math.abs(txn.totalValue).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {txn.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {txn.performedBy}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <Link
                          to={`/transactions/${txn.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              ‹
            </button>
            <button className="px-3 py-1.5 text-sm bg-[#15aaad] text-white rounded-lg">
              1
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              3
            </button>
            <span className="px-2 text-gray-600">...</span>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              10
            </button>
            <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
