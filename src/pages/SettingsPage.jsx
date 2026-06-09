import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Bell,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardList,
  Key,
  Mail,
  MapPin,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shield,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCog,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ROLE_IDS, ROLE_KEYS, getRoleLabel, normalizeRoleKey, roleToId } from "../config/permissions";
import "../styles/account.css";

const ROLE_OPTIONS = [
  { id: ROLE_IDS.ADMIN, label: "Admin" },
  { id: ROLE_IDS.MANAGER, label: "Manager" },
  { id: ROLE_IDS.STAFF, label: "Staff" },
];

const AUDIT_PAGE_SIZE = 5;

const INITIAL_STORE_INFO = {
  storeName: "Tanzeem Global Logistics",
  location: "Dubai, UAE",
  timezone: "GST (UTC+4)",
  supportEmail: "support@tanzeemlogistics.com",
  phone: "+971-4-123-4567",
  status: "Active",
};

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function getCurrentCompanyId() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.currentUser?.companyId || null;
  } catch {
    return null;
  }
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { ...authHeaders(), ...options.headers } });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function statusClass(status) {
  return String(status || "").toLowerCase() === "active" ? "pill-green" : "pill-gray";
}

function actionPill(action) {
  const normalized = String(action || "").toLowerCase();
  if (normalized.includes("create") || normalized.includes("insert") || normalized.includes("add")) return "pill-green";
  if (normalized.includes("delete") || normalized.includes("remove")) return "pill-red";
  if (normalized.includes("update") || normalized.includes("edit")) return "pill-amber";
  return "pill-blue";
}

function formatTime(value, now = Date.now()) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  const diff = Math.floor((now - date.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return date.toLocaleDateString();
}

function IconBubble({ icon: Icon, tone = "green" }) {
  const tones = {
    green: "bg-[#d6f5e8] text-[#0a6b45]",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`settings-nav-icon ${tones[tone] || tones.green}`}>
      {createElement(Icon, { className: "w-4 h-4" })}
    </span>
  );
}

function Toggle({ checked, onChange, disabled }) {
  return (
    <label className="account-toggle">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
      <span />
    </label>
  );
}

function EmptyState({ icon: Icon = ClipboardList, title, copy }) {
  return (
    <div className="account-empty app-context-panel">
      <div className="account-empty-icon">
        {createElement(Icon, { className: "w-5 h-5" })}
      </div>
      <div className="account-empty-title">{title}</div>
      {copy && <div className="account-empty-copy">{copy}</div>}
    </div>
  );
}

function SectionHead({ title, copy, action }) {
  return (
    <div className="account-section-head">
      <div>
        <h2 className="account-section-title">{title}</h2>
        {copy && <p className="account-section-copy">{copy}</p>}
      </div>
      {action}
    </div>
  );
}

function ViewOnlyBanner({ children }) {
  return (
    <div className="account-banner">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function NumberStepper({ value, readOnly, onChange }) {
  const numericValue = Number(value) || 0;
  const update = (nextValue) => onChange(Math.max(0, nextValue));

  return (
    <div className="account-number-stepper">
      <input
        className="account-input"
        type="number"
        value={value ?? ""}
        readOnly={readOnly}
        onChange={(event) => update(Number(event.target.value) || 0)}
      />
      <div className="account-stepper-controls" aria-hidden={readOnly}>
        <button
          className="account-stepper-btn"
          type="button"
          onClick={() => update(numericValue + 1)}
          disabled={readOnly}
          tabIndex={readOnly ? -1 : 0}
          aria-label="Increase value"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          className="account-stepper-btn"
          type="button"
          onClick={() => update(numericValue - 1)}
          disabled={readOnly || numericValue <= 0}
          tabIndex={readOnly ? -1 : 0}
          aria-label="Decrease value"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function SettingsHero({ roleLabel, currentUser }) {
  const meta = [
    { label: "Signed in as", value: currentUser?.name || "User" },
    { label: "Role", value: roleLabel },
    { label: "Branch", value: currentUser?.branchId ? `Branch ${currentUser.branchId}` : "Current branch" },
  ];

  return (
    <header className="account-hero app-soft-hero">
      <div>
        <span className="account-kicker">
          <Shield className="w-3.5 h-3.5" />
          Workspace control center
        </span>
        <h1 className="account-title">Settings</h1>
        <p className="account-subtitle">
          Manage access, branch details, alert rules, AI behavior, audit trails, and account security from one focused workspace.
        </p>
      </div>
      <div className="account-hero-meta">
        {meta.map((item) => (
          <div className="account-meta-tile" key={item.label}>
            <div className="account-meta-label">{item.label}</div>
            <div className="account-meta-value">{item.value}</div>
          </div>
        ))}
      </div>
    </header>
  );
}

function SettingsNavigation({ tabs, active, onChange }) {
  return (
    <nav className="settings-nav" aria-label="Settings sections">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`settings-nav-button ${active === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="settings-nav-icon">{createElement(tab.icon, { className: "w-4 h-4" })}</span>
          <span>
            <span className="settings-nav-label">{tab.label}</span>
            <span className="settings-nav-desc">{tab.desc}</span>
          </span>
        </button>
      ))}
    </nav>
  );
}

function StoreSettings({ readOnly = false }) {
  const [form, setForm] = useState(INITIAL_STORE_INFO);
  const [company, setCompany] = useState({ name: "", field: "", email: "", phone: "" });
  const [branches, setBranches] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [newBranch, setNewBranch] = useState({ name: "", location: "", phoneNumber: "", email: "", status: "Active" });
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateCompany = (field, value) => setCompany((current) => ({ ...current, [field]: value }));
  const updateBranch = (field, value) => setNewBranch((current) => ({ ...current, [field]: value }));

  const normalizeBranch = (branch) => ({
    id: branch.id ?? branch.Id,
    name: branch.name ?? branch.Name ?? "",
    location: branch.location ?? branch.Location ?? "",
    phoneNumber: branch.phoneNumber ?? branch.PhoneNumber ?? "",
    email: branch.email ?? branch.Email ?? "",
    status: branch.status ?? branch.Status ?? "Active",
    createdAt: branch.createdAt ?? branch.CreatedAt ?? null,
  });

  const normalizeCompany = (data) => ({
    name: data?.name ?? data?.Name ?? "",
    field: data?.field ?? data?.Field ?? "",
    email: data?.email ?? data?.Email ?? "",
    phone: data?.phone ?? data?.Phone ?? "",
  });

  const hydrateWorkspace = useCallback(async () => {
    setWorkspaceLoading(true);
    try {
      const branchData = await apiFetch("/api/Branch/Get-Branches");
      const normalizedBranches = Array.isArray(branchData) ? branchData.map(normalizeBranch) : [];
      setBranches(normalizedBranches);

      const primaryBranch = normalizedBranches[0];
      if (primaryBranch) {
        setForm({
          storeName: primaryBranch.name || INITIAL_STORE_INFO.storeName,
          location: primaryBranch.location || INITIAL_STORE_INFO.location,
          timezone: INITIAL_STORE_INFO.timezone,
          supportEmail: primaryBranch.email || INITIAL_STORE_INFO.supportEmail,
          phone: primaryBranch.phoneNumber || INITIAL_STORE_INFO.phone,
          status: primaryBranch.status || INITIAL_STORE_INFO.status,
        });
        setEditingBranchId(primaryBranch.id ?? null);
      }

      const companyId = getCurrentCompanyId();
      if (companyId) {
        const companyData = await apiFetch(`/api/Company/Get-Company/${companyId}`);
        setCompany(normalizeCompany(companyData));
      }
    } catch (error) {
      console.error("Failed to load workspace settings:", error);
    } finally {
      setWorkspaceLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateWorkspace();
  }, [hydrateWorkspace]);

  const createBranch = async () => {
    const nextErrors = {};
    if (!newBranch.name.trim()) nextErrors.name = "Branch name is required.";
    if (!newBranch.location.trim()) nextErrors.location = "Location is required.";
    if (!newBranch.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (!newBranch.email.trim()) nextErrors.email = "Email is required.";
    if (newBranch.email && !/^\S+@\S+\.\S+$/.test(newBranch.email)) nextErrors.email = "Use a valid email address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setCreating(true);
    setMessage("");
    try {
      await apiFetch("/api/BusinessCore/Create-Additional-Branch", {
        method: "POST",
        body: JSON.stringify(newBranch),
      });
      setMessage("Branch created successfully.");
      setNewBranch({ name: "", location: "", phoneNumber: "", email: "", status: "Active" });
      setErrors({});
      await hydrateWorkspace();
    } catch {
      setMessage("Failed to create branch.");
    } finally {
      setCreating(false);
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  const saveWorkspace = async () => {
    setSavingWorkspace(true);
    setMessage("");
    try {
      const companyId = getCurrentCompanyId();

      if (companyId) {
        await apiFetch(`/api/Company/Update-Company/${companyId}`, {
          method: "PUT",
          body: JSON.stringify(company),
        });
      }

      if (editingBranchId) {
        await apiFetch(`/api/Branch/Update-Branch/${editingBranchId}`, {
          method: "PUT",
          body: JSON.stringify({
            id: editingBranchId,
            name: form.storeName,
            location: form.location,
            phoneNumber: form.phone,
            email: form.supportEmail,
            status: form.status,
          }),
        });
      }

      setMessage("Workspace saved successfully.");
      await hydrateWorkspace();
    } catch {
      setMessage("Failed to save workspace.");
    } finally {
      setSavingWorkspace(false);
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  const editBranch = async (branch) => {
    try {
      const detail = await apiFetch(`/api/Branch/Get-Branch/${branch.id}`);
      const selected = normalizeBranch(detail || branch);
      setEditingBranchId(selected.id);
      setForm({
        storeName: selected.name || "",
        location: selected.location || "",
        timezone: INITIAL_STORE_INFO.timezone,
        supportEmail: selected.email || "",
        phone: selected.phoneNumber || "",
        status: selected.status || "Active",
      });
    } catch {
      setMessage("Failed to load branch details.");
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  const deleteBranch = async (branch) => {
    if (!window.confirm(`Delete ${branch.name || "this branch"}?`)) return;
    try {
      await apiFetch(`/api/Branch/Delete-Branch/${branch.id}`, { method: "DELETE" });
      setMessage("Branch deleted successfully.");
      await hydrateWorkspace();
    } catch {
      setMessage("Failed to delete branch.");
    } finally {
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  const deleteCompany = async () => {
    const companyId = getCurrentCompanyId();
    if (!companyId) {
      setMessage("Company ID is not available.");
      window.setTimeout(() => setMessage(""), 3200);
      return;
    }
    if (!window.confirm("Delete this company workspace? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/Company/Delete-Company/${companyId}`, { method: "DELETE" });
      setMessage("Company deleted successfully.");
    } catch {
      setMessage("Failed to delete company.");
    } finally {
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  const infoFields = [
    { key: "storeName", label: "Branch name", full: true },
    { key: "location", label: "Location", icon: MapPin },
    { key: "timezone", label: "Timezone", type: "select", options: ["GST (UTC+4)", "EST (UTC-5)", "PST (UTC-8)", "GMT (UTC+0)", "IST (UTC+5:30)", "EET (UTC+2)"] },
    { key: "supportEmail", label: "Support email", type: "email", icon: Mail },
    { key: "phone", label: "Phone number", type: "tel", icon: Phone },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
  ];

  return (
    <div className="account-stack">
      <SectionHead
        title="Branch & Workspace"
        copy={readOnly ? "Review branch details for this workspace." : "Update your primary branch profile and create additional branches."}
      />
      {readOnly && <ViewOnlyBanner>Only administrators can modify branch and workspace information.</ViewOnlyBanner>}

      {workspaceLoading && <div className="account-skeleton h-20" />}

      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title">Company profile</div>
            <div className="account-card-copy">Legal and public details for the company workspace.</div>
          </div>
        </div>
        <div className="account-card-body">
          <div className="account-grid-2">
            {[
              { key: "name", label: "Company name" },
              { key: "field", label: "Business field" },
              { key: "email", label: "Company email", type: "email" },
              { key: "phone", label: "Company phone", type: "tel" },
            ].map((field) => (
              <div className="account-field" key={field.key}>
                <label>{field.label}</label>
                <input
                  className="account-input"
                  type={field.type || "text"}
                  value={company[field.key]}
                  readOnly={readOnly}
                  onChange={(event) => updateCompany(field.key, event.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title">Primary branch</div>
            <div className="account-card-copy">Public contact and operating details for this branch.</div>
          </div>
          <span className={`account-pill ${statusClass(form.status)}`}>{form.status}</span>
        </div>
        <div className="account-card-body">
          <div className="account-grid-2">
            {infoFields.map((field) => {
              const control = field.type === "select" ? (
                <select
                  className="account-select"
                  value={form[field.key]}
                  disabled={readOnly}
                  onChange={(event) => updateForm(field.key, event.target.value)}
                >
                  {field.options.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : (
                <input
                  className="account-input"
                  type={field.type || "text"}
                  value={form[field.key]}
                  readOnly={readOnly}
                  onChange={(event) => updateForm(field.key, event.target.value)}
                />
              );

              return (
                <div className={`account-field ${field.full ? "md:col-span-2" : ""}`} key={field.key}>
                  <label>{field.label}</label>
                  {field.icon ? (
                    <div className="account-input-icon">
                      {createElement(field.icon, { className: "w-4 h-4" })}
                      {control}
                    </div>
                  ) : control}
                </div>
              );
            })}
          </div>
          {!readOnly && (
            <div className="account-actions mt-5">
              <button className="account-btn secondary" onClick={() => setForm(INITIAL_STORE_INFO)}>
                <RefreshCcw className="w-4 h-4" />
                Discard
              </button>
              <button className="account-btn primary" onClick={saveWorkspace} disabled={savingWorkspace}>
                <Save className="w-4 h-4" />
                {savingWorkspace ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title">Branches</div>
            <div className="account-card-copy">{branches.length} branches available in this workspace.</div>
          </div>
        </div>
        {branches.length === 0 ? (
          <EmptyState icon={Building2} title="No branches found" copy="Create a branch to start assigning users and operations." />
        ) : (
          <div className="account-table-wrap">
            <table className="account-table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Status</th>
                  {!readOnly && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.id}>
                    <td><strong>{branch.name || "-"}</strong><div className="text-xs text-gray-500">ID {branch.id}</div></td>
                    <td>{branch.location || "-"}</td>
                    <td>{branch.email || "-"}<div className="text-xs text-gray-500">{branch.phoneNumber || "-"}</div></td>
                    <td><span className={`account-pill ${statusClass(branch.status)}`}>{branch.status || "Inactive"}</span></td>
                    {!readOnly && (
                      <td className="text-right">
                        <button className="account-btn secondary mr-2" onClick={() => editBranch(branch)}>Edit</button>
                        <button className="account-btn secondary text-red-600" onClick={() => deleteBranch(branch)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!readOnly && (
        <div className="account-card">
          <div className="account-card-head">
            <div>
              <div className="account-card-title">Create branch</div>
              <div className="account-card-copy">Add a new branch to the company workspace.</div>
            </div>
          </div>
          <div className="account-card-body">
            <div className="account-grid-2">
              {[
                { key: "name", label: "Branch name", placeholder: "Tanzeem Abu Dhabi", full: true },
                { key: "location", label: "Location", placeholder: "Abu Dhabi, UAE" },
                { key: "phoneNumber", label: "Phone number", placeholder: "+971-2-1234567" },
                { key: "email", label: "Email", placeholder: "abudhabi@tanzeem.com", type: "email" },
              ].map((field) => (
                <div className={`account-field ${field.full ? "md:col-span-2" : ""}`} key={field.key}>
                  <label>{field.label}</label>
                  <input
                    className="account-input"
                    type={field.type || "text"}
                    value={newBranch[field.key]}
                    placeholder={field.placeholder}
                    onChange={(event) => updateBranch(field.key, event.target.value)}
                  />
                  {errors[field.key] && <p className="text-xs text-red-600 mt-1">{errors[field.key]}</p>}
                </div>
              ))}
              <div className="account-field">
                <label>Status</label>
                <select className="account-select" value={newBranch.status} onChange={(event) => updateBranch("status", event.target.value)}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="account-actions mt-5">
              {message && (
                <span className={`account-pill ${message.includes("success") ? "pill-green" : "pill-red"}`}>
                  {message.includes("success") ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {message}
                </span>
              )}
              <button className="account-btn primary" onClick={createBranch} disabled={creating}>
                <Plus className="w-4 h-4" />
                {creating ? "Creating..." : "Create branch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="account-card">
          <div className="account-card-head">
            <div>
              <div className="account-card-title text-red-700">Danger zone</div>
              <div className="account-card-copy">Delete the company workspace only when the backend account should be removed.</div>
            </div>
          </div>
          <div className="account-card-body">
            <button className="account-btn secondary text-red-600" onClick={deleteCompany}>
              Delete company
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", phoneNumber: "", role: ROLE_IDS.STAFF, tempPassword: "" });

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await apiFetch("/api/BusinessCore/Get-All-Employees");
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const getEmployeeId = (employee) => {
    const candidates = [employee?.id, employee?.employeeId, employee?.userId, employee?.UserId];
    for (const candidate of candidates) {
      const parsed = Number(candidate);
      if (candidate !== undefined && candidate !== null && !Number.isNaN(parsed)) return parsed;
    }
    return null;
  };

  const roleBadge = (role) => ({
    [ROLE_IDS.ADMIN]: "pill-purple",
    [ROLE_IDS.MANAGER]: "pill-blue",
    [ROLE_IDS.STAFF]: "pill-green",
  }[role] || "pill-gray");

  const filteredEmployees = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return employees.filter((employee) => {
      const text = `${employee.name || ""} ${employee.email || ""} ${employee.phoneNumber || ""} ${employee.branchName || ""} ${employee.branchId || ""}`.toLowerCase();
      const matchesQuery = !needle || text.includes(needle);
      const matchesRole = roleFilter === "all" || Number(employee.role) === Number(roleFilter);
      return matchesQuery && matchesRole;
    });
  }, [employees, query, roleFilter]);

  const createEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.phoneNumber) {
      alert("Please fill name, email, and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: newEmployee.name,
        email: newEmployee.email,
        role: Number(newEmployee.role),
        phoneNumber: newEmployee.phoneNumber,
        ...(newEmployee.tempPassword.trim() ? { tempPassword: newEmployee.tempPassword } : {}),
      };
      await apiFetch("/api/BusinessCore/Create-Employee", { method: "POST", body: JSON.stringify(payload) });
      await fetchEmployees();
      setShowAdd(false);
      setNewEmployee({ name: "", email: "", phoneNumber: "", role: ROLE_IDS.STAFF, tempPassword: "" });
    } catch {
      alert("Failed to create employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEmployee = async (employee) => {
    const id = getEmployeeId(employee);
    if (!id) {
      alert("Invalid employee ID.");
      return;
    }
    try {
      const profile = await apiFetch(`/api/BusinessCore/Get-Employee-Profile/${id}`);
      setEditingEmployee(profile);
    } catch {
      alert("Could not load employee details.");
    }
  };

  const updateEmployee = async () => {
    const id = getEmployeeId(editingEmployee);
    if (!id) {
      alert("Invalid employee ID.");
      return;
    }
    setUpdating(true);
    try {
      await apiFetch(`/api/BusinessCore/Update-Employee/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editingEmployee.name,
          email: editingEmployee.email,
          phoneNumber: editingEmployee.phoneNumber,
          role: Number(editingEmployee.role),
        }),
      });
      await fetchEmployees();
      setEditingEmployee(null);
    } catch {
      alert("Failed to update employee.");
    } finally {
      setUpdating(false);
    }
  };

  const deleteEmployee = async (employee) => {
    const id = getEmployeeId(employee);
    if (!id) {
      alert("Invalid employee ID.");
      return;
    }
    if (!window.confirm(`Delete ${employee.name || employee.email || "this employee"}?`)) return;

    try {
      await apiFetch(`/api/BusinessCore/Delete-Employee/${id}`, { method: "DELETE" });
      await fetchEmployees();
    } catch {
      alert("Failed to delete employee.");
    }
  };

  const assignBranch = async (employee) => {
    const userId = getEmployeeId(employee);
    const branchId = Number(prompt("Enter new Branch ID:"));
    if (!userId || Number.isNaN(branchId)) return;

    setAssigning(true);
    try {
      const response = await fetch(`/api/BusinessCore/Assign-User?userId=${userId}&newBranchId=${branchId}`, {
        method: "PUT",
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await fetchEmployees();
    } catch (error) {
      alert(`Failed to assign branch: ${error.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const activeCount = employees.filter((employee) => String(employee.status).toLowerCase() === "active").length;

  return (
    <div className="account-stack">
      <SectionHead
        title="People & Access"
        copy="Invite team members, review roles, and move people between branches."
        action={<button className="account-btn primary" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" />Add employee</button>}
      />

      <div className="account-grid-3">
        <div className="account-stat"><div className="account-stat-value">{employees.length}</div><div className="account-stat-label">Total employees</div></div>
        <div className="account-stat"><div className="account-stat-value text-[#0f8c5a]">{activeCount}</div><div className="account-stat-label">Active users</div></div>
        <div className="account-stat"><div className="account-stat-value text-[#66706a]">{employees.length - activeCount}</div><div className="account-stat-label">Inactive users</div></div>
      </div>

      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title">Team directory</div>
            <div className="account-card-copy">{filteredEmployees.length} shown from {employees.length} total</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="account-input-icon">
              <Search className="w-4 h-4" />
              <input className="account-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team" />
            </div>
            <div className="account-input-icon">
              <SlidersHorizontal className="w-4 h-4" />
              <select className="account-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="all">All roles</option>
                {ROLE_OPTIONS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, index) => <div className="account-skeleton h-12" key={index} />)}</div>
        ) : filteredEmployees.length === 0 ? (
          <EmptyState icon={Users} title="No employees found" copy="Try a different filter or add a new employee." />
        ) : (
          <div className="account-table-wrap">
            <table className="account-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th>Last active</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={getEmployeeId(employee) || employee.email}>
                    <td><strong>{employee.name}</strong><div className="text-xs text-gray-500">{employee.email}</div></td>
                    <td><span className={`account-pill ${roleBadge(employee.role)}`}>{getRoleLabel(employee.role)}</span></td>
                    <td>{employee.phoneNumber || "-"}</td>
                    <td>
                      {employee.branchId ? `Branch ${employee.branchId}` : employee.branchName || "-"}
                      <button className="account-icon-btn ml-1" onClick={() => assignBranch(employee)} disabled={assigning} title="Assign branch">
                        <Key className="w-3.5 h-3.5" />
                      </button>
                    </td>
                    <td><span className={`account-pill ${statusClass(employee.status)}`}>{employee.status || "Inactive"}</span></td>
                    <td>{employee.lastActive || "-"}</td>
                    <td className="text-right">
                      <button className="account-btn secondary" onClick={() => openEmployee(employee)} title="View employee">
                        View
                      </button>
                      <button className="account-icon-btn ml-1 text-red-600" onClick={() => deleteEmployee(employee)} title="Delete employee">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && (
        <EmployeeModal
          title="Add employee"
          subtitle="Create a team member account and assign a role."
          employee={newEmployee}
          setEmployee={setNewEmployee}
          onClose={() => setShowAdd(false)}
          onSave={createEmployee}
          saving={submitting}
          saveLabel="Add employee"
          allowPassword
        />
      )}

      {editingEmployee && (
        <EmployeeModal
          title="Edit employee"
          subtitle="Update team member details and role."
          employee={editingEmployee}
          setEmployee={setEditingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={updateEmployee}
          saving={updating}
          saveLabel="Save changes"
        />
      )}
    </div>
  );
}

function EmployeeModal({ title, subtitle, employee, setEmployee, onClose, onSave, saving, saveLabel, allowPassword = false }) {
  const setField = (field, value) => setEmployee((current) => ({ ...current, [field]: value }));

  return (
    <div className="account-modal-backdrop">
      <div className="account-modal">
        <div className="account-card-head">
          <div>
            <div className="account-section-title text-[24px]">{title}</div>
            <div className="account-card-copy">{subtitle}</div>
          </div>
          <button className="account-icon-btn" onClick={onClose}><X className="w-4 h-4" /></button>
        </div>
        <div className="account-card-body">
          <div className="account-grid-2">
            <div className="account-field">
              <label>Full name</label>
              <input className="account-input" value={employee.name || ""} onChange={(event) => setField("name", event.target.value)} />
            </div>
            <div className="account-field">
              <label>Email</label>
              <input className="account-input" type="email" value={employee.email || ""} onChange={(event) => setField("email", event.target.value)} />
            </div>
            <div className="account-field">
              <label>Phone</label>
              <input className="account-input" type="tel" value={employee.phoneNumber || ""} onChange={(event) => setField("phoneNumber", event.target.value)} />
            </div>
            <div className="account-field">
              <label>Role</label>
              <select className="account-select" value={employee.role || ROLE_IDS.STAFF} onChange={(event) => setField("role", Number(event.target.value))}>
                {ROLE_OPTIONS.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
            {allowPassword && (
              <div className="account-field md:col-span-2">
                <label>Temporary password</label>
                <input className="account-input" value={employee.tempPassword || ""} onChange={(event) => setField("tempPassword", event.target.value)} placeholder="Auto-generate if left empty" />
              </div>
            )}
          </div>
          <div className="account-actions mt-5">
            <button className="account-btn secondary" onClick={onClose}>Cancel</button>
            <button className="account-btn primary" onClick={onSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : saveLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertConfigurations({ readOnly = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/AlertConfigurations")
      .then(setData)
      .catch(() => setData({
        lowStockThreshold: 20,
        daysBeforeExpiry: 30,
        daysWithoutMovement: 60,
        isActive_InAppNotifiation: true,
        isActive_EmailNotifiation: false,
        isActive_LowAlert: true,
        isActive_OutAlert: true,
        isActive_ExpiryAlert: false,
        isActive_DeadAlert: false,
        isActive_NewOrderAlert: true,
        isActive_OrderUpdateAlert: false,
      }))
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => !readOnly && setData((current) => ({ ...current, [field]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/AlertConfigurations", { method: "PUT", body: JSON.stringify(data) });
      setMessage("Alert settings saved.");
    } catch {
      setMessage("Failed to save alert settings.");
    } finally {
      setSaving(false);
      window.setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <div className="account-skeleton h-80" />;
  if (!data) return <EmptyState icon={Bell} title="Alert settings unavailable" copy="Try again later." />;

  const thresholds = [
    { key: "lowStockThreshold", label: "Low stock threshold", unit: "units", copy: "Alert when stock falls below this quantity." },
    { key: "daysBeforeExpiry", label: "Expiry warning", unit: "days", copy: "Warn before products reach expiration." },
    { key: "daysWithoutMovement", label: "Dead stock threshold", unit: "days", copy: "Flag products without movement." },
  ];
  const channels = [
    { key: "isActive_InAppNotifiation", label: "In-app notifications", copy: "Show alerts inside Tanzeem.", icon: Bell, tone: "purple" },
    { key: "isActive_EmailNotifiation", label: "Email notifications", copy: "Send critical alerts by email.", icon: Mail, tone: "green" },
  ];
  const alertTypes = [
    { key: "isActive_LowAlert", label: "Low stock alerts", copy: "Items fall below threshold." },
    { key: "isActive_OutAlert", label: "Out of stock alerts", copy: "Stock reaches zero." },
    { key: "isActive_ExpiryAlert", label: "Expiry warnings", copy: "Products nearing expiration." },
    { key: "isActive_DeadAlert", label: "Dead stock alerts", copy: "Items with no movement." },
    { key: "isActive_NewOrderAlert", label: "New order alerts", copy: "Orders are placed." },
    { key: "isActive_OrderUpdateAlert", label: "Order update alerts", copy: "Fulfillment status changes." },
  ];

  return (
    <div className="account-stack">
      <SectionHead title="Alerts & Notifications" copy="Tune thresholds, notification channels, and alert types." />
      {readOnly && <ViewOnlyBanner>Only administrators can modify alert settings.</ViewOnlyBanner>}
      <div className="account-card pad">
        <div className="account-grid-3">
          {thresholds.map((item) => (
            <div className="account-field" key={item.key}>
              <label>{item.label}</label>
              <NumberStepper
                value={data[item.key]}
                readOnly={readOnly}
                onChange={(value) => set(item.key, value)}
              />
              <p className="account-card-copy">{item.unit} - {item.copy}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="account-grid-2">
        {channels.map((channel) => (
          <div className="account-card pad flex items-center justify-between gap-4" key={channel.key}>
            <div className="flex items-center gap-3">
              <IconBubble icon={channel.icon} tone={channel.tone} />
              <div>
                <div className="account-card-title">{channel.label}</div>
                <div className="account-card-copy">{channel.copy}</div>
              </div>
            </div>
            <Toggle checked={!!data[channel.key]} onChange={(event) => set(channel.key, event.target.checked)} disabled={readOnly} />
          </div>
        ))}
      </div>
      <div className="account-card">
        <div className="account-card-head"><div className="account-card-title">Alert types</div></div>
        <div className="account-card-body">
          <div className="account-grid-2">
            {alertTypes.map((type) => (
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3" key={type.key}>
                <div>
                  <div className="text-sm font-semibold">{type.label}</div>
                  <div className="account-card-copy">{type.copy}</div>
                </div>
                <Toggle checked={!!data[type.key]} onChange={(event) => set(type.key, event.target.checked)} disabled={readOnly} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {!readOnly && (
        <div className="account-actions">
          {message && <span className={`account-pill ${message.includes("saved") ? "pill-green" : "pill-red"}`}>{message}</span>}
          <button className="account-btn primary" onClick={save} disabled={saving}><Save className="w-4 h-4" />{saving ? "Saving..." : "Save alert settings"}</button>
        </div>
      )}
    </div>
  );
}

function AIFeatures({ readOnly = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/AIConfigurations")
      .then(setData)
      .catch(() => setData({ demandForecasting: true, autoCategorization: false }))
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => !readOnly && setData((current) => ({ ...current, [field]: value }));
  const save = async () => {
    setSaving(true);
    try {
      await apiFetch("/api/AIConfigurations", { method: "PUT", body: JSON.stringify(data) });
      setMessage("AI settings saved.");
    } catch {
      setMessage("Failed to save AI settings.");
    } finally {
      setSaving(false);
      window.setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) return <div className="account-skeleton h-64" />;

  const features = [
    { key: "demandForecasting", icon: Zap, tone: "amber", label: "Demand forecasting", copy: "Predict inventory needs using transaction history." },
    { key: "autoCategorization", icon: Bot, tone: "blue", label: "Auto categorization", copy: "Suggest categories when new products are created." },
  ];

  return (
    <div className="account-stack">
      <SectionHead title="AI Features" copy="Control automation that helps teams forecast, classify, and act faster." />
      {readOnly && <ViewOnlyBanner>Only administrators can modify AI feature settings.</ViewOnlyBanner>}
      <div className="account-card pad flex items-center gap-4">
        <IconBubble icon={Sparkles} tone="green" />
        <div>
          <div className="account-card-title">Inventory intelligence</div>
          <div className="account-card-copy">Keep AI assistance focused on operations, not extra noise.</div>
        </div>
      </div>
      <div className="account-grid-2">
        {features.map((feature) => (
          <div className="account-card pad" key={feature.key}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <IconBubble icon={feature.icon} tone={feature.tone} />
                <div>
                  <div className="account-card-title">{feature.label}</div>
                  <div className="account-card-copy">{feature.copy}</div>
                </div>
              </div>
              <Toggle checked={!!data?.[feature.key]} onChange={(event) => set(feature.key, event.target.checked)} disabled={readOnly} />
            </div>
            <div className="mt-5 pt-4 border-t border-gray-100">
              <span className={`account-pill ${data?.[feature.key] ? "pill-green" : "pill-gray"}`}>{data?.[feature.key] ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        ))}
      </div>
      {!readOnly && (
        <div className="account-actions">
          {message && <span className={`account-pill ${message.includes("saved") ? "pill-green" : "pill-red"}`}>{message}</span>}
          <button className="account-btn primary" onClick={save} disabled={saving}><Save className="w-4 h-4" />{saving ? "Saving..." : "Save AI settings"}</button>
        </div>
      )}
    </div>
  );
}

function AuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("branch");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, today: 0, users: 0 });
  const [loadedAt, setLoadedAt] = useState(null);

  useEffect(() => {
    const endpoint = filter === "branch"
      ? `/api/AuditLogs/Get-Audits-Branch?Page_Size=${AUDIT_PAGE_SIZE}&Page=${page}`
      : `/api/AuditLogs/Get-Audits-User?Page_Size=${AUDIT_PAGE_SIZE}&Page=${page}`;

    apiFetch(endpoint)
      .then((response) => {
        const rows = response?.data || [];
        const nextTotalCount = response?.totalCount || rows.length;
        const today = new Date().toDateString();
        setLogs(rows.slice(0, AUDIT_PAGE_SIZE));
        setTotalCount(nextTotalCount);
        setTotalPages(response?.totalPages > 0 ? response.totalPages : Math.max(1, Math.ceil(nextTotalCount / AUDIT_PAGE_SIZE)));
        setStats({
          total: nextTotalCount,
          today: rows.filter((row) => row.createdAt && new Date(row.createdAt).toDateString() === today).length,
          users: new Set(rows.map((row) => row.userId)).size,
        });
        setLoadedAt(Date.now());
      })
      .catch((error) => console.error("Audit logs error:", error))
      .finally(() => setLoading(false));
  }, [filter, page]);

  const changeFilter = (nextFilter) => {
    setLoading(true);
    setPage(1);
    setFilter(nextFilter);
  };

  const changePage = (nextPage) => {
    setLoading(true);
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <div className="account-stack">
      <SectionHead title="Audit Trail" copy="Review changes made across users and branches." />
      <div className="account-grid-3">
        <div className="account-stat"><div className="account-stat-value">{loading ? "-" : stats.total}</div><div className="account-stat-label">Total events</div></div>
        <div className="account-stat"><div className="account-stat-value text-[#0f8c5a]">{loading ? "-" : stats.today}</div><div className="account-stat-label">Today</div></div>
        <div className="account-stat"><div className="account-stat-value text-[#66706a]">{loading ? "-" : stats.users}</div><div className="account-stat-label">Unique users</div></div>
      </div>
      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title">Activity log</div>
            <div className="account-card-copy">
              Showing {filter} events{totalCount ? ` - ${totalCount} total` : ""}.
            </div>
          </div>
          <div className="flex gap-2">
            {["branch", "user"].map((item) => (
              <button key={item} className={`account-btn ${filter === item ? "primary" : "secondary"}`} onClick={() => changeFilter(item)}>
                {item === "branch" ? "Branch" : "User"}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(AUDIT_PAGE_SIZE)].map((_, index) => <div className="account-skeleton h-12" key={index} />)}</div>
        ) : logs.length === 0 ? (
          <EmptyState title="No audit logs found" copy="Activity appears here as changes are made." />
        ) : (
          <div className="account-table-wrap">
            <table className="account-table">
              <thead>
                <tr><th>Action</th><th>Entity</th><th>Performed by</th><th>Timestamp</th><th className="text-right">Details</th></tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td><span className={`account-pill ${actionPill(log.action)}`}>{log.action || "Action"}</span></td>
                    <td><strong>{log.entityName || "-"}</strong></td>
                    <td>{log.userName || log.userId || "-"}</td>
                    <td>{formatTime(log.createdAt, loadedAt)}</td>
                    <td className="text-right">
                      <button className="account-btn secondary" onClick={() => navigate(`/audit-log/${log.id}`, { state: { log, returnTo: "/settings?tab=audit" } })}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages} ({totalCount} events)
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="account-btn secondary"
                    onClick={() => changePage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                  <button
                    className="account-btn secondary"
                    onClick={() => changePage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="account-stack">
      <SectionHead title="Security" copy="Update password details for the current account." />
      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title">Change password</div>
            <div className="account-card-copy">Use a strong password and rotate it regularly.</div>
          </div>
          <IconBubble icon={Key} tone="purple" />
        </div>
        <div className="account-card-body">
          <div className="account-grid-2">
            {["Current password", "New password", "Confirm new password"].map((label, index) => (
              <div className={`account-field ${index === 0 ? "md:col-span-2" : ""}`} key={label}>
                <label>{label}</label>
                <input className="account-input" type="password" placeholder={`Enter ${label.toLowerCase()}`} />
              </div>
            ))}
          </div>
          <div className="account-actions mt-5">
            <button className="account-btn primary"><Save className="w-4 h-4" />Update password</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagerStoreReadOnly() {
  return <StoreSettings readOnly />;
}

export function SettingsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, can } = useAuth();
  const roleId = currentUser?.roleId ?? currentUser?.role_id ?? roleToId(currentUser?.role);
  const roleKey = normalizeRoleKey(currentUser?.role || roleId);
  const canManageWorkspace = can("update_company") || can("create_branch");
  const canViewWorkspace = roleKey !== ROLE_KEYS.STAFF && (can("view_company") || can("view_branch"));
  const canManageUsers = can("manage_users");
  const canViewAlerts = can("view_alert_config");
  const canEditAlerts = can("update_alert_config");
  const canViewAi = can("view_ai_config");
  const canEditAi = can("update_ai_config");
  const canViewAudit = can("view_audit_logs");
  const roleLabel = getRoleLabel(roleId);
  const requestedTab = new URLSearchParams(location.search).get("tab") || location.state?.tab;
  const [activeTab, setActiveTab] = useState(canViewWorkspace ? "store" : "security");

  const tabs = useMemo(() => {
    const items = [];
    if (canViewWorkspace) items.push({ id: "store", label: "Workspace", desc: canManageWorkspace ? "Branches and contacts" : "Branch details", icon: Building2 });
    if (canManageUsers) items.push({ id: "users", label: "People", desc: "Team and access", icon: Users });
    if (canViewAlerts) items.push({ id: "alerts", label: "Alerts", desc: canEditAlerts ? "Thresholds and channels" : "View alert rules", icon: Bell });
    if (canViewAi) items.push({ id: "ai", label: "AI", desc: canEditAi ? "Automation settings" : "View automation", icon: Sparkles });
    if (canViewAudit) items.push({ id: "audit", label: "Audit trail", desc: "System activity", icon: Activity });
    items.push({ id: "security", label: "Security", desc: "Password controls", icon: Shield });
    return items;
  }, [canEditAi, canEditAlerts, canManageUsers, canManageWorkspace, canViewAi, canViewAlerts, canViewAudit, canViewWorkspace]);

  const selectedTab = requestedTab || activeTab;
  const effectiveActiveTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : tabs[0]?.id || "security";

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate({ pathname: "/settings", search: `?tab=${tabId}` }, { replace: true });
  };

  return (
    <div className="account-root account-page">
      <div className="account-shell">
        <SettingsHero roleLabel={roleLabel} currentUser={currentUser} />
        <div className="settings-layout">
          <SettingsNavigation tabs={tabs} active={effectiveActiveTab} onChange={handleTabChange} />
          <main>
            {effectiveActiveTab === "store" && (canManageWorkspace ? <StoreSettings /> : <ManagerStoreReadOnly />)}
            {effectiveActiveTab === "users" && canManageUsers && <UserManagement />}
            {effectiveActiveTab === "alerts" && canViewAlerts && <AlertConfigurations readOnly={!canEditAlerts} />}
            {effectiveActiveTab === "ai" && canViewAi && <AIFeatures readOnly={!canEditAi} />}
            {effectiveActiveTab === "audit" && canViewAudit && <AuditLogs />}
            {effectiveActiveTab === "security" && <SecuritySettings />}
          </main>
        </div>
      </div>
    </div>
  );
}
