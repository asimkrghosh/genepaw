import { useState } from "react";
import { useLocation } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { COLORS, Navbar, Footer, Button, SectionTitle, Badge, INDIA_STATES } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { apiFetch } from "./api.js";

// ─── Constants ───
const REGISTRATION_INITIAL = {
  name: "", email: "", password: "", clinic_name: "",
  registration_number: "", city: "", state: "", phone: "",
};

const PHONE_RE = /^[6-9]\d{9}$/;

const REFERRAL_STEPS = [
  {
    step: "1",
    title: "Refer a Client",
    desc: "Recommend GenePaw to your patient's owner. Share your clinic code at checkout or mention the referral program directly.",
  },
  {
    step: "2",
    title: "Client Orders a Kit",
    desc: "Your referred client orders a Health + Breed or Complete Genome kit. Credit is applied to your account automatically.",
  },
  {
    step: "3",
    title: "Earn Credit + Clinical PDF",
    desc: "Earn ₹500 account credit per referred order. You also receive the clinical-format PDF report for every qualifying result.",
  },
];

const REPORT_FEATURES = [
  {
    label: "Breed Ancestry Analysis",
    desc: "Breed composition table with percentages, confidence intervals, and lineage data — ready to attach to patient records.",
  },
  {
    label: "Heritable Health Marker Panel",
    desc: "200+ markers with gene codes (MDR1, PRA-prcd, SOD1 and more), result status, and plain-language interpretation.",
  },
  {
    label: "Behavioral Trait Summary",
    desc: "Trainability, energy level, prey drive, and sociability scores compared against breed averages.",
  },
  {
    label: "Lineage Table",
    desc: "Structured parentage and lineage data formatted for clinical record-keeping.",
  },
  {
    label: "For Veterinary Use Notation",
    desc: "Every report footer states \"Prepared for veterinary use\" with GenePaw Genomics Pvt. Ltd. branding.",
  },
];

// ─── Vet Program Landing Page ───
function VetProgramPage() {
  const [form, setForm] = useState(REGISTRATION_INITIAL);
  const [formError, setFormError] = useState(null);
  const [success, setSuccess] = useState(false);

  const registerVet = useMutation({
    mutationFn: (data) =>
      apiFetch("/api/v1/vets/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => setSuccess(true),
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!PHONE_RE.test(form.phone)) {
      setFormError("Phone must be a valid 10-digit Indian mobile number (starts with 6–9).");
      return;
    }
    registerVet.mutate(form);
  }

  return (
    <div>
      {/* ─── Hero ─── */}
      <section
        className="pt-40 pb-32 px-6 text-center"
        style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}
      >
        <div className="max-w-4xl mx-auto">
          <Badge color={COLORS.accentLight}>VET PARTNER PROGRAM</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mt-6 mb-6 leading-tight">
            Clinical-grade genomics<br className="hidden sm:block" /> for your patients
          </h1>
          <p className="text-lg text-green-100 mb-10 max-w-2xl mx-auto">
            Join India's leading pet genomics platform. Offer your clients trusted genetic insights, earn referral credits, and receive clinical PDF reports formatted for your records — at no cost.
          </p>
          <Button
            variant="accent"
            size="lg"
            onClick={() =>
              document.getElementById("vet-register").scrollIntoView({ behavior: "smooth" })
            }
          >
            Register as a Vet Partner
          </Button>
        </div>
      </section>

      {/* ─── Referral Model ─── */}
      <section className="py-20 px-6" style={{ backgroundColor: COLORS.card }}>
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            subtitle="HOW IT WORKS"
            title="Earn credit every time you refer"
            description="The GenePaw Vet Partner Program turns your clinical referrals into recurring benefits — automatically."
          />
          <div className="grid sm:grid-cols-3 gap-6">
            {REFERRAL_STEPS.map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-white rounded-2xl shadow p-8 border"
                style={{ borderColor: COLORS.border }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-6"
                  style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}
                >
                  {step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Report Depth ─── */}
      <section className="py-20 px-6" style={{ backgroundColor: COLORS.bg }}>
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            subtitle="CLINICAL PDF REPORT"
            title="A report built for clinical records"
            description="The GenePaw clinical PDF is structured for attachment to patient files — complementing your clinical notes, not replacing them."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {REPORT_FEATURES.map(({ label, desc }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-6 shadow border"
                style={{ borderColor: COLORS.border }}
              >
                <Badge color={COLORS.primary}>{label}</Badge>
                <p className="text-sm text-gray-500 mt-3 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Registration Form ─── */}
      <section id="vet-register" className="py-20 px-6" style={{ backgroundColor: COLORS.card }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Badge color={COLORS.primary}>JOIN THE PROGRAM</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">Register as a Vet Partner</h2>
            <p className="text-gray-500 text-sm">Free to join. Start earning with your first referral.</p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4"
                style={{ background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` }}
              >
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">You're in!</h3>
              <p className="text-gray-600">Welcome to GenePaw Vet Partners. We'll be in touch.</p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-lg p-8 border"
              style={{ borderColor: COLORS.border }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Dr. Priya Sharma"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="vet@clinic.com"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="Min. 8 characters"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
                  <input
                    type="text"
                    name="clinic_name"
                    value={form.clinic_name}
                    onChange={handleChange}
                    required
                    placeholder="Sharma Pet Clinic"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Veterinary Registration Number</label>
                  <input
                    type="text"
                    name="registration_number"
                    value={form.registration_number}
                    onChange={handleChange}
                    required
                    placeholder="VCI-2023-001"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    placeholder="Mumbai"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State / UT</label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                    style={{ borderColor: COLORS.border }}
                  >
                    <option value="">Select State / UT</option>
                    {INDIA_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    style={{ borderColor: COLORS.border }}
                  />
                </div>
              </div>

              {(formError || registerVet.error) && (
                <p className="text-red-500 text-sm mt-4">
                  {formError ?? registerVet.error?.message}
                </p>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                disabled={registerVet.isPending}
              >
                {registerVet.isPending ? "Registering…" : "Register as Vet Partner"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Vet Report Page (Story 5.3 — DO NOT TOUCH) ───
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
