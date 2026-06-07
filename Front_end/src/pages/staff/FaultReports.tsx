import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Plus, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { faultReportsAPI, assetsAPI } from "@/lib/api";

const initialFaultForm = {
  asset_id: "",
  description: "",
  priority: "medium",
  report_date: "",
  status: "reported",
};

export default function StaffFaultReports() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [faultForm, setFaultForm] = useState(initialFaultForm);
  const [formError, setFormError] = useState("");
  const { toast } = useToast();

  const { data: faultReports = [], isLoading: faultsLoading, error: faultsError } = useQuery({
    queryKey: ["faultReports"],
    queryFn: faultReportsAPI.getAll,
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: assetsAPI.getAll,
  });

  const isLoading = faultsLoading || assetsLoading;
  const error = faultsError;

  const filteredReports = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return faultReports;

    return faultReports.filter((report: any) => {
      const assetName = assets.find((asset: any) => asset.id === report.asset_id)?.asset_name || "";
      return [
        assetName,
        report.description,
        report.priority,
        report.status,
        report.report_date,
      ]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(query));
    });
  }, [faultReports, assets, search]);

  const createMutation = useMutation({
    mutationFn: (data: any) => faultReportsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faultReports"] });
      setIsDialogOpen(false);
      setFaultForm(initialFaultForm);
      setFormError("");
      toast({
        title: "Report submitted",
        description: "Your fault report has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to submit report",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = () => {
    setFaultForm(initialFaultForm);
    setFormError("");
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!faultForm.asset_id || !faultForm.description.trim() || !faultForm.report_date) {
      setFormError("Please complete all required fields.");
      return;
    }

    if (!user) {
      setFormError("Unable to identify your profile. Please log in again.");
      return;
    }

    createMutation.mutate({
      ...faultForm,
      reported_by: user.id,
      assigned_to: "",
    });
  };

  if (isLoading) {
    return <div className="px-4 sm:px-6 md:p-6">Loading fault reports...</div>;
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:p-6 text-destructive">Failed to load fault reports.</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fault Reports"
        description="Submit a problem report and review existing reports."
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search fault reports"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-[220px]"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report a Fault</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">Asset</label>
                  <select
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
                    value={faultForm.asset_id}
                    onChange={(event) => setFaultForm({ ...faultForm, asset_id: event.target.value })}
                  >
                    <option value="">Select asset</option>
                    {assets.map((asset: any) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.asset_name} ({asset.asset_tag})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-muted-foreground">Description</label>
                  <Textarea
                    value={faultForm.description}
                    onChange={(event) => setFaultForm({ ...faultForm, description: event.target.value })}
                    placeholder="Describe the issue"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Priority</label>
                    <select
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none"
                      value={faultForm.priority}
                      onChange={(event) => setFaultForm({ ...faultForm, priority: event.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Report Date</label>
                    <Input
                      type="date"
                      value={faultForm.report_date}
                      onChange={(event) => setFaultForm({ ...faultForm, report_date: event.target.value })}
                    />
                  </div>
                </div>

                {formError && <p className="text-sm text-destructive">{formError}</p>}

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Submit Report</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length ? (
              filteredReports.map((report: any) => {
                const asset = assets.find((item: any) => item.id === report.asset_id);
                return (
                  <TableRow key={report.id}>
                    <TableCell>{asset?.asset_name || "Unknown asset"}</TableCell>
                    <TableCell><StatusBadge status={report.status || "reported"} /></TableCell>
                    <TableCell><StatusBadge status={report.priority || "medium"} /></TableCell>
                    <TableCell>{report.description || "—"}</TableCell>
                    <TableCell>{report.report_date || "—"}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                  No fault reports match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
