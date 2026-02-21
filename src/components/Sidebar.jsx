import { Link, useLocation } from "react-router";
import { Package, Box } from "lucide-react";
import logo from '../assets/logo white.svg';

export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { icon: Package, label: "Products", path: "/products" },
    { icon: Box, label: "Add Item", path: "/add-item" },
  ];

  return (
    <div className="w-60 bg-[#1a1d1f] flex flex-col min-h-screen">
      <div className="px-5 py-6">
        <div className="py-6">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src={logo} alt="Tanzeem" className="h-9 w-auto" />
          </Link>
        </div>
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
                isActive
                  ? "bg-[#15aaad] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
