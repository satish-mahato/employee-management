import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

const MonthlyAttendance = () => {
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = React.useState<string | null>(
    searchParams.get("employee") || null
  );
  const [employees, setEmployees] = React.useState<any[]>([]);
  const [attendance, setAttendance] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance();
    }
  }, [selectedEmployee, currentDate]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        roles:role_id (id, name, salary)
      `);

    if (error) {
      console.error('Error fetching employees:', error);
      return;
    }

    if (data) {
      setEmployees(data);
      if (!selectedEmployee && data.length > 0) {
        setSelectedEmployee(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchAttendance = async () => {
    const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', selectedEmployee)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) {
      console.error('Error fetching attendance:', error);
      return;
    }

    setAttendance(data || []);
  };

  useEffect(() => {
    const employeeId = searchParams.get("employee");
    if (employeeId) {
      setSelectedEmployee(employeeId);
    }
  }, [searchParams]);

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  // Generate days for the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const attendanceMap = new Map(
    attendance.map(record => [
      format(new Date(record.date), 'yyyy-MM-dd'),
      record.status
    ])
  );

  const monthAttendance = daysInMonth.map(day => ({
    date: day,
    status: attendanceMap.get(format(day, 'yyyy-MM-dd')) || 'absent'
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "half-day":
        return "bg-yellow-100 text-yellow-800";
      case "absent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white shadow-lg rounded-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b">
          <div className="mb-4 sm:mb-0">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Monthly Attendance Overview
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {selectedEmployeeData?.name} - {selectedEmployeeData?.roles?.name}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-[140px] text-center font-medium text-gray-700">
                {format(currentDate, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[100px] text-gray-700">
                    Date
                  </TableHead>
                  <TableHead className="text-gray-700">Day</TableHead>
                  <TableHead className="text-gray-700">Status</TableHead>
                  <TableHead className="text-gray-700">Work Hours</TableHead>
                  <TableHead className="text-gray-700">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthAttendance.map((day) => (
                  <TableRow
                    key={day.date.toString()}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="text-gray-900">
                      {format(day.date, "d")}
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {format(day.date, "EEEE")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(day.status)}`}
                      >
                        {day.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-900">
                      {day.status === "present"
                        ? "8 hours"
                        : day.status === "half-day"
                          ? "4 hours"
                          : "-"}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {day.status === "absent"
                        ? "No attendance recorded"
                        : day.status === "half-day"
                          ? "Left early"
                          : "Regular day"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-100"></div>
                <span className="text-sm text-gray-700">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-100"></div>
                <span className="text-sm text-gray-700">Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-100"></div>
                <span className="text-sm text-gray-700">Absent</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Total Working Hours:{" "}
              {monthAttendance.reduce((acc, day) => {
                if (day.status === "present") return acc + 8;
                if (day.status === "half-day") return acc + 4;
                return acc;
              }, 0)}{" "}
              hours
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyAttendance;