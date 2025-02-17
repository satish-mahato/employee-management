import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";

// Extended type for employees with role information
type EmployeeWithRole = Employee & {
  role: string;
  currentBalance: number;
};

const BulkAttendance = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState<EmployeeWithRole[]>([]);
  const [date, setDate] = React.useState<Date>(new Date());
  const [loading, setLoading] = React.useState(true);
  const [attendanceMap, setAttendanceMap] = React.useState<
    Record<string, string>
  >({});

  React.useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [date]);

  const isBeforeJoiningDate = (employee: Employee, selectedDate: Date) => {
    return new Date(employee.joining_date) > selectedDate;
  };

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase.from("employees").select(`
          *,
          roles:role_id (id, name, salary)
        `);

      if (error) throw error;

      const formattedEmployees: EmployeeWithRole[] = data.map((emp) => ({
        ...emp,
        role: emp.roles?.name || "N/A",
        currentBalance: emp.roles?.salary || 0,
      }));
      setEmployees(formattedEmployees);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching employees",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("date", format(date, "yyyy-MM-dd"));

      if (error) throw error;

      const newAttendanceMap: Record<string, string> = {};
      data?.forEach((record) => {
        newAttendanceMap[record.employee_id] = record.status;
      });
      setAttendanceMap(newAttendanceMap);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching attendance",
        description: error.message,
      });
    }
  };

  const handleIndividualUpdate = async (
    employeeId: string,
    newStatus: "present" | "half-day" | "absent",
  ) => {
    try {
      const { error } = await supabase.from("attendance").upsert({
        employee_id: employeeId,
        date: format(date, "yyyy-MM-dd"),
        status: newStatus,
      });

      if (error) throw error;

      setAttendanceMap((prev) => ({
        ...prev,
        [employeeId]: newStatus,
      }));

      toast({
        title: "Status updated",
        description: `Attendance marked as ${newStatus} for ${format(date, "PPP")}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating attendance",
        description: error.message,
      });
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const { error } = await supabase.from("attendance").upsert(
        Object.entries(attendanceMap).map(([employeeId, status]) => ({
          employee_id: employeeId,
          date: format(date, "yyyy-MM-dd"),
          status,
        })),
        { onConflict: "employee_id,date" }
      );

      if (error) throw error;

      toast({
        title: "Attendance Updated",
        description: `Bulk attendance updated for ${format(date, "PPP")}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating attendance",
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-lg rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Bulk Attendance Update
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal hover:bg-gray-50 transition-colors",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => setDate(newDate || new Date())}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8">
              No employees found. Add some employees first.
            </div>
          ) : (
            <div className="rounded-lg border shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-700">Employee</TableHead>
                    <TableHead className="text-gray-700">Role</TableHead>
                    <TableHead className="text-gray-700">
                      Current Status
                    </TableHead>
                    <TableHead className="text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const beforeJoining = isBeforeJoiningDate(employee, date);
                    return (
                      <TableRow
                        key={employee.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          beforeJoining ? "bg-gray-100" : ""
                        }`}
                      >
                        <TableCell className="font-medium text-gray-900">
                          {employee.name}
                        </TableCell>
                        <TableCell className="text-gray-900">
                          {employee.role}
                        </TableCell>
                        <TableCell className="capitalize text-gray-900">
                          {beforeJoining
                            ? "Not Joined"
                            : attendanceMap[employee.id] || "Not marked"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!beforeJoining ? (
                              <>
                                <Button
                                  size="sm"
                                  variant={
                                    attendanceMap[employee.id] === "present"
                                      ? "default"
                                      : "outline"
                                  }
                                  className="hover:bg-green-100 hover:text-green-800 transition-colors"
                                  onClick={() =>
                                    handleIndividualUpdate(employee.id, "present")
                                  }
                                >
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    attendanceMap[employee.id] === "half-day"
                                      ? "default"
                                      : "outline"
                                  }
                                  className="hover:bg-yellow-100 hover:text-yellow-800 transition-colors"
                                  onClick={() =>
                                    handleIndividualUpdate(employee.id, "half-day")
                                  }
                                >
                                  Half-day
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    attendanceMap[employee.id] === "absent"
                                      ? "default"
                                      : "outline"
                                  }
                                  className="hover:bg-red-100 hover:text-red-800 transition-colors"
                                  onClick={() =>
                                    handleIndividualUpdate(employee.id, "absent")
                                  }
                                >
                                  Absent
                                </Button>
                              </>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                Joined on {format(new Date(employee.joining_date), "PP")}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              onClick={handleBulkUpdate}
            >
              Update Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkAttendance;