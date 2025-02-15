import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarCheck2, DollarSign, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeCardProps {
  name?: string;
  role?: string;
  avatarUrl?: string;
  attendancePercentage?: number;
  attendanceStreak?: number;
  currentBalance?: number;
  status?: "present" | "half-day" | "absent";
  id?: string;
}

const EmployeeCard = ({
  name = "John Doe",
  role = "Software Engineer",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  attendancePercentage = 85,
  attendanceStreak = 5,
  currentBalance = 2500,
  status = "present",
  id = "1",
}: EmployeeCardProps) => {
  const navigate = useNavigate();
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

  return (
    <Card className="w-[340px] bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={avatarUrl} alt={name} />
            <AvatarFallback>
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-slate-500">{role}</p>
          </div>
        </div>
        <Badge variant="secondary" className={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Monthly Attendance</span>
            <span className="font-medium">{attendancePercentage}%</span>
          </div>
          <Progress value={attendancePercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">{attendanceStreak} day streak</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">${currentBalance}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          className="w-[48%] space-x-2"
          onClick={() => navigate(`/monthly-attendance?employee=${id}`)}
        >
          <UserCheck className="h-4 w-4" />
          <span>View Attendance</span>
        </Button>
        <Button
          className="w-[48%] space-x-2"
          onClick={() => console.log("Process payment clicked")}
        >
          <DollarSign className="h-4 w-4" />
          <span>Pay Salary</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmployeeCard;
