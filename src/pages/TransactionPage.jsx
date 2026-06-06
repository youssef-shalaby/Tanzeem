import { useState, useEffect } from "react";
import {
  Search, SlidersHorizontal, Download, Calendar, TrendingUp, TrendingDown,
  RefreshCw, ArrowUpCircle, ArrowDownCircle, Package, Eye, Loader2,
} from "lucide-react";
import { Link } from "react-router";

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch { return null; }
}

// Backend enums → display labels
const TYPE_MAP = { 1: "Stock In", 2: "Stock Out", 3: "Adjustment" };
const SOURCE_MAP = {
  7: "Received from Supplier", 8: "Production", 9: "Customer Return",
  10: "Found/Recovered", 11: "Transfer from Another Branch",
  12: "Inventory Adjustment", 13: "Sold to Customer",
};

function normalizeTransaction(t) {
  const firstItem = t.transactionItemDtos?.[0];
  return {
    id: t.id,
    transactionId: t.transactionId,
    date: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: new Date(t.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    type: TYPE_MAP[t.type] ?? "Unknown",
    productName: firstItem?.product?.name ?? "—",
    sku: firstItem?.product?.sku ?? "—",
    quantity: t.totalTransactedItems,
    unitPrice: firstItem?.unitPrice ?? 0,
    totalValue: t.value,
    source: SOURCE_MAP[t.sourceReason] ?? `Reason ${t.sourceReason}`,
    performedBy: t.preformedBy || "—",
    reference: t.referenceNumber || null,
    rawType: t.type,
  };
}

export function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = getToken();
    fetch("/api/Transaction/Get-Transactions", {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => { if (!r.ok) throw new Error(`Failed to load transactions (${r.status})`); return r.json(); })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];
        setTransactions(list.map(normalizeTransaction));
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTransactions = transactions.filter((txn) => {
    const matchesType =
      typeFilter === "all" ||
      (typeFilter === "stock-in" && txn.type === "Stock In") ||
      (typeFilter === "stock-out" && txn.type === "Stock Out") ||
      (typeFilter === "adjustment" && txn.type === "Adjustment");
    const matchesSearch =
      searchQuery === "" ||
      String(txn.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.transactionId ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeStyle = (type) => {
    switch (type) {
      case "Stock In":   return { badge: "bg-green-100 text-green-700 border-green-200", icon: ArrowUpCircle,   iconColor: "text-green-600" };
      case "Stock Out":  return { badge: "bg-red-100 text-red-700 border-red-200",       icon: ArrowDownCircle, iconColor: "text-red-600" };
      case "Adjustment": return { badge: "bg-blue-100 text-blue-700 border-blue-200",    icon: RefreshCw,       iconColor: "text-blue-600" };
      default:           return { badge: "bg-gray-100 text-gray-700 border-gray-200",    icon: Package,         iconColor: "text-gray-600" };
    }
  };

  const totalStockIn  = transactions.filter((t) => t.type === "Stock In").reduce((s, t) => s + t.totalValue, 0);
  const totalStockOut = transactions.filter((t) => t.type === "Stock Out").reduce((s, t) => s + t.totalValue, 0);
  const totalAdj      = transactions.filter((t) => t.type === "Adjustment").reduce((s, t) => s + Math.abs(t.totalValue), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaction History</h1>
          <p className="text-sm text-gray-600 mt-1">Complete record of all inventory movements and adjustments</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/add-stock" className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowUpCircle className="w-4 h-4 text-gray-600" /> Stock In
          </Link>
          <Link to="/stock-out" className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
            <ArrowDownCircle className="w-4 h-4 text-gray-600" /> Stock Out
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Stock In</div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">${totalStockIn.toLocaleString()}</div>
          <div className="text-sm text-gray-600">{transactions.filter((t) => t.type === "Stock In").length} transactions</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Stock Out</div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-600" /></div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">${totalStockOut.toLocaleString()}</div>
          <div className="text-sm text-gray-600">{transactions.filter((t) => t.type === "Stock Out").length} transactions</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Adjustments</div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center"><RefreshCw className="w-5 h-5 text-blue-600" /></div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">${totalAdj.toLocaleString()}</div>
          <div className="text-sm text-gray-600">{transactions.filter((t) => t.type === "Adjustment").length} transactions</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Product Name, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[["all","All Transactions","bg-[#15aaad]"], ["stock-in","Stock In","bg-green-600"], ["stock-out","Stock Out","bg-red-600"], ["adjustment","Adjustments","bg-blue-600"]].map(([val, label, activeClass]) => (
            <button key={val} onClick={() => setTypeFilter(val)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${typeFilter === val ? `${activeClass} text-white` : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#15aaad] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-600">{error}</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-500">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Transaction ID","Date & Time","Type","Product","Quantity","Value","Source/Reason","Performed By","Actions"].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider ${i >= 4 && i <= 5 ? "text-right" : i === 8 ? "text-center" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((txn) => {
                  const { badge, icon: Icon, iconColor } = getTypeStyle(txn.type);
                  return (
                    <tr key={txn.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        #{txn.id}
                        {txn.reference && <div className="text-xs text-gray-500 mt-0.5">{txn.reference}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{txn.date}</div>
                        <div className="text-xs text-gray-500">{txn.time}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${badge.split(" ")[0]}`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                          </div>
                          <span className={`inline-flex px-3 py-1 rounded-md text-xs font-medium border ${badge}`}>{txn.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{txn.productName}</div>
                        <div className="text-xs text-gray-500">SKU: {txn.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${txn.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                          {txn.quantity > 0 ? "+" : ""}{txn.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-semibold ${txn.totalValue > 0 ? "text-green-600" : "text-red-600"}`}>
                          {txn.totalValue > 0 ? "+" : ""}${Math.abs(txn.totalValue).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{txn.source}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{txn.performedBy}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <Link to={`/transactions/${txn.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors group">
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
        )}

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </div>
    </div>
  );
}