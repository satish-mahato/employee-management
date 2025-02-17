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
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from("employees")
          .select(`
            *,
            roles:role_id (id, name, salary)
          `);

        if (error) throw error;

        if (data) {
          const formattedEmployees = data.map((emp) => ({
            id: emp.id,
            name: emp.name,
            role: emp.roles?.name || "N/A",
            avatarUrl: emp.avatarurl,
            attendancePercentage: emp.attendancepercentage || 0,
            attendanceStreak: emp.attendancestreak || 0,
            currentBalance: emp.roles?.salary || 0,
            status: emp.status || "present",
          }));
          setSupabaseEmployees(formattedEmployees);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
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