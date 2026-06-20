import { useState, useEffect } from "react";
import {
  Search, ArrowUpCircle, ArrowDownCircle, TrendingUp, TrendingDown,
  RefreshCw, ChevronLeft, ChevronRight, RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ToneIcon } from "../components/ToneIcon";
import { EmptyState } from "../components/EmptyState";
import { TableLoadingState } from "../components/LoadingStates";
import { formatAppDate, formatAppTime } from "../utils/dateTime";

// ============================
// Design system styles (green accent)
// ============================
const TRANSACTIONS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .transactions-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-search-input {
    width: 100%; padding: 9px 14px 9px 36px;
    background: #f5f6f3; border: 1px solid transparent;
    border-radius: 100px; font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s, background .2s;
  }
  .db-search-input::placeholder { color: #aaa; }
  .db-search-input:focus { background: #fff; border-color: rgba(15,140,90,.3); }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: .5px; padding: 10px 16px; text-align: left; background: #f9faf7; }
  .db-table td { padding: 12px 16px; font-size: 13px; color: #1a1a18; border-top: 1px solid rgba(0,0,0,.05); }
  .db-table tr:hover td { background: #f9faf7; }
  .transactions-table { table-layout: fixed; min-width: 1040px; }
  .transactions-table th,
  .transactions-table td { vertical-align: middle; }
  .transactions-table .col-id { width: 132px; }
  .transactions-table .col-date { width: 136px; }
  .transactions-table .col-type { width: 118px; }
  .transactions-table .col-product { width: 230px; }
  .transactions-table .col-qty { width: 96px; }
  .transactions-table .col-value { width: 116px; }
  .transactions-table .col-source { width: 180px; }
  .transactions-table .col-user { width: 140px; }
  .transactions-table .col-actions { width: 104px; }
  .txn-product-name,
  .txn-source,
  .txn-user {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .txn-sku {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-skeleton { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:10px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
`;

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
    date: formatAppDate(t.createdAt, { month: "short", day: "numeric", year: "numeric" }),
    time: formatAppTime(t.createdAt, { hour: "2-digit", minute: "2-digit" }),
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(pageStart, pageStart + itemsPerPage);
  const shownStart = filteredTransactions.length === 0 ? 0 : pageStart + 1;
  const shownEnd = Math.min(pageStart + itemsPerPage, filteredTransactions.length);
  const hasTransactionFilters = searchQuery.trim() !== "" || typeFilter !== "all";

  const renderPagination = () => {
    const pages = [];
    let start = Math.max(safeCurrentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) start = Math.max(end - 4, 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  };

  // Only pill badges – no arrow icons
  const getTypeStyle = (type) => {
    switch (type) {
      case "Stock In":   return "pill-green";
      case "Stock Out":  return "pill-red";
      case "Adjustment": return "pill-blue";
      default:           return "bg-gray-100 text-gray-600";
    }
  };

  const totalStockIn  = transactions.filter((t) => t.type === "Stock In").reduce((s, t) => s + t.totalValue, 0);
  const totalStockOut = transactions.filter((t) => t.type === "Stock Out").reduce((s, t) => s + t.totalValue, 0);
  const totalAdj      = transactions.filter((t) => t.type === "Adjustment").reduce((s, t) => s + Math.abs(t.totalValue), 0);

  return (
    <div className="transactions-root space-y-6">
      <style>{TRANSACTIONS_STYLES}</style>

      {/* HEADER */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="db-section-title">Transaction History</h1>
          <p className="app-page-subtitle">Review stock movements, adjustments, values, and source reasons.</p>
        </div>
        <div className="app-page-actions">
          <Link to="/add-stock" state={{ from: "/transactions" }} className="db-secondary-btn">
            <ArrowUpCircle className="w-4 h-4" /> Stock In
          </Link>
          <Link to="/stock-out" state={{ from: "/transactions" }} className="db-secondary-btn">
            <ArrowDownCircle className="w-4 h-4" /> Stock Out
          </Link>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Total Stock In</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">${totalStockIn.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{transactions.filter((t) => t.type === "Stock In").length} transactions</div>
            </div>
            <ToneIcon icon={TrendingUp} tone="green" />
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Total Stock Out</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">${totalStockOut.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{transactions.filter((t) => t.type === "Stock Out").length} transactions</div>
            </div>
            <ToneIcon icon={TrendingDown} tone="red" />
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Adjustments</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">${totalAdj.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{transactions.filter((t) => t.type === "Adjustment").length} transactions</div>
            </div>
            <ToneIcon icon={RefreshCw} tone="blue" />
          </div>
        </div>
      </div>

      {/* FILTERS CARD */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Filter Transactions</span>
        </div>
        <div className="p-5 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Product Name, or SKU..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="db-search-input pl-11"
            />
          </div>
          {/* Type filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              ["all", "All Transactions", "bg-[#0f8c5a] text-white"],
              ["stock-in", "Stock In", "bg-green-600 text-white"],
              ["stock-out", "Stock Out", "bg-red-600 text-white"],
              ["adjustment", "Adjustments", "bg-blue-600 text-white"],
            ].map(([val, label, activeClass]) => (
              <button
                key={val}
                onClick={() => {
                  setTypeFilter(val);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  typeFilter === val
                    ? activeClass
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSACTIONS TABLE CARD */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Transaction Log</span>
        </div>
        <div className="app-table-frame overflow-x-auto">
          {isLoading ? (
            <TableLoadingState rows={6} />
          ) : error ? (
            <div className="flex items-center justify-center py-20 text-sm text-red-600">{error}</div>
          ) : filteredTransactions.length === 0 ? (
            <EmptyState
              icon={hasTransactionFilters ? Search : RefreshCw}
              tone={hasTransactionFilters ? "blue" : "green"}
              title={hasTransactionFilters ? "No transactions match this view" : "Record your first transaction"}
              message={
                hasTransactionFilters
                  ? "Transactions that match the selected type and search text will appear here."
                  : "Stock in, stock out, and adjustment records create the movement history your team can audit later."
              }
              actions={
                hasTransactionFilters
                  ? [
                      {
                        label: "Clear filters",
                        icon: RotateCcw,
                        variant: "secondary",
                        onClick: () => {
                          setSearchQuery("");
                          setTypeFilter("all");
                          setCurrentPage(1);
                        },
                      },
                    ]
                  : [
                      { label: "Stock in", icon: ArrowUpCircle, to: "/add-stock", state: { from: "/transactions" } },
                      { label: "Stock out", icon: ArrowDownCircle, to: "/stock-out", state: { from: "/transactions" }, variant: "secondary" },
                    ]
              }
            />
          ) : (
            <table className="db-table transactions-table">
              <thead>
                <tr>
                  <th className="col-id">Transaction ID</th>
                  <th className="col-date">Date & Time</th>
                  <th className="col-type">Type</th>
                  <th className="col-product">Product</th>
                  <th className="col-qty text-right">Quantity</th>
                  <th className="col-value text-right">Value</th>
                  <th className="col-source">Source/Reason</th>
                  <th className="col-user">Performed By</th>
                  <th className="col-actions text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTransactions.map((txn) => {
                  const badgeClass = getTypeStyle(txn.type);
                  return (
                    <tr key={txn.id}>
                      <td className="font-medium">
                        #{txn.id}
                        {txn.reference && <div className="text-xs text-gray-500 mt-0.5">{txn.reference}</div>}
                      </td>
                      <td>
                        <div>{txn.date}</div>
                        <div className="text-xs text-gray-500">{txn.time}</div>
                      </td>
                      <td>
                        <span className={`db-stat-pill ${badgeClass}`}>{txn.type}</span>
                      </td>
                      <td>
                        <span className="txn-product-name font-medium" title={txn.productName}>{txn.productName}</span>
                        <span className="txn-sku text-xs text-gray-500" title={`SKU: ${txn.sku}`}>SKU: {txn.sku}</span>
                      </td>
                      <td className="text-right">
                        <span className={txn.quantity > 0 ? "text-green-600" : "text-red-600"}>
                          {txn.quantity > 0 ? "+" : ""}{txn.quantity}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className={txn.totalValue > 0 ? "text-green-600" : "text-red-600"}>
                          {txn.totalValue > 0 ? "+" : ""}${Math.abs(txn.totalValue).toFixed(2)}
                        </span>
                      </td>
                      <td className="text-gray-600"><span className="txn-source" title={txn.source}>{txn.source}</span></td>
                      <td><span className="txn-user" title={txn.performedBy}>{txn.performedBy}</span></td>
                      <td className="text-center">
                        <Link to={`/transactions/${txn.id}`} className="db-secondary-btn">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {!isLoading && !error && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3 text-sm text-gray-600">
            <span>
              Showing {shownStart}-{shownEnd} of {filteredTransactions.length}
              {filteredTransactions.length !== transactions.length ? ` filtered from ${transactions.length}` : ""} transactions
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  disabled={safeCurrentPage === 1}
                  className="db-icon-btn disabled:opacity-40"
                  aria-label="Previous transactions page"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {renderPagination().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      safeCurrentPage === page
                        ? "bg-[#0f8c5a] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    aria-current={safeCurrentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="db-icon-btn disabled:opacity-40"
                  aria-label="Next transactions page"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
