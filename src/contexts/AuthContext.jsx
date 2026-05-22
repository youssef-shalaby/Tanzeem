import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "tanzeem_auth";

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
    email: email,
    role: normalizeRole(source.role || source.userRole),
  };
}

/* ------------------ Provider ------------------ */

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = readStoredAuth();
    return {
      currentUser: stored?.currentUser || null,
      token: stored?.token || null,
      backendResponse: stored?.backendResponse || null,
    };
  });

  /* restore session on refresh */
  useEffect(() => {
    const stored = readStoredAuth();
    if (stored) setAuthState(stored);
  }, []);

  /* LOGIN / SIGNUP */
  const setSession = (data) => {
    // Handle case where backend returns raw JWT string
    const token = typeof data === "string" ? data : extractToken(data);
    const currentUser = token ? decodeJWT(token) : normalizeUser(data);

    const nextState = {
      currentUser,
      token,
      backendResponse: data,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setAuthState(nextState);

    return nextState;
  };

  /* manual update */
  const setCurrentUser = (currentUser) => {
    const nextState = {
      ...authState,
      currentUser,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setAuthState(nextState);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      currentUser: null,
      token: null,
      backendResponse: null,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: !!authState.currentUser,
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