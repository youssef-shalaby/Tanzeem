import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'tanzeem_auth';

function readStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  if (typeof role === 'number') {
    return { 1: 'admin', 2: 'manager', 3: 'staff' }[role] || 'manager';
  }

  const normalized = String(role || 'manager').toLowerCase();
  if (['admin', 'manager', 'staff'].includes(normalized)) return normalized;
  return 'manager';
}

function extractToken(data) {
  return data?.token || data?.accessToken || data?.jwt || data?.data?.token || data?.data?.accessToken || null;
}

function normalizeUser(data, fallbackEmail = '') {
  const source = data?.user || data?.admin || data?.data?.user || data?.data || data || {};

  return {
    id: source.id || source.userId || source.adminId || fallbackEmail || 'current-user',
    name: source.name || source.fullName || source.userName || fallbackEmail || 'Tanzeem User',
    email: source.email || fallbackEmail,
    role: normalizeRole(source.role || source.userRole || source.userRoles),
  };
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = readStoredAuth();
    return {
      currentUser: stored?.currentUser || null,
      token: stored?.token || null,
      backendResponse: stored?.backendResponse || null,
    };
  });

  const setSession = (data, fallbackEmail = '') => {
    const nextState = {
      currentUser: normalizeUser(data, fallbackEmail),
      token: extractToken(data),
      backendResponse: data,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setAuthState(nextState);
    return nextState;
  };

  const setCurrentUser = (currentUser) => {
    const nextState = { ...authState, currentUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    setAuthState(nextState);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({ currentUser: null, token: null, backendResponse: null });
  };

  const value = {
    ...authState,
    isAuthenticated: Boolean(authState.currentUser),
    setSession,
    setCurrentUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
