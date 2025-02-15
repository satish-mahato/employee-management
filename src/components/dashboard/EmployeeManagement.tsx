import React from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Employee } from "@/lib/data";
import { supabase } from "@/lib/supabase";

type Role = {
  id: string;
  name: string;
  salary: number;
};

const EmployeeManagement = () => {
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
  });
  const [newRole, setNewRole] = React.useState({
    name: "",
    salary: 0,
  });

  React.useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    const { data, error } = await supabase.from("employees").select("*");
    if (error) {
      console.error("Error fetching employees:", error);
      return;
    }
    setEmployees(data);
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase.from("roles").select("*");
    if (error) {
      console.error("Error fetching roles:", error);
      return;
    }
    setRoles(data);
  };

  const handleEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRole = roles.find((role) => role.name === formData.role);

    if (editingEmployee) {
      const { error } = await supabase
        .from("employees")
        .update({
          name: formData.name,
          role: formData.role,
        })
        .eq("id", editingEmployee.id);

      if (error) {
        console.error("Error updating employee:", error);
        return;
      }
    } else {
      const { error } = await supabase.from("employees").insert([
        {
          name: formData.name,
          role: formData.role,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
          attendancePercentage: 100,
          attendanceStreak: 0,
          currentBalance: selectedRole?.salary || 0,
          status: "present",
        },
      ]);

      if (error) {
        console.error("Error adding employee:", error);
        return;
      }
    }

    setFormData({ name: "", role: "" });
    setEditingEmployee(null);
    setIsAddDialogOpen(false);
    fetchEmployees();
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("roles").insert([
      {
        name: newRole.name,
        salary: newRole.salary,
      },
    ]);

    if (error) {
      console.error("Error adding role:", error);
      return;
    }

    setNewRole({ name: "", salary: 0 });
    fetchRoles();
  };

  const handleDeleteRole = async (id: string) => {
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (error) {
      console.error("Error deleting role:", error);
      return;
    }
    fetchRoles();
  };

  const handleDeleteEmployee = async (id: string) => {
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) {
      console.error("Error deleting employee:", error);
      return;
    }
    fetchEmployees();
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      role: employee.role,
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Employee Management</CardTitle>
          <div className="flex gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? "Edit Employee" : "Add New Employee"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEmployeeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name} (${role.salary})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    {editingEmployee ? "Update" : "Add"} Employee
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Manage Roles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Manage Roles</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddRole} className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) =>
                        setNewRole({ ...newRole, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleSalary">Salary</Label>
                    <Input
                      id="roleSalary"
                      type="number"
                      value={newRole.salary}
                      onChange={(e) =>
                        setNewRole({
                          ...newRole,
                          salary: Number(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Role
                  </Button>
                </form>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell>{role.name}</TableCell>
                        <TableCell>${role.salary}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const role = roles.find((r) => r.name === employee.role);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.name}
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>${role?.salary || "N/A"}</TableCell>
                    <TableCell className="capitalize">
                      {employee.status}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
