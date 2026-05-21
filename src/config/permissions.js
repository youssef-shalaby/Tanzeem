export const permissions = {
  admin: [
    // Dashboard
    "view_dashboard",

    // Company
    "view_company",
    "update_company",
    "delete_company",

    // Branch
    "view_branch",
    "view_all_branches",
    "create_branch",
    "update_branch",
    "delete_branch",

    // Employees
    "create_employee",
    "assign_employee",

    // Products
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",

    // Orders
    "view_orders",
    "create_orders",
    "manage_orders",
    "delete_orders",
    "confirm_delivery",

    // Suppliers
    "view_suppliers",
    "create_suppliers",
    "manage_suppliers",
    "delete_suppliers",

    'view_analytics',
    "view_delivery_issues",

    // Transactions
    "view_transactions",
    "view_all_transactions",
    "create_transactions",

    // Alerts
    "view_alerts",
    "view_alert_dashboard",

    // Alert Configurations
    "view_alert_config",
    "create_alert_config",
    "update_alert_config",

    // Notifications
    "view_notifications",
    "mark_notification_read",
    "mark_all_notifications_read",

    // Profile & Settings
    "view_profile",
    "view_settings",

    // Users (future-proofing)
    "manage_users",
  ],

  manager: [
    // Dashboard
    "view_dashboard",

    // Company
    "view_company",
    "update_company",
    "delete_company",

    // Branch
    "view_branch",
    "view_all_branches",
    "create_branch",
    "update_branch",
    "delete_branch",

    // Employees
    "create_employee",
    "assign_employee",

    // Products
    "view_products",
    "create_products",
    "edit_products",
    "delete_products",

    // Orders
    "view_orders",
    "create_orders",
    "manage_orders",
    "delete_orders",
    "confirm_delivery",

    // Suppliers
    "view_suppliers",
    "create_suppliers",
    "manage_suppliers",
    "delete_suppliers",

    'view_analytics',
    "view_delivery_issues",

    // Transactions
    "view_transactions",
    "view_all_transactions",
    "create_transactions",

    // Alerts
    "view_alerts",
    "view_alert_dashboard",

    // Alert Configurations
    "view_alert_config",
    "create_alert_config",
    "update_alert_config",

    // Notifications
    "view_notifications",
    "mark_notification_read",
    "mark_all_notifications_read",

    // Profile & Settings
    "view_profile",
    "view_settings",

    // Users (future-proofing)
    "manage_users",
  ],

  staff: [
    // Branch
    "view_branch", // own branch only

    // Products
    "view_products",

    // Orders
    "view_orders", // own branch only
    "confirm_delivery",

    // Suppliers
    "view_suppliers",

    // Transactions
    "create_transactions",
    "view_transactions", // own only

    // Alerts
    "view_alerts", // limited types

    // Notifications
    "view_notifications",
    "mark_notification_read",
    "mark_all_notifications_read",

    // Profile & Settings
    "view_profile",
    "view_settings",
  ],
};