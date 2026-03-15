import { StatCard } from "../components/StatCard";
import {
  Users,
  DollarSign,
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Link } from "react-router";

const stats = [
  {
    title: "Total Stock Value",
    value: "$125.4k",
    change: 18.2,
    icon: DollarSign,
    iconColor: "#15aaad",
    iconBgColor: "bg-[#15aaad]/10",
  },
  {
    title: "Low Stock Count",
    value: "23",
    change: -12.5,
    icon: AlertTriangle,
    iconColor: "#f59e0b",
    iconBgColor: "bg-orange-100",
  },
  {
    title: "Dead Stock Count",
    value: "8",
    change: -15.3,
    icon: XCircle,
    iconColor: "#ef4444",
    iconBgColor: "bg-red-100",
  },
  {
    title: "Items Near Expiry",
    value: "12",
    change: 5.8,
    icon: Clock,
    iconColor: "#8b5cf6",
    iconBgColor: "bg-purple-100",
  },
];

const categoryData = [
  { name: "Electronics", value: 450, color: "#15aaad" },
  { name: "Accessories", value: 320, color: "#3b82f6" },
  { name: "Office Supplies", value: 280, color: "#8b5cf6" },
  { name: "Furniture", value: 180, color: "#f59e0b" },
  { name: "Others", value: 63, color: "#6b7280" },
];

const topMovingItems = [
  { name: "Wireless Mouse", sold: 456, revenue: 9118.44, trend: "up" },
  { name: "USB-C Cable", sold: 789, revenue: 10247.11, trend: "up" },
  { name: "HDMI Cable", sold: 567, revenue: 5097.33, trend: "up" },
  { name: "Laptop Stand", sold: 234, revenue: 7017.66, trend: "down" },
  { name: "Webcam HD", sold: 178, revenue: 10678.22, trend: "up" },
];

const recentOperations = [
  {
    id: 1,
    type: "Stock In",
    item: "Wireless Mouse",
    quantity: 120,
    user: "Admin",
    time: "10 mins ago",
  },
  {
    id: 2,
    type: "Stock Out",
    item: "USB-C Cable",
    quantity: 50,
    user: "John Doe",
    time: "25 mins ago",
  },
  {
    id: 3,
    type: "New Item",
    item: "Laptop Charger",
    quantity: 60,
    user: "Admin",
    time: "1 hour ago",
  },
  {
    id: 4,
    type: "Stock In",
    item: "HDMI Cable",
    quantity: 150,
    user: "Sarah",
    time: "2 hours ago",
  },
  {
    id: 5,
    type: "Update",
    item: 'Monitor 24"',
    quantity: 0,
    user: "Admin",
    time: "3 hours ago",
  },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20">
          <option>Last month</option>
          <option>Last 3 months</option>
          <option>Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* AI Insights Card */}
      <Link to="/analytics" className="block group">
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#15aaad] hover:shadow-md transition-all cursor-pointer">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#15aaad]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    AI-Powered Demand Forecasting
                  </h3>
                  <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    3 Urgent
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  3 items need restocking within 7 days. View detailed analytics
                  and AI recommendations to optimize your inventory.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#15aaad] group-hover:gap-3 transition-all">
                  <span>View Analytics Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  95.2%
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  Forecast Accuracy
                </div>
              </div>
              <div className="w-px h-16 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  18
                </div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">
                  High Demand
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              Category Distribution
            </h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categoryData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Moving Items</h2>
            <button className="text-[#15aaad] text-sm font-medium hover:underline">
              View all
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                    Item Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                    Units Sold
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                    Revenue
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {topMovingItems.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">
                      {item.sold}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">
                      ${item.revenue.toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-sm font-medium ${
                          item.trend === "up"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.trend === "up" ? "↑" : "↓"}
                        {item.trend === "up" ? "Rising" : "Falling"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Operations</h2>
          <Link
            to="/transactions"
            className="text-[#15aaad] text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                  Type
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                  Item
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                  Quantity
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                  User
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOperations.map((operation) => (
                <tr
                  key={operation.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
                        operation.type === "Stock In"
                          ? "bg-green-100 text-green-700"
                          : operation.type === "Stock Out"
                            ? "bg-red-100 text-red-700"
                            : operation.type === "New Item"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {operation.type}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {operation.item}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-900">
                    {operation.quantity > 0 ? operation.quantity : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {operation.user}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {operation.time}
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
