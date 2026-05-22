import {
  Mail,
  Phone,
  Edit2,
  User as UserIcon,
  Shield,
  IdCard,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// --- Role config ---
const roleConfig = {
  admin: {
    name: "John Admin",
    title: "System Administrator",
    email: "john@tanzeem.com",
    phone: "+971-50-123-4567",
    userId: "USR001",
    avatarGradient: "from-purple-500 to-purple-700",
    roleLabel: "Admin",
    roleBadge: "bg-purple-100 text-purple-700 border-purple-200",
    roleIcon: "text-purple-600",
    roleIconBg: "bg-purple-100",
    permissions: [
      { name: "Manage Inventory", enabled: true },
      { name: "Process Orders", enabled: true },
      { name: "Add/Edit Suppliers", enabled: true },
      { name: "Generate Reports", enabled: true },
      { name: "User Management", enabled: true },
      { name: "System Settings", enabled: true },
      { name: "Alert Configurations", enabled: true },
      { name: "AI Features", enabled: true },
    ],
    activity: [
      {
        action: "Added new user",
        detail: "Sarah Manager added to the system",
        time: "1 hour ago",
        color: "bg-green-500",
      },
      {
        action: "Updated settings",
        detail: "Alert configurations modified",
        time: "3 hours ago",
        color: "bg-blue-500",
      },
      {
        action: "Generated report",
        detail: "Monthly inventory analytics report",
        time: "5 hours ago",
        color: "bg-orange-500",
      },
      {
        action: "Approved order",
        detail: "Order #ORD-045 approved for processing",
        time: "1 day ago",
        color: "bg-purple-500",
      },
      {
        action: "System backup",
        detail: "Database backup completed successfully",
        time: "2 days ago",
        color: "bg-[#15aaad]",
      },
    ],
  },
  manager: {
    name: "Sarah Manager",
    title: "Inventory Manager",
    email: "sarah@tanzeem.com",
    phone: "+971-50-234-5678",
    userId: "USR002",
    avatarGradient: "from-blue-500 to-blue-700",
    roleLabel: "Manager",
    roleBadge: "bg-blue-100 text-blue-700 border-blue-200",
    roleIcon: "text-blue-600",
    roleIconBg: "bg-blue-100",
    permissions: [
      { name: "Manage Inventory", enabled: true },
      { name: "Process Orders", enabled: true },
      { name: "Add/Edit Suppliers", enabled: true },
      { name: "Generate Reports", enabled: true },
      { name: "User Management", enabled: false },
      { name: "System Settings", enabled: false },
      { name: "Alert Configurations", enabled: false },
      { name: "AI Features", enabled: true },
    ],
    activity: [
      {
        action: "Added new item",
        detail: "Wireless Keyboard added to inventory",
        time: "2 hours ago",
        color: "bg-green-500",
      },
      {
        action: "Updated order",
        detail: "Order #ORD-032 status changed to Shipped",
        time: "4 hours ago",
        color: "bg-blue-500",
      },
      {
        action: "Added supplier",
        detail: "Global Tech Solutions added to supplier list",
        time: "6 hours ago",
        color: "bg-purple-500",
      },
      {
        action: "Stock adjustment",
        detail: "Updated stock levels for 12 items",
        time: "1 day ago",
        color: "bg-orange-500",
      },
      {
        action: "Generated report",
        detail: "Weekly inventory summary report",
        time: "2 days ago",
        color: "bg-[#15aaad]",
      },
    ],
  },
  staff: {
    name: "Mike Staff",
    title: "Warehouse Staff",
    email: "mike@tanzeem.com",
    phone: "+971-50-345-6789",
    userId: "USR003",
    avatarGradient: "from-green-500 to-green-700",
    roleLabel: "Staff",
    roleBadge: "bg-green-100 text-green-700 border-green-200",
    roleIcon: "text-green-600",
    roleIconBg: "bg-green-100",
    permissions: [
      { name: "View Inventory", enabled: true },
      { name: "Add Stock", enabled: true },
      { name: "Stock Out Items", enabled: true },
      { name: "View Orders", enabled: true },
      { name: "Process Orders", enabled: false },
      { name: "Add/Edit Suppliers", enabled: false },
      { name: "Generate Reports", enabled: false },
      { name: "User Management", enabled: false },
    ],
    activity: [
      {
        action: "Stock added",
        detail: "Added 50 units of USB-C Cable",
        time: "30 minutes ago",
        color: "bg-green-500",
      },
      {
        action: "Stock out",
        detail: "Removed 15 units of Wireless Mouse",
        time: "2 hours ago",
        color: "bg-orange-500",
      },
      {
        action: "Stock added",
        detail: "Added 100 units of HDMI Cable",
        time: "4 hours ago",
        color: "bg-green-500",
      },
      {
        action: "Stock out",
        detail: "Removed 8 units of Laptop Charger",
        time: "6 hours ago",
        color: "bg-orange-500",
      },
      {
        action: "Inventory check",
        detail: "Verified stock levels for Zone A",
        time: "1 day ago",
        color: "bg-blue-500",
      },
    ],
  },
};

export function ProfilePage() {
  const { currentUser } = useAuth();

  console.log(currentUser);

  // Normalize role to lowercase key; fallback to 'staff'
  const role = currentUser?.role?.toLowerCase() ?? "staff";
  const profile = roleConfig[role] ?? roleConfig.staff;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div
                className={`w-20 h-20 rounded-full bg-gradient-to-br ${profile.avatarGradient} flex items-center justify-center`}
              >
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{profile.title}</p>
                <span className="inline-flex px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium border border-green-200">
                  Active
                </span>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm rounded-lg hover:bg-gray-50 transition-colors">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Email Address</div>
                <div className="text-sm font-medium text-gray-900">
                  {profile.email}
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Phone Number</div>
                <div className="text-sm font-medium text-gray-900">
                  {profile.phone}
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center">
                <IdCard className="w-5 h-5 text-[#15aaad]" />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">User ID</div>
                <div className="text-sm font-medium text-gray-900">
                  {profile.userId}
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full ${profile.roleIconBg} flex items-center justify-center`}
              >
                <Shield className={`w-5 h-5 ${profile.roleIcon}`} />
              </div>
              <div>
                <div className="text-xs text-gray-600 mb-1">Role</div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${profile.roleBadge}`}
                >
                  {profile.roleLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Permissions & Access</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.permissions.map((permission) => (
              <div
                key={permission.name}
                className="flex items-center justify-between p-4 bg-[#f6f8fa] rounded-lg"
              >
                <span className="text-sm text-gray-900">{permission.name}</span>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    permission.enabled
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {permission.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {profile.activity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.color}`}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </div>
                  <div className="text-xs text-gray-600">{activity.detail}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
