---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-core-experience', 'step-04-emotional-response']
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/prd-validation-report.md'
  - '_bmad-output/project-context.md'
---

# UX Design Specification GenePaw

**Author:** Pc
**Date:** 2026-05-15

---

## Executive Summary

### Project Vision

GenePaw is India's first multi-species animal genomics platform — a brownfield React/Vite/Tailwind SPA with a functional prototype. The UX strategy is to refine and extend the existing prototype rather than redesign it. The current prototype demonstrates the core journey well; the work ahead is audience clarity, India-market alignment, trust/consent infrastructure, and veterinarian-specific flows.

### Target Users

- **Pet owners** — primary customer; emotional, mobile-friendly, needs reassurance and clarity over scientific depth
- **Breeders** — high-intent recurring buyers; need lineage/purity data, multi-animal management (future phase)
- **Veterinarians** — referral engine; need clinical credibility, PDF reports formatted for medical records, a registration path
- **Zoo / institutional buyers** — bulk procurement; separate flow (future phase)

### Key Design Challenges

1. **Audience mixing in species grid** — 24 species including research model organisms (roundworm, bacteria, fruit fly) sit alongside pet species. Customers need a filtered view; research organisms handled separately.
2. **No customer authentication** — deferred by decision; kit tracking and results access are demo-only for current phase.
3. **India-market misalignment** — contact info, address fields, and phone formats are USA-centric despite INR pricing and India-first positioning.
4. **Trust deficit in order flow** — DNA data requires explicit consent collection; currently absent from the order wizard.
5. **Admin visibility** — admin entry point is prominent in the customer navbar; needs to be moved to a discreet location.

### Design Opportunities

1. **Veterinarian channel** — a dedicated vet landing page and report preview converts the existing PDF infrastructure into an organic referral loop.
2. **India-first positioning** — Bangalore HQ, +91 contact, INR throughout, and Indian address forms reinforce the "domestic incumbent" story that differentiates GenePaw from Embark/Wisdom Panel.
3. **Consent as a trust signal** — a well-worded consent step (not a legal wall) can become a positive differentiator in a market where genomic privacy is unfamiliar.

## Confirmed UX Decisions

### Species Filtering
Customer-facing species grid shows only: Dog, Cat, Bird, Fish, Horse, Cattle, Pig, Sheep, Primate, Dolphin, Bat, Python, Panda.
Hidden from customer view: Human, Rat, Roundworm, Fruit Fly, Frog, Yeast, Sea Slug, Snail, Mosquito, Bacteria, Vole, Mole-Rat (available to admin/research portal in future phase).

### India / Bangalore Localisation
- Footer contact: Bangalore address, +91 phone number
- Order forms: city / state / pincode fields (remove zip/country)
- Consistent across both OrderKit and SpeciesSection forms

### Consent in Order Flow
Inline in the "Confirm" step of OrderKit: a short consent paragraph covering data use and an opt-in checkbox. Submit is disabled until checked.

### Admin Entry Point
Remove "Admin" button from Navbar. Add low-contrast "Staff Login" text link to the footer (same row as Privacy Policy / Terms of Service).

### Species Not Listed — Single Path
Remove duplicate inline order form from SpeciesSection. The "Species Not Listed?" tile navigates to OrderKit with `other` pre-selected. One form, one path.

### Veterinarian Pages
Two new pages:
- `vet-program`: vet partner landing (referral model, report depth, registration form)
- `vet-report`: sample vet report showcase with PDF download trigger

Footer "For Veterinarians" link connects to `vet-program`.

## Core User Experience

### Defining Experience

The primary core loop is: Order Kit → Track Sample → Results Reveal → Share/Download PDF. The single most critical interaction is the **Results Reveal** — the first time a customer opens their genomic report. This is the emotional payoff for the purchase and the trigger for referral behaviour (sharing with vets, friends, breeders). Everything else in the product supports or leads toward this moment.

### Platform Strategy

Web-first SPA, fully responsive. Desktop-optimised for ordering and admin workflows; mobile-optimised for results viewing and kit tracking. No native app or offline functionality required at this stage. Touch targets on tabbed results pages must be thumb-reachable (minimum 44px hit area). The existing React/Vite/Tailwind stack supports this without additional tooling.

### Effortless Interactions

- **Species discovery and kit ordering** — 4-step wizard is already well-structured; species grid click-through is intuitive
- **Results tab navigation** — swipeable on mobile; tabs must not require horizontal scrolling on small screens
- **Vet PDF download** — one-click from results header; already implemented correctly
- **Consent checkbox** — inline in Confirm step, non-blocking, plain-language wording
- **Admin access** — footer Staff Login link; zero friction for admins who know it exists, invisible to customers

### Critical Success Moments

| Moment | Why it matters |
|---|---|
| Home hero | First impression — must feel credible and India-native, not generic |
| Species selection | Animal must be findable within 5 seconds; no research organisms in customer view |
| Pricing page | ₹27,999 is a considered purchase — trust must be earned before the commit |
| Results reveal | The "wow" moment — breed/health data must feel personal, visual, and meaningful |
| PDF download | Closes the vet referral loop; this action drives organic acquisition |

### Experience Principles

1. **Results first** — every page should make the user feel closer to their animal's story
2. **Science made warm** — genomic data presented with empathy, not clinical coldness
3. **India-native** — language, currency, address, contact, and visual tone signal a domestic product built for this market
4. **One clear path** — no duplicate forms, no ambiguous CTAs, no admin noise visible to customers
5. **Earn trust before asking for data** — consent collected after the user understands the value, not as an entry barrier

## Desired Emotional Response

### Primary Emotional Goals

The product's emotional superpower is **wonder and delight** at the results reveal — the pet owner's "I had no idea!" moment. This is the emotion that drives word-of-mouth and social sharing. Supporting emotions by segment: reassurance (health-focused owners), confidence (breeders), clinical credibility (vets), efficiency (institutions).

### Emotional Journey Mapping

| Stage | Target emotion | Emotion to avoid |
|---|---|---|
| Landing on home | Curiosity + trust | Scepticism ("Is this real?") |
| Species selection | Recognition — "my animal is here" | Confusion from irrelevant organisms |
| Pricing page | Considered confidence | Sticker shock without context |
| Order flow | Ease and forward momentum | Friction or doubt |
| Consent step | Informed and respected | Cornered or surveilled |
| Waiting (tracking) | Anticipation | Anxiety or abandonment |
| Results reveal | Wonder and delight | Overwhelm or disappointment |
| Health markers | Empowered awareness | Fear or alarm |
| PDF download | Professional satisfaction | Embarrassment if report looks cheap |
| Return visits | Belonging and loyalty | Forgetting the product existed |

### Micro-Emotions

- **Trust over scepticism** — earned through every visual and copy decision
- **Delight over satisfaction** — results must surprise, not merely inform
- **Empowerment over anxiety** — health data framed as knowledge, never as alarm
- **Belonging over isolation** — India-native experience at every touchpoint

### Design Implications

| Emotion | UX approach |
|---|---|
| Wonder on results reveal | Animated breed chart entrance; large warm visual; personal animal header before data |
| Reassurance on health markers | Traffic-light colour coding (green/amber/red) with plain-language explanations, not gene codes alone |
| Trust on consent | Short human-written paragraph ("Your pet's DNA stays yours") — not legal boilerplate |
| Clinical credibility for vets | PDF uses structured tables, standard clinical terminology, GenePaw logo — looks like a lab report |
| India-native belonging | Bangalore address, INR everywhere, species names contextualised for Indian breeds |

### Emotional Design Principles

1. **Delight before data** — lead with the emotional story, then reveal the science
2. **Knowledge, not diagnosis** — health results empower; they never alarm
3. **Earned trust** — every interaction either builds or spends trust; spend carefully
4. **Made for India** — every touchpoint should feel domestic, not translated
