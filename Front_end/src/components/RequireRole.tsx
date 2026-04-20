import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const getDefaultRouteForRole = (role: string) => {
  switch (role) {
    case "asset_manager":
      return "/assets";
    case "technician":
      return "/maintenance";
    case "department_head":
      return "/departments";
    case "staff":
      return "/assets"; // or some other default
    default:
      return "/";
  }
};

export default function RequireRole({
  allowedRoles,
  children,
}: {
  allowedRoles: string[];
  children: JSX.Element;
}) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    const defaultRoute = getDefaultRouteForRole(user?.role || "");
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}
