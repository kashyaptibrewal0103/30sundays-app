// ─── Travel consultant + team lead shown on the itinerary screen ───
//
// One card, two versions, picked from the consultant's own trip count:
//   tripsPlanned >= TRIPS_THRESHOLD  → v1: their own volume is the proof
//   tripsPlanned <  TRIPS_THRESHOLD  → v2: the volume block is hidden and the
//                                     team lead's record carries the card
// Everything else is shared, so there is one component and one set of copy.
export const TRIPS_THRESHOLD = 100;

export const teamLeads = {
  aarav: {
    id: "aarav",
    name: "Aarav Mehta",
    role: "Team Lead",
    phone: "+919876500022",
    teamSize: 6,
    tripsPlanned: 6000,
    languages: ["English", "Hindi"],
    // Two lines: what he runs, then why that matters to this customer.
    bio: "Aarav leads a team of 6 Bali consultants and has planned 6,000+ trips himself. He reviews every itinerary before it reaches you.",
  },
};

// Same person, two demo profiles, so both versions are reviewable in one build.
// In production this comes from the deal's assigned consultant.
export const consultantProfiles = {
  v1: {
    id: "rohit-senior",
    name: "Rohit Sharma",
    phone: "+919876500011",
    destination: "Bali",
    tripsPlanned: 2000,
    languages: ["English", "Hindi"],
    leadId: "aarav",
    bio: "Rohit has been planning couple trips for 3 years, 2,000 Bali itineraries, and he still books the villas himself.",
  },
  v2: {
    id: "rohit-new",
    name: "Rohit Sharma",
    phone: "+919876500011",
    destination: "Bali",
    tripsPlanned: 42,
    languages: ["English", "Hindi"],
    leadId: "aarav",
    bio: "Rohit has been planning couple trips to Bali for 2 years, and he still books the villas himself.",
  },
};

export const formatCount = (n) => Number(n || 0).toLocaleString("en-IN");

export const consultantVersion = (c) =>
  c && c.tripsPlanned >= TRIPS_THRESHOLD ? "v1" : "v2";

export const teamLeadFor = (c) => (c ? teamLeads[c.leadId] || null : null);

// An explicit ?consultant=v1|v2 wins in the prototype; otherwise fall back to
// the proven profile. Returns null for "no consultant assigned yet", which the
// section renders as nothing (per the requirement doc).
export function getConsultant(override) {
  if (override === "none") return null;
  return consultantProfiles[override] || consultantProfiles.v1;
}
