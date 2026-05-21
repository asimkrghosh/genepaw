import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { COLORS } from "./shared.jsx";

const CustomerPortal = React.lazy(() => import("./CustomerPortal.jsx"));
const OrderFlow = React.lazy(() => import("./OrderFlow.jsx"));
const Results = React.lazy(() => import("./Results.jsx"));
const VetPortal = React.lazy(() => import("./VetPortal.jsx"));
const AdminPortal = React.lazy(() => import("./AdminPortal.jsx"));
const StaffLogin = React.lazy(() => import("./StaffLogin.jsx"));

function AuthGuard({ children }) {
  const token = localStorage.getItem("genepaw_token");
  if (!token) return <Navigate to="/staff-login" replace />;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "staff") return <Navigate to="/staff-login" replace />;
    if (payload.exp && payload.exp * 1000 < Date.now()) return <Navigate to="/staff-login" replace />;
  } catch {
    return <Navigate to="/staff-login" replace />;
  }
  return children;
}

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
    <div className="text-gray-400 text-sm">Loading…</div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<CustomerPortal />} />
        <Route path="/track" element={<CustomerPortal />} />
        <Route path="/track/:orderId" element={<CustomerPortal />} />
        <Route path="/order-kit" element={<OrderFlow />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:orderId" element={<Results />} />
        <Route path="/vet-program" element={<VetPortal />} />
        <Route path="/vet-report" element={<VetPortal />} />
        <Route path="/staff-login" element={<StaffLogin />} />
        <Route path="/admin" element={<AuthGuard><AdminPortal /></AuthGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
