import { useState } from "react";
import { Search, SlidersHorizontal, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const orders = [
  {
    id: "ORD-3492",
    date: "Oct 24, 2023",
    time: "10:42 AM",
    supplier: "Acme Corp",
    total: 1250.0,
    status: "Shipped",
  },
  {
    id: "ORD-3491",
    date: "Oct 23, 2023",
    time: "02:15 PM",
    supplier: "Globex Inc",
    total: 450.0,
    status: "Pending",
  },
  {
    id: "ORD-3490",
    date: "Oct 23, 2023",
    time: "09:30 AM",
    supplier: "Stark Ind",
    total: 8900.0,
    status: "Delivered",
  },
  {
    id: "ORD-3489",
    date: "Oct 22, 2023",
    time: "11:05 AM",
    supplier: "Wayne Corp",
    total: 325.0,
    status: "Cancelled",
  },
];

export function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter(
          (order) => order.status.toLowerCase() === selectedStatus
        );

  const getStatusStyle = (status) => {
    switch (status) {
      case "Shipped":
        return "bg-blue-100 text-blue-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>

        <Link
          to="/orders/create"
          className="px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
        >
          Create Order
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#15aaad]" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">
            $45,230
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Pending Orders</div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">12</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Completed Orders</div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">
            1,245
          </div>
        </div>

      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3">

          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />

            <input
              type="text"
              placeholder="Search by Order ID, Supplier, or Date..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#f6f8fa] rounded-lg text-sm focus:outline-none"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value="all">All</option>
            <option value="shipped">Shipped</option>
            <option value="pending">Pending</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-sm rounded-lg hover:bg-gray-50">
            <SlidersHorizontal className="w-[18px] h-[18px] text-gray-600" />
            More Filters
          </button>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200">

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase">Order ID</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase">Supplier</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {order.id}
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm">{order.date}</div>
                    <div className="text-xs text-gray-500">{order.time}</div>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    {order.supplier}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium">
                    ${order.total.toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusStyle(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50"
                    >
                      View
                    </Link>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
}