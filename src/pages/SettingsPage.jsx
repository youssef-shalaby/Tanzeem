import {
  Store, Shield, Bell, Users, MapPin, ChevronDown, UserPlus, Edit2, Trash2,
  Key, Smartphone, Clock, AlertCircle, Mail, Check, Plus, Sparkles, Zap, Bot
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// ─── Shared Toggle Component ───────────────────────────────────────────────
const Toggle = ({ checked, onChange, disabled = false }) => (
  <label className={`relative inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
    <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#15aaad]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15aaad]" />
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
              isActive ? 'text-[#15aaad]' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#15aaad] rounded-full" />}
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
        <p className="text-sm text-gray-600">Manage your password and security preferences.</p>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <p className="text-sm text-gray-600 mt-1">Update your password regularly to keep your account secure</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {['Current Password', 'New Password', 'Confirm New Password'].map((label) => (
            <div key={label}>
              <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">{label}</label>
              <input type="password" placeholder={`Enter ${label.toLowerCase()}`} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" />
            </div>
          ))}
          <button className="px-6 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors">Update Password</button>
        </div>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
              </div>
            </div>
            <Toggle checked={twoFactorEnabled} onChange={(e) => setTwoFactorEnabled(e.target.checked)} />
          </div>
        </div>
        {twoFactorEnabled && (
          <div className="p-6 bg-blue-50 border-t border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900 font-medium">Two-factor authentication is enabled</p>
                <p className="text-xs text-blue-700 mt-1">You'll need to enter a verification code from your authenticator app when you sign in.</p>
                <button className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">View Recovery Codes</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Sessions</h3>
              <p className="text-sm text-gray-600 mt-1">Manage devices where you're currently logged in</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Device</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Last Active</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{session.device}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{session.location}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span className="text-sm text-gray-600">{session.lastActive}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">Revoke</button>
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

// ─── ADMIN Settings ────────────────────────────────────────────────────────
function AdminSettings() {
  const [activeTab, setActiveTab] = useState('store-info');
  const [formData, setFormData] = useState({ storeName: 'Tanzeem Global Logistics', location: 'Dubai, UAE', timezone: 'GST (UTC+4)', supportEmail: 'support@tanzeemlogistics.com' });
  const [managers, setManagers] = useState([{ id: 1, name: 'David Chen', email: 'david.c@tanzeem.com', role: 'MANAGER', avatar: '👨‍💼' }]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([
    { id: 1, userId: 'USR001', firstName: 'John', lastName: 'Admin', email: 'john@tanzeem.com', phone: '+971-50-123-4567', role: 'admin', status: 'active', lastActive: '2 hours ago' },
    { id: 2, userId: 'USR002', firstName: 'Sarah', lastName: 'Manager', email: 'sarah@tanzeem.com', phone: '+971-50-234-5678', role: 'manager', status: 'active', lastActive: '5 hours ago' },
    { id: 3, userId: 'USR003', firstName: 'Mike', lastName: 'Staff', email: 'mike@tanzeem.com', phone: '+971-50-345-6789', role: 'staff', status: 'active', lastActive: '1 day ago' },
  ]);
  const [newUser, setNewUser] = useState({ userId: '', firstName: '', lastName: '', email: '', phone: '', role: 'staff' });
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Dubai, UAE', lastActive: 'Active now', status: 'active' },
    { id: 2, device: 'Safari on MacBook Pro', location: 'Dubai, UAE', lastActive: '2 hours ago', status: 'active' },
    { id: 3, device: 'Mobile App on iPhone', location: 'Abu Dhabi, UAE', lastActive: '1 day ago', status: 'inactive' },
  ]);
  // Alert Configurations — from API
  const [alertSettings, setAlertSettings] = useState(null);
  const [alertSaving, setAlertSaving] = useState(false);
  const [alertSaveMsg, setAlertSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/AlertConfigurations')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setAlertSettings(data); })
      .catch(() => {});
  }, []);

  const handleSaveAlertSettings = () => {
    if (!alertSettings) return;
    setAlertSaving(true);
    fetch('/api/AlertConfigurations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertSettings),
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(() => { setAlertSaveMsg('Saved!'); setTimeout(() => setAlertSaveMsg(''), 2000); })
      .catch(() => { setAlertSaveMsg('Failed to save.'); setTimeout(() => setAlertSaveMsg(''), 3000); })
      .finally(() => setAlertSaving(false));
  };

  // AI Configurations — from API
  const [aiSettings, setAiSettings] = useState(null);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiSaveMsg, setAiSaveMsg] = useState('');

  useEffect(() => {
    fetch('/api/AIConfigurations')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setAiSettings(data); })
      .catch(() => {});
  }, []);

  const handleSaveAiSettings = () => {
    if (!aiSettings) return;
    setAiSaving(true);
    fetch('/api/AIConfigurations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aiSettings),
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(() => { setAiSaveMsg('Saved!'); setTimeout(() => setAiSaveMsg(''), 2000); })
      .catch(() => { setAiSaveMsg('Failed to save.'); setTimeout(() => setAiSaveMsg(''), 3000); })
      .finally(() => setAiSaving(false));
  };

  const tabs = [
    { id: 'store-info', icon: Store, label: 'Store Info' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'alert-configurations', icon: Bell, label: 'Alert Configurations' },
    { id: 'user-management', icon: Users, label: 'User Management' },
    { id: 'ai-features', icon: Sparkles, label: 'AI Features' },
  ];

  const getRoleBadgeStyle = (role) => ({ admin: 'bg-purple-100 text-purple-700 border-purple-200', manager: 'bg-blue-100 text-blue-700 border-blue-200', staff: 'bg-green-100 text-green-700 border-green-200' }[role] || 'bg-gray-100 text-gray-700 border-gray-200');
  const getRolePermissions = (role) => ({ admin: 'Full system access, can manage users and settings', manager: 'Manage inventory, orders, and suppliers', staff: 'View and edit inventory, create orders' }[role] || '');

  const handleAddUser = () => {
    if (!newUser.userId || !newUser.firstName || !newUser.lastName || !newUser.email || !newUser.phone) { alert('Please fill in all required fields'); return; }
    const user = { id: users.length + 1, ...newUser, status: 'active', lastActive: 'Just now' };
    setUsers([user, ...users]);
    setNewUser({ userId: '', firstName: '', lastName: '', email: '', phone: '', role: 'staff' });
    setShowAddUserModal(false);
    alert(`User "${user.firstName} ${user.lastName}" has been added successfully!`);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setShowEditUserModal(false);
    setSelectedUser(null);
    alert('User updated successfully!');
  };

  const handleDeleteUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (confirm(`Are you sure you want to delete ${user?.firstName} ${user?.lastName}?`)) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const handleToggleStatus = (userId) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  };

  return (
    <>
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 overflow-y-auto bg-[#f6f8fa]">
        <div className="max-w-5xl mx-auto p-8">

          {/* Store Info */}
          {activeTab === 'store-info' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Store Information</h2>
                <p className="text-sm text-gray-600">Update your logistics center details and operational workspace settings.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Store Name</label>
                  <input type="text" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Timezone</label>
                    <div className="relative">
                      <select value={formData.timezone} onChange={(e) => setFormData({ ...formData, timezone: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]">
                        <option>GST (UTC+4)</option><option>EST (UTC-5)</option><option>PST (UTC-8)</option><option>GMT (UTC+0)</option><option>IST (UTC+5:30)</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Support Email</label>
                  <input type="email" value={formData.supportEmail} onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" />
                </div>
              </div>

              {/* Key Contacts */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Key Contacts</h3>
                    <p className="text-sm text-gray-600 mt-1">Assigned managers for this store location</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors">
                    <UserPlus className="w-4 h-4" /> Add Manager
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Role</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wide">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managers.map((manager) => (
                        <tr key={manager.id} className="border-b border-gray-100 last:border-0">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg">{manager.avatar}</div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                                <div className="text-xs text-gray-600">{manager.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-[#15aaad]/10 text-[#15aaad]">{manager.role}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-gray-600" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">Last updated: October 24, 2023</p>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Discard</button>
                  <button className="px-6 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && <SecurityTab sessions={sessions} />}

          {/* Alert Configurations */}
          {activeTab === 'alert-configurations' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Alert Configurations</h2>
                <p className="text-sm text-gray-600">Set up notifications and alert thresholds for inventory levels.</p>
              </div>

              {!alertSettings ? (
                <div className="text-sm text-gray-500 p-6">Loading alert configurations...</div>
              ) : (<>
                {/* Thresholds */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-orange-600" /></div>
                      <div><h3 className="text-lg font-semibold text-gray-900">Stock Level Thresholds</h3><p className="text-sm text-gray-600 mt-1">Configure automatic alerts for inventory levels</p></div>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    {[
                      { key: 'lowStockThreshold',   label: 'Low Stock Threshold',   unit: 'units',            hint: 'Alert when stock falls below this quantity' },
                      { key: 'daysBeforeExpiry',     label: 'Expiry Warning Period', unit: 'days before expiry', hint: 'Alert when products are nearing expiration date' },
                      { key: 'daysWithoutMovement',  label: 'Dead Stock Threshold',  unit: 'days without movement', hint: 'Alert when products have no movement for this period' },
                    ].map(({ key, label, unit, hint }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">{label}</label>
                        <div className="flex items-center gap-4">
                          <input type="number" value={alertSettings[key] ?? ''} onChange={(e) => setAlertSettings({ ...alertSettings, [key]: parseInt(e.target.value) || 0 })} className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" />
                          <span className="text-sm text-gray-600 whitespace-nowrap">{unit}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">{hint}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification Channels */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Bell className="w-5 h-5 text-blue-600" /></div>
                      <div><h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3><p className="text-sm text-gray-600 mt-1">Choose how you want to receive alerts</p></div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { key: 'isActive_InAppNotifiation', icon: Bell, iconBg: 'bg-purple-100', iconColor: 'text-purple-600', label: 'In-App Notifications', desc: 'Alerts inside the dashboard' },
                      { key: 'isActive_EmailNotifiation', icon: Mail, iconBg: 'bg-green-100',  iconColor: 'text-green-600',  label: 'Email Notifications',   desc: 'Receive alerts via email' },
                    ].map(({ key, icon: Icon, iconBg, iconColor, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}><Icon className={`w-5 h-5 ${iconColor}`} /></div>
                          <div><div className="text-sm font-medium text-gray-900">{label}</div><div className="text-xs text-gray-600 mt-1">{desc}</div></div>
                        </div>
                        <Toggle checked={!!alertSettings[key]} onChange={(e) => setAlertSettings({ ...alertSettings, [key]: e.target.checked })} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert Type Toggles */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center"><Check className="w-5 h-5 text-indigo-600" /></div>
                      <div><h3 className="text-lg font-semibold text-gray-900">Alert Types</h3><p className="text-sm text-gray-600 mt-1">Enable or disable specific alert categories</p></div>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    {[
                      { key: 'isActive_LowAlert',         label: 'Low Stock Alerts',       desc: 'Get notified when items fall below threshold' },
                      { key: 'isActive_OutAlert',          label: 'Out of Stock Alerts',    desc: 'Urgent notification when stock reaches zero' },
                      { key: 'isActive_ExpiryAlert',       label: 'Expiry Date Warnings',   desc: 'Alert before products expire' },
                      { key: 'isActive_DeadAlert',         label: 'Dead Stock Alerts',      desc: 'Items with no movement for extended period' },
                      { key: 'isActive_NewOrderAlert',     label: 'New Order Alerts',       desc: 'Notify when new orders are placed' },
                      { key: 'isActive_OrderUpdateAlert',  label: 'Order Update Alerts',    desc: 'Track order fulfillment progress' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{label}</div>
                          <div className="text-xs text-gray-600 mt-1">{desc}</div>
                        </div>
                        <Toggle checked={!!alertSettings[key]} onChange={(e) => setAlertSettings({ ...alertSettings, [key]: e.target.checked })} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  {alertSaveMsg && <span className={`text-sm font-medium ${alertSaveMsg === 'Saved!' ? 'text-green-600' : 'text-red-600'}`}>{alertSaveMsg}</span>}
                  <button onClick={handleSaveAlertSettings} disabled={alertSaving} className="px-6 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-50">
                    {alertSaving ? 'Saving...' : 'Save Alert Settings'}
                  </button>
                </div>
              </>)}
            </div>
          )}

          {/* User Management */}
          {activeTab === 'user-management' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">User Management</h2>
                <p className="text-sm text-gray-600">Add, edit, and manage user accounts and permissions.</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><Shield className="w-5 h-5 text-purple-600" /></div>
                    <div><h3 className="text-lg font-semibold text-gray-900">Role Permissions</h3><p className="text-sm text-gray-600 mt-1">Overview of available user roles and their access levels</p></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg"><span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200 mb-2">Admin</span><p className="text-xs text-gray-700">Full system access, can manage users and settings</p></div>
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg"><span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 mb-2">Manager</span><p className="text-xs text-gray-700">Manage inventory, orders, and suppliers</p></div>
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg"><span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 border border-green-200 mb-2">Staff</span><p className="text-xs text-gray-700">View and edit inventory, create orders</p></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div><h3 className="text-lg font-semibold text-gray-900">Team Members</h3><p className="text-sm text-gray-600 mt-1">Manage user accounts and access permissions</p></div>
                  <button onClick={() => setShowAddUserModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors">
                    <Plus className="w-4 h-4" /> Add User
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wide">Last Active</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div><div className="text-xs text-gray-600">{user.email}</div></td>
                          <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleToggleStatus(user.id)} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer transition-colors ${user.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
                              {user.status === 'active' ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{user.lastActive}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { setSelectedUser(user); setShowEditUserModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><Edit2 className="w-4 h-4 text-gray-600" /></button>
                              <button onClick={() => handleDeleteUser(user.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-600" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                  Total Users: <span className="font-medium text-gray-900">{users.length}</span>{' • '}
                  Active: <span className="font-medium text-green-600">{users.filter(u => u.status === 'active').length}</span>{' • '}
                  Inactive: <span className="font-medium text-gray-500">{users.filter(u => u.status === 'inactive').length}</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Features - Admin (editable) */}
          {activeTab === 'ai-features' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Features</h2>
                <p className="text-sm text-gray-600">Configure AI-powered features for demand forecasting and intelligent automation.</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0"><Sparkles className="w-6 h-6 text-[#15aaad]" /></div>
                  <div><h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Inventory Intelligence</h3><p className="text-sm text-gray-600">Leverage machine learning to predict demand patterns and automate product categorization.</p></div>
                </div>
              </div>

              {!aiSettings ? (
                <div className="text-sm text-gray-500 p-6">Loading AI configurations...</div>
              ) : (<>
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><Bot className="w-5 h-5 text-purple-600" /></div>
                      <div><h3 className="text-lg font-semibold text-gray-900">Demand Forecasting</h3><p className="text-sm text-gray-600 mt-1">AI-powered predictions for inventory planning</p></div>
                    </div>
                    <Toggle checked={!!aiSettings.demandForecasting} onChange={(e) => setAiSettings({ ...aiSettings, demandForecasting: e.target.checked })} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Zap className="w-5 h-5 text-blue-600" /></div>
                      <div><h3 className="text-lg font-semibold text-gray-900">Auto Categorization</h3><p className="text-sm text-gray-600 mt-1">Automatically categorize new products using AI</p></div>
                    </div>
                    <Toggle checked={!!aiSettings.autoCategorization} onChange={(e) => setAiSettings({ ...aiSettings, autoCategorization: e.target.checked })} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  {aiSaveMsg && <span className={`text-sm font-medium ${aiSaveMsg === 'Saved!' ? 'text-green-600' : 'text-red-600'}`}>{aiSaveMsg}</span>}
                  <button onClick={handleSaveAiSettings} disabled={aiSaving} className="px-6 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-50">
                    {aiSaving ? 'Saving...' : 'Save AI Settings'}
                  </button>
                </div>
              </>)}
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200"><h2 className="text-xl font-semibold text-gray-900">Add New User</h2><p className="text-sm text-gray-600 mt-1">Create a new team member account</p></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">User ID <span className="text-red-500">*</span></label><input type="text" placeholder="USR001" value={newUser.userId} onChange={(e) => setNewUser({ ...newUser, userId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label><input type="text" placeholder="John" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label><input type="text" placeholder="Doe" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label><input type="email" placeholder="user@tanzeem.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label><input type="tel" placeholder="+971-50-123-4567" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]">
                  <option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option>
                </select>
                <p className="text-xs text-gray-600 mt-2">{getRolePermissions(newUser.role)}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => { setShowAddUserModal(false); setNewUser({ userId: '', firstName: '', lastName: '', email: '', phone: '', role: 'staff' }); }} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleAddUser} className="px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">Add User</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200"><h2 className="text-xl font-semibold text-gray-900">Edit User</h2><p className="text-sm text-gray-600 mt-1">Update user information and permissions</p></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">User ID</label><input type="text" value={selectedUser.userId} onChange={(e) => setSelectedUser({ ...selectedUser, userId: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">First Name</label><input type="text" value={selectedUser.firstName} onChange={(e) => setSelectedUser({ ...selectedUser, firstName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label><input type="text" value={selectedUser.lastName} onChange={(e) => setSelectedUser({ ...selectedUser, lastName: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><input type="email" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input type="tel" value={selectedUser.phone} onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" /></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]">
                  <option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select value={selectedUser.status} onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]">
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => { setShowEditUserModal(false); setSelectedUser(null); }} className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleEditUser} className="px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MANAGER Settings ──────────────────────────────────────────────────────
function ManagerSettings() {
  const [activeTab, setActiveTab] = useState('store-info');
  const [formData] = useState({ storeName: 'Tanzeem Global Logistics', location: 'Dubai, UAE', timezone: 'GST (UTC+4)', supportEmail: 'support@tanzeemlogistics.com' });
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Dubai, UAE', lastActive: 'Active now', status: 'active' },
    { id: 2, device: 'Safari on MacBook Pro', location: 'Dubai, UAE', lastActive: '2 hours ago', status: 'active' },
    { id: 3, device: 'Mobile App on iPhone', location: 'Abu Dhabi, UAE', lastActive: '1 day ago', status: 'inactive' },
  ]);
  const [alertSettings, setAlertSettings] = useState({ lowStockThreshold: '20', criticalStockThreshold: '5', expiryWarningDays: '30', emailNotifications: true, pushNotifications: true, smsNotifications: false });
  const [aiSettings, setAiSettings] = useState(null);
  useEffect(() => {
    fetch('/api/AIConfigurations')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setAiSettings(data); })
      .catch(() => {});
  }, []);

  const tabs = [
    { id: 'store-info', icon: Store, label: 'Store Info' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'alert-configurations', icon: Bell, label: 'Alert Configurations' },
    { id: 'ai-features', icon: Sparkles, label: 'AI Features' },
  ];

  return (
    <>
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto bg-[#f6f8fa]">
        <div className="max-w-5xl mx-auto p-8">

          {/* Store Info - View Only */}
          {activeTab === 'store-info' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Store Information</h2>
                <p className="text-sm text-gray-600">View your logistics center details and operational workspace settings.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Store Name</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">{formData.storeName}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Location</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{formData.location}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Timezone</label>
                    <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">{formData.timezone}</div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">Support Email</label>
                  <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900">{formData.supportEmail}</div>
                </div>
              </div>
              <ViewOnlyBanner message="Only administrators can modify store information. Contact your admin to request changes." />
            </div>
          )}

          {activeTab === 'security' && <SecurityTab sessions={sessions} />}

          {/* Alert Configurations - Manager (limited) */}
          {activeTab === 'alert-configurations' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Alert Configurations</h2>
                <p className="text-sm text-gray-600">Set up notifications and alert thresholds for inventory levels.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-orange-600" /></div>
                    <div><h3 className="text-lg font-semibold text-gray-900">Stock Level Alerts</h3><p className="text-sm text-gray-600 mt-1">Configure automatic alerts for low inventory levels</p></div>
                  </div>
                </div>
                <div className="p-6 space-y-5">
                  {[
                    { key: 'lowStockThreshold', label: 'Low Stock Threshold', unit: 'units', hint: 'Alert when stock falls below this quantity' },
                    { key: 'criticalStockThreshold', label: 'Critical Stock Threshold', unit: 'units', hint: 'Alert for critically low stock requiring immediate action' },
                    { key: 'expiryWarningDays', label: 'Expiry Warning Days', unit: 'days', hint: 'Get notified this many days before product expiry' },
                  ].map(({ key, label, unit, hint }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">{label}</label>
                      <div className="flex items-center gap-4">
                        <input type="number" value={alertSettings[key]} onChange={(e) => setAlertSettings({ ...alertSettings, [key]: e.target.value })} className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]" />
                        <span className="text-sm text-gray-600">{unit}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{hint}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <button className="px-6 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors">Save Alert Settings</button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3><p className="text-sm text-gray-600 mt-1">Choose how you want to receive alerts</p></div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Email Notifications', key: 'emailNotifications', desc: 'Receive alerts via email' },
                    { label: 'Push Notifications', key: 'pushNotifications', desc: 'Browser and mobile app notifications' },
                    { label: 'SMS Notifications', key: 'smsNotifications', desc: 'Text message alerts for critical items' },
                  ].map((channel) => (
                    <div key={channel.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div><div className="text-sm font-medium text-gray-900">{channel.label}</div><div className="text-xs text-gray-600 mt-0.5">{channel.desc}</div></div>
                      <Toggle checked={alertSettings[channel.key]} onChange={(e) => setAlertSettings({ ...alertSettings, [channel.key]: e.target.checked })} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Features - Manager (view only) */}
          {activeTab === 'ai-features' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Features</h2>
                <p className="text-sm text-gray-600">View AI-powered features and intelligent automation settings.</p>
              </div>
              <ViewOnlyBanner message="Only administrators can modify AI feature settings. Contact your admin to request changes." />
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Active AI Features</h3><p className="text-sm text-gray-600 mt-1">Current AI-powered automation status</p></div>
                <div className="p-6 space-y-4">
                  {!aiSettings ? (
                    <div className="text-sm text-gray-400">Loading...</div>
                  ) : [
                    { label: 'Demand Forecasting', enabled: aiSettings.demandForecasting, desc: 'Predict future inventory needs' },
                    { label: 'Auto-Categorization', enabled: aiSettings.autoCategorization, desc: 'Automatically categorize new products' },
                  ].map((feature) => (
                    <div key={feature.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div><div className="text-sm font-medium text-gray-900">{feature.label}</div><div className="text-xs text-gray-600 mt-0.5">{feature.desc}</div></div>
                      <span className={`inline-flex px-3 py-1 rounded-md text-xs font-semibold ${feature.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{feature.enabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Configuration Details</h3><p className="text-sm text-gray-600 mt-1">Current AI model settings</p></div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100"><div className="text-sm font-medium text-gray-900">Forecast Period</div><div className="text-sm text-gray-600">{aiSettings.forecastPeriod} days</div></div>
                  <div className="flex items-center justify-between py-3"><div className="text-sm font-medium text-gray-900">Confidence Threshold</div><div className="text-sm text-gray-600">{aiSettings.confidenceThreshold}%</div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── STAFF Settings ────────────────────────────────────────────────────────
function StaffSettings() {
  const [activeTab, setActiveTab] = useState('security');
  const [sessions] = useState([
    { id: 1, device: 'Chrome on Windows', location: 'Dubai, UAE', lastActive: 'Active now', status: 'active' },
    { id: 2, device: 'Mobile App on iPhone', location: 'Abu Dhabi, UAE', lastActive: '1 day ago', status: 'inactive' },
  ]);
  const [alertPreferences, setAlertPreferences] = useState({ emailNotifications: true, pushNotifications: true, smsNotifications: false, lowStockAlerts: true, criticalStockAlerts: true, expiryWarnings: true });

  const tabs = [
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'alert-preferences', icon: Bell, label: 'Alert Preferences' },
  ];

  return (
    <>
      <TabBar tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 overflow-y-auto bg-[#f6f8fa]">
        <div className="max-w-5xl mx-auto p-8">

          {activeTab === 'security' && <SecurityTab sessions={sessions} />}

          {activeTab === 'alert-preferences' && (
            <div className="space-y-6">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Alert Preferences</h2>
                <p className="text-sm text-gray-600">Customize your personal notification preferences.</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3><p className="text-sm text-gray-600 mt-1">Choose how you want to receive alerts</p></div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Email Notifications', key: 'emailNotifications', desc: 'Receive alerts via email' },
                    { label: 'Push Notifications', key: 'pushNotifications', desc: 'Browser and mobile app notifications' },
                    { label: 'SMS Notifications', key: 'smsNotifications', desc: 'Text message alerts for critical items' },
                  ].map((channel) => (
                    <div key={channel.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div><div className="text-sm font-medium text-gray-900">{channel.label}</div><div className="text-xs text-gray-600 mt-0.5">{channel.desc}</div></div>
                      <Toggle checked={alertPreferences[channel.key]} onChange={(e) => setAlertPreferences({ ...alertPreferences, [channel.key]: e.target.checked })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">Alert Types</h3><p className="text-sm text-gray-600 mt-1">Select which alerts you want to receive</p></div>
                <div className="p-6 space-y-4">
                  {[
                    { label: 'Low Stock Alerts', key: 'lowStockAlerts', desc: 'Get notified when items fall below threshold' },
                    { label: 'Critical Stock Alerts', key: 'criticalStockAlerts', desc: 'Urgent notifications for very low stock' },
                    { label: 'Expiry Date Warnings', key: 'expiryWarnings', desc: 'Alert before products expire' },
                  ].map((alert) => (
                    <div key={alert.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div><div className="text-sm font-medium text-gray-900">{alert.label}</div><div className="text-xs text-gray-600 mt-0.5">{alert.desc}</div></div>
                      <Toggle checked={alertPreferences[alert.key]} onChange={(e) => setAlertPreferences({ ...alertPreferences, [alert.key]: e.target.checked })} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button className="px-6 py-2.5 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors">Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────
export function SettingsPage() {
  const { currentUser } = useAuth();
  const role = currentUser?.role?.toLowerCase() ?? 'staff';

  const subtitles = {
    admin: 'Manage your system preferences and configurations',
    manager: 'View system preferences and manage your personal configurations',
    staff: 'Manage your personal security and notification preferences',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">{subtitles[role] ?? subtitles.staff}</p>
        </div>
      </div>
      {role === 'admin' && <AdminSettings key="admin" />}
      {role === 'manager' && <ManagerSettings key="manager" />}
      {role === 'staff' && <StaffSettings key="staff" />}
    </div>
  );
}