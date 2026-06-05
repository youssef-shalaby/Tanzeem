"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, Package, AlertCircle, Download, BarChart3, Target, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';


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
    'bg-[#15aaad]',
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

  // Fetch mini dashboard summary stats from the dedicated endpoint
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

  // Fetch top categories from the dedicated endpoint
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

        // Filter out placeholder entries (categoryName === 'string') and deduplicate by name
        const seen = new Set();
        const cleaned = data.filter((c) => {
          if (!c.categoryName || c.categoryName === 'string') return false;
          if (seen.has(c.categoryName)) return false;
          seen.add(c.categoryName);
          return true;
        });

        // Compute bar widths: if all counts are 0 distribute equally, otherwise scale to max
        const maxCount = Math.max(...cleaned.map((c) => c.categoryCount ?? 0));
        const mapped = cleaned.map((c, i) => ({
          category: c.categoryName,
          count: c.categoryCount ?? 0,
          // When counts are all zero show equal bars at 60% to indicate data is present but not counted yet
          percentage: maxCount > 0
            ? Math.round(((c.categoryCount ?? 0) / maxCount) * 90) + 10
            : 60,
          color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        }));

        setTopCategories(mapped);
      })
      .catch(() => {});
  }, []);

  // Paginated table fetch — PascalCase params for ASP.NET Core backend
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
          // API returns confidence as a decimal (e.g. 0.7766) → convert to percentage
          confidence: Math.round((item.confidence ?? 0) * 100),
          trend: item.demand_occurs ? 'up' : (item.segment === 'zero' ? 'down' : 'stable'),
          segment: item.segment,
          recommendedAction: item.demand_occurs
            ? `Order ${item.predicted_units} units`
            : item.segment === 'zero'
            ? 'No demand expected'
            : 'Monitor stock levels',
        }));
        if (mapped.length === 0 && (body.totalCount ?? 0) > 0) {
          console.warn('[AnalyticsPage] data[] is empty but totalCount > 0. Check query param names. Raw body:', JSON.stringify(body));
        }
        setForecastData(mapped);

        const count = body.totalCount ?? 0;
        // Guard against negative/zero/overflow totalPages from the backend
        const pages = body.totalPages > 0
          ? body.totalPages
          : Math.max(1, Math.ceil(count / itemsPerPage));
        setTotalPages(pages);
        setTotalCount(count);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI-Powered Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">Demand forecasting and intelligent insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
          >
            <option value="7days">Next 7 Days</option>
            <option value="30days">Next 30 Days</option>
            <option value="60days">Next 60 Days</option>
            <option value="90days">Next 90 Days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Cards — sourced from Get_mini_dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#15aaad]" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">AI</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{miniDashboard.totalProductForecasted}</div>
          <div className="text-sm text-gray-600">Total Products Forecasted</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Urgent</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{miniDashboard.itemsNeedRestock}</div>
          <div className="text-sm text-gray-600">Items Need Restock</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{miniDashboard.highDemandItems}</div>
          <div className="text-sm text-gray-600">High Demand Items</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">On Track</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">
            {miniDashboard.averageForecastConfidence > 0
              ? `${miniDashboard.averageForecastConfidence}%`
              : '—'}
          </div>
          <div className="text-sm text-gray-600">Avg Forecast Confidence</div>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-[#15aaad]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">AI Recommendation</h3>
            <p className="text-sm text-gray-600 mb-3">
              Based on historical sales patterns and demand forecasting data, review items marked as high demand and restock before stockout occurs. Items with confidence above 90% are highly reliable signals.
            </p>
            <button
              className="px-4 py-2 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors"
              onClick={scrollToForecast}
            >
              View Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Demand Forecast Table */}
      <div id="demand-forecast-table" className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Demand Forecast (Next 30 Days)</h3>
            <span className="text-sm text-gray-500">{totalCount} products</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 animate-pulse bg-gray-100 rounded" />
              ))}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#f6f8fa] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Predicted Demand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Trend</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Segment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">AI Recommendation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {forecastData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-400">
                      No forecast data available.
                    </td>
                  </tr>
                ) : (
                  forecastData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-xs text-gray-500">{item.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-900">{item.predictedDemand}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getTrendColor(item.trend)}`}>
                          {getTrendIcon(item.trend)}
                          <span className="capitalize">{item.trend}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                          <BarChart3 className="w-3.5 h-3.5" />
                          {item.confidence}%
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                          {item.segment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#15aaad]" />
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
        <div className="p-5 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages} — {totalCount} total
          </span>
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Seasonal Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Seasonal Patterns</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { season: 'Q1 2025', trend: 'High demand for office supplies', impact: '+23%', color: 'green' },
                { season: 'Q2 2025', trend: 'Electronics surge expected', impact: '+35%', color: 'blue' },
                { season: 'Q3 2025', trend: 'Furniture orders declining', impact: '-12%', color: 'red' },
                { season: 'Q4 2025', trend: 'Holiday season boost', impact: '+48%', color: 'purple' },
              ].map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    pattern.impact.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {pattern.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Categories — live from Get_Top_Categories_By_Forecast */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Top Categories by Forecast</h3>
          </div>
          <div className="p-6">
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