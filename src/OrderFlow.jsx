import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ArrowLeft, ArrowRight, Check, Plus, Minus, PackageCheck, Lock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { COLORS, formatINR, Button, Navbar, Footer, INDIA_STATES } from "./shared.jsx";
import { useApp } from "./AppContext.jsx";
import { SPECIES_DATA } from "./CustomerPortal.jsx";
import { apiFetch } from "./api.js";

const isValidIndianPhone = (phone) => /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ""));
const isValidPincode = (pin) => /^\d{6}$/.test(pin);

const PLAN_PACKAGE_MAP = {
  "Breed ID": "breed_id",
  "Health + Breed": "health_breed",
  "Complete Genome": "complete_genome",
};

const CONSENT_TEXT =
  "Your pet’s DNA stays yours. We use your sample only to generate the report you ordered. Your genomic data is stored securely in India, never sold to third parties, and you can request deletion at any time by contacting us.";

function OrderKit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pricing, user, logout } = useApp();
  const preSelectedSpecies = location.state?.species || null;

  const [step, setStep] = useState(preSelectedSpecies ? 2 : 1);
  const [selectedSpecies, setSelectedSpecies] = useState(preSelectedSpecies || null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", address2: "", city: "", state: "", pincode: "", petName: "", notes: "" });
  const [consentChecked, setConsentChecked] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  const { data: speciesApiData, isError: speciesError } = useQuery({
    queryKey: ["species", "customer"],
    queryFn: () => apiFetch("/api/v1/species?category=customer"),
    staleTime: 5 * 60 * 1000,
  });
  const speciesIdMap = speciesApiData?.items
    ? Object.fromEntries(speciesApiData.items.map((s) => [s.name, s.id]))
    : {};

  const placeOrder = useMutation({
    mutationFn: async () => {
      const order = await apiFetch("/api/v1/orders", {
        method: "POST",
        body: JSON.stringify({
          species_id: speciesIdMap[selectedSpecies.name],
          package: PLAN_PACKAGE_MAP[selectedPlan.name],
          address_city: form.city,
          address_state: form.state,
          address_pincode: form.pincode,
          full_name: form.name,
          phone: form.phone,
        }),
      });
      await apiFetch(`/api/v1/orders/${order.id}/consent?token=${order.guest_token}`, {
        method: "POST",
        body: JSON.stringify({
          consent_text: CONSENT_TEXT,
          consented_at: new Date().toISOString(),
        }),
      });
      return order;
    },
    onSuccess: (order) => {
      localStorage.setItem(`genepaw_guest_token_${order.id}`, String(order.guest_token));
      setOrderResult({ orderId: order.id, guestToken: order.guest_token });
    },
  });

  return (
    <section className="min-h-screen pt-28 pb-20" style={{ backgroundColor: COLORS.bg }}>
      <div className="max-w-4xl mx-auto px-6">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-gray-500 hover:text-green-600 mb-8 cursor-pointer">
          <ArrowLeft size={18} /> Back to Home
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Your GenePaw Kit</h1>
        <p className="text-gray-500 mb-8">Complete the steps below to get started with genomic testing.</p>

        <div className="flex items-center gap-4 mb-12">
          {["Species", "Plan", "Details", "Confirm"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "text-white" : "bg-gray-200 text-gray-400"}`} style={step === i + 1 ? { background: `linear-gradient(135deg, ${COLORS.gradientStart}, ${COLORS.gradientEnd})` } : {}}>
                {step > i + 1 ? <Check size={16} /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${step === i + 1 ? "font-semibold text-gray-900" : "text-gray-400"}`}>{s}</span>
              {i < 3 && <div className={`flex-1 h-0.5 ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select Your Animal's Species</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SPECIES_DATA.filter((s) => s.category === "customer").map((s) => (
                <div key={s.id} onClick={() => setSelectedSpecies(s)} className={`bg-white rounded-xl p-5 cursor-pointer border-2 transition-all hover:-translate-y-0.5 ${selectedSpecies?.id === s.id ? "border-green-500 shadow-lg shadow-green-500/10" : "border-transparent shadow-sm hover:shadow-md"}`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="font-semibold text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{s.healthMarkers} markers</div>
                </div>
              ))}
              <div
                onClick={() => setSelectedSpecies({ id: "other", name: "Other Species", icon: "❓", isCustom: true, variants: [] })}
                className={`bg-white rounded-xl p-5 cursor-pointer border-2 border-dashed transition-all hover:-translate-y-0.5 ${selectedSpecies?.id === "other" ? "border-amber-500 shadow-lg shadow-amber-500/10" : "border-gray-300 hover:border-amber-400 shadow-sm hover:shadow-md"}`}
              >
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-2">
                  <PackageCheck size={20} className="text-amber-600" />
                </div>
                <div className="font-semibold text-gray-900">Species Not Listed?</div>
                <div className="text-xs text-gray-400 mt-1">Order a custom kit</div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button disabled={!selectedSpecies} onClick={() => setStep(2)}>Continue <ArrowRight size={18} /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Choose Your Testing Plan</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {pricing.map((p) => (
                <div key={p.name} onClick={() => setSelectedPlan(p)} className={`bg-white rounded-xl p-6 cursor-pointer border-2 transition-all hover:-translate-y-0.5 relative ${selectedPlan?.name === p.name ? "border-green-500 shadow-lg shadow-green-500/10" : "border-transparent shadow-sm hover:shadow-md"}`}>
                  {p.popular && <span className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">POPULAR</span>}
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  <div className="text-2xl font-bold text-gray-900 my-2">{formatINR(p.price)}</div>
                  <ul className="space-y-1">
                    {p.features.map((f) => <li key={f} className="text-sm text-gray-500 flex items-center gap-1"><Check size={14} className="text-green-500" /> {f}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer"><Minus size={16} /></button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 cursor-pointer"><Plus size={16} /></button>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</Button>
              <Button disabled={!selectedPlan} onClick={() => { setStep(3); setConsentChecked(false); }}>Continue <ArrowRight size={18} /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping & Pet Details</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Phone <span className="text-red-500">*</span></label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Pet/Animal Name <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                  <input value={form.petName} onChange={(e) => setForm({ ...form, petName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Address Line 2 <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                <input value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">City <span className="text-red-500">*</span></label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">State <span className="text-red-500">*</span></label>
                  <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 bg-white">
                    <option value="">Select State</option>
                    {INDIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Pincode <span className="text-red-500">*</span></label>
                  <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} maxLength={6} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Special Notes <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 resize-none" placeholder="Any additional information about your animal..." />
              </div>
              <div className="border-t pt-4 mt-2">
                <p className="text-base text-gray-700 leading-relaxed mb-4">
                  Your pet's DNA stays yours. We use your sample only to generate the report you ordered. Your genomic data is stored securely in India, never sold to third parties, and you can request deletion at any time by contacting us.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-green-500 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-700">I understand and agree to GenePaw's use of my pet's genomic data.</span>
                </label>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft size={18} /> Back</Button>
              <Button onClick={() => { if (form.name && form.email && form.phone && form.address && form.city && form.state && form.pincode && isValidPincode(form.pincode) && isValidIndianPhone(form.phone) && consentChecked) setStep(4); }} disabled={!form.name || !form.email || !form.phone || !form.address || !form.city || !form.state || !form.pincode || !isValidPincode(form.pincode) || !isValidIndianPhone(form.phone) || !consentChecked}>Review Order <ArrowRight size={18} /></Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="text-3xl">{selectedSpecies?.icon}</span>
                <div>
                  <div className="font-bold text-gray-900">{selectedSpecies?.name} — {selectedPlan?.name}</div>
                  <div className="text-sm text-gray-500">Qty: {quantity} • {form.petName && `Animal: ${form.petName}`}</div>
                </div>
                <div className="ml-auto text-2xl font-bold text-gray-900">{formatINR(selectedPlan?.price * quantity)}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Name:</span> <span className="text-gray-700 font-medium">{form.name || "—"}</span></div>
                <div><span className="text-gray-400">Email:</span> <span className="text-gray-700 font-medium">{form.email || "—"}</span></div>
                <div><span className="text-gray-400">Phone:</span> <span className="text-gray-700 font-medium">{form.phone || "—"}</span></div>
                <div><span className="text-gray-400">Address:</span> <span className="text-gray-700 font-medium">{form.address || "—"}{form.address2 ? `, ${form.address2}` : ""}, {form.city}, {form.state} – {form.pincode}</span></div>
              </div>
              <div className="border-t pt-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Total (incl. shipping)</div>
                  <div className="text-3xl font-bold text-gray-900">{formatINR(selectedPlan?.price * quantity)}</div>
                </div>
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <Lock size={16} /> Secure checkout powered by Razorpay
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              {orderResult ? null : (
                <Button variant="ghost" disabled={placeOrder.isPending} onClick={() => { setStep(3); setConsentChecked(false); }}><ArrowLeft size={18} /> Back</Button>
              )}
              {orderResult ? (
                <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <Check size={40} className="text-green-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Order Placed!</h3>
                  <p className="text-sm text-gray-500 mb-3">Save your order reference to track your kit:</p>
                  <div className="font-mono text-sm bg-white rounded-xl border border-gray-200 px-4 py-2 inline-block mb-2 select-all">{orderResult.orderId}</div>
                  <p className="text-xs text-gray-400 mt-2">Guest token: <span className="font-mono select-all">{orderResult.guestToken}</span></p>
                  <div className="mt-4">
                    <Button
                      variant="primary"
                      onClick={() => navigate(`/track/${orderResult.orderId}?token=${encodeURIComponent(orderResult.guestToken)}`)}
                    >
                      Track Your Order <ArrowRight size={18} />
                    </Button>
                  </div>
                </div>
              ) : selectedSpecies?.isCustom ? (
                <p className="text-sm text-amber-600 self-center">Custom species orders require manual processing. Contact us at hello@genepaw.in.</p>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {speciesError && (
                    <p className="text-sm text-amber-600">Unable to load species data. Please refresh and try again.</p>
                  )}
                  {placeOrder.isError && (
                    <p className="text-sm text-red-600">{placeOrder.error?.body?.detail ?? placeOrder.error?.message ?? "Order failed. Please try again."}</p>
                  )}
                  <Button
                    variant="accent"
                    size="lg"
                    disabled={placeOrder.isPending || !speciesIdMap[selectedSpecies?.name]}
                    onClick={() => placeOrder.mutate()}
                  >
                    {placeOrder.isPending ? "Placing Order…" : `Place Order — ${formatINR(selectedPlan?.price * quantity)}`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function OrderFlowPage() {
  const { user, logout } = useApp();

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.bg, color: COLORS.text }}>
      <Navbar currentPage="order" user={user} onLogout={logout} />
      <OrderKit />
      <Footer />
    </div>
  );
}
