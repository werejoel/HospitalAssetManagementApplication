import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { assetsAPI, departmentsAPI, assetCategoriesAPI, suppliersAPI } from "@/lib/api";

export default function StaffAssets() {
  const [search, setSearch] = useState("");

  const { data: assets = [], isLoading: assetsLoading, error: assetsError } = useQuery({
    queryKey: ["assets"],
    queryFn: assetsAPI.getAll,
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentsAPI.getAll,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["assetCategories"],
    queryFn: assetCategoriesAPI.getAll,
  });

  const { data: suppliers = [], isLoading: suppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: suppliersAPI.getAll,
  });

  const isLoading = assetsLoading || departmentsLoading || categoriesLoading || suppliersLoading;
  const error = assetsError;

  const filteredAssets = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return assets;

    return assets.filter((asset: any) => {
      const departmentName = departments.find((dept: any) => dept.id === asset.department_id)?.department_name || "";
      const categoryName = categories.find((cat: any) => cat.id === asset.category_id)?.category_name || "";
      const supplierName = suppliers.find((supplier: any) => supplier.id === asset.supplier_id)?.supplier_name || "";

      return [
        asset.asset_name,
        asset.asset_tag,
        asset.serial_number,
        asset.status,
        asset.asset_condition,
        departmentName,
        categoryName,
        supplierName,
      ]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(query));
    });
  }, [assets, departments, categories, suppliers, search]);

  if (isLoading) {
    return <div className="px-4 sm:px-6 md:p-6">Loading assets...</div>;
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:p-6 text-destructive">Failed to load assets.</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assets"
        description="Browse and search the asset inventory."
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search assets"
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
              <TableHead>Name</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Supplier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length ? (
              filteredAssets.map((asset: any) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.asset_name}</TableCell>
                  <TableCell>{asset.asset_tag}</TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status || "available"} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={asset.asset_condition || "good"} />
                  </TableCell>
                  <TableCell>
                    {departments.find((dept: any) => dept.id === asset.department_id)?.department_name || "—"}
                  </TableCell>
                  <TableCell>
                    {categories.find((cat: any) => cat.id === asset.category_id)?.category_name || "—"}
                  </TableCell>
                  <TableCell>
                    {suppliers.find((supplier: any) => supplier.id === asset.supplier_id)?.supplier_name || "—"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-sm text-muted-foreground">
                  No assets match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
