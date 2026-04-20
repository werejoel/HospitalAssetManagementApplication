import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/admin/Dashboard";
import ManagerDashboard from "@/pages/manager/Dashboard";
import Assets from "@/pages/manager/Assets";
import Departments from "@/pages/inventory/Departments";
import Maintenance from "@/pages/manager/Maintenance";
import FaultReports from "@/pages/manager/FaultReports";
import Assignments from "@/pages/manager/Assignments";
import Movements from "@/pages/manager/Movements";
import Suppliers from "@/pages/manager/Suppliers";
import UsersPage from "@/pages/admin/UsersPage";
import Disposals from "@/pages/manager/Disposals";
import Login from "@/app/Login";
import Signup from "@/app/Signup";
import RequireAuth from "@/components/RequireAuth";
import RequireRole from "@/components/RequireRole";
import { routePermissions } from "@/lib/roleConfig";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/app/NotFound";

const queryClient = new QueryClient();

const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.role === "admin" ? <Dashboard /> : <ManagerDashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route
                path="/"
                element={
                  <RequireRole allowedRoles={routePermissions["/"]}>
                    <DashboardRouter />
                  </RequireRole>
                }
              />
              <Route
                path="/assets"
                element={
                  <RequireRole allowedRoles={routePermissions["/assets"]}>
                    <Assets />
                  </RequireRole>
                }
              />
              <Route
                path="/departments"
                element={
                  <RequireRole allowedRoles={routePermissions["/departments"]}>
                    <Departments />
                  </RequireRole>
                }
              />
              <Route
                path="/maintenance"
                element={
                  <RequireRole allowedRoles={routePermissions["/maintenance"]}>
                    <Maintenance />
                  </RequireRole>
                }
              />
              <Route
                path="/faults"
                element={
                  <RequireRole allowedRoles={routePermissions["/faults"]}>
                    <FaultReports />
                  </RequireRole>
                }
              />
              <Route
                path="/assignments"
                element={
                  <RequireRole allowedRoles={routePermissions["/assignments"]}>
                    <Assignments />
                  </RequireRole>
                }
              />
              <Route
                path="/movements"
                element={
                  <RequireRole allowedRoles={routePermissions["/movements"]}>
                    <Movements />
                  </RequireRole>
                }
              />
              <Route
                path="/suppliers"
                element={
                  <RequireRole allowedRoles={routePermissions["/suppliers"]}>
                    <Suppliers />
                  </RequireRole>
                }
              />
              <Route
                path="/disposals"
                element={
                  <RequireRole allowedRoles={routePermissions["/disposals"]}>
                    <Disposals />
                  </RequireRole>
                }
              />
              <Route
                path="/users"
                element={
                  <RequireRole allowedRoles={routePermissions["/users"]}>
                    <UsersPage />
                  </RequireRole>
                }
              />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
