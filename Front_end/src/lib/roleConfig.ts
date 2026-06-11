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
  | "store_manager"
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

export const normalizeRole = (role?: string) => {
  const normalized = role?.toLowerCase().trim();

  if (!normalized) {
    return "";
  }

  if (normalized === "asset_manager") {
    return "store_manager";
  }

  return normalized;
};

export const canManageAssetStatus = (role?: string) => {
  const normalizedRole = normalizeRole(role);
  return ["admin", "asset_manager", "store_manager"].includes(normalizedRole);
};

export const formatRoleLabel = (role?: string) => {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case "admin":
      return "Administrator";
    case "asset_manager":
    case "store_manager":
      return "Store Manager";
    case "technician":
      return "Technician";
    case "department_head":
      return "Department Head";
    case "staff":
      return "Staff";
    default:
      return role?.replaceAll("_", " ") || "User";
  }
};

export const navItems: NavItem[] = [
  {
    path: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "asset_manager", "store_manager", "staff"],
    section: "Overview",
  },
  {
    path: "/assets",
    label: "Assets",
    icon: Package,
    roles: ["admin", "asset_manager", "store_manager", "technician", "department_head", "staff"],
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
    roles: ["admin", "asset_manager", "store_manager"],
    section: "Inventory",
  },
  {
    path: "/maintenance",
    label: "Maintenance",
    icon: Wrench,
    roles: ["admin", "asset_manager", "store_manager", "technician", "staff"],
    section: "Service",
  },
  {
    path: "/faults",
    label: "Fault Reports",
    icon: AlertTriangle,
    roles: ["admin", "asset_manager", "store_manager", "technician", "staff"],
    section: "Service",
  },
  {
    path: "/assignments",
    label: "Requests",
    icon: ClipboardList,
    roles: ["admin", "asset_manager", "store_manager", "department_head", "staff"],
    section: "Operations",
  },
  {
    path: "/movements",
    label: "Movements",
    icon: ArrowLeftRight,
    roles: ["admin", "asset_manager", "store_manager"],
    section: "Operations",
  },
  {
    path: "/disposals",
    label: "Disposals",
    icon: Trash2,
    roles: ["admin", "asset_manager", "store_manager"],
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
        return "/assets";
      default:
        return "/";
    }
  };

  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "admin") {
    return navItems;
  }

  return navItems.filter((item) =>
    item.roles.includes(normalizedRole as Role),
  );
};

export const routePermissions: Record<string, Role[]> = {
  "/": ["admin", "asset_manager", "store_manager", "staff"],
  "/assets": ["admin", "asset_manager", "store_manager", "technician", "department_head", "staff"],
  "/maintenance": ["admin", "asset_manager", "store_manager", "technician", "staff"],
  "/faults": ["admin", "asset_manager", "store_manager", "technician", "staff"],
  "/departments": ["admin", "department_head"],
  "/suppliers": ["admin", "asset_manager", "store_manager"],
  "/assignments": ["admin", "asset_manager", "store_manager", "department_head", "staff"],
  "/movements": ["admin", "asset_manager", "store_manager"],
  "/disposals": ["admin", "asset_manager", "store_manager"],
  "/users": ["admin"],
};
