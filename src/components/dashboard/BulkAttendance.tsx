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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, Sun, XCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

type EmployeeWithRole = Employee & {
  role: string;
  currentBalance: number;
};

const statusIcons = {
  present: <CheckCircle className="h-4 w-4 mr-2 text-green-600" />,
  "half-day": <Sun className="h-4 w-4 mr-2 text-yellow-600" />,
  absent: <XCircle className="h-4 w-4 mr-2 text-red-600" />,
  "not-marked": null,
};

const BulkAttendance = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState<EmployeeWithRole[]>([]);
  const [date, setDate] = React.useState<Date>(new Date());
  const [loading, setLoading] = React.useState(true);
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, string>>({});
  const [showPopup, setShowPopup] = React.useState(false);

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

  const handleStatusChange = async (
    employeeId: string,
    newStatus: "present" | "half-day" | "absent"
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
        { onConflict: "employee_id,date" } // Match composite primary key
      );
  
      if (error) throw error;
  
      toast({
        title: "Attendance Updated",
        description: `Bulk attendance updated for ${format(date, "PPP")}`,
        variant: "success",
      });
      setShowPopup(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating attendance",
        description: error.message,
      });
    }
  };

  const handleMarkAll = (status: "present" | "half-day" | "absent") => {
    const newAttendanceMap: Record<string, string> = {};
    employees.forEach((employee) => {
      if (!isBeforeJoiningDate(employee, date)) {
        newAttendanceMap[employee.id] = status;
      }
    });
    setAttendanceMap(newAttendanceMap);
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">
              Attendance Management
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select Date</span>}
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
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading employees...</div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No employees found. Please add employees first.
            </div>
          ) : (
            <div className="rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <Table className="border-collapse">
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-gray-600 font-semibold py-4">Employee</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Role</TableHead>
                    <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                    <TableHead className="text-gray-600 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => {
                    const beforeJoining = isBeforeJoiningDate(employee, date);
                    const currentStatus = beforeJoining
                      ? "Not Joined"
                      : attendanceMap[employee.id] || "Not marked";

                    return (
                      <TableRow
                        key={employee.id}
                        className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                      >
                        <TableCell className="font-medium text-gray-900 py-4">
                          <div className="flex items-center">
                            <span className="mr-3">{employee.name}</span>
                            {beforeJoining && (
                              <Badge variant="outline" className="text-xs text-gray-500">
                                Joins {format(new Date(employee.joining_date), "PP")}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{employee.role}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize",
                              currentStatus === "present" && "bg-green-50 text-green-700",
                              currentStatus === "half-day" && "bg-yellow-50 text-yellow-700",
                              currentStatus === "absent" && "bg-red-50 text-red-700",
                              currentStatus === "Not Joined" && "bg-gray-100 text-gray-500"
                            )}
                          >
                            {currentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {!beforeJoining && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="px-3">
                                  <span>Edit</span>
                                  <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="flex items-center"
                                  onClick={() => handleStatusChange(employee.id, "present")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Present
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center"
                                  onClick={() => handleStatusChange(employee.id, "half-day")}
                                >
                                  <Sun className="h-4 w-4 mr-2 text-yellow-600" />
                                  Half-day
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center"
                                  onClick={() => handleStatusChange(employee.id, "absent")}
                                >
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Absent
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <div className="flex space-x-2">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all"
                onClick={() => handleMarkAll("present")}
                size="lg"
              >
                Mark All Present
              </Button>
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg transition-all"
                onClick={() => handleMarkAll("half-day")}
                size="lg"
              >
                Mark All Half-Day
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all"
                onClick={() => handleMarkAll("absent")}
                size="lg"
              >
                Mark All Absent
              </Button>
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
              onClick={handleBulkUpdate}
              size="lg"
            >
              Save All Changes
            </Button>
          </div>
        </CardContent>
      </Card>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Attendance Updated</h2>
            <p>Bulk attendance has been successfully updated for {format(date, "PPP")}.</p>
            <div className="mt-4 flex justify-end">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowPopup(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkAttendance;