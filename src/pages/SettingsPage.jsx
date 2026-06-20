import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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
  Tags,
  ChevronDown,
  ChevronUp,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { ROLE_IDS, ROLE_KEYS, getRoleLabel, normalizeRoleKey, roleToId } from "../config/permissions";
import { ToneIcon } from "../components/ToneIcon";
import { formatRelativeTime, parseAppDate } from "../utils/dateTime";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../services/categoriesApi";
import { deleteAccountFully } from "../services/authApi";
import { API_BASE_URL, getApiErrorMessage, parseApiResponse } from "../services/api";
import "../styles/account.css";

const ROLE_OPTIONS = [
  { id: ROLE_IDS.ADMIN, label: "Admin" },
  { id: ROLE_IDS.MANAGER, label: "Manager" },
  { id: ROLE_IDS.STAFF, label: "Staff" },
];

const CREATE_EMPLOYEE_ROLE_OPTIONS = ROLE_OPTIONS.filter(({ id }) => id !== ROLE_IDS.ADMIN);

const EMPTY_NEW_EMPLOYEE = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  role: ROLE_IDS.STAFF,
  tempPassword: "",
};

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
    const stored = JSON.parse(localStorage.getItem("tanzeem_auth"));
    const currentUser = stored?.currentUser;
    const backendResponse = stored?.backendResponse;
    const backendData = backendResponse?.data || backendResponse?.user || backendResponse;

    return (
      pickValue(currentUser, ["companyId", "CompanyId", "companyID", "CompanyID", "company_id"]) ||
      pickValue(backendData, ["companyId", "CompanyId", "companyID", "CompanyID", "company_id"]) ||
      null
    );
  } catch {
    return null;
  }
}

function pickValue(source, keys) {
  if (!source || typeof source !== "object") return undefined;
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function normalizeStatus(status) {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (status === true || normalized === "1" || normalized === "active") return "Active";
  if (status === false || normalized === "0" || normalized === "inactive") return "Inactive";
  return status || "Inactive";
}

function normalizeEmployee(employee) {
  const id = pickValue(employee, ["id", "Id", "employeeId", "EmployeeId", "userId", "UserId"]);
  const email = pickValue(employee, ["email", "Email"]) || "";
  const name = pickValue(employee, ["name", "Name", "fullName", "FullName", "userName", "UserName"]) || email || "Employee";
  const companyId = pickValue(employee, ["companyId", "CompanyId", "companyID", "CompanyID", "company_id"]);
  const branchId = pickValue(employee, ["branchId", "BranchId", "branchID", "BranchID", "branch_id"]);

  return {
    ...employee,
    id,
    employeeId: pickValue(employee, ["employeeId", "EmployeeId"]) ?? id,
    userId: pickValue(employee, ["userId", "UserId"]) ?? id,
    name,
    email,
    phoneNumber: pickValue(employee, ["phoneNumber", "PhoneNumber", "phone", "Phone"]) || "",
    role: roleToId(pickValue(employee, ["role", "Role", "roleId", "RoleId", "role_id"])),
    status: normalizeStatus(pickValue(employee, ["status", "Status", "isActive", "IsActive"])),
    branchId,
    branchName: pickValue(employee, ["branchName", "BranchName"]),
    companyId,
    lastActive: pickValue(employee, ["lastActive", "LastActive", "lastLogin", "LastLogin"]),
  };
}

async function apiFetch(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers: { ...authHeaders(), ...options.headers } });
  const data = await parseApiResponse(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(data, `Request failed: ${response.status}`));
  }
  return data;
}

function randomPasswordChar(characters) {
  const values = new Uint32Array(1);
  window.crypto?.getRandomValues?.(values);
  const index = values[0] ? values[0] % characters.length : Math.floor(Math.random() * characters.length);
  return characters[index];
}

function generateTemporaryPassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%";
  const pool = `${upper}${lower}${numbers}${symbols}`;
  const required = [
    randomPasswordChar(upper),
    randomPasswordChar(lower),
    randomPasswordChar(numbers),
    randomPasswordChar(symbols),
  ];
  const rest = Array.from({ length: 8 }, () => randomPasswordChar(pool));
  return [...required, ...rest].sort(() => Math.random() - 0.5).join("");
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
  return formatRelativeTime(value, now);
}

function IconBubble({ icon: Icon, tone = "green" }) {
  return <ToneIcon icon={Icon} tone={tone} size="md" className="settings-nav-icon" iconClassName="w-4 h-4" />;
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

function normalizeBranchStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "2" || normalized === "inactive") return "Inactive";
  if (normalized === "3" || normalized === "closed") return "Closed";
  return "Active";
}

function normalizeBranch(branch) {
  return {
    id: branch.id ?? branch.Id,
    name: branch.name ?? branch.Name ?? "",
    location: branch.location ?? branch.Location ?? "",
    phoneNumber: branch.phoneNumber ?? branch.PhoneNumber ?? "",
    email: branch.email ?? branch.Email ?? "",
    status: normalizeBranchStatus(branch.status ?? branch.Status),
    createdAt: branch.createdAt ?? branch.CreatedAt ?? null,
  };
}

function StoreSettings({ readOnly = false }) {
  const [form, setForm] = useState(INITIAL_STORE_INFO);
  const [company, setCompany] = useState({ name: "", field: "", email: "", phone: "" });
  const [branches, setBranches] = useState([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [editingBranchName, setEditingBranchName] = useState("");
  const [isBranchEditOpen, setIsBranchEditOpen] = useState(false);
  const [branchDraft, setBranchDraft] = useState(null);
  const [newBranch, setNewBranch] = useState({ name: "", location: "", phoneNumber: "", email: "", status: "Active" });
  const [errors, setErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const updateCompany = (field, value) => setCompany((current) => ({ ...current, [field]: value }));
  const updateBranch = (field, value) => setNewBranch((current) => ({ ...current, [field]: value }));

  const normalizeCompany = (data) => ({
    name: data?.name ?? data?.Name ?? "",
    field: data?.field ?? data?.Field ?? "",
    email: data?.email ?? data?.Email ?? "",
    phone: data?.phone ?? data?.Phone ?? "",
  });

  const hydrateWorkspace = useCallback(async () => {
    setWorkspaceLoading(true);
    setMessage("");
    try {
      const companyData = await apiFetch("/api/Company/Get-Company");
      setCompany(normalizeCompany(companyData));
    } catch (error) {
      console.error("Failed to load company settings:", error);
      setMessage(error.message || "Failed to load company settings.");
    }

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
        setEditingBranchName(primaryBranch.name || "Primary branch");
      }
    } catch (error) {
      console.error("Failed to load branch settings:", error);
      setMessage((current) => current || error.message || "Failed to load branch settings.");
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

  const saveCompany = async () => {
    setSavingWorkspace(true);
    setMessage("");
    try {
      await apiFetch("/api/Company/Update-Company", {
        method: "PUT",
        body: JSON.stringify(company),
      });

      setMessage("Company saved successfully.");
      await hydrateWorkspace();
    } catch (error) {
      setMessage(error.message || "Failed to save company.");
    } finally {
      setSavingWorkspace(false);
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  const saveBranchEdits = async () => {
    if (!editingBranchId) return;

    const draft = branchDraft || form;
    setSavingWorkspace(true);
    setMessage("");
    try {
      const nextStatus = normalizeBranchStatus(draft.status);
      await apiFetch(`/api/Branch/Update-Branch/${editingBranchId}`, {
        method: "PUT",
        body: JSON.stringify({
          id: editingBranchId,
          name: draft.storeName.trim(),
          location: draft.location.trim(),
          phoneNumber: draft.phone.trim(),
          email: draft.supportEmail.trim(),
          status: nextStatus,
        }),
      });

      setMessage("Branch saved successfully.");
      setIsBranchEditOpen(false);
      setBranchDraft(null);
      await hydrateWorkspace();
    } catch (error) {
      setMessage(error.message || "Failed to save branch.");
    } finally {
      setSavingWorkspace(false);
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  const editBranch = (branch) => {
    const selected = normalizeBranch(branch);
    const nextForm = {
      storeName: selected.name || "",
      location: selected.location || "",
      timezone: INITIAL_STORE_INFO.timezone,
      supportEmail: selected.email || "",
      phone: selected.phoneNumber || "",
      status: normalizeBranchStatus(selected.status),
    };
    setEditingBranchId(selected.id);
    setEditingBranchName(selected.name || `Branch ${selected.id}`);
    setForm(nextForm);
    setBranchDraft(nextForm);
    setIsBranchEditOpen(true);
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
    if (!window.confirm("Delete this company workspace? This cannot be undone.")) return;
    try {
      await apiFetch("/api/Company/Delete-Company", { method: "DELETE" });
      setMessage("Company deleted successfully.");
    } catch {
      setMessage("Failed to delete company.");
    } finally {
      window.setTimeout(() => setMessage(""), 3200);
    }
  };

  return (
    <div className="account-stack">
      <SectionHead
        title="Branch & Workspace"
        copy={readOnly ? "Review branch details for this workspace." : "Update your primary branch profile and create additional branches."}
      />
      {readOnly && <ViewOnlyBanner>Only administrators can modify branch and workspace information.</ViewOnlyBanner>}

      {workspaceLoading && <div className="account-skeleton h-20" />}
      {message && !message.includes("success") && (
        <div className="account-inline-message danger">
          <AlertCircle className="w-4 h-4" />
          {message}
        </div>
      )}

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
          {!readOnly && (
            <div className="account-actions mt-5">
              <button className="account-btn primary" onClick={saveCompany} disabled={savingWorkspace}>
                <Save className="w-4 h-4" />
                {savingWorkspace ? "Saving..." : "Save company"}
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

      {isBranchEditOpen && (
        <BranchEditModal
          form={branchDraft || form}
          title={editingBranchName || "Branch"}
          saving={savingWorkspace}
          onChange={(field, value) => setBranchDraft((current) => ({ ...(current || form), [field]: value }))}
          onClose={() => {
            setIsBranchEditOpen(false);
            setBranchDraft(null);
          }}
          onSave={saveBranchEdits}
        />
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
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [assigningEmployee, setAssigningEmployee] = useState(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [newEmployee, setNewEmployee] = useState(EMPTY_NEW_EMPLOYEE);
  const [employeeFormError, setEmployeeFormError] = useState("");
  const [createdEmployee, setCreatedEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    try {
      const data = await apiFetch("/api/BusinessCore/Get-All-Employees");
      const rows = Array.isArray(data) ? data : data?.data || data?.items || [];
      const normalizedEmployees = rows.map(normalizeEmployee);
      const companyId = getCurrentCompanyId();
      const hasCompanyScopedRows = normalizedEmployees.some((employee) => employee.companyId !== undefined && employee.companyId !== null);
      setEmployees(
        companyId && hasCompanyScopedRows
          ? normalizedEmployees.filter((employee) => String(employee.companyId) === String(companyId))
          : normalizedEmployees
      );
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    apiFetch("/api/Branch/Get-Branches-Menu")
      .then((data) => {
        const rows = Array.isArray(data) ? data : data?.data || data?.items || [];
        setBranches(rows.map((branch) => ({
          id: branch.id ?? branch.Id ?? branch.branchId ?? branch.BranchId,
          name: branch.name ?? branch.Name ?? branch.branchName ?? branch.BranchName ?? "Branch",
        })).filter((branch) => branch.id));
      })
      .catch((error) => {
        console.error("Failed to load branch menu:", error);
        setBranches([]);
      });
  }, []);

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
    const firstName = newEmployee.firstName.trim();
    const lastName = newEmployee.lastName.trim();
    const email = newEmployee.email.trim();
    const phoneNumber = newEmployee.phoneNumber.trim();
    const tempPassword = newEmployee.tempPassword.trim();
    const fullName = `${firstName} ${lastName}`.trim();

    if (!firstName || !lastName || !email || !phoneNumber) {
      setEmployeeFormError("First name, last name, email, and phone are required.");
      return;
    }
    if (!tempPassword) {
      setEmployeeFormError("Temporary password is required.");
      return;
    }
    setEmployeeFormError("");
    setSubmitting(true);
    try {
      const payload = {
        name: fullName,
        email,
        role: Number(newEmployee.role),
        phoneNumber,
        tempPassword,
      };
      await apiFetch("/api/BusinessCore/Create-Employee", { method: "POST", body: JSON.stringify(payload) });
      await fetchEmployees();
      setCreatedEmployee({
        name: fullName,
        email,
        role: Number(newEmployee.role),
      });
    } catch (error) {
      setEmployeeFormError(error.message || "Failed to create employee. Please check the details and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeAddEmployee = () => {
    setShowAdd(false);
    setEmployeeFormError("");
    setCreatedEmployee(null);
    setNewEmployee(EMPTY_NEW_EMPLOYEE);
  };

  const createAnotherEmployee = () => {
    setEmployeeFormError("");
    setCreatedEmployee(null);
    setNewEmployee(EMPTY_NEW_EMPLOYEE);
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

  const assignBranch = async (employee, branchId) => {
    const userId = getEmployeeId(employee);
    const nextBranchId = Number(branchId);
    if (!userId || Number.isNaN(nextBranchId)) return;

    setAssigning(true);
    try {
      await apiFetch(`/api/BusinessCore/Assign-User?userId=${userId}&newBranchId=${nextBranchId}`, {
        method: "PUT",
        body: JSON.stringify({}),
      });
      await fetchEmployees();
      setAssigningEmployee(null);
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
        <div className="account-directory-frame">
          {loading ? (
            <div className="account-directory-loading">
              {[...Array(5)].map((_, index) => <div className="account-skeleton h-12" key={index} />)}
            </div>
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
                        <button className="account-icon-btn ml-1" onClick={() => setAssigningEmployee(employee)} disabled={assigning} title="Assign branch">
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
      </div>

      {showAdd && (
        <EmployeeModal
          title="Add employee"
          subtitle="Create a team member account and assign a role."
          employee={newEmployee}
          setEmployee={setNewEmployee}
          onClose={closeAddEmployee}
          onSave={createEmployee}
          saving={submitting}
          saveLabel="Add employee"
          allowPassword
          createMode
          errorMessage={employeeFormError}
          createdEmployee={createdEmployee}
          onCreateAnother={createAnotherEmployee}
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

      {assigningEmployee && (
        <BranchAssignModal
          employee={assigningEmployee}
          branches={branches}
          onClose={() => setAssigningEmployee(null)}
          onSave={(branchId) => assignBranch(assigningEmployee, branchId)}
          saving={assigning}
        />
      )}
    </div>
  );
}

function BranchEditModal({ form, title, saving, onChange, onClose, onSave }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className="account-modal-backdrop" role="presentation">
      <div className="account-modal" role="dialog" aria-modal="true" aria-labelledby="branch-edit-title">
        <div className="account-modal-head">
          <div>
            <div className="account-section-title text-[24px]" id="branch-edit-title">Edit branch</div>
            <div className="account-card-copy">{title}</div>
          </div>
          <button className="account-modal-close" onClick={onClose} aria-label="Close branch editor">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="account-card-body">
          <div className="account-grid-2">
            <div className="account-field account-field-wide">
              <label>Branch name</label>
              <input className="account-input" value={form.storeName} onChange={(event) => onChange("storeName", event.target.value)} autoComplete="organization" />
            </div>
            <div className="account-field">
              <label>Location</label>
              <div className="account-input-icon">
                <MapPin className="w-4 h-4" />
                <input className="account-input" value={form.location} onChange={(event) => onChange("location", event.target.value)} autoComplete="address-level2" />
              </div>
            </div>
            <div className="account-field">
              <label>Timezone</label>
              <select className="account-select" value={form.timezone} onChange={(event) => onChange("timezone", event.target.value)}>
                {["GST (UTC+4)", "EST (UTC-5)", "PST (UTC-8)", "GMT (UTC+0)", "IST (UTC+5:30)", "EET (UTC+2)"].map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="account-field">
              <label>Support email</label>
              <div className="account-input-icon">
                <Mail className="w-4 h-4" />
                <input className="account-input" type="email" value={form.supportEmail} onChange={(event) => onChange("supportEmail", event.target.value)} autoComplete="email" />
              </div>
            </div>
            <div className="account-field">
              <label>Phone number</label>
              <div className="account-input-icon">
                <Phone className="w-4 h-4" />
                <input className="account-input" type="tel" value={form.phone} onChange={(event) => onChange("phone", event.target.value)} autoComplete="tel" />
              </div>
            </div>
            <div className="account-field account-field-wide">
              <label>Status</label>
              <select className="account-select" value={form.status} onChange={(event) => onChange("status", event.target.value)}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="account-modal-footer">
          <button className="account-btn secondary" onClick={onClose}>Cancel</button>
          <button className="account-btn primary" onClick={onSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save branch"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function EmployeeModal({
  title,
  subtitle,
  employee,
  setEmployee,
  onClose,
  onSave,
  saving,
  saveLabel,
  allowPassword = false,
  createMode = false,
  errorMessage = "",
  createdEmployee = null,
  onCreateAnother,
}) {
  const setField = (field, value) => setEmployee((current) => ({ ...current, [field]: value }));
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (createdEmployee) {
    return createPortal(
      <div className="account-modal-backdrop" role="presentation">
        <div className="account-modal account-modal-narrow">
          <div className="account-modal-head">
            <div>
              <div className="account-section-title text-[24px]">Employee added</div>
              <div className="account-card-copy">The new team member is ready for workspace access.</div>
            </div>
            <button className="account-modal-close" onClick={onClose} aria-label="Close modal">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="account-card-body">
            <div className="account-success-panel">
              <div className="account-success-icon">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3>{createdEmployee.name}</h3>
              <p>{createdEmployee.email}</p>
              <div className="account-success-meta">
                <span>{getRoleLabel(createdEmployee.role)}</span>
              </div>
            </div>
          </div>
          <div className="account-modal-footer">
            <button className="account-btn secondary" onClick={onCreateAnother}>Add another</button>
            <button className="account-btn primary" onClick={onClose}>
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="account-modal-backdrop" role="presentation">
      <div className="account-modal" role="dialog" aria-modal="true" aria-labelledby="employee-modal-title">
        <div className="account-modal-head">
          <div>
            <div className="account-section-title text-[24px]" id="employee-modal-title">{title}</div>
            <div className="account-card-copy">{subtitle}</div>
          </div>
          <button className="account-modal-close" onClick={onClose} aria-label="Close modal">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="account-card-body">
          {errorMessage && <div className="account-form-error">{errorMessage}</div>}
          <div className="account-grid-2">
            {createMode ? (
              <>
                <div className="account-field">
                  <label>First name</label>
                  <input className="account-input" value={employee.firstName || ""} onChange={(event) => setField("firstName", event.target.value)} autoComplete="given-name" />
                </div>
                <div className="account-field">
                  <label>Last name</label>
                  <input className="account-input" value={employee.lastName || ""} onChange={(event) => setField("lastName", event.target.value)} autoComplete="family-name" />
                </div>
              </>
            ) : (
              <div className="account-field account-field-wide">
                <label>Full name</label>
                <input className="account-input" value={employee.name || ""} onChange={(event) => setField("name", event.target.value)} autoComplete="name" />
              </div>
            )}
            <div className="account-field">
              <label>Email</label>
              <input className="account-input" type="email" value={employee.email || ""} onChange={(event) => setField("email", event.target.value)} autoComplete="email" />
            </div>
            <div className="account-field">
              <label>Phone</label>
              <input className="account-input" type="tel" value={employee.phoneNumber || ""} onChange={(event) => setField("phoneNumber", event.target.value)} autoComplete="tel" />
            </div>
            <div className="account-field account-field-wide">
              <label>Role</label>
              <select className="account-select" value={employee.role || ROLE_IDS.STAFF} onChange={(event) => setField("role", Number(event.target.value))}>
                {(createMode ? CREATE_EMPLOYEE_ROLE_OPTIONS : ROLE_OPTIONS).map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
            </div>
            {allowPassword && (
              <div className="account-field account-field-wide">
                <label>Temporary password</label>
                <div className="account-input-row">
                  <input className="account-input" value={employee.tempPassword || ""} onChange={(event) => setField("tempPassword", event.target.value)} placeholder="Enter a temporary password" required />
                  <button className="account-btn secondary" type="button" onClick={() => setField("tempPassword", generateTemporaryPassword())}>
                    <RefreshCcw className="w-4 h-4" />
                    Generate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="account-modal-footer">
          <button className="account-btn secondary" onClick={onClose}>Cancel</button>
          <button className="account-btn primary" onClick={onSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : saveLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function BranchAssignModal({ employee, branches, onClose, onSave, saving }) {
  const currentBranchId = employee?.branchId ? String(employee.branchId) : "";
  const [branchId, setBranchId] = useState(currentBranchId || (branches[0]?.id ? String(branches[0].id) : ""));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return createPortal(
    <div className="account-modal-backdrop" role="presentation">
      <div className="account-modal account-modal-narrow" role="dialog" aria-modal="true" aria-labelledby="assign-branch-title">
        <div className="account-modal-head">
          <div>
            <div className="account-section-title text-[24px]" id="assign-branch-title">Assign branch</div>
            <div className="account-card-copy">{employee?.name || employee?.email || "Team member"}</div>
          </div>
          <button className="account-modal-close" onClick={onClose} aria-label="Close branch assignment">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="account-card-body">
          <div className="account-field">
            <label>Branch</label>
            <select className="account-select" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
              {!branches.length && <option value="">No branches available</option>}
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name} - ID {branch.id}</option>
              ))}
            </select>
            <p className="account-field-help">Branch options come from the backend branch menu.</p>
          </div>
        </div>
        <div className="account-modal-footer">
          <button className="account-btn secondary" onClick={onClose}>Cancel</button>
          <button className="account-btn primary" onClick={() => onSave(branchId)} disabled={saving || !branchId}>
            <Save className="w-4 h-4" />
            {saving ? "Assigning..." : "Assign branch"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CategorySettings({ readOnly = false }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [query, setQuery] = useState("");

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err?.status === 401 || err?.status === 403
        ? "You do not have access to load categories."
        : "Categories could not be loaded right now. Please try again."
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const showMessage = (nextMessage) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const validateName = (name, currentId = null) => {
    const trimmed = name.trim();
    if (!trimmed) return "Category name is required.";
    const duplicate = categories.some((category) => (
      category.id !== currentId && category.name.toLowerCase() === trimmed.toLowerCase()
    ));
    if (duplicate) return "That category already exists.";
    return "";
  };

  const addCategory = async () => {
    const validation = validateName(newName);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await createCategory(newName);
      setNewName("");
      showMessage("Category created.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to create category.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditingName(category.name);
    setError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setError("");
  };

  const saveEdit = async () => {
    const validation = validateName(editingName, editingId);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await updateCategory({ id: editingId, name: editingName });
      cancelEdit();
      showMessage("Category updated.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete ${category.name}? Products using it may need a new category.`)) return;

    setSaving(true);
    setError("");
    try {
      await deleteCategory(category.id);
      showMessage("Category deleted.");
      await loadCategories();
    } catch (err) {
      setError(err.message || "Failed to delete category.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(needle));
  }, [categories, query]);

  return (
    <div className="account-stack">
      <SectionHead
        title="Categories"
        copy="Manage the product groups available across inventory, product creation, and reports."
      />
      {readOnly && <ViewOnlyBanner>Only administrators and managers can modify product categories.</ViewOnlyBanner>}

      <div className="account-grid-3">
        <div className="account-stat"><div className="account-stat-value">{loading ? "-" : categories.length}</div><div className="account-stat-label">Total categories</div></div>
        <div className="account-stat"><div className="account-stat-value text-[#0f8c5a]">{loading ? "-" : filteredCategories.length}</div><div className="account-stat-label">Shown now</div></div>
        <div className="account-stat"><div className="account-stat-value text-[#66706a]">{loading ? "-" : "Ready"}</div><div className="account-stat-label">Library status</div></div>
      </div>

      {!readOnly && (
        <div className="account-card">
          <div className="account-card-head">
            <div>
              <div className="account-card-title">Create category</div>
              <div className="account-card-copy">Add a reusable product category for the workspace.</div>
            </div>
          </div>
          <div className="account-card-body">
            <div className="account-input-row">
              <input
                className="account-input"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") addCategory();
                }}
                placeholder="Category name"
              />
              <button className="account-btn primary" type="button" onClick={addCategory} disabled={saving}>
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title">Category library</div>
            <div className="account-card-copy">{filteredCategories.length} shown from {categories.length} total.</div>
          </div>
          <div className="account-input-icon account-search-compact">
            <Search className="w-4 h-4" />
            <input className="account-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" />
          </div>
        </div>
        {error && <div className="account-inline-message danger"><AlertCircle className="w-4 h-4" />{error}</div>}
        {message && <div className="account-inline-message success"><CheckCircle2 className="w-4 h-4" />{message}</div>}
        {loading ? (
          <div className="p-5 space-y-3">{[...Array(5)].map((_, index) => <div className="account-skeleton h-12" key={index} />)}</div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState icon={Tags} title="No categories found" copy="Create categories here, then select them when creating products." />
        ) : (
          <div className="account-table-wrap">
            <table className="account-table">
              <thead>
                <tr>
                  <th>Category</th>
                  {!readOnly && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id || category.name}>
                    <td>
                      {editingId === category.id ? (
                        <input
                          className="account-input"
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") saveEdit();
                            if (event.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                        />
                      ) : (
                        <strong>{category.name}</strong>
                      )}
                    </td>
                    {!readOnly && (
                      <td className="text-right">
                        {editingId === category.id ? (
                          <>
                            <button className="account-btn secondary mr-2" type="button" onClick={cancelEdit}>Cancel</button>
                            <button className="account-btn primary" type="button" onClick={saveEdit} disabled={saving}>
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="account-btn secondary mr-2" type="button" onClick={() => startEdit(category)}>Edit</button>
                            <button className="account-icon-btn text-red-600" type="button" onClick={() => removeCategory(category)} disabled={saving} aria-label={`Delete ${category.name}`}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

function ConfigurationSettings({
  defaultSection,
  canManageCategories,
  canViewAlerts,
  canEditAlerts,
  canViewAi,
  canEditAi,
  onSectionChange,
}) {
  const sections = useMemo(() => {
    const items = [];
    if (canManageCategories) items.push({ id: "categories", label: "Categories", desc: "Product groups", icon: Tags });
    if (canViewAlerts) items.push({ id: "alerts", label: "Alerts", desc: canEditAlerts ? "Thresholds and channels" : "View alert rules", icon: Bell });
    if (canViewAi) items.push({ id: "ai", label: "AI", desc: canEditAi ? "Automation settings" : "View automation", icon: Sparkles });
    return items;
  }, [canEditAi, canEditAlerts, canManageCategories, canViewAi, canViewAlerts]);

  const initialSection = sections.some((section) => section.id === defaultSection)
    ? defaultSection
    : sections[0]?.id;
  const [activeSection, setActiveSection] = useState(initialSection);

  const selectSection = (sectionId) => {
    setActiveSection(sectionId);
    onSectionChange(sectionId);
  };

  if (!sections.length) {
    return <EmptyState icon={SlidersHorizontal} title="No configurations available" copy="Your role does not include configuration access." />;
  }

  return (
    <div className="account-stack">
      <div className="config-bar">
        <div>
          <h2 className="account-section-title">Configurations</h2>
          <p className="account-section-copy">Categories, alert behavior, and AI automation.</p>
        </div>
        <nav className="config-nav" aria-label="Configuration sections">
          {sections.map((section) => (
            <button
              className={`config-nav-button ${activeSection === section.id ? "active" : ""}`}
              key={section.id}
              onClick={() => selectSection(section.id)}
              title={section.desc}
              type="button"
            >
              {createElement(section.icon, { className: "w-4 h-4" })}
              <span>{section.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {activeSection === "categories" && canManageCategories && <CategorySettings />}
      {activeSection === "alerts" && canViewAlerts && <AlertConfigurations readOnly={!canEditAlerts} />}
      {activeSection === "ai" && canViewAi && <AIFeatures readOnly={!canEditAi} />}
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
          today: rows.filter((row) => parseAppDate(row.createdAt)?.toDateString() === today).length,
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
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const setField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setMessage("");
    setError("");
    setDeleteError("");
  };

  const updatePassword = async () => {
    const currentPassword = form.currentPassword.trim();
    const newPassword = form.newPassword.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Enter your current password and confirm the new one.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiFetch("/api/Auth/change-password", {
        method: "PUT",
        body: JSON.stringify({
          oldPassword: currentPassword,
          newPassword,
        }),
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update password.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      setDeleteError("Type DELETE to confirm account deletion.");
      return;
    }
    if (!window.confirm("Delete this account permanently? This cannot be undone.")) return;

    setDeletingAccount(true);
    setDeleteError("");
    setMessage("");
    try {
      await deleteAccountFully();
      logout();
      navigate("/signin", { replace: true });
    } catch (err) {
      setDeleteError(err.message || "Could not delete this account.");
    } finally {
      setDeletingAccount(false);
    }
  };

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
          {message && (
            <div className="account-form-success">
              <CheckCircle2 className="w-4 h-4" />
              {message}
            </div>
          )}
          {error && <div className="account-form-error">{error}</div>}
          <div className="account-grid-2">
            <div className="account-field md:col-span-2">
              <label>Current password</label>
              <input
                className="account-input"
                type="password"
                placeholder="Enter current password"
                value={form.currentPassword}
                onChange={setField("currentPassword")}
                autoComplete="current-password"
              />
            </div>
            <div className="account-field">
              <label>New password</label>
              <input
                className="account-input"
                type="password"
                placeholder="Enter new password"
                value={form.newPassword}
                onChange={setField("newPassword")}
                autoComplete="new-password"
              />
            </div>
            <div className="account-field">
              <label>Confirm new password</label>
              <input
                className="account-input"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={setField("confirmPassword")}
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="account-actions mt-5">
            <button className="account-btn primary" onClick={updatePassword} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </div>

      <div className="account-card">
        <div className="account-card-head">
          <div>
            <div className="account-card-title text-red-700">Delete account</div>
            <div className="account-card-copy">Permanently remove this account and all related access.</div>
          </div>
          <IconBubble icon={Trash2} tone="red" />
        </div>
        <div className="account-card-body">
          <div className="account-field">
            <label>Type DELETE to confirm</label>
            <input
              className="account-input"
              value={deleteConfirmation}
              onChange={(event) => {
                setDeleteConfirmation(event.target.value);
                setDeleteError("");
              }}
              placeholder="DELETE"
            />
          </div>
          {deleteError && <div className="account-form-error mt-3">{deleteError}</div>}
          <div className="account-actions mt-5">
            <button className="account-btn secondary text-red-600" onClick={deleteAccount} disabled={deletingAccount}>
              <Trash2 className="w-4 h-4" />
              {deletingAccount ? "Deleting..." : "Delete account"}
            </button>
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
  const canManageCategories = [ROLE_KEYS.ADMIN, ROLE_KEYS.MANAGER].includes(roleKey);
  const canManageUsers = can("manage_users");
  const canViewAlerts = can("view_alert_config");
  const canEditAlerts = can("update_alert_config");
  const canViewAi = can("view_ai_config");
  const canEditAi = can("update_ai_config");
  const canViewConfigurations = canManageCategories || canViewAlerts || canViewAi;
  const canViewAudit = can("view_audit_logs");
  const roleLabel = getRoleLabel(roleId);
  const searchParams = new URLSearchParams(location.search);
  const requestedTab = searchParams.get("tab") || location.state?.tab;
  const requestedSection = searchParams.get("section") || location.state?.section;
  const [activeTab, setActiveTab] = useState(canViewWorkspace ? "store" : "security");

  const tabs = useMemo(() => {
    const items = [];
    if (canViewWorkspace) items.push({ id: "store", label: "Workspace", desc: canManageWorkspace ? "Branches and contacts" : "Branch details", icon: Building2 });
    if (canViewConfigurations) items.push({ id: "configurations", label: "Configurations", desc: "Categories, alerts, AI", icon: SlidersHorizontal });
    if (canManageUsers) items.push({ id: "users", label: "People", desc: "Team and access", icon: Users });
    if (canViewAudit) items.push({ id: "audit", label: "Audit trail", desc: "System activity", icon: Activity });
    items.push({ id: "security", label: "Security", desc: "Password controls", icon: Shield });
    return items;
  }, [canManageUsers, canManageWorkspace, canViewAudit, canViewConfigurations, canViewWorkspace]);

  const legacyConfigurationTabs = new Set(["categories", "alerts", "ai"]);
  const selectedTab = legacyConfigurationTabs.has(requestedTab) ? "configurations" : requestedTab || activeTab;
  const effectiveActiveTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : tabs[0]?.id || "security";
  const configurationSection = legacyConfigurationTabs.has(requestedTab)
    ? requestedTab
    : requestedSection || "categories";

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    navigate({ pathname: "/settings", search: `?tab=${tabId}` }, { replace: true });
  };

  const handleConfigurationSectionChange = (sectionId) => {
    navigate({ pathname: "/settings", search: `?tab=configurations&section=${sectionId}` }, { replace: true });
  };

  return (
    <div className="account-root account-page">
      <div className="account-shell">
        <SettingsHero roleLabel={roleLabel} currentUser={currentUser} />
        <div className="settings-layout">
          <SettingsNavigation tabs={tabs} active={effectiveActiveTab} onChange={handleTabChange} />
          <main>
            {effectiveActiveTab === "store" && (canManageWorkspace ? <StoreSettings /> : <ManagerStoreReadOnly />)}
            {effectiveActiveTab === "configurations" && canViewConfigurations && (
              <ConfigurationSettings
                key={configurationSection}
                defaultSection={configurationSection}
                canManageCategories={canManageCategories}
                canViewAlerts={canViewAlerts}
                canEditAlerts={canEditAlerts}
                canViewAi={canViewAi}
                canEditAi={canEditAi}
                onSectionChange={handleConfigurationSectionChange}
              />
            )}
            {effectiveActiveTab === "users" && canManageUsers && <UserManagement />}
            {effectiveActiveTab === "audit" && canViewAudit && <AuditLogs />}
            {effectiveActiveTab === "security" && <SecuritySettings />}
          </main>
        </div>
      </div>
    </div>
  );
}
