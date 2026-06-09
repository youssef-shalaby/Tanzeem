/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/api";
import {
  FEATURE_PERMISSIONS,
  canAccessFeature,
  getDefaultRouteForRole,
  getPermissionsForRole,
  hasPermission,
  normalizeRoleKey,
  roleToId,
} from "../config/permissions";

const AuthContext = createContext(null);

const STORAGE_KEY = "tanzeem_auth";

const FEATURE_PROBES = [
  { feature: "dashboard", path: "/api/Dashboard/get_four_boxes" },
  { feature: "alerts", path: "/api/Alert/mini_Alert_dashboard" },
  { feature: "analytics", path: "/api/DemandForecasting/Get_mini_dashboard" },
  { feature: "orders", path: "/api/Order?page=1&page_size=1" },
  { feature: "suppliers", path: "/api/Supplier?page=1&page_size=1" },
  { feature: "delivery-issues", path: "/api/DeliveryIssues?page=1&page_size=1" },
];

/* ------------------ Helpers ------------------ */

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function persistAuthSession({ currentUser, token, backendResponse, deniedFeatures }) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentUser,
      token,
      backendResponse,
      deniedFeatures: Array.from(deniedFeatures || []),
    })
  );
}

function extractToken(data) {
  return (
    data?.token ||
    data?.accessToken ||
    data?.jwt ||
    data?.data?.token ||
    data?.data?.accessToken ||
    null
  );
}

function decodeJWT(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roleClaim =
      payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ] ||
      payload.role ||
      payload.Role ||
      payload.roleId ||
      payload.RoleId;
    const role = normalizeRoleKey(roleClaim);

    return {
      id:
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] || "current-user",
      name:
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
        ] || "User",
      email:
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ] || "",
      role,
      roleId: roleToId(role),
      companyId: payload["CompanyId"] || null,
      branchId: payload["BranchId"] || null,
    };
  } catch {
    return null;
  }
}

function normalizeUser(data) {
  const source = data?.user || data?.data || data || {};
  const email = source.email || "";
  const role = normalizeRoleKey(source.role || source.userRole || source.roleId || source.role_id);

  return {
    id: source.id || source.userId || email || "current-user",
    name:
      source.name ||
      source.fullName ||
      source.userName ||
      (email ? email.split("@")[0] : "User"),
    email,
    role,
    roleId: roleToId(role),
    companyId: source.companyId || source.companyID || source.company_id || null,
    branchId: source.branchId || source.branchID || source.branch_id || null,
  };
}

function deriveAllowedFeatures(currentUser, deniedFeatures = new Set()) {
  const allowed = new Set();

  Object.keys(FEATURE_PERMISSIONS).forEach((feature) => {
    if (canAccessFeature(currentUser?.role, feature) && !deniedFeatures.has(feature)) {
      allowed.add(feature);
    }
  });

  return allowed;
}

async function probeDeniedFeatures(currentUser) {
  const results = await Promise.allSettled(
    FEATURE_PROBES.map(({ path }) => apiRequest(path))
  );

  const denied = new Set();

  results.forEach((result, i) => {
    const feature = FEATURE_PROBES[i].feature;
    if (!canAccessFeature(currentUser?.role, feature)) {
      denied.add(feature);
      return;
    }

    if (result.status === "rejected" && result.reason?.name === "ForbiddenError") {
      denied.add(feature);
    }
  });

  return denied;
}

/* ------------------ Provider ------------------ */

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = readStoredAuth();
    const deniedFeatures = new Set(stored?.deniedFeatures || []);

    return {
      currentUser: stored?.currentUser || null,
      token: stored?.token || null,
      backendResponse: stored?.backendResponse || null,
      deniedFeatures,
      allowedFeatures: stored?.currentUser ? deriveAllowedFeatures(stored.currentUser, deniedFeatures) : new Set(),
      permissions: stored?.currentUser ? getPermissionsForRole(stored.currentUser.role) : new Set(),
      permissionsReady: !stored?.currentUser || Array.isArray(stored?.deniedFeatures),
    };
  });

  useEffect(() => {
    if (authState.currentUser) {
      probeDeniedFeatures(authState.currentUser).then((deniedFeatures) => {
        setAuthState((prev) => ({
          ...prev,
          deniedFeatures,
          allowedFeatures: deriveAllowedFeatures(prev.currentUser, deniedFeatures),
          permissions: getPermissionsForRole(prev.currentUser?.role),
          permissionsReady: true,
        }));
        persistAuthSession({
          currentUser: authState.currentUser,
          token: authState.token,
          backendResponse: authState.backendResponse,
          deniedFeatures,
        });
      });
    }
  }, [authState.backendResponse, authState.currentUser, authState.token]);

  /* LOGIN */
  const setSession = async (data) => {
    const token = typeof data === "string" ? data : extractToken(data);
    const currentUser = token ? decodeJWT(token) || normalizeUser(data) : normalizeUser(data);

    const nextState = { currentUser, token, backendResponse: data };

    const deniedFeatures = await probeDeniedFeatures(currentUser);
    const allowedFeatures = deriveAllowedFeatures(currentUser, deniedFeatures);
    const permissions = getPermissionsForRole(currentUser?.role);

    persistAuthSession({ ...nextState, deniedFeatures });

    setAuthState({ ...nextState, deniedFeatures, allowedFeatures, permissions, permissionsReady: true });

    return { ...nextState, deniedFeatures, allowedFeatures, permissions, permissionsReady: true };
  };

  const setCurrentUser = (currentUser) => {
    const normalizedUser = {
      ...currentUser,
      role: normalizeRoleKey(currentUser?.role || currentUser?.roleId || currentUser?.role_id),
      roleId: roleToId(currentUser?.role || currentUser?.roleId || currentUser?.role_id),
    };
    const nextState = {
      ...authState,
      currentUser: normalizedUser,
      permissions: getPermissionsForRole(normalizedUser.role),
      allowedFeatures: deriveAllowedFeatures(normalizedUser, authState.deniedFeatures),
      permissionsReady: true,
    };

    persistAuthSession({
      currentUser: normalizedUser,
      token: authState.token,
      backendResponse: authState.backendResponse,
      deniedFeatures: authState.deniedFeatures,
    });

    setAuthState(nextState);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);

    setAuthState({
      currentUser: null,
      token: null,
      backendResponse: null,
      deniedFeatures: new Set(),
      allowedFeatures: new Set(),
      permissions: new Set(),
      permissionsReady: true,
    });
  };

  const isFeatureAllowed = (feature) => {
    if (!authState.currentUser) return false;
    return authState.allowedFeatures.has(feature);
  };

  const can = (permission) => {
    if (!authState.currentUser) return false;
    return hasPermission(authState.currentUser.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: !!authState.currentUser,
        isFeatureAllowed,
        can,
        getDefaultRoute: () => getDefaultRouteForRole(authState.currentUser?.role),
        setSession,
        setCurrentUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
