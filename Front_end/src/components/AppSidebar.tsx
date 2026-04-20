import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getNavItemsForRole } from "@/lib/roleConfig";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function SidebarContent({ collapsed, setCollapsed, onMobileClose }: any) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const items = getNavItemsForRole(user?.role || "staff");
  const sections = [
    "Overview",
    "Inventory",
    "Operations",
    "Service",
    "Administration",
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    onMobileClose?.();
  };

  return (
    <div
      className={`h-screen min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-xl flex flex-col transition-all duration-300 ${collapsed ? "w-[68px]" : "w-[250px]"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
          <Activity className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-sidebar-foreground leading-tight">
              MBALE REGIONAL
            </h1>
            <p className="text-[10px] text-sidebar-muted leading-tight">
              Asset Information Management
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-sidebar-muted">
              {user?.role.replaceAll("_", " ")}
            </p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-4 overflow-y-auto">
        {sections.map((section) => {
          const sectionItems = items.filter((item) => item.section === section);
          if (!sectionItems.length) {
            return null;
          }

          return (
            <div key={section} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-sidebar-muted">
                  {section}
                </div>
              )}
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? "text-sidebar-primary" : ""}`}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-[18px] h-[18px]" />
          ) : (
            <ChevronLeft className="w-[18px] h-[18px]" />
          )}
          {!collapsed && <span>Collapse Bar</span>}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all w-full"
        >
          <LogOut className="w-[18px] h-[18px]" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );
}

function AppSidebarDesktop() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="hidden md:block fixed left-0 top-0 h-screen z-50">
      <SidebarContent collapsed={collapsed} setCollapsed={setCollapsed} />
    </div>
  );
}

function AppSidebarMobile() {
  const [open, setOpen] = useState(false);
  const [collapsed] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="fixed top-4 left-4 p-2 rounded-lg bg-primary text-primary-foreground z-40 md:hidden hover:bg-primary/90 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 w-[250px] flex flex-col bg-sidebar text-sidebar-foreground"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border md:hidden">
          <h2 className="text-sm font-bold">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg hover:bg-secondary transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent
            collapsed={collapsed}
            setCollapsed={() => {}}
            onMobileClose={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function AppSidebar() {
  return (
    <>
      <AppSidebarDesktop />
      <AppSidebarMobile />
    </>
  );
}

AppSidebar.Mobile = AppSidebarMobile;
