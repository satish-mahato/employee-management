import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import BulkAttendance from "./components/dashboard/BulkAttendance";
import MonthlyAttendance from "./components/dashboard/MonthlyAttendance";
import EmployeeManagement from "./components/dashboard/EmployeeManagement";
import RootLayout from "./components/layouts/RootLayout";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider, useAuth } from "./lib/auth.tsx";
import routes from "tempo-routes";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />

            <Route element={<RootLayout />}>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bulk-attendance"
                element={
                  <ProtectedRoute requireAdmin>
                    <BulkAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monthly-attendance"
                element={
                  <ProtectedRoute>
                    <MonthlyAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/manage-employees"
                element={
                  <ProtectedRoute requireAdmin>
                    <EmployeeManagement />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
