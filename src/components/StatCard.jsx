export function StatCard({ title, value, change, icon, iconColor = '#15aaad', iconBgColor = 'bg-[#15aaad]/10' }) {
  const isPositive = change > 0;
  const Icon = icon;

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <span>{isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-sm text-gray-600">{title}</div>
        <div className="text-2xl font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}