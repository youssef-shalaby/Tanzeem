import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { permissions } from '../config/permissions';

export default function ProtectedRoute({
  children,
  requiredPermission,
}) {
  const { currentUser } = useAuth();

  const userPermissions =
    permissions[currentUser.role] || [];

  const hasPermission =
    userPermissions.includes(requiredPermission);

  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}