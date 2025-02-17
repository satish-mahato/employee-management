import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { Employee, Role } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const EmployeeManagement = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(
    null,
  );
  const [formData, setFormData] = React.useState({
    name: "",
    role: "",
    joining_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [newRole, setNewRole] = React.useState({
    name: "",
    salary: "",
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([fetchEmployees(), fetchRoles()]).finally(() =>
      setLoading(false),
    );
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select(`
        *,
        roles:role_id (id, name, salary)
      `);

    if (error) {
      console.error("Error fetching employees:", error);
      toast({
        variant: "destructive",
        title: "Error fetching employees",
        description: error.message,
      });
      return;
    }

    if (data) {
      const formattedEmployees = data.map((emp) => ({
        ...emp,
        role: emp.roles?.name || "N/A",
        currentBalance: emp.roles?.salary || 0,
      }));
      setEmployees(formattedEmployees);
    }
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) {
      console.error("Error fetching roles:", error);
      toast({
        variant: "destructive",
        title: "Error fetching roles",
        description: error.message,
      });
      return;
    }
    setRoles(data);
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.joining_date) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields",
      });
      return;
    }

    try {
      if (editingEmployee) {
        const { error } = await supabase
          .from("employees")
          .update({
            name: formData.name,
            role_id: formData.role,
            joining_date: formData.joining_date,
          })
          .eq("id", editingEmployee.id);

        if (error) throw error;
        toast({ title: "Employee updated successfully" });
      } else {
        const { error } = await supabase.from("employees").insert([
          {
            name: formData.name,
            role_id: formData.role,
            joining_date: formData.joining_date,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
            attendance_percentage: 100,
            attendance_streak: 0,
            status: "present",
          },
        ]);

        if (error) throw error;
        toast({ title: "Employee added successfully" });
      }

      setFormData({
        name: "",
        role: "",
        joining_date: format(new Date(), "yyyy-MM-dd"),
      });
      setEditingEmployee(null);
      setIsAddDialogOpen(false);
      await fetchEmployees();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error submitting employee",
        description: error.message,
      });
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("roles").insert([
        {
          name: newRole.name,
          salary: parseFloat(newRole.salary),
        },
      ]);

      if (error) throw error;

      toast({ title: "Role added successfully" });
      setNewRole({ name: "", salary: "" });
      fetchRoles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error adding role",
        description: error.message,
      });
    }
  };

  const confirmDelete = async (type: "employee" | "role", id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const { error } = await supabase
        .from(type === "employee" ? "employees" : "roles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted`,
      });
      type === "employee" ? fetchEmployees() : fetchRoles();
    } catch (error) {
      toast({
        variant: "destructive",
        title: `Error deleting ${type}`,
        description: error.message,
      });
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role_id,
      joining_date: employee.joining_date || format(new Date(), "yyyy-MM-dd"),
    });
    setIsAddDialogOpen(true);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Employee Management</CardTitle>
          <div className="space-x-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(true)}>
              Manage Roles
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table className="border rounded-lg">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[200px]">Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const role = roles.find((r) => r.id === employee.role_id);
                return (
                  <TableRow key={employee.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={employee.avatar_url} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      {role?.salary?.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          employee.status === "present"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete("employee", employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Add/Edit Employee Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </DialogTitle>
              <DialogDescription>
                {editingEmployee
                  ? "Update employee details"
                  : "Add a new employee to your organization"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name} -{" "}
                        {role.salary.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input
                  id="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) =>
                    setFormData({ ...formData, joining_date: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editingEmployee ? "Save Changes" : "Add Employee"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Manage Roles Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="text-lg">Manage Roles</DialogTitle>
              <DialogDescription>
                Add or remove job roles and their corresponding salaries
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role-name">Role Name</Label>
                  <Input
                    id="role-name"
                    value={newRole.name}
                    onChange={(e) =>
                      setNewRole({ ...newRole, name: e.target.value })
                    }
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={newRole.salary}
                    onChange={(e) =>
                      setNewRole({ ...newRole, salary: e.target.value })
                    }
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </Button>
            </form>

            <div className="rounded-lg border">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[200px]">Role</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        No roles found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          {role.name}
                        </TableCell>
                        <TableCell>
                          {role.salary.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => confirmDelete("role", role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EmployeeManagement;
