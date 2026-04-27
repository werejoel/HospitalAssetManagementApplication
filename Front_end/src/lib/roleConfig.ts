import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  Building2,
  ClipboardList,
  LayoutDashboard,
  Package,
  Trash2,
  Truck,
  Users,
  Wrench,
} from "lucide-react";

export type Role =
  | "admin"
  | "asset_manager"
  | "technician"
  | "department_head"
  | "staff";

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
  section: string;
};

export const navItems: NavItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "asset_manager"],
    section: "Overview",
  },
  {
    path: "/assets",
    label: "Assets",
    icon: Package,
    roles: ["admin", "asset_manager", "technician", "department_head"],
    section: "Inventory",
  },
  {
    path: "/departments",
    label: "Departments",
    icon: Building2,
    roles: ["admin", "department_head"],
    section: "Inventory",
  },
  {
    path: "/suppliers",
    label: "Suppliers",
    icon: Truck,
    roles: ["admin", "asset_manager"],
    section: "Inventory",
  },
  {
    path: "/maintenance",
    label: "Maintenance",
    icon: Wrench,
    roles: ["admin", "asset_manager", "technician"],
    section: "Service",
  },
  {
    path: "/faults",
    label: "Fault Reports",
    icon: AlertTriangle,
    roles: ["admin", "asset_manager", "technician"],
    section: "Service",
  },
  {
    path: "/assignments",
    label: "Assignments",
    icon: ClipboardList,
    roles: ["admin", "asset_manager", "department_head"],
    section: "Operations",
  },
  {
    path: "/movements",
    label: "Movements",
    icon: ArrowLeftRight,
    roles: ["admin", "asset_manager"],
    section: "Operations",
  },
  {
    path: "/disposals",
    label: "Disposals",
    icon: Trash2,
    roles: ["admin", "asset_manager"],
    section: "Operations",
  },
  {
    path: "/users",
    label: "Users",
    icon: Users,
    roles: ["admin"],
    section: "Administration",
  },
];

export const getNavItemsForRole = (role: Role | string) => {
  const getDefaultRouteForRole = (role: string) => {
    switch (role) {
      case "asset_manager":
        return "/assets";
      case "technician":
        return "/maintenance";
      case "department_head":
        return "/departments";
      case "staff":
        return "/assets";
      default:
        return "/";
    }
  };

  if (role === "admin") {
    return navItems;
  }

  return navItems.filter((item) => item.roles.includes(role as Role));
};

export const routePermissions: Record<string, Role[]> = {
  "/": ["admin", "asset_manager"],
  "/assets": ["admin", "asset_manager", "technician", "department_head"],
  "/departments": ["admin", "department_head"],
  "/suppliers": ["admin", "asset_manager"],
  "/maintenance": ["admin", "asset_manager", "technician"],
  "/faults": ["admin", "asset_manager", "technician"],
  "/assignments": ["admin", "asset_manager", "department_head"],
  "/movements": ["admin", "asset_manager"],
  "/disposals": ["admin", "asset_manager"],
  "/users": ["admin"],
};
