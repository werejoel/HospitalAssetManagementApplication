import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="md:ml-[250px] transition-all duration-300 pt-16 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
