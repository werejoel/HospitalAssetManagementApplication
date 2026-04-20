import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RequireAuth({ children }: { children: JSX.Element }) {
  const { signedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!signedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
