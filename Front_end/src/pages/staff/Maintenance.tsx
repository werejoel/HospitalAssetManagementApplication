import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { maintenanceAPI, assetsAPI, usersAPI } from "@/lib/api";

export default function StaffMaintenance() {
  const [search, setSearch] = useState("");

  const { data: maintenance = [], isLoading: maintenanceLoading, error: maintenanceError } = useQuery({
    queryKey: ["maintenance"],
    queryFn: maintenanceAPI.getAll,
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: assetsAPI.getAll,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: usersAPI.getAll,
  });

  const isLoading = maintenanceLoading || assetsLoading || usersLoading;
  const error = maintenanceError;

  const filteredMaintenance = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return maintenance;

    return maintenance.filter((record: any) => {
      const assetName = assets.find((asset: any) => asset.id === record.asset_id)?.asset_name || "";
      const technicianName = users.find((user: any) => user.user_id === record.technician_id)?.full_name || "";
      return [
        record.maintenance_type,
        record.description,
        record.status,
        assetName,
        technicianName,
      ]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(query));
    });
  }, [maintenance, assets, users, search]);

  if (isLoading) {
    return <div className="px-4 sm:px-6 md:p-6">Loading maintenance records...</div>;
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:p-6 text-destructive">Failed to load maintenance records.</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        description="View maintenance history and upcoming work orders."
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search maintenance"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-[220px]"
          />
          <Button variant="secondary">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </PageHeader>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Cost</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaintenance.length ? (
              filteredMaintenance.map((record: any) => {
                const asset = assets.find((item: any) => item.id === record.asset_id);
                const technician = users.find((user: any) => user.user_id === record.technician_id);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{asset?.asset_name || "Unknown asset"}</TableCell>
                    <TableCell>{record.maintenance_type || "-"}</TableCell>
                    <TableCell>
                      <StatusBadge status={record.status || "scheduled"} />
                    </TableCell>
                    <TableCell>{technician?.full_name || "Unassigned"}</TableCell>
                    <TableCell>{record.maintenance_date || "-"}</TableCell>
                    <TableCell>{record.cost ? `UGX ${record.cost}` : "-"}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                  No maintenance records match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
