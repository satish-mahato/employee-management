import React from "react";
import Header from "@/components/dashboard/Header";
import EmployeeGrid from "@/components/dashboard/EmployeeGrid";

const Home = () => {
  const handleSearch = (searchTerm: string) => {
    console.log("Searching for:", searchTerm);
  };

  return (
    <main className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Employee Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Manage attendance and process payments for your team members
        </p>
      </div>
      <EmployeeGrid />
    </main>
  );
};

export default Home;
