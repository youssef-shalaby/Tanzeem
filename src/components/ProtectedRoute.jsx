import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import UnauthorizedPage from "../pages/UnauthorizedPage";

/**
 * Checks authentication first, then checks a named feature or permission.
 */
export default function ProtectedRoute({ children, feature, permission }) {
  const { currentUser, isFeatureAllowed, can } = useAuth();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  if (feature && !isFeatureAllowed(feature)) {
    return <UnauthorizedPage />;
  }

  if (permission && !can(permission)) {
    return <UnauthorizedPage />;
  }

  return children;
}
