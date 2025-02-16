export interface Role {
  id: string;
  name: string;
  salary: number;
  created_at?: string;
}

export interface Employee {
  id: string;
  name: string;
  role_id: string;
  avatarUrl: string;
  attendancePercentage: number;
  attendanceStreak: number;
  currentBalance: number;
  status: "present" | "half-day" | "absent";
  created_at?: string;
}
