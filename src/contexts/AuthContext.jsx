/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
      companyId:
        payload["CompanyId"] ||
        payload["companyId"] ||
        payload["CompanyID"] ||
        payload["companyID"] ||
        payload["company_id"] ||
        null,
      branchId:
        payload["BranchId"] ||
        payload["branchId"] ||
        payload["BranchID"] ||
        payload["branchID"] ||
        payload["branch_id"] ||
        null,
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
    const tokenUser = stored?.token ? decodeJWT(stored.token) : null;
    const currentUser = tokenUser
      ? { ...(stored?.currentUser || {}), ...tokenUser }
      : stored?.currentUser || null;

    return {
      currentUser,
      token: stored?.token || null,
      backendResponse: stored?.backendResponse || null,
      deniedFeatures,
      allowedFeatures: currentUser ? deriveAllowedFeatures(currentUser, deniedFeatures) : new Set(),
      permissions: currentUser ? getPermissionsForRole(currentUser.role) : new Set(),
      permissionsReady: !currentUser || Array.isArray(stored?.deniedFeatures),
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
  const setSession = useCallback(async (data) => {
    const token = typeof data === "string" ? data : extractToken(data);
    const currentUser = token ? decodeJWT(token) || normalizeUser(data) : normalizeUser(data);

    const nextState = { currentUser, token, backendResponse: data };

    const deniedFeatures = await probeDeniedFeatures(currentUser);
    const allowedFeatures = deriveAllowedFeatures(currentUser, deniedFeatures);
    const permissions = getPermissionsForRole(currentUser?.role);

    persistAuthSession({ ...nextState, deniedFeatures });

    setAuthState({ ...nextState, deniedFeatures, allowedFeatures, permissions, permissionsReady: true });

    return { ...nextState, deniedFeatures, allowedFeatures, permissions, permissionsReady: true };
  }, []);

  const setCurrentUser = useCallback((currentUser) => {
    const normalizedUser = {
      ...currentUser,
      role: normalizeRoleKey(currentUser?.role || currentUser?.roleId || currentUser?.role_id),
      roleId: roleToId(currentUser?.role || currentUser?.roleId || currentUser?.role_id),
    };

    setAuthState((prev) => {
      const nextState = {
        ...prev,
        currentUser: normalizedUser,
        permissions: getPermissionsForRole(normalizedUser.role),
        allowedFeatures: deriveAllowedFeatures(normalizedUser, prev.deniedFeatures),
        permissionsReady: true,
      };

      persistAuthSession({
        currentUser: normalizedUser,
        token: prev.token,
        backendResponse: prev.backendResponse,
        deniedFeatures: prev.deniedFeatures,
      });

      return nextState;
    });
  }, []);

  const logout = useCallback(() => {
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
  }, []);

  const isFeatureAllowed = useCallback((feature) => {
    if (!authState.currentUser) return false;
    return authState.allowedFeatures.has(feature);
  }, [authState.allowedFeatures, authState.currentUser]);

  const can = useCallback((permission) => {
    if (!authState.currentUser) return false;
    return hasPermission(authState.currentUser.role, permission);
  }, [authState.currentUser]);

  const getDefaultRoute = useCallback(
    () => getDefaultRouteForRole(authState.currentUser?.role),
    [authState.currentUser?.role]
  );

  const value = useMemo(() => ({
    ...authState,
    isAuthenticated: !!authState.currentUser,
    isFeatureAllowed,
    can,
    getDefaultRoute,
    setSession,
    setCurrentUser,
    logout,
  }), [
    authState,
    isFeatureAllowed,
    can,
    getDefaultRoute,
    setSession,
    setCurrentUser,
    logout,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
