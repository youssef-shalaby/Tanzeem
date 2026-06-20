import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import { formatAppDate } from "../utils/dateTime";

// ============================
// Design system styles (green accent, DM Sans, etc.)
// ============================
const ORDERS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .orders-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
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
  .db-select {
    padding: 8px 14px; background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #444; cursor: pointer; outline: none; transition: border-color .2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
  }
  .db-select:hover { border-color: #0f8c5a; }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: .5px; padding: 10px 16px; text-align: left; background: #f9faf7; }
  .db-table td { padding: 12px 16px; font-size: 13px; color: #1a1a18; border-top: 1px solid rgba(0,0,0,.05); }
  .db-table tr:hover td { background: #f9faf7; }
  .db-search-input {
    width: 100%; padding: 9px 14px 9px 36px;
    background: #f5f6f3; border: 1px solid transparent;
    border-radius: 100px; font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s, background .2s;
  }
  .db-search-input::placeholder { color: #aaa; }
  .db-search-input:focus { background: #fff; border-color: rgba(15,140,90,.3); }
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
  } catch {
    return null;
  }
}

export function OrdersPage() {
  const navigate = useNavigate();

  const [ordersList, setOrdersList] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
    pendingOrdersCount: 0,
    deliveredOrdersCount: 0,
    totalOrdersRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterId, setFilterId] = useState("all");
  const [sortId, setSortId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [issueMap, setIssueMap] = useState({});

  const pageSize = 10;

  // Dashboard Stats
  useEffect(() => {
    fetch("/api/Order/mini_order_dashboard", {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) =>
        setDashboardStats({
          pendingOrdersCount: data.pendingOrdersCount || 0,
          deliveredOrdersCount: data.deliveredOrdersCount || 0,
          totalOrdersRevenue: data.totalOrdersRevenue || 0,
        })
      )
      .catch(() => {});
  }, []);

  // Orders Fetch
  useEffect(() => {
    let isCancelled = false;
    const loadingTimer = window.setTimeout(() => {
      if (!isCancelled) setLoading(true);
    }, 0);

    let url = `/api/Order?page=${currentPage}&page_size=${pageSize}`;

    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (filterId !== "all") {
      url += `&filterId=${filterId}`;
    }
    if (sortId !== "") {
      url += `&sortId=${sortId}`;
    }

    fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders.");
        return res.json();
      })
      .then((body) => {
        if (isCancelled) return;
        setOrdersList(body.data || []);
        setTotalPages(body.totalPages && body.totalPages > 0 ? body.totalPages : 1);
        setTotalCount(body.totalCount || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [currentPage, searchTerm, filterId, sortId]);

  // Delivery Issues Fetch
  useEffect(() => {
    fetch("/api/DeliveryIssues?page=1&page_size=1000", {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const map = {};
        (data.data || []).forEach((deliveryIssue) => {
          const orderId = deliveryIssue.orderId;
          if (!orderId) return;
          let totalIssues = 0;
          (deliveryIssue.items || []).forEach((item) => {
            totalIssues += (item.issues || []).length;
          });
          map[orderId] = (map[orderId] || 0) + totalIssues;
        });
        setIssueMap(map);
      })
      .catch((err) => console.error(err));
  }, []);

  const getStatus = (status) => {
    if (typeof status === "number") {
      return status === 0 ? "Pending" : "Delivered";
    }
    if (!status) return "Pending";
    const normalized = String(status).toLowerCase();
    if (normalized.includes("deliver")) return "Delivered";
    if (normalized.includes("cancel")) return "Cancelled";
    return "Pending";
  };

  const getStatusStyle = (status) => {
    switch (getStatus(status)) {
      case "Pending":   return "pill-yellow";
      case "Delivered": return "pill-green";
      case "Cancelled": return "pill-red";
      default:          return "bg-gray-100 text-gray-600";
    }
  };

  const renderPagination = () => {
    const pages = [];
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) start = Math.max(end - 4, 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };
  const hasOrderFilters = searchTerm.trim() !== "" || filterId !== "all" || sortId !== "";

  return (
    <div className="orders-root space-y-6">
      <style>{ORDERS_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="db-section-title">Orders</h1>
          <p className="app-page-subtitle">Manage purchase orders and track deliveries.</p>
        </div>
        <button
          onClick={() => navigate("/orders/create")}
          className="db-primary-btn"
        >
          Create Order
        </button>
      </div>

      {/* Stats Cards (Dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Total Revenue" value={`$${Number(dashboardStats.totalOrdersRevenue || 0).toLocaleString()}`} sub="Order revenue" icon={DollarSign} iconColor="#0f8c5a" iconBgColor="bg-[#0f8c5a]/10" className="db-fade-in" />
        <StatCard title="Pending Orders" value={dashboardStats.pendingOrdersCount} sub="Need attention" subColor="#d97706" icon={Clock} iconColor="#eab308" iconBgColor="bg-yellow-100" className="db-fade-in" />
        <StatCard title="Completed Orders" value={dashboardStats.deliveredOrdersCount} sub="Delivered orders" icon={CheckCircle} iconColor="#22c55e" iconBgColor="bg-green-100" className="db-fade-in" />
      </div>

      {/* Search + Filters Card */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Filter Orders</span>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, Supplier, or Date..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="db-search-input pl-11"
              />
            </div>

            {/* Filter (Status) */}
            <select
              value={filterId}
              onChange={(e) => {
                setFilterId(e.target.value);
                setCurrentPage(1);
              }}
              className="db-select"
            >
              <option value="all">All Statuses</option>
              <option value="0">Pending</option>
              <option value="1">Delivered</option>
            </select>

            {/* Sort */}
            <select
              value={sortId}
              onChange={(e) => {
                setSortId(e.target.value);
                setCurrentPage(1);
              }}
              className="db-select"
            >
              <option value="">Default Sort</option>
              <option value="0">Receive Date ↑ (Nearest)</option>
              <option value="1">Receive Date ↓ (Farthest)</option>
              <option value="2">Order Date ↑ (Nearest)</option>
              <option value="3">Order Date ↓ (Farthest)</option>
              <option value="4">Supplier A → Z</option>
              <option value="5">Supplier Z → A</option>
              <option value="6">Total ↓ (Highest)</option>
              <option value="7">Total ↑ (Lowest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Order List</span>
        </div>
        <div className="app-table-frame overflow-x-auto">
          {loading ? (
            <div className="p-10 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="db-skeleton h-12" />
              ))}
            </div>
          ) : error ? (
            <div className="p-10 text-center text-sm text-red-600">{error}</div>
          ) : ordersList.length === 0 ? (
            <EmptyState
              icon={hasOrderFilters ? Search : Plus}
              tone={hasOrderFilters ? "blue" : "green"}
              title={hasOrderFilters ? "No orders match these filters" : "Create your first order"}
              message={
                hasOrderFilters
                  ? "Orders that match the current search, status, and sort settings will appear here."
                  : "Orders connect suppliers to incoming stock, delivery checks, and issue follow-up."
              }
              actions={
                hasOrderFilters
                  ? [
                      {
                        label: "Clear filters",
                        icon: RotateCcw,
                        variant: "secondary",
                        onClick: () => {
                          setSearchTerm("");
                          setFilterId("all");
                          setSortId("");
                          setCurrentPage(1);
                        },
                      },
                    ]
                  : [
                      {
                        label: "Create order",
                        icon: Plus,
                        onClick: () => navigate("/orders/create"),
                      },
                    ]
              }
            />
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Total Value</th>
                  <th>Status</th>
                  <th>Delivery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((ord) => {
                    const status = getStatus(ord.status);
                    const issueCount = issueMap[ord.id] || 0;
                    const showDelivery = status === "Delivered";

                    return (
                      <tr key={ord.id}>
                        <td className="font-medium">
                          {ord.stringId || `#${ord.id}`}
                        </td>
                        <td>
                          {formatAppDate(ord.orderDate, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td>{ord.supplierName}</td>
                        <td>${Number(ord.total || 0).toFixed(2)}</td>
                        <td>
                          <span className={`db-stat-pill ${getStatusStyle(ord.status)}`}>
                            {status}
                          </span>
                        </td>
                        <td>
                          {!showDelivery ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : issueCount > 0 ? (
                            <span className="db-stat-pill pill-red">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {issueCount} {issueCount === 1 ? "issue" : "issues"}
                            </span>
                          ) : (
                            <span className="db-stat-pill pill-green">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Clean
                            </span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              navigate(`/orders/${ord.id}`, { state: { order: ord } })
                            }
                            className="db-secondary-btn"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages} ({totalCount} orders)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="db-icon-btn disabled:opacity-40"
              >
                ‹
              </button>
              {renderPagination().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    currentPage === page
                      ? "bg-[#0f8c5a] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="db-icon-btn disabled:opacity-40"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
