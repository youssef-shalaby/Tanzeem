"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, Package, AlertCircle, BarChart3, Target, Sparkles } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';

// ============================
// Design system styles (green accent instead of teal)
// ============================
const ANALYTICS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .analytics-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
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
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .forecast-signal-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    border-radius: 14px;
    background: var(--app-soft);
    border: 1px solid var(--app-line);
  }
  .forecast-signal-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .forecast-signal-icon.green { background: var(--app-success-bg); color: var(--app-success-text); }
  .forecast-signal-icon.blue { background: var(--app-info-bg); color: var(--app-info-text); }
  .forecast-signal-icon.amber { background: var(--app-warning-bg); color: var(--app-warning-text); }
  .forecast-signal-icon.red { background: var(--app-danger-bg); color: var(--app-danger-text); }
  .forecast-signal-title { font-size: 13px; font-weight: 650; color: var(--app-ink); }
  .forecast-signal-detail { margin-top: 2px; font-size: 12px; color: var(--app-muted); }
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

const CATEGORY_COLORS = [
  'bg-[#0f8c5a]',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-red-500',
  'bg-yellow-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export function AnalyticsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [forecastData, setForecastData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [miniDashboard, setMiniDashboard] = useState({
    totalProductForecasted: 0,
    itemsNeedRestock: 0,
    highDemandItems: 0,
    averageForecastConfidence: 0,
  });
  const [topCategories, setTopCategories] = useState([]);
  const [topCategoriesLoading, setTopCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  // Fetch mini dashboard summary stats
  useEffect(() => {
    fetch('/api/DemandForecasting/Get_mini_dashboard', {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((body) => {
        if (!body) return;
        setMiniDashboard({
          totalProductForecasted: body.totalProductForecasted ?? 0,
          itemsNeedRestock: body.itemsNeedRestock ?? 0,
          highDemandItems: body.highDemandItems ?? 0,
          averageForecastConfidence: body.averageForecastConfidence ?? 0,
        });
      })
      .catch(() => {});
  }, []);

  // Fetch top categories
  useEffect(() => {
    fetch('/api/DemandForecasting/Get_Top_Categories_By_Forecast', {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (!Array.isArray(data)) {
          setTopCategories([]);
          return;
        }
        const seen = new Set();
        const cleaned = data.reduce((items, category) => {
          const name = String(category.categoryName || "").trim();
          const count = Number(
            category.categoryCount ??
            category.forecastCount ??
            category.totalForecast ??
            category.count ??
            0
          );
          const key = name.toLowerCase();

          if (!name || key === "string" || count <= 0 || seen.has(key)) return items;

          seen.add(key);
          items.push({ categoryName: name, categoryCount: count });
          return items;
        }, []);

        const maxCount = Math.max(1, ...cleaned.map((c) => c.categoryCount));
        const mapped = cleaned.map((c, i) => ({
          category: c.categoryName,
          count: c.categoryCount,
          percentage: Math.max(8, Math.round((c.categoryCount / maxCount) * 100)),
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }));
        setTopCategories(mapped);
      })
      .catch(() => setTopCategories([]))
      .finally(() => setTopCategoriesLoading(false));
  }, []);

  // Paginated table fetch
  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      setLoading(true);

      fetch(`/api/DemandForecasting?page=${currentPage}&page_size=${itemsPerPage}`, {
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch forecast data');
          return res.json();
        })
        .then((body) => {
          if (cancelled) return;
          const mapped = (body.data || []).map((item) => ({
            id: String(item.productId),
            productName: item.productName,
            sku: item.sku,
            predictedDemand: item.predicted_units ?? 0,
            confidence: Math.round((item.confidence ?? 0) * 100),
            segment: item.segment,
          }));
          setForecastData(mapped);
          setTotalCount(body.totalCount ?? 0);
          setTotalPages(body.totalPages > 0 ? body.totalPages : Math.max(1, Math.ceil((body.totalCount ?? 0) / itemsPerPage)));
          setLoading(false);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error('Forecast fetch error:', err);
          setLoading(false);
        });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [currentPage]);

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-700 bg-green-100';
    if (confidence >= 75) return 'text-blue-700 bg-blue-100';
    return 'text-orange-700 bg-orange-100';
  };

  const leadingCategory = topCategories[0];
  const forecastSignals = [
    {
      title: 'Forecast window',
      detail: `${miniDashboard.totalProductForecasted.toLocaleString()} products analyzed`,
      value: 'Next 30 days',
      icon: Target,
      tone: 'green',
      pill: 'pill-green',
    },
    {
      title: 'Leading category',
      detail: leadingCategory
        ? `${leadingCategory.count.toLocaleString()} forecasted units`
        : 'Waiting for category forecast data',
      value: leadingCategory?.category ?? 'No category yet',
      icon: BarChart3,
      tone: 'blue',
      pill: 'pill-blue',
    },
    {
      title: 'Restock pressure',
      detail: 'Items predicted to need stock attention',
      value: `${miniDashboard.itemsNeedRestock.toLocaleString()} items`,
      icon: AlertCircle,
      tone: miniDashboard.itemsNeedRestock > 0 ? 'amber' : 'green',
      pill: miniDashboard.itemsNeedRestock > 0 ? 'pill-yellow' : 'pill-green',
    },
    {
      title: 'Model confidence',
      detail: miniDashboard.averageForecastConfidence > 0
        ? 'Average confidence across forecasted products'
        : 'Confidence will appear after forecasts are generated',
      value: miniDashboard.averageForecastConfidence > 0
        ? `${miniDashboard.averageForecastConfidence}%`
        : 'Pending',
      icon: TrendingUp,
      tone: miniDashboard.averageForecastConfidence >= 75 ? 'green' : 'amber',
      pill: miniDashboard.averageForecastConfidence >= 75 ? 'pill-green' : 'pill-yellow',
    },
  ];

  return (
    <div className="analytics-root space-y-6">
      <style>{ANALYTICS_STYLES}</style>

      {/* Header - removed dropdown and export button */}
      <div className="app-page-header">
        <div className="app-page-heading">
        <h1 className="db-section-title">AI-Powered Analytics</h1>
        <p className="app-page-subtitle">Demand forecasting, restock signals, and intelligent inventory insights.</p>
        </div>
      </div>

      {/* Summary Cards (Dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Total Products Forecasted"
          value={miniDashboard.totalProductForecasted}
          sub="Products analyzed"
          icon={Sparkles}
          iconColor="#0f8c5a"
          iconBgColor="bg-[#0f8c5a]/10"
          className="db-fade-in"
        />
        <StatCard
          title="Items Need Restock"
          value={miniDashboard.itemsNeedRestock}
          sub="Need attention"
          subColor="#d97706"
          icon={AlertCircle}
          iconColor="#f59e0b"
          iconBgColor="bg-orange-100"
          className="db-fade-in"
        />
        <StatCard
          title="High Demand Items"
          value={miniDashboard.highDemandItems}
          sub="Forecasted demand"
          subColor="#0a6b45"
          icon={TrendingUp}
          iconColor="#22c55e"
          iconBgColor="bg-green-100"
          className="db-fade-in"
        />
        <StatCard
          title="Avg Forecast Confidence"
          value={miniDashboard.averageForecastConfidence > 0 ? `${miniDashboard.averageForecastConfidence}%` : '—'}
          sub="Model confidence"
          icon={Target}
          iconColor="#3b82f6"
          iconBgColor="bg-blue-100"
          className="db-fade-in"
        />
      </div>

      {/* Demand Forecast Table */}
      <div id="demand-forecast-table" className="db-card db-fade-in">
        <div className="db-card-header flex items-center justify-between">
          <span className="db-card-title">Demand Forecast (Next 30 Days)</span>
          <span className="text-sm text-gray-500">{totalCount} products</span>
        </div>
        <div className="app-table-frame overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="db-skeleton h-10" />
              ))}
            </div>
          ) : forecastData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              tone="blue"
              title="No forecast data yet"
              message="Demand forecasts appear after products and enough movement history are available."
              actions={[{ label: 'Add product', icon: Package, to: '/add-item' }]}
            />
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Predicted Demand</th>
                  <th>Confidence</th>
                  <th>Segment</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-xs text-gray-500">{item.sku}</div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="font-semibold text-gray-900">{item.predictedDemand}</span>
                        </div>
                      </td>
                      <td>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                          <BarChart3 className="w-3.5 h-3.5" />
                          {item.confidence}%
                        </div>
                      </td>
                      <td>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                          {item.segment}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages} — {totalCount} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="db-icon-btn disabled:opacity-40"
            >
              ‹
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="db-icon-btn disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Seasonal Patterns + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Signals */}
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Forecast Signals</span>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {forecastSignals.map((signal) => {
                const Icon = signal.icon;
                return (
                <div key={signal.title} className="forecast-signal-card">
                  <div className="flex items-center gap-3">
                    <div className={`forecast-signal-icon ${signal.tone}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="forecast-signal-title">{signal.title}</div>
                      <div className="forecast-signal-detail">{signal.detail}</div>
                    </div>
                  </div>
                  <span className={`db-stat-pill ${signal.pill}`}>
                    {signal.value}
                  </span>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Top Categories by Forecast</span>
          </div>
          <div className="p-5">
            {topCategoriesLoading ? (
              <div className="space-y-5">
                {[...Array(4)].map((_, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="db-skeleton h-4 w-36" />
                      <div className="db-skeleton h-4 w-20" />
                    </div>
                    <div className="db-skeleton h-2.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : topCategories.length === 0 ? (
              <EmptyState
                compact
                icon={BarChart3}
                tone="blue"
                title="No category forecast yet"
                message="Category rankings will appear after forecasted demand is available."
              />
            ) : (
              <div className="space-y-5">
                {topCategories.map((cat) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">{cat.category}</div>
                      <div className="text-sm text-gray-600">
                        {cat.count.toLocaleString()} units
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`${cat.color} h-2.5 rounded-full transition-all`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
