export interface Employee {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  attendancePercentage: number;
  attendanceStreak: number;
  currentBalance: number;
  status: "present" | "half-day" | "absent";
}

export const defaultEmployees: Employee[] = [
  {
    id: "1",
    name: "John Doe",
    role: "Software Engineer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    attendancePercentage: 85,
    attendanceStreak: 5,
    currentBalance: 2500,
    status: "present",
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "Product Manager",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    attendancePercentage: 92,
    attendanceStreak: 8,
    currentBalance: 3200,
    status: "present",
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "UI Designer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    attendancePercentage: 78,
    attendanceStreak: 3,
    currentBalance: 2100,
    status: "half-day",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    role: "QA Engineer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    attendancePercentage: 65,
    attendanceStreak: 0,
    currentBalance: 1800,
    status: "absent",
  },
];
