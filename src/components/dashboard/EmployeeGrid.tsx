import React from "react";
import EmployeeCard from "./EmployeeCard";
import { Employee, defaultEmployees } from "@/lib/data";

interface EmployeeGridProps {
  employees?: Employee[];
}

const EmployeeGrid = ({ employees = defaultEmployees }: EmployeeGridProps) => {
  return (
    <div className="w-full h-[850px] bg-slate-50 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {employees.map((employee) => (
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
