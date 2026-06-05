import { useState, useEffect } from "react";
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // orderId => total nested issues count
  const [issueMap, setIssueMap] = useState({});

  const pageSize = 10;

  // Dashboard Stats
  useEffect(() => {
    fetch("/api/Order/mini_order_dashboard")
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
    setLoading(true);

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

    fetch(url)
      .then((res) => {
        if (!res.ok)
          throw new Error("Failed to fetch orders.");

        return res.json();
      })
      .then((body) => {
        setOrdersList(body.data || []);

        setTotalPages(
          body.totalPages && body.totalPages > 0
            ? body.totalPages
            : 1
        );

        setTotalCount(body.totalCount || 0);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [currentPage, searchTerm, filterId, sortId]);

  // Delivery Issues Fetch
  useEffect(() => {
    fetch("/api/DeliveryIssues?page=1&page_size=1000")
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

          map[orderId] =
            (map[orderId] || 0) + totalIssues;
        });

        console.log("Issue Map:", map);

        setIssueMap(map);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const getStatus = (status) => {
    if (typeof status === "number") {
      return status === 0 ? "Pending" : "Delivered";
    }

    if (!status) return "Pending";

    const normalized = String(status).toLowerCase();

    if (normalized.includes("deliver")) {
      return "Delivered";
    }

    if (normalized.includes("cancel")) {
      return "Cancelled";
    }

    return "Pending";
  };

  const getStatusStyle = (status) => {
    switch (getStatus(status)) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Delivered":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  // Dynamic Pagination
  const renderPagination = () => {
    const pages = [];

    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);

    if (end - start < 4) {
      start = Math.max(end - 4, 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Orders
        </h1>

        <button
          onClick={() => navigate("/orders/create")}
          className="px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
        >
          Create Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Revenue */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">
              Total Revenue
            </div>

            <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#15aaad]" />
            </div>
          </div>

          <div className="text-3xl font-semibold text-gray-900 mb-2">
            $
            {Number(
              dashboardStats.totalOrdersRevenue || 0
            ).toLocaleString()}
          </div>

          <div className="flex items-center gap-1 text-sm text-green-600">
            <span>↗</span>
            <span>12%</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">
              Pending Orders
            </div>

            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>

          <div className="text-3xl font-semibold text-gray-900 mb-2">
            {dashboardStats.pendingOrdersCount}
          </div>

          <div className="flex items-center gap-1 text-sm text-green-600">
            <span>↗</span>
            <span>2%</span>
          </div>
        </div>

        {/* Delivered */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">
              Completed Orders
            </div>

            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          <div className="text-3xl font-semibold text-gray-900 mb-2">
            {dashboardStats.deliveredOrdersCount}
          </div>

          <div className="flex items-center gap-1 text-sm text-green-600">
            <span>↗</span>
            <span>5%</span>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />

            <input
              type="text"
              placeholder="Search by Order ID, Supplier, or Date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
            />
          </div>

          {/* Filter */}
          <select
            value={filterId}
            onChange={(e) => {
              setFilterId(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white"
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
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 bg-white"
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

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading orders...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-red-600">
            Error: {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {ordersList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-sm text-gray-400"
                    >
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  ordersList.map((ord) => {
                    const status = getStatus(ord.status);

                    const issueCount =
                      issueMap[ord.id] || 0;

                    const showDelivery =
                      status === "Delivered";

                    return (
                      <tr
                        key={ord.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        {/* Order ID */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {ord.stringId || `#${ord.id}`}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(
                            ord.orderDate
                          ).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Supplier */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {ord.supplierName}
                        </td>

                        {/* Total */}
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          $
                          {Number(
                            ord.total || 0
                          ).toFixed(2)}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-md text-xs font-medium ${getStatusStyle(
                              ord.status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Delivery Issues */}
                        <td className="px-6 py-4">
                          {!showDelivery ? (
                            <span className="text-xs text-gray-400">
                              —
                            </span>
                          ) : issueCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-700">
                              <AlertTriangle className="w-3 h-3" />

                              {issueCount}{" "}
                              {issueCount === 1
                                ? "issue"
                                : "issues"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3" />
                              Clean
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              navigate(`/orders/${ord.id}`, {
                                state: { order: ord },
                              })
                            }
                            className="inline-flex items-center px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {currentPage} of{" "}
              {totalPages} ({totalCount} orders)
            </div>

            <div className="flex items-center gap-2">
              {/* Previous */}
              <button
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((p) => p - 1)
                }
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
              >
                ‹
              </button>

              {/* Pages */}
              {renderPagination().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1.5 text-sm rounded-lg ${
                    currentPage === page
                      ? "bg-[#15aaad] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next */}
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => p + 1)
                }
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40"
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