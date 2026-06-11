import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  ClipboardList,
  Edit,
  Trash2,
  Search,
  Download,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRefreshData } from "@/hooks/use-refresh-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { assignmentsAPI, assetsAPI, usersAPI, departmentsAPI } from "@/lib/api";
import { canManageAssetStatus, normalizeRole } from "@/lib/roleConfig";

const initialAssignmentForm = {
  asset_id: "",
  assigned_to: "",
  department_id: "",
  status: "pending",
};

const Assignments = () => {
  const { user } = useAuth();
  const normalizedRole = normalizeRole(user?.role);
  const isStaff = normalizedRole === "staff";
  const isStoreManager = canManageAssetStatus(normalizedRole);
  const { isRefreshing, refreshData } = useRefreshData();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignmentForm);

  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useQuery({ queryKey: ["assignments"], queryFn: assignmentsAPI.getAll });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: assetsAPI.getAll,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: usersAPI.getAll,
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentsAPI.getAll,
  });

  const isLoading =
    assignmentsLoading || assetsLoading || usersLoading || departmentsLoading;
  const error = assignmentsError;
  const canUpdateAssetStatus = canManageAssetStatus(user?.role);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        assigned_to: data.assigned_to || user?.id || "",
        status: data.status || "pending",
      };

      const assignment = await assignmentsAPI.create(payload);

      if (canUpdateAssetStatus) {
        if (payload.status === "active" || payload.status === "approved") {
          await assetsAPI.update(payload.asset_id, { status: "assigned" });
        } else if (payload.status === "pending" || payload.status === "requested") {
          await assetsAPI.update(payload.asset_id, { status: "requested" });
        } else if (payload.status === "rejected" || payload.status === "returned") {
          await assetsAPI.update(payload.asset_id, { status: "available" });
        }
      }

      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setIsDialogOpen(false);
      setEditingAssignment(null);
      setAssignmentForm(initialAssignmentForm);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to create assignment");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // Get the current assignment to check status change
      const currentAssignment = assignments.find((a) => a.id === id);

      const assignment = await assignmentsAPI.update(id, data);

      if (canUpdateAssetStatus) {
        if (data.status === "active" || data.status === "approved") {
          await assetsAPI.update(data.asset_id, { status: "assigned" });
        } else if (data.status === "pending" || data.status === "requested") {
          await assetsAPI.update(data.asset_id, { status: "requested" });
        } else if (data.status === "returned" || data.status === "rejected") {
          await assetsAPI.update(data.asset_id, { status: "available" });
        } else if (data.status === "lost") {
          await assetsAPI.update(data.asset_id, { status: "lost" });
        }
      }

      return assignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setIsDialogOpen(false);
      setEditingAssignment(null);
      setAssignmentForm(initialAssignmentForm);
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update assignment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Get the assignment before deleting to know which asset to update
      const assignment = assignments.find((a) => a.id === id);

      // Delete the assignment
      await assignmentsAPI.delete(id);

      // Set asset status back to available
      if (assignment) {
        await assetsAPI.update(assignment.asset_id, { status: "available" });
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to delete assignment");
    },
  });

  const filteredAssignments = useMemo(() => {
    const query = search.toLowerCase();

    return assignments.filter((a: any) => {
      if (isStaff && a.assigned_to !== user?.id) {
        return false;
      }

      const asset = assets.find((ast: any) => ast.id === a.asset_id);
      const requester = users.find((u: any) => u.user_id === a.assigned_to);

      return (
        asset?.asset_name?.toLowerCase().includes(query) ||
        asset?.asset_tag?.toLowerCase().includes(query) ||
        requester?.username?.toLowerCase().includes(query) ||
        requester?.email?.toLowerCase().includes(query) ||
        a.status?.toLowerCase().includes(query)
      );
    });
  }, [assignments, assets, users, search, isStaff, user?.id]);

  const totalAssignments = filteredAssignments.length;
  const pendingApprovals = filteredAssignments.filter(
    (a: any) => a.status?.toLowerCase() === "pending",
  ).length;
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "returned":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Returned
          </Badge>
        );
      case "lost":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Lost
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status || "Unknown"}</Badge>;
    }
  };

  const handleOpenCreate = () => {
    setEditingAssignment(null);
    setAssignmentForm({
      ...initialAssignmentForm,
      assigned_to: user?.id || "",
      status: "pending",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    setAssignmentForm({
      asset_id: assignment.asset_id || "",
      assigned_to: assignment.assigned_to || "",
      department_id: assignment.department_id || "",
      status: assignment.status || "active",
    });
    setIsDialogOpen(true);
  };

  const handleSaveAssignment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...assignmentForm,
      assigned_to: assignmentForm.assigned_to || user?.id || "",
      status: isStaff ? "pending" : assignmentForm.status || "pending",
    };

    if (!payload.asset_id.trim()) {
      alert("Please choose an asset before submitting your request.");
      return;
    }

    if (!payload.assigned_to.trim()) {
      alert("Your user record could not be found. Please sign in again and try.");
      return;
    }

    if (editingAssignment) {
      updateMutation.mutate({ id: editingAssignment.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDeleteAssignment = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleApproveRequest = (assignment: any) => {
    updateMutation.mutate({
      id: assignment.id,
      data: { ...assignment, status: "approved" },
    });
  };

  const handleRejectRequest = (assignment: any) => {
    updateMutation.mutate({
      id: assignment.id,
      data: { ...assignment, status: "rejected" },
    });
  };

  const handleExportExcel = () => {
    const headers = [
      "Asset",
      "Asset Tag",
      "Assigned To",
      "Assigned Date",
      "Status",
    ];
    const rows = filteredAssignments.map((a: any) => {
      const asset = assets.find((ast: any) => ast.id === a.asset_id);
      const user = users.find((u: any) => u.user_id === a.assigned_to);
      return [
        asset?.asset_name || "",
        asset?.asset_tag || "",
        user?.username || "",
        a.assigned_date || "",
        a.status || "",
      ];
    });

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.setAttribute(
      "download",
      `assignments-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    refreshData(["assignments", "assets", "users", "departments"]);
  };

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 md:p-6">
        <Alert>
          <AlertTitle>Loading requests</AlertTitle>
          <AlertDescription>
            Fetching asset request records from the server.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 md:p-6">
        <Alert variant="destructive">
          <AlertTitle>Unable to load requests</AlertTitle>
          <AlertDescription>
            {String(error) ||
              "There was a problem loading assignment data. Please refresh or try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:p-6">
      <PageHeader
        title="Asset Requests"
        description="Staff can request assets and store managers can approve them."
      >
        <div className="flex flex-wrap gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-4 h-4" /> Export
          </Button>
          <Button size="sm" onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" />
            {isStaff ? "New Request" : "New Request"}
          </Button>
        </div>
      </PageHeader>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-sky-50 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
                Request workflow
              </p>
              <DialogTitle className="mt-1 text-xl text-emerald-950">
                {editingAssignment
                  ? "Edit Request"
                  : isStaff
                    ? "Request an Asset"
                    : "Create Request"}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-emerald-800">
                {editingAssignment
                  ? "Adjust the request details and save the update."
                  : isStaff
                    ? "Choose an asset and submit your request. Store Manager will approve or reject it from the requests page."
                    : "Create a request for a staff member, team, or department and track its progress."}
              </DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSaveAssignment} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Asset *
              </label>
              <Select
                value={assignmentForm.asset_id}
                onValueChange={(value) =>
                  setAssignmentForm({ ...assignmentForm, asset_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an asset" />
                </SelectTrigger>
                <SelectContent>
                  {assets
                    .filter((asset: any) => {
                      const status = String(asset.status || "").toLowerCase();
                      return isStaff ? status === "available" || status === "new" : true;
                    })
                    .map((asset: any) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.asset_name} ({asset.asset_tag})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-4 shadow-sm">
              <label className="mb-2 block text-sm font-semibold text-sky-900">
                Requested By
              </label>
              {isStaff ? (
                <div className="flex items-center justify-between rounded-xl border border-sky-200 bg-white p-3 text-sm text-sky-900 shadow-sm">
                  <div>
                    <p className="font-semibold">{user?.full_name || user?.username || "Current staff member"}</p>
                    <p className="text-xs text-sky-700">{user?.email || "Your account will be used automatically"}</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                    Staff request
                  </Badge>
                </div>
              ) : (
                <Select
                  value={assignmentForm.assigned_to}
                  onValueChange={(value) =>
                    setAssignmentForm({ ...assignmentForm, assigned_to: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user: any) => (
                      <SelectItem key={user.user_id} value={user.user_id}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Department
              </label>
              <Select
                value={assignmentForm.department_id}
                onValueChange={(value) =>
                  setAssignmentForm({ ...assignmentForm, department_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept: any) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={assignmentForm.status}
                onValueChange={(value) =>
                  setAssignmentForm({ ...assignmentForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {isStaff ? (
                    <>
                      <SelectItem value="pending">Pending approval</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="pending">Pending approval</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-3 justify-end pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingAssignment ? "Update Request" : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-700">
                Total requests
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-950">
                {totalAssignments}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-emerald-600">
            All asset requests in the system.
          </p>
        </div>

        <div className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-sky-700">
                Pending approvals
              </p>
              <p className="mt-2 text-3xl font-semibold text-sky-950">
                {pendingApprovals}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 shadow-sm">
              <ClipboardList className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-sky-600">
            Requests currently waiting for approval.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search requests..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Requested Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {filteredAssignments.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground"
                >
                  <Alert>
                    <AlertTitle>No requests found</AlertTitle>
                    <AlertDescription>
                      Try a different search term or submit a new request to
                      get started.
                    </AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <TableBody>
              {filteredAssignments.map((assignment: any) => {
                const asset = assets.find(
                  (a: any) => a.id === assignment.asset_id,
                );
                const user = users.find(
                  (u: any) => u.user_id === assignment.assigned_to,
                );
                return (
                  <TableRow
                    key={assignment.id}
                    className="hover:bg-secondary/50"
                  >
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          {asset?.asset_name || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {asset?.asset_tag || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">
                          {user?.username || "N/A"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.assigned_date
                        ? new Date(
                            assignment.assigned_date,
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {isStoreManager && assignment.status?.toLowerCase() === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveRequest(assignment)}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRejectRequest(assignment)}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}
                      {!isStaff && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(assignment)}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete request
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this request?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteAssignment(assignment.id)
                                  }
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>
      </div>
    </div>
  );
};
export default Assignments;
