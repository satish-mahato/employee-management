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
import { defaultEmployees } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

const MonthlyAttendance = () => {
  const [searchParams] = useSearchParams();
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = React.useState(
    searchParams.get("employee") || defaultEmployees[0].id,
  );

  useEffect(() => {
    const employeeId = searchParams.get("employee");
    if (employeeId) {
      setSelectedEmployee(employeeId);
    }
  }, [searchParams]);

  const selectedEmployeeData =
    defaultEmployees.find((emp) => emp.id === selectedEmployee) ||
    defaultEmployees[0];

  // Generate days for the current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Mock attendance data - in real app, this would come from an API
  const mockAttendance = daysInMonth.map((day) => ({
    date: day,
    status:
      Math.random() > 0.7
        ? Math.random() > 0.5
          ? "half-day"
          : "absent"
        : "present",
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

  return (
    <div className="container mx-auto py-6">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Monthly Attendance Overview</CardTitle>
            <p className="text-sm text-slate-500 mt-1">
              {selectedEmployeeData.name} - {selectedEmployeeData.role}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              value={selectedEmployee}
              onValueChange={setSelectedEmployee}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {defaultEmployees.map((employee) => (
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
              <div className="w-[140px] text-center font-medium">
                {format(currentDate, "MMMM yyyy")}
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Work Hours</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAttendance.map((day) => (
                  <TableRow key={day.date.toString()}>
                    <TableCell>{format(day.date, "d")}</TableCell>
                    <TableCell>{format(day.date, "EEEE")}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(day.status)}`}
                      >
                        {day.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {day.status === "present"
                        ? "8 hours"
                        : day.status === "half-day"
                          ? "4 hours"
                          : "-"}
                    </TableCell>
                    <TableCell className="text-slate-500">
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
          <div className="mt-6 flex justify-between items-center">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-100"></div>
                <span className="text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-100"></div>
                <span className="text-sm">Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-100"></div>
                <span className="text-sm">Absent</span>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total Working Hours:{" "}
              {mockAttendance.reduce((acc, day) => {
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
