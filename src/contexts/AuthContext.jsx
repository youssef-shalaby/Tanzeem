import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/api";

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

function normalizeRole(role) {
  if (!role) return "staff";
  if (typeof role === "number") {
    return { 1: "admin", 2: "manager", 3: "staff" }[role] || "staff";
  }
  return String(role).toLowerCase();
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
      role: normalizeRole(
        payload[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ]
      ),
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
  return {
    id: source.id || source.userId || email || "current-user",
    name:
      source.name ||
      source.fullName ||
      source.userName ||
      (email ? email.split("@")[0] : "User"),
    email,
    role: normalizeRole(source.role || source.userRole),
  };
}

async function probeFeatures() {
  const results = await Promise.allSettled(
    FEATURE_PROBES.map(({ path }) => apiRequest(path))
  );

  const allowed = new Set();

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      allowed.add(FEATURE_PROBES[i].feature);
    } else if (result.reason?.name !== "ForbiddenError") {
      allowed.add(FEATURE_PROBES[i].feature);
    }
  });

  return allowed;
}

/* ------------------ Provider ------------------ */

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = readStoredAuth();

    return {
      currentUser: stored?.currentUser || null,
      token: stored?.token || null,
      backendResponse: stored?.backendResponse || null,
      allowedFeatures: null,
    };
  });

  useEffect(() => {
    if (authState.currentUser) {
      probeFeatures().then((allowed) => {
        setAuthState((prev) => ({ ...prev, allowedFeatures: allowed }));
      });
    }
  }, []);

  /* LOGIN */
  const setSession = async (data) => {
    const token = typeof data === "string" ? data : extractToken(data);
    const currentUser = token ? decodeJWT(token) : normalizeUser(data);

    const nextState = { currentUser, token, backendResponse: data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

    const allowedFeatures = await probeFeatures();

    setAuthState({ ...nextState, allowedFeatures });

    return { ...nextState, allowedFeatures };
  };

  const setCurrentUser = (currentUser) => {
    const nextState = { ...authState, currentUser };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentUser,
        token: authState.token,
        backendResponse: authState.backendResponse,
      })
    );

    setAuthState(nextState);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);

    setAuthState({
      currentUser: null,
      token: null,
      backendResponse: null,
      allowedFeatures: null,
    });
  };

  const isFeatureAllowed = (feature) => {
    if (authState.allowedFeatures === null) return true;
    return authState.allowedFeatures.has(feature);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: !!authState.currentUser,
        isFeatureAllowed,
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