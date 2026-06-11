import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Activity, Package, AlertTriangle, Wrench, RefreshCw, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRefreshData } from "@/hooks/use-refresh-data";
import { assetsAPI, faultReportsAPI, maintenanceAPI } from "@/lib/api";

export default function StaffDashboard() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { isRefreshing, refreshData } = useRefreshData();

  const {
    data: assets = [],
    isLoading: assetsLoading,
    error: assetsError,
  } = useQuery({ queryKey: ["assets"], queryFn: assetsAPI.getAll });

  const {
    data: faultReports = [],
    isLoading: faultsLoading,
    error: faultsError,
  } = useQuery({ queryKey: ["faultReports"], queryFn: faultReportsAPI.getAll });

  const {
    data: maintenance = [],
    isLoading: maintenanceLoading,
    error: maintenanceError,
  } = useQuery({ queryKey: ["maintenance"], queryFn: maintenanceAPI.getAll });

  const isLoading = assetsLoading || faultsLoading || maintenanceLoading;
  const error = assetsError || faultsError || maintenanceError;

  const filteredOpenFaults = useMemo(() => {
    const currentSearch = search.toLowerCase().trim();
    return faultReports.filter((report: any) => {
      const assetName = (assets.find((asset: any) => asset.id === report.asset_id)?.asset_name || "").toLowerCase();
      return (
        report.description?.toLowerCase().includes(currentSearch) ||
        report.status?.toLowerCase().includes(currentSearch) ||
        assetName.includes(currentSearch)
      );
    });
  }, [faultReports, assets, search]);

  const openFaultCount = faultReports.filter(
    (report: any) => report.status === "reported" || report.status === "investigating",
  ).length;

  const maintenanceInProgress = maintenance.filter(
    (record: any) => record.status === "in progress" || record.status === "scheduled",
  ).length;

  const availableAssets = assets.filter(
    (asset: any) => asset.status?.toString().toLowerCase() === "available",
  ).length;

  const handleRefresh = () => {
    refreshData(["assets", "faultReports", "maintenance"]);
  };

  if (isLoading) {
    return <div className="px-4 sm:px-6 md:p-6">Loading staff dashboard...</div>;
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:p-6 text-destructive">
        Failed to load staff dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Dashboard"
        description="Request assets from the store manager and track their status."
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search faults or assets"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-[240px]"
          />
          <Button variant="secondary" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Assets"
          value={assets.length}
          icon={Package}
          variant="primary"
        />
        <StatCard
          title="Available Assets"
          value={availableAssets}
          icon={Activity}
        />
        <StatCard
          title="Open Faults"
          value={openFaultCount}
          icon={AlertTriangle}
          variant="accent"
        />
        <StatCard
          title="Maintenance Tasks"
          value={maintenanceInProgress}
          icon={Wrench}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Submit requests to the store manager and follow their progress.
          </p>
          <div className="mt-4 space-y-3">
            <Button className="w-full" onClick={() => navigate("/assignments")}>Request an Asset</Button>
            <Button className="w-full" onClick={() => navigate("/assets")}>View Available Assets</Button>
            <Button className="w-full" onClick={() => navigate("/faults")}>Report a Fault</Button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Open Fault Reports</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Recent fault reports that may need your attention.
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              {filteredOpenFaults.length} reports
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Asset</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Report Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpenFaults.slice(0, 6).map((report: any) => {
                  const asset = assets.find((item: any) => item.id === report.asset_id);
                  return (
                    <tr key={report.id} className="border-b border-border last:border-none">
                      <td className="px-3 py-3">{asset?.asset_name || "Unknown asset"}</td>
                      <td className="px-3 py-3 capitalize">{report.status || "reported"}</td>
                      <td className="px-3 py-3 capitalize">{report.priority || "medium"}</td>
                      <td className="px-3 py-3">{report.report_date || "-"}</td>
                    </tr>
                  );
                })}
                {!filteredOpenFaults.length && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-sm text-muted-foreground">
                      No open fault reports match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
