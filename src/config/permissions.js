export const ROLE_IDS = {
  ADMIN: 1,
  MANAGER: 2,
  STAFF: 3,
};

export const ROLE_KEYS = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
};

export const ROLE_LABELS = {
  [ROLE_KEYS.ADMIN]: "Admin",
  [ROLE_KEYS.MANAGER]: "Manager",
  [ROLE_KEYS.STAFF]: "Staff",
};

export const ROLE_ID_TO_KEY = {
  [ROLE_IDS.ADMIN]: ROLE_KEYS.ADMIN,
  [ROLE_IDS.MANAGER]: ROLE_KEYS.MANAGER,
  [ROLE_IDS.STAFF]: ROLE_KEYS.STAFF,
};

export const ROLE_KEY_TO_ID = {
  [ROLE_KEYS.ADMIN]: ROLE_IDS.ADMIN,
  [ROLE_KEYS.MANAGER]: ROLE_IDS.MANAGER,
  [ROLE_KEYS.STAFF]: ROLE_IDS.STAFF,
};

export const FEATURE_PERMISSIONS = {
  dashboard: "view_dashboard",
  inventory: "view_inventory",
  products: "view_products",
  orders: "view_orders",
  suppliers: "view_suppliers",
  alerts: "view_alerts",
  analytics: "view_analytics",
  "delivery-issues": "view_delivery_issues",
  transactions: "view_transactions",
  settings: "view_settings",
  profile: "view_profile",
};

export const DEFAULT_ROUTE_BY_ROLE = {
  [ROLE_KEYS.ADMIN]: "/dashboard",
  [ROLE_KEYS.MANAGER]: "/dashboard",
  [ROLE_KEYS.STAFF]: "/inventory",
};

export const permissions = {
  [ROLE_KEYS.ADMIN]: [
    "view_dashboard",
    "view_inventory",
    "view_company",
    "update_company",
    "delete_company",
    "view_branch",
    "view_all_branches",
    "create_branch",
    "update_branch",
    "delete_branch",
    "view_employees",
    "create_employee",
    "update_employee",
    "assign_employee",
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",
    "view_orders",
    "create_orders",
    "manage_orders",
    "delete_orders",
    "confirm_delivery",
    "view_suppliers",
    "create_suppliers",
    "manage_suppliers",
    "delete_suppliers",
    "view_analytics",
    "view_delivery_issues",
    "view_transactions",
    "view_all_transactions",
    "create_transactions",
    "view_alerts",
    "view_alert_dashboard",
    "view_alert_config",
    "create_alert_config",
    "update_alert_config",
    "view_ai_config",
    "update_ai_config",
    "view_audit_logs",
    "view_notifications",
    "mark_notification_read",
    "mark_all_notifications_read",
    "view_profile",
    "view_settings",
    "manage_users",
  ],

  [ROLE_KEYS.MANAGER]: [
    "view_dashboard",
    "view_inventory",
    "view_company",
    "view_branch",
    "view_all_branches",
    "view_products",
    "create_products",
    "edit_products",
    "view_orders",
    "create_orders",
    "manage_orders",
    "confirm_delivery",
    "view_suppliers",
    "create_suppliers",
    "manage_suppliers",
    "view_analytics",
    "view_transactions",
    "view_all_transactions",
    "create_transactions",
    "view_alerts",
    "view_alert_dashboard",
    "view_alert_config",
    "view_ai_config",
    "view_notifications",
    "mark_notification_read",
    "mark_all_notifications_read",
    "view_profile",
    "view_settings",
  ],

  [ROLE_KEYS.STAFF]: [
    "view_inventory",
    "view_branch",
    "view_products",
    "create_products",
    "edit_products",
    "view_orders",
    "confirm_delivery",
    "view_suppliers",
    "view_transactions",
    "create_transactions",
    "view_alerts",
    "view_notifications",
    "mark_notification_read",
    "mark_all_notifications_read",
    "view_profile",
    "view_settings",
  ],
};

export function normalizeRoleKey(role) {
  if (typeof role === "number") return ROLE_ID_TO_KEY[role] || ROLE_KEYS.STAFF;

  const normalized = String(role || "").trim().toLowerCase();
  if (normalized === "1") return ROLE_KEYS.ADMIN;
  if (normalized === "2") return ROLE_KEYS.MANAGER;
  if (normalized === "3") return ROLE_KEYS.STAFF;
  if (normalized.includes("admin")) return ROLE_KEYS.ADMIN;
  if (normalized.includes("manager")) return ROLE_KEYS.MANAGER;
  return ROLE_KEYS.STAFF;
}

export function roleToId(role) {
  return ROLE_KEY_TO_ID[normalizeRoleKey(role)];
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRoleKey(role)] || ROLE_LABELS[ROLE_KEYS.STAFF];
}

export function getPermissionsForRole(role) {
  return new Set(permissions[normalizeRoleKey(role)] || permissions[ROLE_KEYS.STAFF]);
}

export function hasPermission(role, permission) {
  if (!permission) return true;
  return getPermissionsForRole(role).has(permission);
}

export function canAccessFeature(role, feature) {
  return hasPermission(role, FEATURE_PERMISSIONS[feature] || feature);
}

export function getDefaultRouteForRole(role) {
  return DEFAULT_ROUTE_BY_ROLE[normalizeRoleKey(role)] || "/inventory";
}
