import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/roleConfig";

const getDefaultRouteForRole = (role: string) => {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case "asset_manager":
    case "store_manager":
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

  const normalizedRole = normalizeRole(user?.role);
  const canAccess = allowedRoles.some(
    (allowedRole) => normalizeRole(allowedRole) === normalizedRole,
  );

  if (!user || !canAccess) {
    const defaultRoute = getDefaultRouteForRole(user?.role || "");
    return <Navigate to={defaultRoute} replace />;
  }

  return children;
}
