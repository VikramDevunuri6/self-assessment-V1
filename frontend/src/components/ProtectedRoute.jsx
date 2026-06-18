import { Navigate } from "react-router-dom";
import { getAccessToken, getUser } from "../services/tokenStorage";
import { ROLES } from "../constants/roles";

export default function ProtectedRoute({ role, roles, children }) {
  const token = getAccessToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = roles || (role ? [role] : null);

  if (allowedRoles) {
    const user = getUser();
    if (!allowedRoles.includes(user?.role)) {
      return <Navigate to={user?.role === ROLES.STUDENT ? "/dashboard" : "/admin"} replace />;
    }
  }

  return children;
}
