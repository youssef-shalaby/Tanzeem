import { Link, useLocation } from 'react-router';
import { Package, Box } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Box, label: 'Add Item', path: '/add-item' },
  ];

  return (
    <div className="w-[240px] bg-[#1a1d1f] flex flex-col min-h-screen">
      <div className="px-6 py-6">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-md bg-[#15aaad] flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-lg font-semibold">Tanzeem</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-sm ${
                isActive ? 'bg-[#15aaad] text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}