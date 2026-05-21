import { useLocation } from "react-router";
import { COLORS, Navbar, Footer } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";

function VetProgramPage() {
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vet Partner Program</h1>
        <p className="text-gray-500">Coming soon — partner with GenePaw to offer genomic testing to your clients.</p>
      </div>
    </div>
  );
}

function VetReportPage() {
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Vet Report Access</h1>
        <p className="text-gray-500">Coming soon — veterinary professionals can access patient genomic reports here.</p>
      </div>
    </div>
  );
}

function PageWrapper({ children }) {
  const { user, logout } = useApp();
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage="vet" user={user} onLogout={logout} />
      {children}
      <Footer />
    </div>
  );
}

export default function VetPortalPage() {
  const { pathname } = useLocation();
  return (
    <PageWrapper>
      {pathname === "/vet-report" ? <VetReportPage /> : <VetProgramPage />}
    </PageWrapper>
  );
}
