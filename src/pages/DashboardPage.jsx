import { useEffect, useState } from "react";
import { StatCard } from "../components/StatCard";
import { DollarSign, AlertTriangle, XCircle, Clock, Sparkles, ArrowRight } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { Link, Navigate } from "react-router";
import { apiRequest, ForbiddenError } from "../services/api";

const CATEGORY_COLORS = ["#0f8c5a","#2c5f8a","#3b82f6","#f59e0b","#ef4444","#6b7280"];

const DB_STYLES = `
  .db-insight-card {
    background:
      linear-gradient(90deg, rgba(15,140,90,.055), rgba(255,255,255,0) 42%),
      var(--app-panel);
    border-radius: 16px; border: 1px solid var(--app-line);
    padding: 18px 20px; display:flex; align-items:center; justify-content:space-between;
    gap:20px; transition: border-color .2s, box-shadow .2s; text-decoration:none; color:inherit; cursor:pointer;
  }
  .db-insight-card:hover { border-color: #0f8c5a; box-shadow: 0 4px 20px rgba(15,140,90,.08); }
  .db-insight-icon { width:40px; height:40px; border-radius:12px; background:#e9f8f1; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .db-insight-main { display:flex; align-items:center; gap:14px; flex:1; min-width:0; }
  .db-insight-heading { display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap; }
  .db-insight-title { font-size:14px; font-weight:600; color:var(--app-ink); }
  .db-insight-copy { font-size:13px; color:var(--app-muted); font-weight:400; line-height:1.5; margin:0; }
  .db-insight-metrics { display:flex; align-items:center; gap:8px; flex-shrink:0; }
  .db-insight-metric { text-align:center; padding:0 18px; }
  .db-insight-metric + .db-insight-metric { border-left:1px solid var(--app-line); }
  .db-insight-number { font-size:24px; font-weight:500; color:var(--app-ink); font-family:'DM Serif Display',serif; line-height:1; }
  .db-insight-number.green { color:var(--app-green); }
  .db-insight-label { font-size:10px; color:var(--app-subtle); text-transform:uppercase; letter-spacing:.5px; margin-top:5px; white-space:nowrap; }
  :root[data-theme="dark"] .db-insight-card {
    background:
      linear-gradient(90deg, rgba(47,186,120,.035), rgba(20,23,24,0) 44%),
      var(--app-panel);
    border-color: rgba(238,242,239,.1);
  }
  :root[data-theme="dark"] .db-insight-card:hover {
    border-color: rgba(47,186,120,.24);
    box-shadow: 0 0 0 1px rgba(47,186,120,.08);
  }
  :root[data-theme="dark"] .db-insight-icon {
    background: rgba(47,186,120,.12);
    color: var(--app-success-text);
  }
  @media (max-width: 900px) {
    .db-insight-card { align-items:flex-start; flex-direction:column; }
    .db-insight-metrics { width:100%; justify-content:space-between; }
    .db-insight-metric { flex:1; padding:0 12px; }
  }
`;

export function DashboardPage() {
  const [boxes,        setBoxes]        = useState(null);
  const [topItems,     setTopItems]     = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [barData,      setBarData]      = useState([]);
  const [lineData,     setLineData]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [isForbidden,  setIsForbidden]  = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest("/api/Dashboard/get_four_boxes"),
      apiRequest("/api/Dashboard/get_top_moving_items"),
      apiRequest("/api/Dashboard/get_category_distribution"),
      apiRequest("/api/Dashboard/get_bar_chart_IN-OUT"),
      apiRequest("/api/Dashboard/get_line_chart_stock_value"),
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
        if (err instanceof ForbiddenError) setIsForbidden(true);
        setLoading(false);
      });
  }, []);

  if (isForbidden) return <Navigate to="/unauthorized" replace />;

  const chartText = "var(--app-subtle)";
  const chartGrid = "var(--app-line)";
  const chartTooltip = {
    background: "var(--app-panel-raised, var(--app-panel))",
    borderRadius: 10,
    border: "1px solid var(--app-line)",
    color: "var(--app-ink)",
    fontSize: 12,
    fontFamily: "'DM Sans',sans-serif",
    boxShadow: "var(--app-shadow-card)",
  };

  const stats = boxes ? [
    { title: "Total Stock Value",  value: `$${Number(boxes.totalStockValue).toLocaleString()}`, change: 18.2,  icon: DollarSign,   iconColor: "#0f8c5a", iconBgColor: "bg-[#0f8c5a]/10" },
    { title: "Low Stock Count",    value: String(boxes.lowStockCount),                          change: -12.5, icon: AlertTriangle, iconColor: "#f59e0b", iconBgColor: "bg-orange-100" },
    { title: "Dead Stock Count",   value: String(boxes.deadStockCount),                         change: -15.3, icon: XCircle,       iconColor: "#ef4444", iconBgColor: "bg-red-100" },
    { title: "Items Near Expiry",  value: String(boxes.nearExpiryCount),                        change: 5.8,   icon: Clock,         iconColor: "#8b5cf6", iconBgColor: "bg-purple-100" },
  ] : [];

  return (
    <div className="db-root space-y-6" style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{DB_STYLES}</style>

      {/* Header — period selector removed */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="db-section-title">Dashboard</h1>
          <p className="app-page-subtitle">Monitor stock health, movement, value, and forecast signals.</p>
        </div>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="db-skeleton h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 db-fade-in">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      {/* AI Insights Banner */}
      <Link to="/analytics" className="db-insight-card db-fade-in" style={{ animationDelay:".05s" }}>
        <div className="db-insight-main">
          <div className="db-insight-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="db-insight-heading">
              <span className="db-insight-title">AI-powered demand forecasting</span>
              <span className="db-stat-pill pill-amber">3 urgent</span>
            </div>
            <p className="db-insight-copy">
              3 items need restocking within 7 days. View detailed analytics and AI recommendations to optimise your inventory.
            </p>
          </div>
        </div>
        <div className="db-insight-metrics">
          <div className="db-insight-metric">
            <div className="db-insight-number">95.2%</div>
            <div className="db-insight-label">Forecast accuracy</div>
          </div>
          <div className="db-insight-metric">
            <div className="db-insight-number green">18</div>
            <div className="db-insight-label">High demand</div>
          </div>
          <ArrowRight size={16} color="#0f8c5a" style={{ marginLeft:8 }} />
        </div>
      </Link>

      {/* Row 1: Category Pie + Top Moving Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="db-card db-fade-in" style={{ animationDelay:".1s" }}>
          <div className="db-card-header">
            <span className="db-card-title">Category distribution</span>
          </div>
          <div style={{ padding:"20px 20px 16px" }}>
            {loading ? (
              <div className="db-skeleton" style={{ height:240 }} />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" labelLine={false}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                  {categoryData.map((item) => (
                    <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                        <span style={{ fontSize:13, color:"var(--app-muted)" }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:500, color:"var(--app-ink)" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Moving Items */}
        <div className="lg:col-span-2 db-card db-fade-in" style={{ animationDelay:".12s" }}>
          <div className="db-card-header">
            <span className="db-card-title">Top moving items</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            {loading ? (
              <div style={{ padding:20, display:"flex", flexDirection:"column", gap:10 }}>
                {[...Array(5)].map((_, i) => <div key={i} className="db-skeleton" style={{ height:36 }} />)}
              </div>
            ) : (
              <table className="db-table" style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    <th>Item name</th>
                    <th>Units sold</th>
                    <th>Revenue</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topItems.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight:500 }}>{item.itemName}</td>
                      <td>{item.unitsSold}</td>
                      <td>${Number(item.revenue).toFixed(2)}</td>
                      <td>
                        <span className={`db-stat-pill ${item.trend === "Rising" ? "pill-green" : "pill-red"}`}>
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
        <div className="db-card db-fade-in" style={{ animationDelay:".15s" }}>
          <div className="db-card-header">
            <span className="db-card-title">Stock in / out</span>
          </div>
          <div style={{ padding:20 }}>
            {loading ? (
              <div className="db-skeleton" style={{ height:260 }} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize:12, fill:chartText, fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:12, fill:chartText, fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltip} />
                  <Legend wrapperStyle={{ fontSize:12, fontFamily:"'DM Sans',sans-serif", color:"var(--app-muted)" }} />
                  <Bar dataKey="stockIn"  name="Stock In"  fill="#0f8c5a" radius={[6,6,0,0]} />
                  <Bar dataKey="stockOut" name="Stock Out" fill="#f59e0b" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="db-card db-fade-in" style={{ animationDelay:".18s" }}>
          <div className="db-card-header">
            <span className="db-card-title">Stock value over time</span>
          </div>
          <div style={{ padding:20 }}>
            {loading ? (
              <div className="db-skeleton" style={{ height:260 }} />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:12, fill:chartText, fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:12, fill:chartText, fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Stock Value"]} contentStyle={chartTooltip} />
                  <Line type="monotone" dataKey="totalValue" name="Stock Value" stroke="#0f8c5a" strokeWidth={2.5} dot={{ r:4, fill:"#0f8c5a", strokeWidth:0 }} activeDot={{ r:6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
