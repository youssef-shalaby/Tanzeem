"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, Package, AlertCircle, Download, BarChart3, Target, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');
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
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

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

  const scrollToForecast = () => {
    document.getElementById('demand-forecast-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
        if (!Array.isArray(data)) return;
        const seen = new Set();
        const cleaned = data.filter((c) => {
          if (!c.categoryName || c.categoryName === 'string') return false;
          if (seen.has(c.categoryName)) return false;
          seen.add(c.categoryName);
          return true;
        });
        const maxCount = Math.max(...cleaned.map((c) => c.categoryCount ?? 0));
        const mapped = cleaned.map((c, i) => ({
          category: c.categoryName,
          count: c.categoryCount ?? 0,
          percentage: maxCount > 0
            ? Math.round(((c.categoryCount ?? 0) / maxCount) * 90) + 10
            : 60,
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }));
        setTopCategories(mapped);
      })
      .catch(() => {});
  }, []);

  // Paginated table fetch
  useEffect(() => {
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
        const mapped = (body.data || []).map((item) => ({
          id: String(item.productId),
          productName: item.productName,
          sku: item.sku,
          predictedDemand: item.predicted_units ?? 0,
          confidence: Math.round((item.confidence ?? 0) * 100),
          trend: item.demand_occurs ? 'up' : (item.segment === 'zero' ? 'down' : 'stable'),
          segment: item.segment,
          recommendedAction: item.demand_occurs
            ? `Order ${item.predicted_units} units`
            : item.segment === 'zero'
            ? 'No demand expected'
            : 'Monitor stock levels',
        }));
        setForecastData(mapped);
        setTotalCount(body.totalCount ?? 0);
        setTotalPages(body.totalPages > 0 ? body.totalPages : Math.max(1, Math.ceil((body.totalCount ?? 0) / itemsPerPage)));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Forecast fetch error:', err);
        setLoading(false);
      });
  }, [currentPage]);

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600 bg-green-50';
    if (trend === 'down') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-700 bg-green-100';
    if (confidence >= 75) return 'text-blue-700 bg-blue-100';
    return 'text-orange-700 bg-orange-100';
  };

  return (
    <div className="analytics-root space-y-6">
      <style>{ANALYTICS_STYLES}</style>

      {/* Header - removed dropdown and export button */}
      <div>
        <h1 className="db-section-title">AI-Powered Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">Demand forecasting and intelligent insights</p>
      </div>

      {/* Summary Cards (Dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Total Products Forecasted</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-900">{miniDashboard.totalProductForecasted}</div>
            <div className="w-10 h-10 rounded-full bg-[#0f8c5a]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#0f8c5a]" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Items Need Restock</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-900">{miniDashboard.itemsNeedRestock}</div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">High Demand Items</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-900">{miniDashboard.highDemandItems}</div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Avg Forecast Confidence</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div className="text-2xl font-semibold text-gray-900">
              {miniDashboard.averageForecastConfidence > 0
                ? `${miniDashboard.averageForecastConfidence}%`
                : '—'}
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Banner (green accent) */}
      <div className="db-card db-fade-in">
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#0f8c5a]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[#0f8c5a]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI Recommendation</h3>
            <p className="text-sm text-gray-600 mb-3">
              Based on historical sales patterns and demand forecasting data, review items marked as high demand and restock before stockout occurs. Items with confidence above 90% are highly reliable signals.
            </p>
            <button
              className="db-primary-btn"
              onClick={scrollToForecast}
            >
              View Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Demand Forecast Table */}
      <div id="demand-forecast-table" className="db-card db-fade-in">
        <div className="db-card-header flex items-center justify-between">
          <span className="db-card-title">Demand Forecast (Next 30 Days)</span>
          <span className="text-sm text-gray-500">{totalCount} products</span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="db-skeleton h-10" />
              ))}
            </div>
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Predicted Demand</th>
                  <th>Trend</th>
                  <th>Confidence</th>
                  <th>Segment</th>
                  <th>AI Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No forecast data available.
                    </td>
                  </tr>
                ) : (
                  forecastData.map((item) => (
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
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTrendColor(item.trend)}`}>
                          {getTrendIcon(item.trend)}
                          <span className="capitalize">{item.trend}</span>
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
                      <td>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#0f8c5a]" />
                          <span className="text-sm text-gray-900">{item.recommendedAction}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
        {/* Seasonal Patterns */}
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Seasonal Patterns</span>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {[
                { season: 'Q1 2025', trend: 'High demand for office supplies', impact: '+23%', color: 'green' },
                { season: 'Q2 2025', trend: 'Electronics surge expected', impact: '+35%', color: 'blue' },
                { season: 'Q3 2025', trend: 'Furniture orders declining', impact: '-12%', color: 'red' },
                { season: 'Q4 2025', trend: 'Holiday season boost', impact: '+48%', color: 'purple' },
              ].map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pattern.color === 'green' ? 'bg-green-100' :
                      pattern.color === 'blue' ? 'bg-blue-100' :
                      pattern.color === 'red' ? 'bg-red-100' : 'bg-purple-100'
                    }`}>
                      <TrendingUp className={`w-5 h-5 ${
                        pattern.color === 'green' ? 'text-green-600' :
                        pattern.color === 'blue' ? 'text-blue-600' :
                        pattern.color === 'red' ? 'text-red-600' : 'text-purple-600'
                      }`} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{pattern.season}</div>
                      <div className="text-xs text-gray-600">{pattern.trend}</div>
                    </div>
                  </div>
                  <span className={`db-stat-pill ${pattern.impact.startsWith('+') ? 'pill-green' : 'pill-red'}`}>
                    {pattern.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Top Categories by Forecast</span>
          </div>
          <div className="p-5">
            {topCategories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No category data available.</p>
            ) : (
              <div className="space-y-5">
                {topCategories.map((cat, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-900">{cat.category}</div>
                      <div className="text-sm text-gray-600">
                        {cat.count > 0 ? `${cat.count} units` : 'Pending data'}
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