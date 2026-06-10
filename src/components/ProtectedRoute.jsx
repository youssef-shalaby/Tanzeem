import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * Checks authentication first, then checks a named feature or permission.
 */
export default function ProtectedRoute({ children, feature, permission }) {
  const { currentUser, isFeatureAllowed, can } = useAuth();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (feature && !isFeatureAllowed(feature)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && !can(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
