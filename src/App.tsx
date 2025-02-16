import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import BulkAttendance from "./components/dashboard/BulkAttendance";
import MonthlyAttendance from "./components/dashboard/MonthlyAttendance";
import EmployeeManagement from "./components/dashboard/EmployeeManagement";
import RootLayout from "./components/layouts/RootLayout";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/bulk-attendance" element={<BulkAttendance />} />
            <Route path="/monthly-attendance" element={<MonthlyAttendance />} />
            <Route path="/manage-employees" element={<EmployeeManagement />} />
          </Route>
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
