import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

const STORAGE_KEY = "tanzeem_auth";

// Each sidebar feature and its probe endpoint.
// On load we fire all of them and record which ones the backend allows (non-403).
const FEATURE_PROBES = [
  { feature: "dashboard",       path: "/api/Dashboard/get_four_boxes" },
  { feature: "alerts",          path: "/api/Alert/mini_Alert_dashboard" },
  { feature: "analytics",       path: "/api/DemandForecasting/Get_mini_dashboard" },
  { feature: "orders",          path: "/api/Order?page=1&page_size=1" },
  { feature: "suppliers",       path: "/api/Supplier?page=1&page_size=1" },
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
      id: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "current-user",
      name: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "User",
      email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || "",
      role: normalizeRole(payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]),
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

// Fire all probes and return a Set of allowed feature keys
async function probeFeatures() {
  const results = await Promise.allSettled(
    FEATURE_PROBES.map(({ path }) => apiRequest(path))
  );

  const allowed = new Set();
  results.forEach((result, i) => {
    // fulfilled = backend returned something (200/other non-403)
    // rejected with ForbiddenError = blocked
    // rejected with other error = network/server error, assume allowed to avoid locking people out
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
      allowedFeatures: stored?.allowedFeatures
        ? new Set(stored.allowedFeatures)
        : null, // null = not probed yet
    };
  });

  // On app load, if already logged in but haven't probed yet, probe now
  useEffect(() => {
    if (authState.currentUser && authState.allowedFeatures === null) {
      probeFeatures().then((allowed) => {
        setAuthState((prev) => {
          const next = {
            ...prev,
            allowedFeatures: allowed,
          };
          // Persist allowed features (as array, Sets aren't JSON-serializable)
          const stored = readStoredAuth();
          if (stored) {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ ...stored, allowedFeatures: [...allowed] })
            );
          }
          return next;
        });
      });
    }
  }, []);

  /* LOGIN */
  const setSession = async (data) => {
    const token = typeof data === "string" ? data : extractToken(data);
    const currentUser = token ? decodeJWT(token) : normalizeUser(data);

    // Probe features right after login so sidebar and routes are ready immediately
    const allowedFeatures = await probeFeatures();

    const nextState = {
      currentUser,
      token,
      backendResponse: data,
      allowedFeatures,
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...nextState, allowedFeatures: [...allowedFeatures] })
    );
    setAuthState(nextState);

    return nextState;
  };

  const setCurrentUser = (currentUser) => {
    const nextState = { ...authState, currentUser };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...nextState,
        allowedFeatures: [...(authState.allowedFeatures || [])],
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
    // While probing, default to allowed to avoid flicker on unrestricted features
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