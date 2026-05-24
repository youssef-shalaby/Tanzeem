"use client";

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Package, AlertCircle, Download, Calendar, BarChart3, Target, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [currentPage, setCurrentPage] = useState(1);
  const [forecastData, setForecastData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const scrollToForecast = () => {
    const forecastSection = document.getElementById('demand-forecast-table');
    if (forecastSection) {
      forecastSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    setLoading(true);
    fetch(`/api/DemandForecasting?page=${currentPage}&page_size=${itemsPerPage}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch forecast data');
        return res.json();
      })
      .then((body) => {
        // Map API fields to the shape the table expects
        const mapped = (body.data || []).map((item) => ({
          id: String(item.productId),
          productName: item.productName,
          sku: item.sku,
          predictedDemand: item.predicted_units ?? 0,
          confidence: Math.round((item.confidence ?? 0) * 100), // 0.7766 → 78
          trend: item.demand_occurs ? 'up' : (item.segment === 'zero' ? 'down' : 'stable'),
          segment: item.segment,
          recommendedAction: item.demand_occurs
            ? `Order ${item.predicted_units} units`
            : item.segment === 'zero'
            ? 'No demand expected'
            : 'Monitor stock levels',
        }));
        setForecastData(mapped);
        setTotalPages(body.totalPages && body.totalPages > 0 ? body.totalPages : 1);
        setTotalCount(body.totalCount || 0);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Forecast fetch error:', err);
        setLoading(false);
      });
  }, [currentPage]);

  // Derived summary counts from current page data
  const urgentCount = forecastData.filter((i) => i.trend === 'up' && i.predictedDemand > 0).length;
  const highDemandCount = forecastData.filter((i) => i.predictedDemand > 50).length;

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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#15aaad]" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">AI</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{totalCount}</div>
          <div className="text-sm text-gray-600">Total Products Forecasted</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Urgent</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{urgentCount}</div>
          <div className="text-sm text-gray-600">Items Need Restock</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">{highDemandCount}</div>
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
            {forecastData.length > 0
              ? `${Math.round(forecastData.reduce((a, i) => a + i.confidence, 0) / forecastData.length)}%`
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
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
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
              disabled={currentPage === totalPages}
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

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Top Categories by Forecast</h3>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              {[
                { category: 'Electronics', demand: 850, percentage: 85, color: 'bg-[#15aaad]' },
                { category: 'Furniture', demand: 520, percentage: 65, color: 'bg-blue-500' },
                { category: 'Stationery', demand: 420, percentage: 52, color: 'bg-purple-500' },
                { category: 'Office Equipment', demand: 310, percentage: 38, color: 'bg-orange-500' },
              ].map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">{cat.category}</div>
                    <div className="text-sm text-gray-600">{cat.demand} units</div>
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
          </div>
        </div>
      </div>
    </div>
  );
}