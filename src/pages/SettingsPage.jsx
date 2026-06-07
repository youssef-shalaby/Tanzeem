import {
  Store,
  Shield,
  Bell,
  Users,
  MapPin,
  ChevronDown,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  Smartphone,
  Clock,
  AlertCircle,
  Mail,
  Check,
  Plus,
  Sparkles,
  Zap,
  Bot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

// ============================
// Design system styles (green accent)
// ============================
const SETTINGS_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .settings-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
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
  .db-input {
    width: 100%; padding: 9px 14px;
    background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s;
  }
  .db-input:focus { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
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
`;

// ─── Shared Toggle Component ───────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled = false }) => (
  <label
    className={`relative inline-flex items-center ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0f8c5a]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f8c5a]" />
  </label>
);

// ─── View-Only Banner ──────────────────────────────────────────────────────
const ViewOnlyBanner = ({ message }) => (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-sm font-medium text-blue-900">View Only Access</p>
      <p className="text-xs text-blue-700 mt-1">{message}</p>
    </div>
  </div>
);

// ─── Shared Tab Bar ────────────────────────────────────────────────────────
const TabBar = ({ tabs, activeTab, setActiveTab }) => (
  <div className="px-8">
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
              isActive ? "text-[#0f8c5a]" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0f8c5a] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Shared: Security Tab ──────────────────────────────────────────────────
const SecurityTab = ({ sessions }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Security</h2>
        <p className="text-sm text-gray-600">
          Manage your password and security preferences.
        </p>
      </div>

      {/* Change Password */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Change Password</span>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Update your password regularly to keep your account secure
              </p>
            </div>
          </div>
          {["Current Password", "New Password", "Confirm New Password"].map(
            (label) => (
              <div key={label}>
                <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                  {label}
                </label>
                <input
                  type="password"
                  placeholder={`Enter ${label.toLowerCase()}`}
                  className="db-input"
                />
              </div>
            ),
          )}
          <button className="db-primary-btn">Update Password</button>
        </div>
      </div>

      {/* 2FA */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Two-Factor Authentication</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Add an extra layer of security
                </p>
                <p className="text-xs text-gray-600">
                  Protect your account with two-factor authentication
                </p>
              </div>
            </div>
            <Toggle
              checked={twoFactorEnabled}
              onChange={(e) => setTwoFactorEnabled(e.target.checked)}
            />
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-blue-800 font-medium">
                    2FA is enabled
                  </p>
                  <p className="text-xs text-blue-700 mt-0.5">
                    You'll need a verification code from your authenticator app
                    on sign-in.
                  </p>
                  <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-800">
                    View Recovery Codes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="db-card db-fade-in">
        <div className="db-card-header">
          <span className="db-card-title">Active Sessions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="db-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Location</th>
                <th>Last Active</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td className="font-medium">{session.device}</td>
                  <td>{session.location}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${session.status === "active" ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span>{session.lastActive}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Helper: getToken ──────────────────────────────────────────────────────
function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

// ─── ADMIN Settings ────────────────────────────────────────────────────────
function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store-info");
  const [formData, setFormData] = useState({
    storeName: "Tanzeem Global Logistics",
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    supportEmail: "support@tanzeemlogistics.com",
  });
  const [managers, setManagers] = useState([
    {
      id: 1,
      name: "David Chen",
      email: "david.c@tanzeem.com",
      role: "MANAGER",
      avatar: "👨‍💼",
    },
  ]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    {
      id: 1,
      userId: "USR001",
      firstName: "John",
      lastName: "Admin",
      email: "john@tanzeem.com",
      phone: "+971-50-123-4567",
      role: "admin",
      status: "active",
      lastActive: "2 hours ago",
    },
    {
      id: 2,
      userId: "USR002",
      firstName: "Sarah",
      lastName: "Manager",
      email: "sarah@tanzeem.com",
      phone: "+971-50-234-5678",
      role: "manager",
      status: "active",
      lastActive: "5 hours ago",
    },
    {
      id: 3,
      userId: "USR003",
      firstName: "Mike",
      lastName: "Staff",
      email: "mike@tanzeem.com",
      phone: "+971-50-345-6789",
      role: "staff",
      status: "active",
      lastActive: "1 day ago",
    },
  ]);
  const [newUser, setNewUser] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "staff",
  });
  const [sessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "Dubai, UAE",
      lastActive: "Active now",
      status: "active",
    },
    {
      id: 2,
      device: "Safari on MacBook Pro",
      location: "Dubai, UAE",
      lastActive: "2 hours ago",
      status: "active",
    },
    {
      id: 3,
      device: "Mobile App on iPhone",
      location: "Abu Dhabi, UAE",
      lastActive: "1 day ago",
      status: "inactive",
    },
  ]);
  const [alertSettings, setAlertSettings] = useState(null);
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertSaveMsg, setAlertSaveMsg] = useState("");
  const [aiSettings, setAiSettings] = useState(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaveMsg, setAiSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/AlertConfigurations", {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAlertSettings(data);
      })
      .catch(() => {});
    fetch("/api/AIConfigurations", {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAiSettings(data);
      })
      .catch(() => {});
  }, []);

  const handleSaveAlertSettings = () => {
    if (!alertSettings) return;
    setAlertSaving(true);
    fetch("/api/AlertConfigurations", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(alertSettings),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => {
        setAlertSaveMsg("Saved!");
        setTimeout(() => setAlertSaveMsg(""), 2000);
      })
      .catch(() => {
        setAlertSaveMsg("Failed to save.");
        setTimeout(() => setAlertSaveMsg(""), 3000);
      })
      .finally(() => setAlertSaving(false));
  };

  const handleSaveAiSettings = () => {
    if (!aiSettings) return;
    setAiSaving(true);
    fetch("/api/AIConfigurations", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(aiSettings),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => {
        setAiSaveMsg("Saved!");
        setTimeout(() => setAiSaveMsg(""), 2000);
      })
      .catch(() => {
        setAiSaveMsg("Failed to save.");
        setTimeout(() => setAiSaveMsg(""), 3000);
      })
      .finally(() => setAiSaving(false));
  };

  const tabs = [
    { id: "store-info", icon: Store, label: "Store Info" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "alert-configurations", icon: Bell, label: "Alert Configurations" },
    { id: "user-management", icon: Users, label: "User Management" },
    { id: "ai-features", icon: Sparkles, label: "AI Features" },
  ];

  const getRoleBadgeStyle = (role) =>
    ({
      admin: "bg-purple-100 text-purple-700",
      manager: "bg-blue-100 text-blue-700",
      staff: "bg-green-100 text-green-700",
    })[role] || "bg-gray-100 text-gray-700";
  const getRolePermissions = (role) =>
    ({
      admin: "Full system access",
      manager: "Manage inventory, orders, suppliers",
      staff: "View/edit inventory, create orders",
    })[role] || "";

  const handleAddUser = () => {
    if (
      !newUser.userId ||
      !newUser.firstName ||
      !newUser.lastName ||
      !newUser.email ||
      !newUser.phone
    ) {
      alert("Please fill in all required fields");
      return;
    }
    const user = {
      id: users.length + 1,
      ...newUser,
      status: "active",
      lastActive: "Just now",
    };
    setUsers([user, ...users]);
    setNewUser({
      userId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "staff",
    });
    setShowAddUserModal(false);
    alert(
      `User "${user.firstName} ${user.lastName}" has been added successfully!`,
    );
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)));
    setShowEditUserModal(false);
    setSelectedUser(null);
    alert("User updated successfully!");
  };

  const handleDeleteUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (
      confirm(
        `Are you sure you want to delete ${user?.firstName} ${user?.lastName}?`,
      )
    ) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u,
      ),
    );
  };

  return (
    <div className="settings-root">
      <style>{SETTINGS_STYLES}</style>
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto bg-[#f6f8fa]">
        <div className="max-w-5xl mx-auto p-8 space-y-6">
          {/* Store Info */}
          {activeTab === "store-info" && (
            <>
              <div>
                <h2 className="db-section-title">Store Information</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Update your logistics center details and operational workspace
                  settings.
                </p>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Store Details</span>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Store Name
                    </label>
                    <input
                      type="text"
                      value={formData.storeName}
                      onChange={(e) =>
                        setFormData({ ...formData, storeName: e.target.value })
                      }
                      className="db-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                        Location
                      </label>
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[#0f8c5a]/20 focus-within:border-[#0f8c5a] bg-white">
                        <div className="pl-3">
                          <MapPin className="w-4 h-4 text-[#0f8c5a]" />
                        </div>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              location: e.target.value,
                            })
                          }
                          className="flex-1 py-2 pr-3 text-sm bg-transparent focus:outline-none"
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                        Timezone
                      </label>
                      <div className="relative">
                        <select
                          value={formData.timezone}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              timezone: e.target.value,
                            })
                          }
                          className="db-select w-full"
                        >
                          <option>GST (UTC+4)</option>
                          <option>EST (UTC-5)</option>
                          <option>PST (UTC-8)</option>
                          <option>GMT (UTC+0)</option>
                          <option>IST (UTC+5:30)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supportEmail: e.target.value,
                        })
                      }
                      className="db-input"
                    />
                  </div>
                </div>
              </div>

              {/* Key Contacts */}
              <div className="db-card db-fade-in">
                <div className="db-card-header flex items-center justify-between">
                  <span className="db-card-title">Key Contacts</span>
                  <button className="db-primary-btn">
                    <UserPlus className="w-4 h-4" /> Add Manager
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managers.map((manager) => (
                        <tr key={manager.id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">
                                {manager.avatar}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {manager.name}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {manager.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="db-stat-pill bg-[#0f8c5a]/10 text-[#0f8c5a]">
                              {manager.role}
                            </span>
                          </td>
                          <td className="text-right">
                            <button className="db-icon-btn">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">
                  Last updated: October 24, 2023
                </p>
                <div className="flex gap-3">
                  <button className="db-secondary-btn">Discard</button>
                  <button className="db-primary-btn">Save Changes</button>
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && <SecurityTab sessions={sessions} />}

          {/* Alert Configurations */}
          {activeTab === "alert-configurations" && (
            <div className="space-y-6">
              <div>
                <h2 className="db-section-title">Alert Configurations</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set up notifications and alert thresholds for inventory
                  levels.
                </p>
              </div>
              {!alertSettings ? (
                <div className="text-sm text-gray-500 p-6">
                  Loading alert configurations...
                </div>
              ) : (
                <>
                  <div className="db-card db-fade-in">
                    <div className="db-card-header">
                      <span className="db-card-title">
                        Stock Level Thresholds
                      </span>
                    </div>
                    <div className="p-6 space-y-5">
                      {[
                        {
                          key: "lowStockThreshold",
                          label: "Low Stock Threshold",
                          unit: "units",
                          hint: "Alert when stock falls below this quantity",
                        },
                        {
                          key: "daysBeforeExpiry",
                          label: "Expiry Warning Period",
                          unit: "days before expiry",
                          hint: "Alert when products are nearing expiration date",
                        },
                        {
                          key: "daysWithoutMovement",
                          label: "Dead Stock Threshold",
                          unit: "days without movement",
                          hint: "Alert when products have no movement for this period",
                        },
                      ].map(({ key, label, unit, hint }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                            {label}
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="number"
                              value={alertSettings[key] ?? ""}
                              onChange={(e) =>
                                setAlertSettings({
                                  ...alertSettings,
                                  [key]: parseInt(e.target.value) || 0,
                                })
                              }
                              className="db-input flex-1"
                            />
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {unit}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="db-card db-fade-in">
                    <div className="db-card-header">
                      <span className="db-card-title">
                        Notification Channels
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      {[
                        {
                          key: "isActive_InAppNotifiation",
                          icon: Bell,
                          iconBg: "bg-purple-100",
                          iconColor: "text-purple-600",
                          label: "In-App Notifications",
                          desc: "Alerts inside the dashboard",
                        },
                        {
                          key: "isActive_EmailNotifiation",
                          icon: Mail,
                          iconBg: "bg-green-100",
                          iconColor: "text-green-600",
                          label: "Email Notifications",
                          desc: "Receive alerts via email",
                        },
                      ].map(
                        ({
                          key,
                          icon: Icon,
                          iconBg,
                          iconColor,
                          label,
                          desc,
                        }) => (
                          <div
                            key={key}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}
                              >
                                <Icon className={`w-5 h-5 ${iconColor}`} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {label}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {desc}
                                </div>
                              </div>
                            </div>
                            <Toggle
                              checked={!!alertSettings[key]}
                              onChange={(e) =>
                                setAlertSettings({
                                  ...alertSettings,
                                  [key]: e.target.checked,
                                })
                              }
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="db-card db-fade-in">
                    <div className="db-card-header">
                      <span className="db-card-title">Alert Types</span>
                    </div>
                    <div className="p-6 space-y-3">
                      {[
                        {
                          key: "isActive_LowAlert",
                          label: "Low Stock Alerts",
                          desc: "Get notified when items fall below threshold",
                        },
                        {
                          key: "isActive_OutAlert",
                          label: "Out of Stock Alerts",
                          desc: "Urgent notification when stock reaches zero",
                        },
                        {
                          key: "isActive_ExpiryAlert",
                          label: "Expiry Date Warnings",
                          desc: "Alert before products expire",
                        },
                        {
                          key: "isActive_DeadAlert",
                          label: "Dead Stock Alerts",
                          desc: "Items with no movement for extended period",
                        },
                        {
                          key: "isActive_NewOrderAlert",
                          label: "New Order Alerts",
                          desc: "Notify when new orders are placed",
                        },
                        {
                          key: "isActive_OrderUpdateAlert",
                          label: "Order Update Alerts",
                          desc: "Track order fulfillment progress",
                        },
                      ].map(({ key, label, desc }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {label}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {desc}
                            </div>
                          </div>
                          <Toggle
                            checked={!!alertSettings[key]}
                            onChange={(e) =>
                              setAlertSettings({
                                ...alertSettings,
                                [key]: e.target.checked,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4">
                    {alertSaveMsg && (
                      <span
                        className={`text-sm font-medium ${alertSaveMsg === "Saved!" ? "text-green-600" : "text-red-600"}`}
                      >
                        {alertSaveMsg}
                      </span>
                    )}
                    <button
                      onClick={handleSaveAlertSettings}
                      disabled={alertSaving}
                      className="db-primary-btn"
                    >
                      {alertSaving ? "Saving..." : "Save Alert Settings"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User Management */}
          {activeTab === "user-management" && (
            <div className="space-y-6">
              <div>
                <h2 className="db-section-title">User Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add, edit, and manage user accounts and permissions.
                </p>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Role Permissions</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                      <span className="db-stat-pill bg-purple-100 text-purple-700">
                        Admin
                      </span>
                      <p className="text-xs text-gray-700 mt-2">
                        Full system access, can manage users and settings
                      </p>
                    </div>
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <span className="db-stat-pill bg-blue-100 text-blue-700">
                        Manager
                      </span>
                      <p className="text-xs text-gray-700 mt-2">
                        Manage inventory, orders, and suppliers
                      </p>
                    </div>
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <span className="db-stat-pill bg-green-100 text-green-700">
                        Staff
                      </span>
                      <p className="text-xs text-gray-700 mt-2">
                        View and edit inventory, create orders
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="db-card db-fade-in">
                <div className="db-card-header flex items-center justify-between">
                  <span className="db-card-title">Team Members</span>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="db-primary-btn"
                  >
                    <Plus className="w-4 h-4" /> Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Active</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td>
                            <div className="font-medium">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {user.email}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`db-stat-pill ${getRoleBadgeStyle(user.role)}`}
                            >
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </span>
                          </td>
                          <td>
                            <button
                              onClick={() => handleToggleStatus(user.id)}
                              className={`db-stat-pill ${user.status === "active" ? "pill-green" : "bg-gray-100 text-gray-600"} cursor-pointer`}
                            >
                              {user.status === "active" ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td>{user.lastActive}</td>
                          <td className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowEditUserModal(true);
                                }}
                                className="db-icon-btn"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="db-icon-btn hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-600">
                  Total Users:{" "}
                  <span className="font-medium">{users.length}</span> • Active:{" "}
                  <span className="font-medium text-green-600">
                    {users.filter((u) => u.status === "active").length}
                  </span>{" "}
                  • Inactive:{" "}
                  <span className="font-medium text-gray-500">
                    {users.filter((u) => u.status === "inactive").length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Features */}
          {activeTab === "ai-features" && (
            <div className="space-y-6">
              <div>
                <h2 className="db-section-title">AI Features</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Configure AI-powered features for demand forecasting and
                  intelligent automation.
                </p>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">
                    AI-Powered Inventory Intelligence
                  </span>
                </div>
                <div className="p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0f8c5a]/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#0f8c5a]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      Leverage machine learning to predict demand patterns and
                      automate product categorization.
                    </p>
                  </div>
                </div>
              </div>
              {!aiSettings ? (
                <div className="text-sm text-gray-500 p-6">
                  Loading AI configurations...
                </div>
              ) : (
                <>
                  <div className="db-card db-fade-in">
                    <div className="db-card-header flex items-center justify-between">
                      <span className="db-card-title">Demand Forecasting</span>
                      <Toggle
                        checked={!!aiSettings.demandForecasting}
                        onChange={(e) =>
                          setAiSettings({
                            ...aiSettings,
                            demandForecasting: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="db-card db-fade-in">
                    <div className="db-card-header flex items-center justify-between">
                      <span className="db-card-title">Auto Categorization</span>
                      <Toggle
                        checked={!!aiSettings.autoCategorization}
                        onChange={(e) =>
                          setAiSettings({
                            ...aiSettings,
                            autoCategorization: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4">
                    {aiSaveMsg && (
                      <span
                        className={`text-sm font-medium ${aiSaveMsg === "Saved!" ? "text-green-600" : "text-red-600"}`}
                      >
                        {aiSaveMsg}
                      </span>
                    )}
                    <button
                      onClick={handleSaveAiSettings}
                      disabled={aiSaving}
                      className="db-primary-btn"
                    >
                      {aiSaving ? "Saving..." : "Save AI Settings"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New User
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Create a new team member account
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="USR001"
                  value={newUser.userId}
                  onChange={(e) =>
                    setNewUser({ ...newUser, userId: e.target.value })
                  }
                  className="db-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    className="db-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    className="db-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="user@tanzeem.com"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="db-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+971-50-123-4567"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  className="db-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="db-select w-full"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
                <p className="text-xs text-gray-600 mt-2">
                  {getRolePermissions(newUser.role)}
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setNewUser({
                    userId: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    role: "staff",
                  });
                }}
                className="db-secondary-btn"
              >
                Cancel
              </button>
              <button onClick={handleAddUser} className="db-primary-btn">
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={selectedUser.userId}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, userId: e.target.value })
                  }
                  className="db-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={selectedUser.firstName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        firstName: e.target.value,
                      })
                    }
                    className="db-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={selectedUser.lastName}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        lastName: e.target.value,
                      })
                    }
                    className="db-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className="db-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={selectedUser.phone}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, phone: e.target.value })
                  }
                  className="db-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, role: e.target.value })
                  }
                  className="db-select w-full"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, status: e.target.value })
                  }
                  className="db-select w-full"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditUserModal(false);
                  setSelectedUser(null);
                }}
                className="db-secondary-btn"
              >
                Cancel
              </button>
              <button onClick={handleEditUser} className="db-primary-btn">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MANAGER Settings ──────────────────────────────────────────────────────
function ManagerSettings() {
  const [activeTab, setActiveTab] = useState("store-info");
  const [formData] = useState({
    storeName: "Tanzeem Global Logistics",
    location: "Dubai, UAE",
    timezone: "GST (UTC+4)",
    supportEmail: "support@tanzeemlogistics.com",
  });
  const [sessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "Dubai, UAE",
      lastActive: "Active now",
      status: "active",
    },
    {
      id: 2,
      device: "Safari on MacBook Pro",
      location: "Dubai, UAE",
      lastActive: "2 hours ago",
      status: "active",
    },
    {
      id: 3,
      device: "Mobile App on iPhone",
      location: "Abu Dhabi, UAE",
      lastActive: "1 day ago",
      status: "inactive",
    },
  ]);
  const [alertSettings, setAlertSettings] = useState({
    lowStockThreshold: "20",
    criticalStockThreshold: "5",
    expiryWarningDays: "30",
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
  });
  const [aiSettings, setAiSettings] = useState(null);
  useEffect(() => {
    fetch("/api/AIConfigurations", {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setAiSettings(data);
      })
      .catch(() => {});
  }, []);

  const tabs = [
    { id: "store-info", icon: Store, label: "Store Info" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "alert-configurations", icon: Bell, label: "Alert Configurations" },
    { id: "ai-features", icon: Sparkles, label: "AI Features" },
  ];

  return (
    <div className="settings-root">
      <style>{SETTINGS_STYLES}</style>
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto bg-[#f6f8fa]">
        <div className="max-w-5xl mx-auto p-8 space-y-6">
          {activeTab === "store-info" && (
            <>
              <div>
                <h2 className="db-section-title">Store Information</h2>
                <p className="text-sm text-gray-600 mt-1">
                  View your logistics center details.
                </p>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Store Details</span>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Store Name
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      {formData.storeName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                        Location
                      </label>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">
                        <MapPin className="w-4 h-4 text-[#0f8c5a]" />
                        <span>{formData.location}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                        Timezone
                      </label>
                      <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                        {formData.timezone}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                      Support Email
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      {formData.supportEmail}
                    </div>
                  </div>
                </div>
              </div>
              <ViewOnlyBanner message="Only administrators can modify store information. Contact your admin to request changes." />
            </>
          )}
          {activeTab === "security" && <SecurityTab sessions={sessions} />}
          {activeTab === "alert-configurations" && (
            <div className="space-y-6">
              <div>
                <h2 className="db-section-title">Alert Configurations</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Set up notification thresholds.
                </p>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Stock Level Alerts</span>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    {
                      key: "lowStockThreshold",
                      label: "Low Stock Threshold",
                      unit: "units",
                      hint: "Alert when stock falls below this quantity",
                    },
                    {
                      key: "criticalStockThreshold",
                      label: "Critical Stock Threshold",
                      unit: "units",
                      hint: "Alert for critically low stock",
                    },
                    {
                      key: "expiryWarningDays",
                      label: "Expiry Warning Days",
                      unit: "days",
                      hint: "Get notified before product expiry",
                    },
                  ].map(({ key, label, unit, hint }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">
                        {label}
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={alertSettings[key]}
                          onChange={(e) =>
                            setAlertSettings({
                              ...alertSettings,
                              [key]: e.target.value,
                            })
                          }
                          className="db-input flex-1"
                        />
                        <span className="text-sm text-gray-600">{unit}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{hint}</p>
                    </div>
                  ))}
                  <button className="db-primary-btn">
                    Save Alert Settings
                  </button>
                </div>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Notification Channels</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      label: "Email Notifications",
                      key: "emailNotifications",
                      desc: "Receive alerts via email",
                    },
                    {
                      label: "Push Notifications",
                      key: "pushNotifications",
                      desc: "Browser and mobile app notifications",
                    },
                    {
                      label: "SMS Notifications",
                      key: "smsNotifications",
                      desc: "Text message alerts",
                    },
                  ].map((channel) => (
                    <div
                      key={channel.key}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {channel.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {channel.desc}
                        </div>
                      </div>
                      <Toggle
                        checked={alertSettings[channel.key]}
                        onChange={(e) =>
                          setAlertSettings({
                            ...alertSettings,
                            [channel.key]: e.target.checked,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "ai-features" && (
            <div className="space-y-6">
              <div>
                <h2 className="db-section-title">AI Features</h2>
                <p className="text-sm text-gray-600 mt-1">
                  View AI-powered features.
                </p>
              </div>
              <ViewOnlyBanner message="Only administrators can modify AI feature settings." />
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Active AI Features</span>
                </div>
                <div className="p-6 space-y-4">
                  {!aiSettings ? (
                    <div className="text-sm text-gray-400">Loading...</div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Demand Forecasting
                          </div>
                          <div className="text-xs text-gray-600">
                            Predict future inventory needs
                          </div>
                        </div>
                        <span
                          className={`db-stat-pill ${aiSettings.demandForecasting ? "pill-green" : "bg-gray-100 text-gray-600"}`}
                        >
                          {aiSettings.demandForecasting
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Auto-Categorization
                          </div>
                          <div className="text-xs text-gray-600">
                            Automatically categorize new products
                          </div>
                        </div>
                        <span
                          className={`db-stat-pill ${aiSettings.autoCategorization ? "pill-green" : "bg-gray-100 text-gray-600"}`}
                        >
                          {aiSettings.autoCategorization
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Configuration Details</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      Forecast Period
                    </div>
                    <div className="text-sm text-gray-600">
                      {aiSettings?.forecastPeriod ?? "—"} days
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">
                      Confidence Threshold
                    </div>
                    <div className="text-sm text-gray-600">
                      {aiSettings?.confidenceThreshold ?? "—"}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STAFF Settings ────────────────────────────────────────────────────────
function StaffSettings() {
  const [activeTab, setActiveTab] = useState("security");
  const [sessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "Dubai, UAE",
      lastActive: "Active now",
      status: "active",
    },
    {
      id: 2,
      device: "Mobile App on iPhone",
      location: "Abu Dhabi, UAE",
      lastActive: "1 day ago",
      status: "inactive",
    },
  ]);
  const [alertPreferences, setAlertPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    criticalStockAlerts: true,
    expiryWarnings: true,
  });

  const tabs = [
    { id: "security", icon: Shield, label: "Security" },
    { id: "alert-preferences", icon: Bell, label: "Alert Preferences" },
  ];

  return (
    <div className="settings-root">
      <style>{SETTINGS_STYLES}</style>
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto bg-[#f6f8fa]">
        <div className="max-w-5xl mx-auto p-8 space-y-6">
          {activeTab === "security" && <SecurityTab sessions={sessions} />}
          {activeTab === "alert-preferences" && (
            <>
              <div>
                <h2 className="db-section-title">Alert Preferences</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Customize your personal notification preferences.
                </p>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Notification Channels</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      label: "Email Notifications",
                      key: "emailNotifications",
                      desc: "Receive alerts via email",
                    },
                    {
                      label: "Push Notifications",
                      key: "pushNotifications",
                      desc: "Browser and mobile app notifications",
                    },
                    {
                      label: "SMS Notifications",
                      key: "smsNotifications",
                      desc: "Text message alerts",
                    },
                  ].map((channel) => (
                    <div
                      key={channel.key}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {channel.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {channel.desc}
                        </div>
                      </div>
                      <Toggle
                        checked={alertPreferences[channel.key]}
                        onChange={(e) =>
                          setAlertPreferences({
                            ...alertPreferences,
                            [channel.key]: e.target.checked,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="db-card db-fade-in">
                <div className="db-card-header">
                  <span className="db-card-title">Alert Types</span>
                </div>
                <div className="p-6 space-y-4">
                  {[
                    {
                      label: "Low Stock Alerts",
                      key: "lowStockAlerts",
                      desc: "Get notified when items fall below threshold",
                    },
                    {
                      label: "Critical Stock Alerts",
                      key: "criticalStockAlerts",
                      desc: "Urgent notifications for very low stock",
                    },
                    {
                      label: "Expiry Date Warnings",
                      key: "expiryWarnings",
                      desc: "Alert before products expire",
                    },
                  ].map((alert) => (
                    <div
                      key={alert.key}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {alert.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-0.5">
                          {alert.desc}
                        </div>
                      </div>
                      <Toggle
                        checked={alertPreferences[alert.key]}
                        onChange={(e) =>
                          setAlertPreferences({
                            ...alertPreferences,
                            [alert.key]: e.target.checked,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button className="db-primary-btn">Save Preferences</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────
export function SettingsPage() {
  const { currentUser } = useAuth();
  const role = currentUser?.role?.toLowerCase() ?? "staff";
  const subtitles = {
    admin: "Manage your system preferences and configurations",
    manager: "View system preferences and manage your personal configurations",
    staff: "Manage your personal security and notification preferences",
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="border-b border-gray-200 px-8 py-6">
        <h1 className="db-section-title">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          {subtitles[role] ?? subtitles.staff}
        </p>
      </div>
      {role === "admin" && <AdminSettings key="admin" />}
      {role === "manager" && <ManagerSettings key="manager" />}
      {role === "staff" && <StaffSettings key="staff" />}
    </div>
  );
}
