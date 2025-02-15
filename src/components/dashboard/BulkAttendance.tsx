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
import { Employee, defaultEmployees } from "@/lib/data";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const BulkAttendance = () => {
  const [employees, setEmployees] =
    React.useState<Employee[]>(defaultEmployees);
  const [date, setDate] = React.useState<Date>(new Date());

  const handleIndividualUpdate = (
    employeeId: string,
    newStatus: "present" | "half-day" | "absent",
  ) => {
    setEmployees(
      employees.map((emp) =>
        emp.id === employeeId ? { ...emp, status: newStatus } : emp,
      ),
    );
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bulk Attendance Update</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
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
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell className="capitalize">
                    {employee.status}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          employee.status === "present" ? "default" : "outline"
                        }
                        onClick={() =>
                          handleIndividualUpdate(employee.id, "present")
                        }
                      >
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          employee.status === "half-day" ? "default" : "outline"
                        }
                        onClick={() =>
                          handleIndividualUpdate(employee.id, "half-day")
                        }
                      >
                        Half-day
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          employee.status === "absent" ? "default" : "outline"
                        }
                        onClick={() =>
                          handleIndividualUpdate(employee.id, "absent")
                        }
                      >
                        Absent
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => {
                // Here you would typically make an API call to update the attendance
                console.log(
                  "Updating attendance for",
                  format(date, "PPP"),
                  ":",
                  employees,
                );
              }}
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
