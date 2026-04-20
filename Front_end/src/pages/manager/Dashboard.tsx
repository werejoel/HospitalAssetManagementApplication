import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Package,
  Activity,
  Wrench,
  AlertTriangle,
  Building2,
  ClipboardList,
  Truck,
  ArrowLeftRight,
  Trash2,
  Search,
  X,
  RotateCcw,
  Download,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import "../admin/css/Dashboard.css";
import StatCard from "@/components/StatCard";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  assetsAPI,
  departmentsAPI,
  assetCategoriesAPI,
  faultReportsAPI,
  assignmentsAPI,
  suppliersAPI,
  maintenanceAPI,
  movementsAPI,
  disposalsAPI,
} from "@/lib/api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "hsl(174,62%,32%)",
  "hsl(38,92%,50%)",
  "hsl(200,25%,12%)",
  "hsl(152,60%,40%)",
  "hsl(200,15%,60%)",
];

const managerNormalizeStatus = (status: string | undefined) =>
  status?.toString().trim().toLowerCase().replace(/\s+/g, "_") || "";

const ManagerDashboard = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<
    "all" | "needs_attention" | "maintenance" | "available"
  >("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useQuery({ queryKey: ["assets"], queryFn: assetsAPI.getAll });

  const {
    data: departments = [],
    isLoading: departmentsLoading,
    error: departmentsError,
  } = useQuery({ queryKey: ["departments"], queryFn: departmentsAPI.getAll });

  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery({
    queryKey: ["assetCategories"],
    queryFn: assetCategoriesAPI.getAll,
  });

  const {
    data: faultReports = [],
    isLoading: faultsLoading,
    error: faultsError,
  } = useQuery({ queryKey: ["faultReports"], queryFn: faultReportsAPI.getAll });

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useQuery({ queryKey: ["assignments"], queryFn: assignmentsAPI.getAll });

  const {
    data: suppliers = [],
    isLoading: suppliersLoading,
    error: suppliersError,
  } = useQuery({ queryKey: ["suppliers"], queryFn: suppliersAPI.getAll });

  const {
    data: maintenance = [],
    isLoading: maintenanceLoading,
    error: maintenanceError,
  } = useQuery({ queryKey: ["maintenance"], queryFn: maintenanceAPI.getAll });

  const {
    data: movements = [],
    isLoading: movementsLoading,
    error: movementsError,
  } = useQuery({ queryKey: ["movements"], queryFn: movementsAPI.getAll });

  const {
    data: disposals = [],
    isLoading: disposalsLoading,
    error: disposalsError,
  } = useQuery({ queryKey: ["disposals"], queryFn: disposalsAPI.getAll });

  const isLoading =
    assetsLoading ||
    departmentsLoading ||
    categoriesLoading ||
    faultsLoading ||
    assignmentsLoading ||
    suppliersLoading ||
    maintenanceLoading ||
    movementsLoading ||
    disposalsLoading;

  const error =
    assetsError ||
    departmentsError ||
    categoriesError ||
    faultsError ||
    assignmentsError ||
    suppliersError ||
    maintenanceError ||
    movementsError ||
    disposalsError;

  const filteredAssets = useMemo(() => {
    let results = assets;

    // Apply filter mode first
    if (filterMode === "needs_attention") {
      results = results.filter((asset) => {
        const status = managerNormalizeStatus(asset.status);
        return (
          status === "under_maintenance" ||
          status === "faulty" ||
          status === "maintenance"
        );
      });
    } else if (filterMode === "maintenance") {
      results = results.filter((asset) => {
        const status = managerNormalizeStatus(asset.status);
        return status === "under_maintenance" || status === "maintenance";
      });
    } else if (filterMode === "available") {
      results = results.filter(
        (asset) => managerNormalizeStatus(asset.status) === "available",
      );
    }

    // Apply search filter
    if (!search.trim()) {
      return results;
    }

    const query = search.toLowerCase();
    return results.filter(
      (asset) =>
        (asset.asset_name || "").toLowerCase().includes(query) ||
        (asset.asset_tag || "").toLowerCase().includes(query) ||
        (asset.status || "").toLowerCase().includes(query) ||
        (asset.serial_number || "").toLowerCase().includes(query) ||
        (
          departments.find((d) => d.id === asset.department_id)
            ?.department_name || ""
        )
          .toLowerCase()
          .includes(query) ||
        (
          categories.find((c) => c.id === asset.category_id)?.category_name ||
          ""
        )
          .toLowerCase()
          .includes(query),
    );
  }, [assets, filterMode, search, departments, categories]);

  const filteredDepartments = useMemo(() => {
    if (!search.trim()) {
      return departments;
    }

    const query = search.toLowerCase();
    return departments.filter((dept) =>
      (dept.department_name || "").toLowerCase().includes(query),
    );
  }, [departments, search]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return categories;
    }

    const query = search.toLowerCase();
    return categories.filter((cat) =>
      (cat.category_name || "").toLowerCase().includes(query),
    );
  }, [categories, search]);

  const dashboardStats = useMemo(() => {
    const totalAssets = filteredAssets.length;
    const activeAssets = filteredAssets.filter(
      (asset) => managerNormalizeStatus(asset.status) === "available",
    ).length;
    const maintenanceAssets = filteredAssets.filter((asset) => {
      const status = managerNormalizeStatus(asset.status);
      return status === "maintenance" || status === "under_maintenance";
    }).length;
    const openFaults = faultReports.filter(
      (fault) => fault.status === "pending",
    ).length;

    return {
      totalAssets,
      activeAssets,
      maintenanceAssets,
      openFaults,
      suppliers: suppliers.length,
      assignments: assignments.length,
      movements: movements.length,
      disposals: disposals.length,
      departments: filteredDepartments.length,
      categories: filteredCategories.length,
    };
  }, [
    filteredAssets,
    filteredDepartments,
    filteredCategories,
    faultReports,
    suppliers,
    assignments,
    movements,
    disposals,
  ]);

  const recentAssignments = useMemo(
    () => assignments.slice(0, 5),
    [assignments],
  );

  const categoryData = useMemo(
    () =>
      filteredCategories.map((category) => ({
        name: category.category_name,
        value: filteredAssets.filter(
          (asset) => asset.category_id === category.id,
        ).length,
      })),
    [filteredAssets, filteredCategories],
  );

  const departmentData = useMemo(
    () =>
      filteredDepartments.map((department) => ({
        name: department.department_name,
        assets: filteredAssets.filter(
          (asset) => asset.department_id === department.id,
        ).length,
      })),
    [filteredAssets, filteredDepartments],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["assets"] }),
        queryClient.invalidateQueries({ queryKey: ["departments"] }),
        queryClient.invalidateQueries({ queryKey: ["assetCategories"] }),
        queryClient.invalidateQueries({ queryKey: ["faultReports"] }),
        queryClient.invalidateQueries({ queryKey: ["assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
        queryClient.invalidateQueries({ queryKey: ["maintenance"] }),
        queryClient.invalidateQueries({ queryKey: ["movements"] }),
        queryClient.invalidateQueries({ queryKey: ["disposals"] }),
      ]);

      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["assets"] }),
        queryClient.refetchQueries({ queryKey: ["departments"] }),
        queryClient.refetchQueries({ queryKey: ["assetCategories"] }),
        queryClient.refetchQueries({ queryKey: ["faultReports"] }),
        queryClient.refetchQueries({ queryKey: ["assignments"] }),
        queryClient.refetchQueries({ queryKey: ["suppliers"] }),
        queryClient.refetchQueries({ queryKey: ["maintenance"] }),
        queryClient.refetchQueries({ queryKey: ["movements"] }),
        queryClient.refetchQueries({ queryKey: ["disposals"] }),
      ]);
    } catch (err) {
      console.error("Failed to refresh manager dashboard:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 md:p-6">Loading manager dashboard...</div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:p-6 text-destructive">
        Failed to load manager dashboard data.
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="sticky top-0 z-30 -mx-4 sm:-mx-6 md:-mx-6 px-4 sm:px-6 md:px-6 py-3 bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className=" sm:text-xl md:text-2xl font-bold tracking-tight uppercase mb-1">
              Dashboard
            </h1>
            <p className="text-[11px] sm:text-xs md:text-sm uppercase tracking-widest text-slate-300/80">
              Overview for asset management and approvals
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`gap-1 h-9 transition-all border-0 text-white ${isRefreshing ? "bg-slate-500" : "bg-primary hover:bg-primary/80"}`}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing" : "Refresh Data"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSearch("");
                setFilterMode("all");
              }}
              className="gap-1 h-9 bg-slate-600 hover:bg-slate-700 text-white border-0"
            >
              <RotateCcw className="w-4 h-4" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-4 px-4 sm:px-6 md:p-6 space-y-6">
        <div className="dashboard-grid dashboard-stats-grid">
          <StatCard
            title="Total Assets"
            value={dashboardStats.totalAssets}
            icon={Package}
            variant="primary"
          />
          <StatCard
            title="Active Assets"
            value={dashboardStats.activeAssets}
            icon={Activity}
            variant="success"
          />
          <StatCard
            title="Maintenance Assets"
            value={dashboardStats.maintenanceAssets}
            icon={Wrench}
            variant="accent"
          />
          <StatCard
            title="Open Faults"
            value={dashboardStats.openFaults}
            icon={AlertTriangle}
            variant="default"
          />
        </div>

        <div className="dashboard-grid dashboard-stats-grid">
          <StatCard
            title="Suppliers"
            value={dashboardStats.suppliers}
            icon={Truck}
          />
          <StatCard
            title="Assignments"
            value={dashboardStats.assignments}
            icon={ClipboardList}
            variant="primary"
          />
          <StatCard
            title="Movements"
            value={dashboardStats.movements}
            icon={ArrowLeftRight}
            variant="accent"
          />
          <StatCard
            title="Disposals"
            value={dashboardStats.disposals}
            icon={Trash2}
            variant="success"
          />
        </div>

        <div className="dashboard-grid dashboard-stats-grid">
          <StatCard
            title="Maintenance Requests"
            value={maintenance.length}
            icon={Wrench}
            variant="accent"
          />
          <StatCard
            title="Departments"
            value={dashboardStats.departments}
            icon={Building2}
          />
          <StatCard
            title="Categories"
            value={dashboardStats.categories}
            icon={Package}
          />
          <StatCard
            title="Fault Reports"
            value={dashboardStats.openFaults}
            icon={AlertTriangle}
            variant="default"
          />
        </div>

        <div className="dashboard-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="dashboard-card-heading">Manager Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Search inventory or drill into active items.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("all")}
              >
                All
              </Button>
              <Button
                variant={
                  filterMode === "needs_attention" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setFilterMode("needs_attention")}
              >
                Needs Attention
              </Button>
              <Button
                variant={filterMode === "maintenance" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("maintenance")}
              >
                Maintenance
              </Button>
              <Button
                variant={filterMode === "available" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("available")}
              >
                Available
              </Button>
            </div>
          </div>

          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search assets, departments or categories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-9 h-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Summary */}
          {(search || filterMode !== "all") && (
            <div className="text-xs text-slate-300/80 bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
              <div className="flex items-center gap-2">
                <span className="font-medium">Active Filters:</span>
                {filterMode !== "all" && (
                  <span className="bg-slate-600 px-2 py-1 rounded text-xs">
                    Mode:{" "}
                    {filterMode
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                )}
                {search && (
                  <span className="bg-slate-600 px-2 py-1 rounded text-xs">
                    Search: "{search}"
                  </span>
                )}
                <span className="text-slate-400">
                  Showing {filteredAssets.length} assets,{" "}
                  {filteredDepartments.length} departments,{" "}
                  {filteredCategories.length} categories
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-4 grid-cols-1 xl:grid-cols-3 mt-6">
            <div className="dashboard-card">
              <h3 className="dashboard-card-heading">Department Spread</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={departmentData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(195,15%,88%)"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="assets"
                    fill="hsl(174,62%,32%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="dashboard-card">
              <h3 className="dashboard-card-heading">Category Breakdown</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-3">
                {categoryData.map((item, index) => (
                  <span
                    key={item.name}
                    className="text-xs text-muted-foreground flex items-center gap-2"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {item.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="dashboard-card">
              <h3 className="dashboard-card-heading">Operational Counts</h3>
              <div className="space-y-3 mt-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Departments</span>
                  <strong>{dashboardStats.departments}</strong>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Asset Categories</span>
                  <strong>{dashboardStats.categories}</strong>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Suppliers</span>
                  <strong>{dashboardStats.suppliers}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="dashboard-card-heading">Latest Assignments</h3>
              <p className="text-sm text-muted-foreground">
                Your most recent activity across assigned assets.
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>

          {recentAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignment activity found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="dashboard-table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Asset
                    </th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Assigned To
                    </th>
                    <th className="py-2.5 px-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                      <td className="py-3 px-3 font-medium">
                        {assets.find(
                          (asset) => asset.id === assignment.asset_id,
                        )?.asset_name || "Unknown"}
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">
                        {assignment.assigned_to || "N/A"}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={assignment.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ManagerDashboard;