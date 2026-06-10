import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit, AlertTriangle, Ban, UserX, UserCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { usersAPI, departmentsAPI } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import "./css/User.css";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "asset_manager", label: "Asset Manager" },
  { value: "technician", label: "Technician" },
  { value: "department_head", label: "Department Head" },
  { value: "staff", label: "Staff" },
];

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    phone_number: "",
    role_id: "staff",
    department_id: "",
  });

  //Queries
  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: usersAPI.getAll,
  });

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: departmentsAPI.getAll,
  });

  //Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => usersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      alert(error.message || "Failed to create user");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      usersAPI.update(editingUser.user_id, {
        full_name: data.full_name,
        phone_number: data.phone_number,
        role_id: data.role_id,
        department_id: data.department_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      alert(error.message || "Failed to update user");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => usersAPI.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to delete user");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => usersAPI.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to deactivate user");
    },
  });

  const blockMutation = useMutation({
    mutationFn: (userId: string) => usersAPI.block(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to block user");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (userId: string) => usersAPI.activate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      alert(error.message || "Failed to activate user");
    },
  });

  const isStatusUpdating =
    deactivateMutation.isPending ||
    blockMutation.isPending ||
    activateMutation.isPending;

  //Handlers
  const resetForm = () => {
    setFormData({
      full_name: "",
      username: "",
      email: "",
      password: "",
      phone_number: "",
      role_id: "staff",
      department_id: "",
    });
    setEditingUser(null);
  };

  const handleCreateClick = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      username: user.username || "",
      email: user.email || "",
      password: "",
      phone_number: user.phone_number || "",
      role_id: user.role_id || "staff",
      department_id: user.department_id || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate(formData);
    } else {
      if (!formData.password) {
        alert("Password is required for new users");
        return;
      }
      createMutation.mutate(formData);
    }
  };

  const handleDeleteUser = (userId: string) => {
    deleteMutation.mutate(userId);
  };

  const handleDeactivateUser = (userId: string) => {
    deactivateMutation.mutate(userId);
  };

  const handleBlockUser = (userId: string) => {
    blockMutation.mutate(userId);
  };

  const handleActivateUser = (userId: string) => {
    activateMutation.mutate(userId);
  };

  const isCurrentUser = (userId: string) => currentUser?.id === userId;

  const renderStatusDialogUser = (user: any) => (
    <div className="users-delete-dialog-user">
      <span className="users-delete-dialog-name">{user.full_name}</span>
      <span className="users-delete-dialog-email">{user.email}</span>
      {user.role_id && (
        <span className="role-pill" data-role={user.role_id}>
          {user.role_id.replace("_", " ")}
        </span>
      )}
    </div>
  );

  //Loading / error states
  if (usersLoading || departmentsLoading) {
    return <div className="px-4 sm:px-6 md:p-6">Loading users...</div>;
  }
  if (usersError) {
    return (
      <div className="px-4 sm:px-6 md:p-6 text-destructive">
        Failed to load users.
      </div>
    );
  }

  //  Render
  return (
    <div className="users-page">
      <PageHeader title="Users" description="Manage system users and roles">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateClick} className="gap-2">
              <Plus className="w-4 h-4" /> Add User
            </Button>
          </DialogTrigger>

          <DialogContent className="users-dialog-content max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Create New User"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Update user information"
                  : "Add a new user to the system"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div className="users-form-group">
                <label className="users-form-label">Full Name *</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  required
                />
              </div>

              {/* Create-only fields */}
              {!editingUser && (
                <>
                  <div className="users-form-group">
                    <label className="users-form-label">Username *</label>
                    <Input
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="users-form-group">
                    <label className="users-form-label">Email *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="users-form-group">
                    <label className="users-form-label">Password *</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}

              {/* Phone */}
              <div className="users-form-group">
                <label className="users-form-label">Phone Number</label>
                <Input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) =>
                    setFormData({ ...formData, phone_number: e.target.value })
                  }
                />
              </div>

              {/* Role */}
              <div className="users-form-group">
                <label className="users-form-label">Role *</label>
                <select
                  className="users-form-select"
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({ ...formData, role_id: e.target.value })
                  }
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="users-form-group">
                <label className="users-form-label">Department</label>
                <select
                  className="users-form-select"
                  value={formData.department_id}
                  onChange={(e) =>
                    setFormData({ ...formData, department_id: e.target.value })
                  }
                >
                  <option value="">Select a department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit row */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="flex-1"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving…"
                    : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* ── Users table ── */}
      <div className="users-table-card">
        <div className="users-table-scroll">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Role</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Status</th>
                <th className="align-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="users-empty">No users found.</div>
                  </td>
                </tr>
              ) : (
                users.map((user: any) => (
                  <tr key={user.user_id}>
                    <td className="cell-name">{user.full_name}</td>
                    <td className="cell-email">{user.email}</td>
                    <td>
                      <span className="cell-mono">{user.username}</span>
                    </td>
                    <td>
                      <span className="role-pill" data-role={user.role_id}>
                        {user.role_id?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="cell-dept">{user.department_name || "—"}</td>
                    <td className="cell-phone">{user.phone_number || "—"}</td>
                    <td>
                      <StatusBadge status={user.status} />
                    </td>
                    <td className="cell-actions">
                      <div className="users-actions">
                        <button
                          className="users-action-btn edit"
                          onClick={() => handleEditClick(user)}
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {user.status === "active" && !isCurrentUser(user.user_id) && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="users-action-btn deactivate"
                                  disabled={isStatusUpdating}
                                  title="Deactivate user"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="users-status-dialog">
                                <AlertDialogHeader>
                                  <div className="users-status-dialog-icon deactivate">
                                    <UserX className="w-5 h-5" />
                                  </div>
                                  <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                                  <AlertDialogDescription asChild>
                                    <div className="users-delete-dialog-body">
                                      <p>
                                        This user will no longer be able to sign in.
                                        You can reactivate their account later.
                                      </p>
                                      {renderStatusDialogUser(user)}
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeactivateUser(user.user_id)
                                    }
                                    disabled={deactivateMutation.isPending}
                                    className="users-status-dialog-confirm deactivate"
                                  >
                                    {deactivateMutation.isPending
                                      ? "Deactivating…"
                                      : "Deactivate"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="users-action-btn block"
                                  disabled={isStatusUpdating}
                                  title="Block user"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="users-status-dialog">
                                <AlertDialogHeader>
                                  <div className="users-status-dialog-icon block">
                                    <Ban className="w-5 h-5" />
                                  </div>
                                  <AlertDialogTitle>Block User</AlertDialogTitle>
                                  <AlertDialogDescription asChild>
                                    <div className="users-delete-dialog-body">
                                      <p>
                                        This user will be blocked from accessing
                                        the system. Use this for policy violations
                                        or security concerns.
                                      </p>
                                      {renderStatusDialogUser(user)}
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleBlockUser(user.user_id)}
                                    disabled={blockMutation.isPending}
                                    className="users-status-dialog-confirm block"
                                  >
                                    {blockMutation.isPending
                                      ? "Blocking…"
                                      : "Block User"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {(user.status === "inactive" ||
                          user.status === "suspended") &&
                          !isCurrentUser(user.user_id) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="users-action-btn activate"
                                  disabled={isStatusUpdating}
                                  title="Activate user"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="users-status-dialog">
                                <AlertDialogHeader>
                                  <div className="users-status-dialog-icon activate">
                                    <UserCheck className="w-5 h-5" />
                                  </div>
                                  <AlertDialogTitle>Activate User</AlertDialogTitle>
                                  <AlertDialogDescription asChild>
                                    <div className="users-delete-dialog-body">
                                      <p>
                                        Restore this user&apos;s access so they can
                                        sign in again.
                                      </p>
                                      {renderStatusDialogUser(user)}
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleActivateUser(user.user_id)
                                    }
                                    disabled={activateMutation.isPending}
                                    className="users-status-dialog-confirm activate"
                                  >
                                    {activateMutation.isPending
                                      ? "Activating…"
                                      : "Activate User"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="users-action-btn delete"
                              disabled={deleteMutation.isPending}
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="users-delete-dialog">
                            <AlertDialogHeader>
                              <div className="users-delete-dialog-icon">
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription asChild>
                                <div className="users-delete-dialog-body">
                                  <p>
                                    Are you sure you want to permanently delete
                                    this user? This action cannot be undone.
                                  </p>
                                  <div className="users-delete-dialog-user">
                                    <span className="users-delete-dialog-name">
                                      {user.full_name}
                                    </span>
                                    <span className="users-delete-dialog-email">
                                      {user.email}
                                    </span>
                                    {user.role_id && (
                                      <span
                                        className="role-pill"
                                        data-role={user.role_id}
                                      >
                                        {user.role_id.replace("_", " ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.user_id)}
                                disabled={deleteMutation.isPending}
                                className="users-delete-dialog-confirm"
                              >
                                {deleteMutation.isPending
                                  ? "Deleting…"
                                  : "Delete User"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
