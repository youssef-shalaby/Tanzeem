import { useEffect, useState } from "react";
import { StatCard } from "../components/StatCard";
import { DollarSign, AlertTriangle, XCircle, Clock, Sparkles, ArrowRight } from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { Link } from "react-router";
import { apiRequest, ForbiddenError } from "../services/api";
import UnauthorizedPage from "./UnauthorizedPage";

const CATEGORY_COLORS = ["#0f8c5a","#15aaad","#3b82f6","#f59e0b","#ef4444","#6b7280"];

const DB_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .db-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-select {
    padding: 8px 14px; background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #444; cursor: pointer; outline: none; transition: border-color .2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
  }
  .db-select:hover { border-color: #0f8c5a; }
  .db-stat-pill { display:inline-flex; align-items:center; font-size:11px; font-weight:500; padding:3px 8px; border-radius:100px; }
  .pill-green { background:#d6f5e8; color:#0a6b45; }
  .pill-red   { background:#fde8e8; color:#9b1c1c; }
  .pill-amber { background:#fef3c7; color:#8b5e00; }
  .db-table th { font-size:11px; font-weight:500; color:#888; text-transform:uppercase; letter-spacing:.5px; padding:10px 16px; text-align:left; }
  .db-table td { padding:12px 16px; font-size:13px; color:#1a1a18; border-top:1px solid rgba(0,0,0,.05); }
  .db-table tr:hover td { background:#f9faf7; }
  .db-insight-card {
    background: #f9faf7; border-radius: 16px; border: 1px solid rgba(15,140,90,.15);
    padding: 20px 24px; display:flex; align-items:center; justify-content:space-between;
    gap:24px; transition: border-color .2s, box-shadow .2s; text-decoration:none; color:inherit; cursor:pointer;
  }
  .db-insight-card:hover { border-color: #0f8c5a; box-shadow: 0 4px 20px rgba(15,140,90,.08); }
  .db-insight-icon { width:44px; height:44px; border-radius:50%; background:rgba(15,140,90,.1); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .db-skeleton { background: linear-gradient(90deg,#f0f0ec 25%,#e8e8e4 50%,#f0f0ec 75%); background-size:200% 100%; animation: shimmer 1.4s infinite; border-radius:10px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
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

  if (isForbidden) return <UnauthorizedPage />;

  const stats = boxes ? [
    { title: "Total Stock Value",  value: `$${Number(boxes.totalStockValue).toLocaleString()}`, change: 18.2,  icon: DollarSign,   iconColor: "#0f8c5a", iconBgColor: "bg-[#0f8c5a]/10" },
    { title: "Low Stock Count",    value: String(boxes.lowStockCount),                          change: -12.5, icon: AlertTriangle, iconColor: "#f59e0b", iconBgColor: "bg-orange-100" },
    { title: "Dead Stock Count",   value: String(boxes.deadStockCount),                         change: -15.3, icon: XCircle,       iconColor: "#ef4444", iconBgColor: "bg-red-100" },
    { title: "Items Near Expiry",  value: String(boxes.nearExpiryCount),                        change: 5.8,   icon: Clock,         iconColor: "#8b5cf6", iconBgColor: "bg-purple-100" },
  ] : [];

  return (
    <div className="db-root space-y-6" style={{ fontFamily:"'DM Sans',sans-serif" }}>
      <style>{DB_STYLES}</style>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="db-section-title">Dashboard</h1>
        <select className="db-select">
          <option>Last month</option>
          <option>Last 3 months</option>
          <option>Last year</option>
        </select>
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
        <div style={{ display:"flex", alignItems:"center", gap:16, flex:1 }}>
          <div className="db-insight-icon">
            <Sparkles size={20} color="#0f8c5a" />
          </div>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <span style={{ fontSize:14, fontWeight:600, color:"#1a1a18" }}>AI-Powered Demand Forecasting</span>
              <span style={{ fontSize:11, fontWeight:500, padding:"3px 8px", borderRadius:100, background:"#fef3c7", color:"#8b5e00" }}>3 Urgent</span>
            </div>
            <p style={{ fontSize:13, color:"#666", fontWeight:300, lineHeight:1.5, margin:0 }}>
              3 items need restocking within 7 days. View detailed analytics and AI recommendations to optimise your inventory.
            </p>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ textAlign:"center", paddingRight:20, borderRight:"1px solid rgba(0,0,0,.08)" }}>
            <div style={{ fontSize:28, fontWeight:600, color:"#1a1a18", fontFamily:"'DM Serif Display',serif" }}>95.2%</div>
            <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:".5px", marginTop:2 }}>Forecast accuracy</div>
          </div>
          <div style={{ textAlign:"center", paddingLeft:20 }}>
            <div style={{ fontSize:28, fontWeight:600, color:"#0f8c5a", fontFamily:"'DM Serif Display',serif" }}>18</div>
            <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:".5px", marginTop:2 }}>High demand</div>
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
                    <Tooltip contentStyle={{ borderRadius:10, border:"1px solid rgba(0,0,0,.08)", fontSize:12, fontFamily:"'DM Sans',sans-serif" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                  {categoryData.map((item) => (
                    <div key={item.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:item.color, flexShrink:0 }} />
                        <span style={{ fontSize:13, color:"#555" }}>{item.name}</span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:500, color:"#1a1a18" }}>{item.value}</span>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false} />
                  <XAxis dataKey="monthName" tick={{ fontSize:12, fill:"#888", fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:12, fill:"#888", fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius:10, border:"1px solid rgba(0,0,0,.08)", fontSize:12, fontFamily:"'DM Sans',sans-serif" }} />
                  <Legend wrapperStyle={{ fontSize:12, fontFamily:"'DM Sans',sans-serif" }} />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:12, fill:"#888", fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:12, fill:"#888", fontFamily:"'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [`$${Number(v).toLocaleString()}`, "Stock Value"]} contentStyle={{ borderRadius:10, border:"1px solid rgba(0,0,0,.08)", fontSize:12, fontFamily:"'DM Sans',sans-serif" }} />
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