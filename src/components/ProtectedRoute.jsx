import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import UnauthorizedPage from "../pages/UnauthorizedPage";

/**
 * Checks authentication first, then optionally checks a feature gate.
 * The feature gate uses the probed results from AuthContext — no API call needed here.
 */
export default function ProtectedRoute({ children, feature }) {
  const { currentUser, isFeatureAllowed, allowedFeatures } = useAuth();

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  // If a feature is specified and probing is done (allowedFeatures !== null),
  // block immediately before the page renders anything
  if (feature && allowedFeatures !== null && !isFeatureAllowed(feature)) {
    return <UnauthorizedPage />;
  }

  return children;
}