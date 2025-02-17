import React, { useEffect, useState } from "react";
import EmployeeCard from "./EmployeeCard";
import { Employee } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeGridProps {
  employees?: Employee[];
}

const EmployeeGrid = ({ employees }: EmployeeGridProps) => {
  const [supabaseEmployees, setSupabaseEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeesWithStats = async () => {
      try {
        // Get current date and start of month
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        ).getDate();

        // Fetch employees with their roles
        const { data: employeesData, error: employeesError } =
          await supabase.from("employees").select(`
            *,
            roles:role_id (id, name, salary)
          `);

        if (employeesError) throw employeesError;

        // Fetch attendance records for the current month
        const { data: attendanceData, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .gte("date", startOfMonth.toISOString().split("T")[0]);

        if (attendanceError) throw attendanceError;

        if (employeesData) {
          const formattedEmployees = await Promise.all(
            employeesData.map(async (emp) => {
              // Calculate attendance percentage and salary
              const employeeAttendance = attendanceData.filter(
                (a) => a.employee_id === emp.id,
              );
              const workingDays = Math.min(
                daysInMonth,
                Math.floor(
                  (today - new Date(emp.joining_date)) / (1000 * 60 * 60 * 24),
                ) + 1,
              );
              const presentDays = employeeAttendance.filter(
                (a) => a.status === "present",
              ).length;
              const halfDays = employeeAttendance.filter(
                (a) => a.status === "half-day",
              ).length;

              // Calculate attendance percentage
              const attendancePercentage = Math.round(
                ((presentDays + halfDays * 0.5) / workingDays) * 100,
              );

              // Calculate salary based on hours worked
              const dailySalary = (emp.roles?.salary || 0) / daysInMonth;
              const hoursWorked = presentDays * 8 + halfDays * 4; // 8 hours for full day, 4 for half
              const expectedHours = workingDays * 8;
              const currentBalance = Math.round(
                (hoursWorked / expectedHours) * (emp.roles?.salary || 0),
              );

              // Calculate attendance streak
              let streak = 0;
              const sortedAttendance = employeeAttendance.sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              );

              for (const record of sortedAttendance) {
                if (
                  record.status === "present" ||
                  record.status === "half-day"
                ) {
                  streak++;
                } else {
                  break;
                }
              }

              return {
                id: emp.id,
                name: emp.name,
                role: emp.roles?.name || "N/A",
                avatarUrl: emp.avatar_url,
                attendancePercentage: attendancePercentage || 0,
                attendanceStreak: streak,
                currentBalance: currentBalance,
                status: emp.status || "present",
              };
            }),
          );

          setSupabaseEmployees(formattedEmployees);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeesWithStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[850px] bg-slate-50 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="w-64 h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[850px] bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-red-500">Error loading employees: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[850px] bg-slate-50 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {(employees || supabaseEmployees).map((employee) => (
          <EmployeeCard
            key={employee.id}
            id={employee.id}
            name={employee.name}
            role={employee.role}
            avatarUrl={employee.avatarUrl}
            attendancePercentage={employee.attendancePercentage}
            attendanceStreak={employee.attendanceStreak}
            currentBalance={employee.currentBalance}
            status={employee.status}
          />
        ))}
      </div>
    </div>
  );
};

export default EmployeeGrid;
