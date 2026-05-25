import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router";
import { COLORS } from "./shared.jsx";

const CustomerPortal = React.lazy(() => import("./CustomerPortal.jsx"));
const OrderFlow = React.lazy(() => import("./OrderFlow.jsx"));
const Results = React.lazy(() => import("./Results.jsx"));
const VetPortal = React.lazy(() => import("./VetPortal.jsx"));
const AdminPortal = React.lazy(() => import("./AdminPortal.jsx"));
const StaffLogin = React.lazy(() => import("./StaffLogin.jsx"));
const MarkerArticle = React.lazy(() => import("./MarkerArticle.jsx"));

// P4: catches lazy-import failures (network error, stale chunk) so the whole app doesn't blank out
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-2">Something went wrong loading this page.</div>
            <button
              className="text-xs underline"
              style={{ color: COLORS.primary }}
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AuthGuard({ children }) {
  const token = localStorage.getItem("genepaw_token");
  if (!token) return <Navigate to="/staff-login" replace />;
  try {
    // P1+P2: validate 3-segment structure and normalize base64url before decoding
    const parts = token.split(".");
    if (parts.length !== 3) return <Navigate to="/staff-login" replace />;
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(Math.ceil(b64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));
    if (payload.role !== "staff") return <Navigate to="/staff-login" replace />;
    // P3: treat missing exp as expired rather than granting eternal access
    if (!payload.exp || payload.exp * 1000 < Date.now()) return <Navigate to="/staff-login" replace />;
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

// P6: renders a proper 404 instead of silently discarding unmatched paths
function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-300 mb-2">404</div>
        <div className="text-gray-500 text-sm mb-4">Page not found.</div>
        <a href="/" style={{ color: COLORS.primary }} className="text-sm underline">Go home</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
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
          <Route path="/markers/:categoryId/:markerIdx" element={<MarkerArticle />} />
          <Route path="/admin" element={<AuthGuard><AdminPortal /></AuthGuard>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
