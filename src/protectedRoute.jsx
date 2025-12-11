import { Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";

const ProtectedRoute = ({ children, page, action = "view" }) => {
  const { getUser, can } = useAuth();
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!can(action)) return <Navigate to="/a1/no-permission" replace />;
  return children;
};

export default ProtectedRoute;
