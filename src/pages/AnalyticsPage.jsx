"use client";

import { TrendingUp, TrendingDown, Package, AlertCircle, Download, Calendar, BarChart3, Target, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const scrollToForecast = () => {
    const forecastSection = document.getElementById('demand-forecast-table');
    if (forecastSection) {
      forecastSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const forecastData = [
    {
      id: '1',
      productName: 'Wireless Mouse',
      sku: 'WM-001',
      currentStock: 45,
      predictedDemand: 120,
      confidence: 92,
      trend: 'up',
      recommendedAction: 'Order 100 units',
      daysUntilRestock: 7,
      category: 'Electronics'
    },
    {
      id: '2',
      productName: 'Office Chair',
      sku: 'OC-234',
      currentStock: 120,
      predictedDemand: 85,
      confidence: 88,
      trend: 'stable',
      recommendedAction: 'Maintain current stock',
      daysUntilRestock: 21,
      category: 'Furniture'
    },
    {
      id: '3',
      productName: 'USB-C Cable',
      sku: 'UC-567',
      currentStock: 200,
      predictedDemand: 350,
      confidence: 95,
      trend: 'up',
      recommendedAction: 'Order 200 units',
      daysUntilRestock: 5,
      category: 'Electronics'
    },
    {
      id: '4',
      productName: 'Notebook A4',
      sku: 'NB-890',
      currentStock: 450,
      predictedDemand: 280,
      confidence: 76,
      trend: 'down',
      recommendedAction: 'Reduce next order by 30%',
      daysUntilRestock: 30,
      category: 'Stationery'
    },
    {
      id: '5',
      productName: 'Desk Lamp',
      sku: 'DL-123',
      currentStock: 35,
      predictedDemand: 95,
      confidence: 89,
      trend: 'up',
      recommendedAction: 'Order 75 units',
      daysUntilRestock: 8,
      category: 'Electronics'
    },
    {
      id: '6',
      productName: 'Mechanical Keyboard',
      sku: 'MK-445',
      currentStock: 65,
      predictedDemand: 140,
      confidence: 91,
      trend: 'up',
      recommendedAction: 'Order 90 units',
      daysUntilRestock: 6,
      category: 'Electronics'
    },
    {
      id: '7',
      productName: 'Monitor Stand',
      sku: 'MS-778',
      currentStock: 80,
      predictedDemand: 75,
      confidence: 85,
      trend: 'stable',
      recommendedAction: 'Maintain current stock',
      daysUntilRestock: 18,
      category: 'Furniture'
    },
    {
      id: '8',
      productName: 'Sticky Notes Pack',
      sku: 'SN-223',
      currentStock: 500,
      predictedDemand: 320,
      confidence: 78,
      trend: 'down',
      recommendedAction: 'Reduce next order by 25%',
      daysUntilRestock: 35,
      category: 'Stationery'
    },
    {
      id: '9',
      productName: 'Webcam HD',
      sku: 'WC-556',
      currentStock: 28,
      predictedDemand: 110,
      confidence: 93,
      trend: 'up',
      recommendedAction: 'Order 95 units',
      daysUntilRestock: 4,
      category: 'Electronics'
    },
    {
      id: '10',
      productName: 'Desk Organizer',
      sku: 'DO-889',
      currentStock: 90,
      predictedDemand: 88,
      confidence: 82,
      trend: 'stable',
      recommendedAction: 'Maintain current stock',
      daysUntilRestock: 22,
      category: 'Office Equipment'
    },
    {
      id: '11',
      productName: 'Ergonomic Mouse Pad',
      sku: 'EMP-334',
      currentStock: 150,
      predictedDemand: 95,
      confidence: 79,
      trend: 'down',
      recommendedAction: 'Reduce next order by 20%',
      daysUntilRestock: 28,
      category: 'Office Equipment'
    },
    {
      id: '12',
      productName: 'Laptop Stand',
      sku: 'LS-667',
      currentStock: 42,
      predictedDemand: 130,
      confidence: 90,
      trend: 'up',
      recommendedAction: 'Order 100 units',
      daysUntilRestock: 7,
      category: 'Furniture'
    },
    {
      id: '13',
      productName: 'Pen Set (12pc)',
      sku: 'PS-445',
      currentStock: 380,
      predictedDemand: 250,
      confidence: 74,
      trend: 'down',
      recommendedAction: 'Reduce next order by 35%',
      daysUntilRestock: 40,
      category: 'Stationery'
    },
    {
      id: '14',
      productName: 'Wireless Headphones',
      sku: 'WH-778',
      currentStock: 55,
      predictedDemand: 165,
      confidence: 94,
      trend: 'up',
      recommendedAction: 'Order 120 units',
      daysUntilRestock: 6,
      category: 'Electronics'
    },
    {
      id: '15',
      productName: 'Filing Cabinet',
      sku: 'FC-990',
      currentStock: 25,
      predictedDemand: 40,
      confidence: 86,
      trend: 'stable',
      recommendedAction: 'Order 20 units',
      daysUntilRestock: 15,
      category: 'Furniture'
    },
    {
      id: '16',
      productName: 'Whiteboard Markers',
      sku: 'WBM-112',
      currentStock: 220,
      predictedDemand: 180,
      confidence: 81,
      trend: 'stable',
      recommendedAction: 'Maintain current stock',
      daysUntilRestock: 25,
      category: 'Stationery'
    },
    {
      id: '17',
      productName: 'USB Hub 4-Port',
      sku: 'UH-334',
      currentStock: 95,
      predictedDemand: 175,
      confidence: 92,
      trend: 'up',
      recommendedAction: 'Order 90 units',
      daysUntilRestock: 8,
      category: 'Electronics'
    },
    {
      id: '18',
      productName: 'Bookshelf',
      sku: 'BS-556',
      currentStock: 18,
      predictedDemand: 55,
      confidence: 87,
      trend: 'up',
      recommendedAction: 'Order 45 units',
      daysUntilRestock: 9,
      category: 'Furniture'
    },
    {
      id: '19',
      productName: 'Calculator',
      sku: 'CAL-223',
      currentStock: 140,
      predictedDemand: 90,
      confidence: 77,
      trend: 'down',
      recommendedAction: 'Reduce next order by 30%',
      daysUntilRestock: 32,
      category: 'Office Equipment'
    },
    {
      id: '20',
      productName: 'External SSD 1TB',
      sku: 'SSD-667',
      currentStock: 32,
      predictedDemand: 125,
      confidence: 96,
      trend: 'up',
      recommendedAction: 'Order 100 units',
      daysUntilRestock: 5,
      category: 'Electronics'
    },
    {
      id: '21',
      productName: 'Desk Calendar 2024',
      sku: 'DC-889',
      currentStock: 280,
      predictedDemand: 150,
      confidence: 72,
      trend: 'down',
      recommendedAction: 'Reduce next order by 40%',
      daysUntilRestock: 45,
      category: 'Stationery'
    },
    {
      id: '22',
      productName: 'Portable Charger',
      sku: 'PC-445',
      currentStock: 48,
      predictedDemand: 155,
      confidence: 91,
      trend: 'up',
      recommendedAction: 'Order 115 units',
      daysUntilRestock: 6,
      category: 'Electronics'
    },
    {
      id: '23',
      productName: 'Conference Table',
      sku: 'CT-112',
      currentStock: 8,
      predictedDemand: 22,
      confidence: 84,
      trend: 'stable',
      recommendedAction: 'Order 15 units',
      daysUntilRestock: 20,
      category: 'Furniture'
    },
    {
      id: '24',
      productName: 'Paper Clips Box',
      sku: 'PCB-778',
      currentStock: 420,
      predictedDemand: 280,
      confidence: 75,
      trend: 'down',
      recommendedAction: 'Reduce next order by 35%',
      daysUntilRestock: 38,
      category: 'Stationery'
    },
    {
      id: '25',
      productName: 'HDMI Cable 2m',
      sku: 'HC-334',
      currentStock: 110,
      predictedDemand: 185,
      confidence: 89,
      trend: 'up',
      recommendedAction: 'Order 85 units',
      daysUntilRestock: 10,
      category: 'Electronics'
    },
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>;
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

  const getUrgencyColor = (days) => {
    if (days <= 7) return 'bg-red-100 text-red-700';
    if (days <= 14) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const paginatedForecastData = forecastData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
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
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">95.2%</div>
          <div className="text-sm text-gray-600">Forecast Accuracy</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Urgent</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">3</div>
          <div className="text-sm text-gray-600">Items Need Restock</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">18</div>
          <div className="text-sm text-gray-600">High Demand Items</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">On Track</span>
          </div>
          <div className="text-2xl font-semibold text-gray-900 mb-1">$45.2K</div>
          <div className="text-sm text-gray-600">Optimized Savings</div>
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
              Based on historical sales patterns and upcoming seasonal trends, we recommend increasing stock for Electronics category by 25% and reducing Stationery items by 15% over the next 30 days.
            </p>
            <button className="px-4 py-2 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors" onClick={scrollToForecast}>
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="stationery">Stationery</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f6f8fa] border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Predicted Demand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Trend</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">AI Recommendation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedForecastData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                      <div className="text-xs text-gray-600">{item.sku}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{item.currentStock}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{item.predictedDemand}</div>
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
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.daysUntilRestock)}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {item.daysUntilRestock} days
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#15aaad]" />
                      <span className="text-sm text-gray-900">{item.recommendedAction}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="text-sm text-gray-600">
              Page {currentPage} of {Math.ceil(forecastData.length / itemsPerPage)}
            </div>
            <button
              className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(forecastData.length / itemsPerPage)}
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
                { season: 'Q1 2024', trend: 'High demand for office supplies', impact: '+23%', color: 'green' },
                { season: 'Q2 2024', trend: 'Electronics surge expected', impact: '+35%', color: 'blue' },
                { season: 'Q3 2024', trend: 'Furniture orders declining', impact: '-12%', color: 'red' },
                { season: 'Q4 2024', trend: 'Holiday season boost', impact: '+48%', color: 'purple' },
              ].map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      pattern.color === 'green' ? 'bg-green-100' :
                      pattern.color === 'blue' ? 'bg-blue-100' :
                      pattern.color === 'red' ? 'bg-red-100' :
                      'bg-purple-100'
                    }`}>
                      <TrendingUp className={`w-5 h-5 ${
                        pattern.color === 'green' ? 'text-green-600' :
                        pattern.color === 'blue' ? 'text-blue-600' :
                        pattern.color === 'red' ? 'text-red-600' :
                        'text-purple-600'
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
                    ></div>
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
