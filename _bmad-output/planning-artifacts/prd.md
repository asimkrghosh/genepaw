---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary']
inputDocuments: []
workflowType: 'prd'
classification:
  projectType: web_app
  domain: scientific
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - GenePaw

**Author:** Pc
**Date:** 2026-05-14

## Executive Summary

GenePaw is India's first multi-species animal genomics platform, with a primary mission to build the world's most comprehensive proprietary genomic databank across all animal species — making GenePaw's reference database the core competitive asset that no competitor can replicate. The customer-facing platform (DNA kit ordering, breed composition, health markers, behavioral traits, nutrition profiles, lineage verification) serves as the primary data acquisition engine for this mission.

The platform serves a market with no domestic incumbent at this breadth of species coverage. Existing services (Embark, Wisdom Panel) are limited to dogs, priced in USD, and hold no data on Indian-native breeds or endemic species. GenePaw's multi-species baseline databank — already established as a starting point — gives it a head start no late entrant can purchase.

**Target Users:**
- **Pet owners (curiosity-driven):** Breed identification for rescued or mixed-breed animals; one-time purchase, emotionally driven
- **Pet owners (health-focused):** Hereditary disease screening, carrier status, and vet-interpretable health reports; premium tier with repeat relationship potential
- **Breeders:** Purity and lineage verification for selective breeding decisions across dogs, cats, birds, and aquaculture; highest-intent recurring segment
- **Zoo / wildlife institutions:** Bulk kit ordering and species-level health and disease analysis; government/municipal and private/conservation institutions (distinct procurement models)
- **Veterinarians:** Influencer stakeholder — vet-interpretable reports and professional PDF exports drive organic referral adoption

**Pricing (INR):** ₹7,999 Breed ID · ₹15,999 Health + Breed · ₹27,999 Complete Genome *(commercial model to be refined in future phase)*

### What Makes This Special

GenePaw's moat is its **proprietary multi-species genomic databank** — retained internally, not public, growing with every kit submitted. Each sample processed expands a reference dataset covering species from common pets to rare zoo animals, including Indian-native breeds and endemic species absent from any global database. This data asset compounds over time: accuracy improves, new analysis capabilities unlock, and the switching cost for institutions that build longitudinal records on GenePaw's platform becomes structural.

The long-term vision extends the platform from data collection toward population-level genomic intelligence, with future potential in veterinary research, animal health insurance, and conservation genomics.

**Market strategy:** India-first, all-species breadth from launch; international expansion as the databank achieves critical mass.

**Open architectural decision:** Sequencing infrastructure (in-house vs. lab partnership) to be determined; impacts data pipeline design and latency SLA.

## Project Classification

- **Project Type:** Web Application — dual-portal (customer-facing + admin dashboard)
- **Domain:** Scientific / Veterinary Genomics
- **Complexity:** Medium
- **Project Context:** Brownfield — functional React SPA prototype and baseline databank exist; backend, real authentication, genomics data pipeline, and consent/privacy infrastructure to be designed
