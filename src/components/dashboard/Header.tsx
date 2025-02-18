import React from "react";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  DollarSign,
  Users,
  CalendarCheck2,
  UserPlus,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  companyBalance?: number;
  onSearch?: (searchTerm: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  companyBalance = 50000,
  onSearch = () => {},
}) => {
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="w-full h-[72px] px-6 bg-white border-b border-slate-200 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-6">
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
        {/* Admin Buttons */}
        {isAdmin && (
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
          </div>
        )}

        {/* Common Buttons */}
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate("/monthly-attendance")}
        >
          <CalendarCheck2 className="h-4 w-4" />
          View Attendance
        </Button>

        {/* Balance Display */}
        <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-lg">
          <DollarSign className="h-5 w-5 text-slate-700" />
          <span className="font-medium text-slate-900">
            ${companyBalance.toLocaleString()}
          </span>
          <span className="text-sm text-slate-500">Available Balance</span>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-medium">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
