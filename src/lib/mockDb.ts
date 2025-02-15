import { Employee, defaultEmployees } from "./data";

class MockDatabase {
  private employees: Employee[] = [...defaultEmployees];

  async from(table: string) {
    if (table === "employees") {
      return {
        select: async () => ({
          data: this.employees,
          error: null,
        }),
        insert: async (data: Partial<Employee>[]) => {
          const newEmployees = data.map((emp) => ({
            ...emp,
            id: Math.random().toString(36).substr(2, 9),
          }));
          this.employees.push(...(newEmployees as Employee[]));
          return { error: null };
        },
        update: async (data: Partial<Employee>) => {
          return {
            eq: async (field: string, value: any) => {
              const index = this.employees.findIndex(
                (emp) => emp[field] === value,
              );
              if (index !== -1) {
                this.employees[index] = { ...this.employees[index], ...data };
              }
              return { error: null };
            },
          };
        },
        delete: async () => {
          return {
            eq: async (field: string, value: any) => {
              this.employees = this.employees.filter(
                (emp) => emp[field] !== value,
              );
              return { error: null };
            },
          };
        },
      };
    }
    throw new Error(`Table ${table} not found`);
  }
}

export const mockDb = new MockDatabase();
