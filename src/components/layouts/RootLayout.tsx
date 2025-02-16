import React from "react";
import Header from "@/components/dashboard/Header";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <Outlet />
    </div>
  );
};

export default RootLayout;
