import { useEffect, useState } from "react";
import { StatCard } from "../components/StatCard";
import {
  DollarSign,
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
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { Link } from "react-router";

const CATEGORY_COLORS = [
  "#15aaad",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#6b7280",
];

export function DashboardPage() {
  const [boxes, setBoxes] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/Dashboard/get_four_boxes").then((r) => r.json()),
      fetch("/api/Dashboard/get_top_moving_items").then((r) => r.json()),
      fetch("/api/Dashboard/get_category_distribution").then((r) => r.json()),
      fetch("/api/Dashboard/get_bar_chart_IN-OUT").then((r) => r.json()),
      fetch("/api/Dashboard/get_line_chart_stock_value").then((r) => r.json()),
    ])
      .then(([boxesData, topData, catData, barChartData, lineChartData]) => {
        setBoxes(boxesData);
        setTopItems(topData || []);
        setCategoryData(
          (catData || []).map((c, i) => ({
            name: c.categoryName,
            value: c.count,
            color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
          }))
        );
        setBarData(barChartData || []);
        setLineData(lineChartData || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      });
  }, []);

  const stats = boxes
    ? [
        {
          title: "Total Stock Value",
          value: `$${Number(boxes.totalStockValue).toLocaleString()}`,
          change: 18.2,
          icon: DollarSign,
          iconColor: "#15aaad",
          iconBgColor: "bg-[#15aaad]/10",
        },
        {
          title: "Low Stock Count",
          value: String(boxes.lowStockCount),
          change: -12.5,
          icon: AlertTriangle,
          iconColor: "#f59e0b",
          iconBgColor: "bg-orange-100",
        },
        {
          title: "Dead Stock Count",
          value: String(boxes.deadStockCount),
          change: -15.3,
          icon: XCircle,
          iconColor: "#ef4444",
          iconBgColor: "bg-red-100",
        },
        {
          title: "Items Near Expiry",
          value: String(boxes.nearExpiryCount),
          change: 5.8,
          icon: Clock,
          iconColor: "#8b5cf6",
          iconBgColor: "bg-purple-100",
        },
      ]
    : [];

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

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

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
                  <h3 className="font-semibold text-gray-900">AI-Powered Demand Forecasting</h3>
                  <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                    3 Urgent
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  3 items need restocking within 7 days. View detailed analytics and AI recommendations to optimize your inventory.
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-[#15aaad] group-hover:gap-3 transition-all">
                  <span>View Analytics Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">95.2%</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">Forecast Accuracy</div>
              </div>
              <div className="w-px h-16 bg-gray-200"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">18</div>
                <div className="text-xs text-gray-600 uppercase tracking-wide">High Demand</div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Row 1: Category Pie + Top Moving Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Category Distribution</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-700">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Moving Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Top Moving Items</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 animate-pulse bg-gray-100 rounded" />
                ))}
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Item Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Units Sold</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Revenue</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-600 uppercase">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.itemName}</td>
                      <td className="px-5 py-4 text-sm text-gray-900">{item.unitsSold}</td>
                      <td className="px-5 py-4 text-sm text-gray-900">${Number(item.revenue).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${item.trend === "Rising" ? "text-green-600" : "text-red-600"}`}>
                          {item.trend === "Rising" ? "↑" : "↓"} {item.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Bar Chart + Line Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock In/Out Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Stock In / Out</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stockIn" name="Stock In" fill="#15aaad" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stockOut" name="Stock Out" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stock Value Line Chart */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Stock Value Over Time</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="h-64 animate-pulse bg-gray-100 rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Stock Value"]} />
                  <Line type="monotone" dataKey="totalValue" name="Stock Value" stroke="#15aaad" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}