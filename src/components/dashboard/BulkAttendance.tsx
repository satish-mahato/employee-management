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
import { CalendarIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Employee } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const statusOptions = [
  { value: "present", label: "Present", icon: CheckCircle2, color: "bg-green-100 text-green-800" },
  { value: "half-day", label: "Half Day", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  { value: "absent", label: "Absent", icon: XCircle, color: "bg-red-100 text-red-800" },
];

const BulkAttendance = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [date, setDate] = React.useState<Date>(new Date());
  const [loading, setLoading] = React.useState(true);
  const [attendanceMap, setAttendanceMap] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetchEmployees();
    fetchAttendance();
  }, [date]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase.from("employees").select(`
        *, 
        roles:role_id (id, name, salary)
      `);

      if (error) throw error;

      setEmployees(data?.map(emp => ({
        ...emp,
        role: emp.roles?.name || "N/A",
        currentBalance: emp.roles?.salary || 0,
      })) || []);
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

      const newAttendanceMap = data?.reduce((acc, record) => ({
        ...acc,
        [record.employee_id]: record.status
      }), {});
      
      setAttendanceMap(newAttendanceMap || {});
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching attendance",
        description: error.message,
      });
    }
  };

  const updateStatus = async (employeeId: string, status: string) => {
    try {
      const { error } = await supabase.from("attendance").upsert({
        employee_id: employeeId,
        date: format(date, "yyyy-MM-dd"),
        status,
      });

      if (error) throw error;

      setAttendanceMap(prev => ({ ...prev, [employeeId]: status }));
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error.message,
      });
    }
  };

  const handleBulkAction = (status: string) => {
    const newAttendanceMap = { ...attendanceMap };
    employees.forEach(emp => {
      newAttendanceMap[emp.id] = status;
    });
    setAttendanceMap(newAttendanceMap);
  };

  const saveBulkAttendance = async () => {
    try {
      const { error } = await supabase.from("attendance").upsert(
        Object.entries(attendanceMap).map(([employeeId, status]) => ({
          employee_id: employeeId,
          date: format(date, "yyyy-MM-dd"),
          status,
        }))
      );

      if (error) throw error;

      toast({
        title: "Attendance Saved",
        description: `Attendance records updated for ${format(date, "PPP")}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving attendance",
        description: error.message,
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-gray-50 border-b">
          <div className="space-y-1 mb-4 sm:mb-0">
            <CardTitle className="text-2xl font-semibold text-gray-900">
              Attendance Management
            </CardTitle>
            <p className="text-sm text-gray-500">
              Update attendance records for your team
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleBulkAction("present")}
              className="border-green-200 text-green-800 hover:bg-green-50"
            >
              Mark All Present
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction("half-day")}
              className="border-yellow-200 text-yellow-800 hover:bg-yellow-50"
            >
              Mark All Half Day
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBulkAction("absent")}
              className="border-red-200 text-red-800 hover:bg-red-50"
            >
              Mark All Absent
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-gray-500">No employees found</div>
              <Button>Add Employees</Button>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-[300px]">Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50 group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={employee.avatar_url} />
                            <AvatarFallback>
                              {employee.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.roles?.salary?.toLocaleString("en-US", {
                                style: "currency",
                                currency: "USD",
                              })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {employee.role}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            statusOptions.find(s => s.value === attendanceMap[employee.id])?.color
                          )}
                        >
                          {attendanceMap[employee.id] || "Not marked"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          {statusOptions.map(({ value, label, icon: Icon }) => (
                            <Button
                              key={value}
                              size="sm"
                              variant={
                                attendanceMap[employee.id] === value
                                  ? "default"
                                  : "outline"
                              }
                              className={cn(
                                "gap-1.5",
                                attendanceMap[employee.id] !== value &&
                                  statusOptions.find(s => s.value === value)?.color
                              )}
                              onClick={() => updateStatus(employee.id, value)}
                            >
                              <Icon className="h-4 w-4" />
                              <span className="sr-only">{label}</span>
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {employees.length > 0 && (
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setAttendanceMap({})}
              >
                Reset Changes
              </Button>
              <Button onClick={saveBulkAttendance} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Save Attendance
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkAttendance;