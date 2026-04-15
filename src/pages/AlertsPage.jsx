import { AlertTriangle, Clock, XCircle, Package, CheckCircle, Info, Filter, Bell, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

const initialAlerts = [
  {
    id: 1,
    type: 'critical',
    category: 'Stock',
    icon: AlertTriangle,
    title: 'Critical Low Stock',
    message: 'Wireless Keyboard stock has dropped to 5 units',
    item: 'Wireless Keyboard (SKU: WK-004)',
    currentStock: 5,
    minStock: 20,
    time: '10 minutes ago',
    action: 'Reorder Now',
    unread: true
  },
  {
    id: 2,
    type: 'critical',
    category: 'Stock',
    icon: AlertTriangle,
    title: 'Out of Stock',
    message: 'Desk Lamp is completely out of stock',
    item: 'Desk Lamp (SKU: DL-011)',
    currentStock: 0,
    minStock: 15,
    time: '1 hour ago',
    action: 'Reorder Now',
    unread: true
  },
  {
    id: 3,
    type: 'warning',
    category: 'Expiry',
    icon: Clock,
    title: 'Items Near Expiry',
    message: '12 items will expire within the next 30 days',
    item: 'Various items',
    time: '2 hours ago',
    action: 'View Items',
    unread: true
  },
  {
    id: 4,
    type: 'warning',
    category: 'Stock',
    icon: AlertTriangle,
    title: 'Low Stock Alert',
    message: 'HDMI Cable stock is below minimum threshold',
    item: 'HDMI Cable (SKU: HC-006)',
    currentStock: 12,
    minStock: 25,
    time: '3 hours ago',
    action: 'Review',
    unread: false
  },
  {
    id: 5,
    type: 'info',
    category: 'Orders',
    icon: Package,
    title: 'Pending Order',
    message: 'Order #ORD-002 is awaiting processing',
    item: 'Wireless Mouse',
    time: '5 hours ago',
    action: 'Process Order',
    unread: false
  },
  {
    id: 6,
    type: 'danger',
    category: 'Dead Stock',
    icon: XCircle,
    title: 'Dead Stock Alert',
    message: 'Cable Organizer has not moved in 90 days',
    item: 'Cable Organizer (SKU: CO-012)',
    time: '1 day ago',
    action: 'Take Action',
    unread: false
  },
  {
    id: 11,
    type: 'danger',
    category: 'Dead Stock',
    icon: XCircle,
    title: 'Dead Stock Alert',
    message: 'Phone Holder has not moved in 120 days',
    item: 'Phone Holder - Adjustable (SKU: PH-027)',
    time: '2 days ago',
    action: 'Take Action',
    unread: false
  },
  {
    id: 12,
    type: 'danger',
    category: 'Dead Stock',
    icon: XCircle,
    title: 'Dead Stock Alert',
    message: 'Mouse Pad has not moved in 105 days',
    item: 'Mouse Pad - XL (SKU: MP-009)',
    time: '3 days ago',
    action: 'Take Action',
    unread: false
  },
  {
    id: 7,
    type: 'warning',
    category: 'Stock',
    icon: AlertTriangle,
    title: 'Low Stock Alert',
    message: 'Laptop Charger stock is below minimum threshold',
    item: 'Laptop Charger (SKU: LC-007)',
    currentStock: 8,
    minStock: 20,
    time: '1 day ago',
    action: 'Review',
    unread: false
  },
  {
    id: 8,
    type: 'info',
    category: 'Stock',
    icon: Info,
    title: 'Stock Received',
    message: 'New shipment of 500 USB-C Cables received',
    item: 'USB-C Cable (SKU: UC-003)',
    time: '2 days ago',
    action: 'View Details',
    unread: false
  },
  {
    id: 9,
    type: 'success',
    category: 'Orders',
    icon: CheckCircle,
    title: 'Order Completed',
    message: 'Order #ORD-001 has been successfully delivered',
    item: 'Laptop Stand',
    time: '2 days ago',
    action: 'View Order',
    unread: false
  },
  {
    id: 10,
    type: 'warning',
    category: 'Expiry',
    icon: Clock,
    title: 'Expiry Warning',
    message: 'Mouse Pad batch will expire in 15 days',
    item: 'Mouse Pad (SKU: MP-009)',
    time: '3 days ago',
    action: 'Review',
    unread: false
  },
];

const categories = [
  { id: 'all', name: 'All Alerts', count: 12, icon: Bell },
  { id: 'stock', name: 'Stock Issues', count: 5, icon: Package, color: 'text-red-600' },
  { id: 'expiry', name: 'Expiry Warnings', count: 2, icon: Clock, color: 'text-yellow-600' },
  { id: 'orders', name: 'Order Updates', count: 2, icon: CheckCircle, color: 'text-blue-600' },
  { id: 'dead-stock', name: 'Dead Stock', count: 3, icon: XCircle, color: 'text-orange-600' },
];

const parseAlertItem = (itemString) => {
  const match = itemString.match(/^(.+?)\s*\(SKU:\s*(.+?)\)$/);
  if (match) return { product: match[1].trim(), sku: match[2].trim() };
  return { product: itemString, sku: '' };
};

export function AlertsPage() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredAlerts = alerts.filter(alert => {
    const categoryMatch = selectedCategory === 'all' ||
      alert.category.toLowerCase().replace(' ', '-') === selectedCategory;
    const typeMatch = filterType === 'all' || alert.type === filterType;
    return categoryMatch && typeMatch;
  });

  const unreadCount = alerts.filter(a => a.unread).length;

  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, unread: false })));
  };

  const handleActionClick = (alert) => {
    if (alert.action === 'Reorder Now') {
      const { product, sku } = parseAlertItem(alert.item);
      navigate('/orders/create', {
        state: {
          prefillItem: {
            product,
            sku,
            quantity: alert.minStock || 1,
            price: 0,
          }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alerts & Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread alerts require your attention`
              : 'All alerts have been read'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Mark All as Read
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
            <Filter className="w-[18px] h-[18px]" />
            Filters
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        <div className="bg-white rounded-xl p-5 border border-red-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Critical</div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">2</div>
          <div className="text-xs text-red-600 font-medium">Requires immediate action</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-yellow-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Warnings</div>
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">4</div>
          <div className="text-xs text-yellow-600 font-medium">Review soon</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Dead Stock</div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">3</div>
          <div className="text-xs text-orange-600 font-medium">No movement detected</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Info</div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">2</div>
          <div className="text-xs text-blue-600 font-medium">Updates available</div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">Total Active</div>
            <div className="w-10 h-10 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#15aaad]" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">12</div>
          <div className="text-xs text-gray-600 font-medium">Across all categories</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar - Categories */}
        <div className="col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-2">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'bg-[#15aaad]/10 text-[#15aaad]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-[#15aaad]' : category.color || 'text-gray-500'}`} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#15aaad] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content - Alert List */}
        <div className="col-span-9">
          <div className="bg-white rounded-xl border border-gray-200">
            {/* Filter Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Filter by priority:</span>
                  <div className="flex gap-2">
                    {['all', 'critical', 'warning', 'info'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          filterType === type
                            ? 'bg-[#15aaad] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{filteredAlerts.length} alerts</span>
              </div>
            </div>

            {/* Alerts List */}
            <div className="divide-y divide-gray-100">
              {filteredAlerts.map((alert) => {
                const Icon = alert.icon;

                return (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${alert.unread ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        alert.type === 'critical' || alert.type === 'danger' ? 'bg-red-100' :
                        alert.type === 'warning' ? 'bg-yellow-100' :
                        alert.type === 'info' ? 'bg-blue-100' :
                        alert.type === 'success' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          alert.type === 'critical' || alert.type === 'danger' ? 'text-red-600' :
                          alert.type === 'warning' ? 'text-yellow-600' :
                          alert.type === 'info' ? 'text-blue-600' :
                          alert.type === 'success' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                            {alert.unread && (
                              <span className="w-2 h-2 rounded-full bg-[#15aaad]"></span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{alert.time}</span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{alert.message}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 font-medium">{alert.item}</span>
                            {alert.currentStock !== undefined && (
                              <span className="text-xs text-gray-400">
                                Stock: {alert.currentStock}/{alert.minStock}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleActionClick(alert)}
                            className="flex items-center gap-1 px-3 py-1.5 text-[#15aaad] text-xs font-medium hover:bg-[#15aaad]/5 rounded-md transition-colors"
                          >
                            {alert.action}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}