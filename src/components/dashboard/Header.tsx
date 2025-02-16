import React from "react";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom"; // Fixed import
import {
  Search,
  DollarSign,
  Users,
  CalendarCheck2,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  companyBalance?: number;
  onSearch?: (searchTerm: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  companyBalance = 50000,
  onSearch = () => {}, // Removed console.log for cleaner code
}) => {
  const navigate = useNavigate();

  return (
    <header className="w-full h-[72px] px-6 bg-white border-b border-slate-200 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Fixed Link usage */}
        <Link to="/">
          <h1 className="text-xl font-bold">BMS</h1>
        </Link>

        {/* Search Bar */}
        <div className="relative w-[320px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            className="pl-10"
            placeholder="Search employees..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/manage-employees")}
          >
            <UserPlus className="h-4 w-4" />
            Manage Employees
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/bulk-attendance")}
          >
            <Users className="h-4 w-4" />
            Bulk Attendance
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => navigate("/monthly-attendance")}
          >
            <CalendarCheck2 className="h-4 w-4" />
            View Attendance
          </Button>
        </div>

        {/* Balance Display */}
        <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-slate-700" />
          <span className="font-medium text-slate-900">
            ${companyBalance.toLocaleString()}
          </span>
          <span className="text-sm text-slate-500">Available Balance</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
