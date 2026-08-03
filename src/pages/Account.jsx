import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight, Wallet, HelpCircle, FileText, LogOut, User, Heart,
  Bookmark, Users, Lightbulb, Bug, Star, Share2, Shield, MessageCircle,
  Instagram, Youtube, Linkedin, X as XIcon, Send, Check,
  ArrowLeft, Phone, Mail, Calendar, MapPin, Trash2, AlertTriangle,
  Gift, Megaphone, Palmtree, UserPlus, Plus, BookUser,
  ChevronDown, CreditCard, Copy, AlertCircle, ReceiptIndianRupee, Download, Clock,
} from "lucide-react";
import { C } from "../data";
import { useDeals } from "../data/deals";
import { useWishlist } from "../data/wishlist";

// Document builders - fields mimic OCR-extracted passport / PAN data.
const passportDoc = (file, { no, dob, issue, expiry, place }) => ({
  type: "Passport", file,
  fields: [
    ["Passport no.", no], ["Nationality", "Indian"], ["Date of birth", dob],
    ["Date of issue", issue], ["Date of expiry", expiry], ["Place of issue", place],
  ],
});
const panDoc = (file, { pan, name, dob, father }) => ({
  type: "PAN card", file,
  fields: [["PAN", pan], ["Name", name], ["Date of birth", dob], ["Father's name", father]],
});

// Demo profiles so the non-"new" states feel populated.
const DEMO_PROFILES = {
  lead: {
    name: "Aarav Mehta", countryCode: "+91", phone: "9876543210",
    email: "aarav.mehta@gmail.com", since: "2025", tier: "Lead",
    dob: "14 Aug 1994", city: "Pune, India", wishlist: 5,
    coins: 0, transactions: [], referralCode: "AAR-7K2M", referEarnings: 0,
    travellers: [
      { name: "Aarav Mehta", relation: "Primary traveller", isSelf: true, docs: [] },
    ],
  },
  customer: {
    name: "Priya Sharma", countryCode: "+91", phone: "9123456780",
    email: "priya.sharma@gmail.com", since: "2024", tier: "Customer",
    dob: "02 Mar 1991", city: "Mumbai, India", wishlist: 8,
    coins: 1500, referralCode: "PRI-5Z7J", referEarnings: 0,
    transactions: [
      { title: "Booking credit · Bali trip", date: "28 Apr 2026", amount: 1000 },
      { title: "Referral bonus · Aarav joined", date: "12 Apr 2026", amount: 500 },
    ],
    // TCS deduction certificates (Form 27D), latest trip first.
    tcsCertificates: [
      { id: "tcs-p1", destination: "Maldives", dates: "18 – 24 Aug 2026", tcsAmount: 8250, fy: "2026-27", status: "pending", availableFrom: "May 2027" },
      { id: "tcs-p2", destination: "Bali", dates: "12 – 19 Feb 2026", tcsAmount: 6240, fy: "2025-26", status: "available", certNo: "27D/2526/AB1042", issuedOn: "14 May 2026" },
    ],
    travellers: [
      { name: "Priya Sharma", relation: "Primary traveller", isSelf: true, docs: [
        passportDoc("passport_priya.jpg", { no: "M4521889", dob: "02 Mar 1991", issue: "15 Aug 2021", expiry: "14 Aug 2031", place: "Mumbai" }),
        panDoc("pan_priya.jpg", { pan: "EXXPS1234K", name: "PRIYA SHARMA", dob: "02 Mar 1991", father: "Ramesh Sharma" }),
      ] },
      { name: "Karan Sharma", relation: "Spouse", docs: [
        passportDoc("passport_karan.jpg", { no: "M7782341", dob: "18 Jul 1989", issue: "04 Jan 2020", expiry: "03 Jan 2030", place: "Mumbai" }),
        panDoc("pan_karan.jpg", { pan: "FXXPS5678L", name: "KARAN SHARMA", dob: "18 Jul 1989", father: "Mohan Sharma" }),
      ] },
    ],
  },
  done: {
    name: "Rohan Kapoor", countryCode: "+91", phone: "9988776655",
    email: "rohan.kapoor@gmail.com", since: "2023", tier: "Globetrotter",
    dob: "21 Nov 1989", city: "Bengaluru, India", wishlist: 12,
    coins: 4200, referralCode: "ROH-9X4Q", referEarnings: 5000,
    referrals: [
      { name: "Vikram Singh", date: "12 May 2026", status: "earned", amount: 2500 },
      { name: "Meera Nair", date: "03 Apr 2026", status: "earned", amount: 2500 },
      { name: "Sahil Kandhari", date: "28 Mar 2026", status: "pending" },
    ],
    transactions: [
      { title: "Repeat booking reward", date: "02 Jun 2026", amount: 1500 },
      { title: "Redeemed on Maldives trip", date: "18 Mar 2026", amount: -800 },
      { title: "Referral bonus · Priya joined", date: "10 Feb 2026", amount: 500 },
      { title: "Welcome bonus", date: "05 Jan 2026", amount: 3000 },
    ],
    tcsCertificates: [
      { id: "tcs-r1", destination: "Maldives", dates: "05 – 11 Jul 2026", tcsAmount: 11400, fy: "2026-27", status: "pending", availableFrom: "May 2027" },
      { id: "tcs-r2", destination: "Bali", dates: "20 – 27 Nov 2025", tcsAmount: 6980, fy: "2025-26", status: "available", certNo: "27D/2526/RK0771", issuedOn: "12 May 2026" },
      { id: "tcs-r3", destination: "Thailand", dates: "08 – 14 Mar 2025", tcsAmount: 3820, fy: "2024-25", status: "available", certNo: "27D/2425/RK0338", issuedOn: "10 May 2025" },
    ],
    travellers: [
      { name: "Rohan Kapoor", relation: "Primary traveller", isSelf: true, docs: [
        passportDoc("passport_rohan.jpg", { no: "P1190234", dob: "21 Nov 1989", issue: "23 Nov 2022", expiry: "22 Nov 2032", place: "Bengaluru" }),
        panDoc("pan_rohan.jpg", { pan: "AKXPK1122M", name: "ROHAN KAPOOR", dob: "21 Nov 1989", father: "Suresh Kapoor" }),
      ] },
      { name: "Nisha Kapoor", relation: "Spouse", docs: [
        passportDoc("passport_nisha.jpg", { no: "P5567120", dob: "30 Sep 1991", issue: "10 Jun 2019", expiry: "09 Jun 2029", place: "Bengaluru" }),
        panDoc("pan_nisha.jpg", { pan: "BKXPK3344N", name: "NISHA KAPOOR", dob: "30 Sep 1991", father: "Anil Verma" }),
      ] },
      { name: "Aarav Kapoor", relation: "Child", docs: [
        passportDoc("passport_aarav.jpg", { no: "P8821067", dob: "12 Dec 2015", issue: "16 Feb 2023", expiry: "15 Feb 2033", place: "Bengaluru" }),
      ] },
    ],
  },
};

const SUPPORT = { phone: "+91 92402 17201", email: "contact@30sundays.club" };

const TIER_STYLE = {
  Lead: { bg: C.bg, color: C.sub, border: C.div },
  Customer: { bg: C.p100, color: C.p600, border: C.p300 },
  Globetrotter: { bg: "#FFF1D6", color: "#B8860B", border: "#F0C97A" },
};

const SOCIALS = [
  { icon: Instagram, label: "Instagram", url: "https://instagram.com/30sundays" },
  { icon: Youtube, label: "YouTube", url: "https://youtube.com/@30sundays" },
  { icon: Linkedin, label: "LinkedIn", url: "https://linkedin.com/company/30sundays" },
];

function formatPhone(data) {
  if (!data) return "";
  const p = data.phone;
  if (p.length === 10) return `${data.countryCode} ${p.slice(0, 5)} ${p.slice(5)}`;
  return `${data.countryCode} ${p}`;
}

export default function Account({ userState, leadData, setUserState, setLeadData }) {
  const navigate = useNavigate();
  const isLoggedIn = userState !== "new";
  const profile = leadData || DEMO_PROFILES[userState] || null;
  const { wished } = useDeals();
  const { counts } = useWishlist();
  const wishlistTotal = Object.values(wished || {}).filter(Boolean).length + (counts?.poiTotal || 0);

  const [feedback, setFeedback] = useState(null); // "feature" | "problem" | null
  const [showDetails, setShowDetails] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showTravellers, setShowTravellers] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [showRefer, setShowRefer] = useState(false);
  const [showTcs, setShowTcs] = useState(false);

  // TCS certificate is only offered to logged-in users with eligible trips.
  const tcsCerts = (isLoggedIn && profile?.tcsCertificates) || [];
  const tcsReady = tcsCerts.filter((c) => c.status === "available").length;

  const handleLogout = () => {
    setUserState("new");
    setLeadData(null);
    navigate("/");
  };

  // Single settings list (matches the app): TCS certificate sits above Logout.
  const mainList = [
    { icon: Wallet, label: "Wallet", onClick: () => setShowWallet(true) },
    { icon: Gift, label: "Refer & Earn", onClick: () => setShowRefer(true) },
    { icon: HelpCircle, label: "Contact Support", onClick: () => setShowSupport(true) },
    { icon: FileText, label: "Terms & Conditions" },
    ...(tcsCerts.length ? [{ icon: ReceiptIndianRupee, label: "TCS certificate", badge: tcsReady || undefined, onClick: () => setShowTcs(true) }] : []),
    ...(isLoggedIn ? [{ icon: LogOut, label: "Logout", onClick: handleLogout }] : []),
  ];

  return (
    <div style={{ minHeight: "100%", background: `linear-gradient(180deg, ${C.p100}55 0%, ${C.bg} 12%)` }}>
      {/* Header */}
      <div style={{ padding: "12px 16px 16px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: C.head }}>Account</h2>
      </div>

      {/* Profile card or Login CTA */}
      <div style={{ padding: "0 16px 16px" }}>
        {isLoggedIn && profile ? (
          <div
            role="button"
            onClick={() => setShowDetails(true)}
            style={{
              borderRadius: 16, background: C.white, cursor: "pointer",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.div}`,
              overflow: "hidden",
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 16px" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%", background: C.p100,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                border: `2px solid ${C.p300}`,
              }}>
                <User size={24} color={C.p600} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 17, fontWeight: 600, color: C.head, margin: 0 }}>{profile.name}</p>
                <p style={{ fontSize: 13, color: C.sub, margin: "3px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {profile.email || formatPhone(profile)}
                </p>
              </div>
              <ChevronRight size={18} color={C.inact} />
            </div>
          </div>
        ) : (
          <div style={{
            padding: "24px 20px", borderRadius: 16, background: C.white,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            border: `1px solid ${C.div}`, textAlign: "center",
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: C.p100,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px", border: `2px solid ${C.p300}`,
            }}>
              <User size={26} color={C.p600} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 4px" }}>
              Welcome to 30 Sundays
            </h3>
            <p style={{ fontSize: 13, color: C.sub, margin: "0 0 16px", lineHeight: "18px" }}>
              Log in to access your trips, saved itineraries & more
            </p>
            <button
              onClick={() => navigate("/plan?return=account")}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                background: C.p600, color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: "0 4px 16px rgba(227,27,83,0.3)",
              }}
            >
              Log in / Sign up
            </button>
          </div>
        )}
      </div>

      {/* Single settings list - TCS certificate sits just above Logout */}
      <SettingsGroup items={mainList} />

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "24px 0 100px" }}>
        <p style={{ fontSize: 11, color: C.inact, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, margin: "0 0 6px" }}>
          Made with <Heart size={10} color={C.p600} fill={C.p600} /> for couples who love to travel
        </p>
        <p style={{ fontSize: 10.5, color: C.inact, margin: 0 }}>Version 1.0.0 (build 142)</p>
      </div>

      {feedback && (
        <FeedbackSheet
          initialTab={feedback}
          email={profile?.email || ""}
          onClose={() => setFeedback(null)}
        />
      )}

      {showDetails && profile && (
        <PersonalDetailsScreen
          profile={profile}
          onClose={() => setShowDetails(false)}
          onDelete={handleLogout}
        />
      )}

      {showWallet && profile && (
        <WalletScreen profile={profile} onClose={() => setShowWallet(false)} />
      )}

      {showTravellers && profile && (
        <TravellersScreen profile={profile} onClose={() => setShowTravellers(false)} />
      )}

      {showSupport && (
        <ContactSupportScreen onClose={() => setShowSupport(false)} />
      )}

      {showRate && <RateSheet onClose={() => setShowRate(false)} />}

      {showRefer && profile && (
        <ReferEarnScreen profile={profile} onClose={() => setShowRefer(false)} />
      )}

      {showTcs && (
        <TcsCertificatesScreen certificates={tcsCerts} onClose={() => setShowTcs(false)} />
      )}
    </div>
  );
}

// ── TCS deduction certificate (Form 27D) ──
// Shown only for eligible logged-in users. Each trip's certificate is either
// downloadable (available) or shows when it will be available (pending).
function TcsCertificatesScreen({ certificates, onClose }) {
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;

  const content = (
    <ScreenFrame title="TCS certificate" onClose={onClose}>
      {/* What it is */}
      <div style={{ borderRadius: 14, background: C.p100 + "88", border: `1px solid ${C.p300}`, padding: "14px 14px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <ReceiptIndianRupee size={16} color={C.p600} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.head }}>Claim your TCS back</span>
        </div>
        <p style={{ fontSize: 12.5, color: C.sub, margin: 0, lineHeight: "18px" }}>
          The TCS collected on your trip can be claimed as a refund when you file your income tax return. Download your TCS deduction certificate (Form 27D) right here.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {certificates.map((c) => <TcsCard key={c.id} c={c} />)}
      </div>

      <p style={{ fontSize: 11.5, color: C.inact, textAlign: "center", margin: "16px 8px 0", lineHeight: "17px" }}>
        Certificates for a trip are issued after the financial year in which the TCS was collected.
      </p>
    </ScreenFrame>
  );

  return frame ? createPortal(content, frame) : content;
}

function TcsCard({ c }) {
  const available = c.status === "available";
  return (
    <div style={{ borderRadius: 16, background: C.white, border: `1px solid ${C.div}`, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
      {/* Trip identifiers */}
      <div style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <MapPin size={16} color={C.p600} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 15.5, fontWeight: 700, color: C.head, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.destination}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.sub, background: C.bg, border: `1px solid ${C.div}`, padding: "3px 9px", borderRadius: 999, flexShrink: 0 }}>FY {c.fy}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <Calendar size={14} color={C.sub} />
          <span style={{ fontSize: 13, color: C.sub }}>{c.dates}</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginTop: 8 }}>
          <span style={{ fontSize: 12.5, color: C.sub }}>TCS collected</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: C.head }}>₹{c.tcsAmount.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Status footer: download (available) or availability note (pending) */}
      {available ? (
        <button
          onClick={() => alert(`TCS certificate (Form 27D)\n\n${c.destination} · FY ${c.fy}\nCertificate no. ${c.certNo}\nTCS ₹${c.tcsAmount.toLocaleString("en-IN")}\n\nDownloading PDF…`)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", minHeight: 46, background: "#F6FEF9", border: "none", borderTop: "1px solid #ABEFC6", color: "#067647", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Download size={16} color="#067647" /> Download certificate
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#FEF6E9", borderTop: "1px solid #F5D98B" }}>
          <Clock size={16} color="#A66B00" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: "#A66B00", lineHeight: "17px" }}>
            Will be available in <b>{c.availableFrom}</b>.
          </span>
        </div>
      )}
    </div>
  );
}

function SettingsGroup({ title, items, footer }) {
  return (
    <div style={{ padding: "8px 16px 0" }}>
      {title && <h3 style={{ fontSize: 13, fontWeight: 700, color: C.sub, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>{title}</h3>}
      <div style={{
        borderRadius: 16, background: C.white, overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.div}`,
      }}>
        {items.map((item, i) => (
          <Row key={item.label} item={item} divider={i < items.length - 1 || !!footer} />
        ))}
        {footer && <Row item={footer} divider={false} danger />}
      </div>
    </div>
  );
}

function Row({ item, divider, danger }) {
  const Icon = item.icon;
  return (
    <button
      onClick={item.onClick}
      style={{
        display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "15px 16px",
        background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
        borderBottom: divider ? `1px solid ${C.div}` : "none",
      }}
    >
      <div style={{
        position: "relative",
        width: 38, height: 38, borderRadius: 11, background: C.p100,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Icon size={18} color={C.p600} />
        {item.soon && (
          <span style={{
            position: "absolute", top: -7, left: -7,
            fontSize: 8, fontWeight: 800, letterSpacing: "0.3px", textTransform: "uppercase",
            color: "#B8860B", background: "#FFF1D6", border: "1px solid #F0C97A",
            padding: "1px 5px", borderRadius: 999, lineHeight: 1.4, whiteSpace: "nowrap",
          }}>Soon</span>
        )}
      </div>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: C.head, textAlign: "left" }}>{item.label}</span>
      {item.badge != null && item.badge > 0 && (
        <span style={{ fontSize: 12, fontWeight: 600, color: C.sub }}>{item.badge}</span>
      )}
      {!danger && <ChevronRight size={16} color={C.inact} />}
    </button>
  );
}

function FeedbackSheet({ initialTab, email, onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [text, setText] = useState("");
  const [emailVal, setEmailVal] = useState(email);
  const [sent, setSent] = useState(false);

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  const TABS = [
    { key: "feature", label: "Suggest a feature", icon: Lightbulb },
    { key: "problem", label: "Report a problem", icon: Bug },
  ];
  const isFeature = tab === "feature";

  const content = (
    <div style={{ position: "absolute", inset: 0, zIndex: 400 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: C.white, borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
        animation: "fadeUp 0.22s ease-out", padding: "8px 18px 22px",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 14px" }} />

        {sent ? (
          <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#F6FEF9",
              border: "1px solid #ABEFC6", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 14px",
            }}>
              <Check size={28} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Thank you!</h3>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 20px", lineHeight: "19px" }}>
              We've logged your {isFeature ? "idea" : "report"}. Our team reviews every note.
            </p>
            <button onClick={onClose} style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
              background: C.p600, color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>Send feedback</h3>
              <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <XIcon size={20} color={C.sub} />
              </button>
            </div>

            {/* Segmented control */}
            <div style={{ display: "flex", gap: 6, background: C.bg, borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {TABS.map(t => {
                const Icon = t.icon;
                const on = tab === t.key;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", fontFamily: "inherit",
                    background: on ? C.white : "transparent",
                    boxShadow: on ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                    color: on ? C.head : C.sub, fontSize: 13, fontWeight: 600,
                  }}>
                    <Icon size={15} color={on ? C.p600 : C.sub} /> {t.label}
                  </button>
                );
              })}
            </div>

            <textarea
              value={text} onChange={e => setText(e.target.value)} rows={4}
              placeholder={isFeature ? "What would make 30 Sundays better for you?" : "What went wrong? Steps to reproduce help us most."}
              style={{
                width: "100%", boxSizing: "border-box", padding: "12px 14px",
                borderRadius: 12, border: `1px solid ${C.div}`, fontSize: 14, fontFamily: "inherit",
                color: C.head, resize: "none", outline: "none", marginBottom: 12,
              }}
            />
            <input
              value={emailVal} onChange={e => setEmailVal(e.target.value)} type="email"
              placeholder="Email (optional, for follow-up)"
              style={{
                width: "100%", boxSizing: "border-box", padding: "12px 14px",
                borderRadius: 12, border: `1px solid ${C.div}`, fontSize: 14, fontFamily: "inherit",
                color: C.head, outline: "none", marginBottom: 16,
              }}
            />
            <button
              disabled={!text.trim()} onClick={() => setSent(true)}
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: text.trim() ? C.p600 : C.div,
                color: text.trim() ? "#fff" : C.inact,
                fontSize: 15, fontWeight: 600, fontFamily: "inherit",
                cursor: text.trim() ? "pointer" : "default",
              }}
            >
              <Send size={16} /> Send {isFeature ? "idea" : "report"}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return frame ? createPortal(content, frame) : content;
}

function RateSheet({ onClose }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;

  const loved = rating === 5;

  const content = (
    <div style={{ position: "absolute", inset: 0, zIndex: 400 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0,
        background: C.white, borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.18)",
        animation: "fadeUp 0.22s ease-out", padding: "8px 18px 24px",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.div, margin: "0 auto 16px" }} />

        {done ? (
          <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#F6FEF9",
              border: "1px solid #ABEFC6", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 14px",
            }}>
              <Check size={28} color="#16A34A" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Thank you!</h3>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 20px", lineHeight: "19px" }}>
              Your feedback helps us make 30 Sundays better.
            </p>
            <button onClick={onClose} style={primaryBtn}>Done</button>
          </div>
        ) : !rating || !loved ? (
          <>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: "0 0 6px", textAlign: "center" }}>
              {rating ? "Thanks for the honest rating" : "Enjoying 30 Sundays?"}
            </h3>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 18px", textAlign: "center", lineHeight: "19px" }}>
              {rating ? "What could we do better? Your note goes straight to our team." : "Tap a star to rate your experience."}
            </p>
            <Stars rating={rating} setRating={setRating} />
            {rating > 0 && (
              <>
                <textarea
                  value={text} onChange={e => setText(e.target.value)} rows={3}
                  placeholder="Tell us what would make it a 5-star experience"
                  style={{
                    width: "100%", boxSizing: "border-box", padding: "12px 14px", marginTop: 18,
                    borderRadius: 12, border: `1px solid ${C.div}`, fontSize: 14, fontFamily: "inherit",
                    color: C.head, resize: "none", outline: "none",
                  }}
                />
                <button onClick={() => setDone(true)} style={{ ...primaryBtn, marginTop: 12 }}>
                  Send feedback
                </button>
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "4px 0" }}>
            <div style={{ fontSize: 42, marginBottom: 8 }}>🎉</div>
            <h3 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>You made our day!</h3>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 16px", lineHeight: "19px" }}>
              Would you mind sharing it on the store? It helps other travellers find us.
            </p>
            <Stars rating={rating} setRating={setRating} />
            <div style={{ marginTop: 20 }}>
              <a href="https://apps.apple.com" target="_blank" rel="noreferrer" style={{ ...primaryBtn, display: "block", textDecoration: "none", textAlign: "center" }}>
                Rate us on the App Store
              </a>
              <a href="https://play.google.com" target="_blank" rel="noreferrer" style={{
                display: "block", textAlign: "center", textDecoration: "none", marginTop: 10,
                padding: "13px 0", borderRadius: 12, border: `1px solid ${C.div}`,
                color: C.head, fontSize: 15, fontWeight: 600,
              }}>
                Rate us on Google Play
              </a>
            </div>
            <button onClick={onClose} style={{ marginTop: 12, background: "none", border: "none", color: C.sub, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return frame ? createPortal(content, frame) : content;
}

const primaryBtn = {
  width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
  background: C.p600, color: "#fff", fontSize: 15, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit",
};

function Stars({ rating, setRating }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
      {[1, 2, 3, 4, 5].map(n => {
        const on = n <= rating;
        return (
          <button key={n} onClick={() => setRating(n)} aria-label={`${n} star`} style={{
            background: "none", border: "none", cursor: "pointer", padding: 4, lineHeight: 0,
          }}>
            <Star size={36} color="#F5A623" fill={on ? "#F5A623" : "none"} strokeWidth={on ? 0 : 1.8} />
          </button>
        );
      })}
    </div>
  );
}

function PersonalDetailsScreen({ profile, onClose, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  const [form, setForm] = useState({
    name: profile.name || "",
    phone: formatPhone(profile),
    email: profile.email || "",
    dob: profile.dob || "",
    city: profile.city || "",
  });
  const [saved, setSaved] = useState(false);
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const setField = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setSaved(false); };

  const fields = [
    { icon: User, key: "name", label: "Full name", type: "text", placeholder: "Your full name" },
    { icon: Phone, key: "phone", label: "Phone number", type: "tel", placeholder: "+91 00000 00000" },
    { icon: Mail, key: "email", label: "Email", type: "email", placeholder: "you@email.com" },
    { icon: Calendar, key: "dob", label: "Date of birth", type: "text", placeholder: "DD MMM YYYY" },
    { icon: MapPin, key: "city", label: "City of residence", type: "text", placeholder: "City, Country" },
  ];

  const content = (
    <div style={{
      position: isMobile ? "fixed" : "absolute", inset: 0, zIndex: 130,
      background: C.bg, display: "flex", flexDirection: "column",
      ...(isMobile ? {} : { borderRadius: 44, overflow: "hidden" }),
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "16px",
        background: C.white, borderBottom: `1px solid ${C.div}`,
      }}>
        <button onClick={onClose} aria-label="Back" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}>
          <ArrowLeft size={22} color={C.head} />
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: 0 }}>Personal details</h2>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "8px 0 20px" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: C.p100,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${C.p300}`,
          }}>
            <User size={34} color={C.p600} />
          </div>
        </div>

        {/* Editable fields */}
        <div style={{
          borderRadius: 16, background: C.white, overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.div}`,
        }}>
          {fields.map((f, i) => {
            const Icon = f.icon;
            return (
              <label key={f.key} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", cursor: "text",
                borderBottom: i < fields.length - 1 ? `1px solid ${C.div}` : "none",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: C.p100,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <Icon size={17} color={C.p600} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 11.5, color: C.sub, margin: "0 0 1px" }}>{f.label}</p>
                  <input
                    type={f.type} value={form[f.key]} onChange={setField(f.key)} placeholder={f.placeholder}
                    style={{
                      width: "100%", border: "none", outline: "none", padding: 0, background: "transparent",
                      fontSize: 15, fontWeight: 500, color: C.head, fontFamily: "inherit",
                    }}
                  />
                </div>
              </label>
            );
          })}
        </div>

        {/* Save changes */}
        <button
          onClick={() => setSaved(true)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", marginTop: 16, padding: "13px 0", borderRadius: 12, border: "none",
            background: saved ? "#F6FEF9" : C.p600, color: saved ? "#16A34A" : "#fff",
            boxShadow: saved ? "none" : "0 4px 16px rgba(227,27,83,0.25)",
            fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            ...(saved ? { border: "1px solid #ABEFC6" } : {}),
          }}
        >
          {saved ? <><Check size={17} /> Saved</> : "Save changes"}
        </button>

        {/* Delete account */}
        <button
          onClick={() => setConfirm(true)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            width: "100%", marginTop: 20, padding: "14px 0", borderRadius: 12,
            background: C.white, border: "1px solid #FDA29B", cursor: "pointer", fontFamily: "inherit",
            color: "#D92D20", fontSize: 15, fontWeight: 600,
          }}
        >
          <Trash2 size={17} /> Delete account
        </button>
        <p style={{ fontSize: 11.5, color: C.inact, textAlign: "center", margin: "10px 4px 0", lineHeight: "16px" }}>
          Deleting your account permanently removes your trips, saved itineraries and data.
        </p>
      </div>

      {/* Delete confirm */}
      {confirm && (
        <div style={{ position: "absolute", inset: 0, zIndex: 140 }}>
          <div onClick={() => setConfirm(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
          <div style={{
            position: "absolute", left: 20, right: 20, top: "50%", transform: "translateY(-50%)",
            background: C.white, borderRadius: 18, padding: "22px 20px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.25)", textAlign: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%", background: "#FEF3F2",
              border: "1px solid #FDA29B", display: "flex", alignItems: "center",
              justifyContent: "center", margin: "0 auto 14px",
            }}>
              <AlertTriangle size={26} color="#D92D20" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 6px" }}>Delete account?</h3>
            <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 20px", lineHeight: "19px" }}>
              This is permanent and can't be undone. All your trips and saved data will be erased.
            </p>
            <button onClick={onDelete} style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
              background: "#D92D20", color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", marginBottom: 8,
            }}>Delete my account</button>
            <button onClick={() => setConfirm(false)} style={{
              width: "100%", padding: "13px 0", borderRadius: 12, border: `1px solid ${C.div}`,
              background: C.white, color: C.head, fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );

  return frame ? createPortal(content, frame) : content;
}

const EARN_WAYS = [
  { icon: Gift, title: "Refer & earn", desc: "Invite friends to join and book their first trip, get wallet credit for every successful referral." },
  { icon: Megaphone, title: "Campaigns", desc: "Participate in special promotions and challenges to unlock extra wallet rewards." },
  { icon: Palmtree, title: "Repeat bookings", desc: "Earn wallet credit every time you book a trip with us." },
];

function ScreenFrame({ title, onClose, children }) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  return (
    <div style={{
      position: isMobile ? "fixed" : "absolute", inset: 0, zIndex: 130,
      backgroundColor: C.bg,
      backgroundImage: `linear-gradient(180deg, ${C.p100} 0%, ${C.bg} 16%)`,
      display: "flex", flexDirection: "column",
      ...(isMobile ? {} : { borderRadius: 44, overflow: "hidden" }),
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px" }}>
        <button onClick={onClose} aria-label="Back" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 0 }}>
          <ArrowLeft size={22} color={C.head} />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.head, margin: 0 }}>{title}</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 16px 24px" }}>{children}</div>
    </div>
  );
}

function WalletScreen({ profile, onClose }) {
  const [showTx, setShowTx] = useState(false);
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  const balance = profile.coins ?? 0;
  const transactions = profile.transactions || [];

  const content = (
    <ScreenFrame title="Wallet" onClose={onClose}>
      {/* Balance card */}
      <div style={{
        position: "relative", borderRadius: 18, background: C.white, overflow: "hidden",
        border: `1px dashed ${C.p300}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "18px 18px 4px",
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.sub, margin: 0 }}>Current Balance</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 14px" }}>
          <span style={{ fontSize: 26 }}>🪙</span>
          <span style={{ fontSize: 30, fontWeight: 800, color: C.head }}>{balance.toLocaleString("en-IN")}</span>
        </div>
        {/* Wallet illustration */}
        <div style={{
          position: "absolute", right: -10, top: 28, width: 86, height: 58, borderRadius: "12px 0 0 12px",
          background: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)",
          boxShadow: "0 6px 16px rgba(245,158,11,0.35)",
        }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 22, height: 22, borderRadius: "50%", background: "#F59E0B", border: "3px solid #FCD34D" }} />
        </div>
        <button
          onClick={() => setShowTx(true)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
            padding: "13px 0", background: "none", border: "none", borderTop: `1px solid ${C.div}`,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700, color: C.p600 }}>View Transaction History</span>
          <ChevronRight size={18} color={C.p600} />
        </button>
      </div>

      {/* Ways to earn */}
      <h3 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: "24px 0 14px" }}>Ways to Earn Coins</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {EARN_WAYS.map(w => {
          const Icon = w.icon;
          return (
            <div key={w.title} style={{
              display: "flex", gap: 14, padding: "16px", borderRadius: 16, background: C.white,
              border: `1px solid ${C.div}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: C.p100, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={21} color={C.p600} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.head, margin: "0 0 4px" }}>{w.title}</p>
                <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "19px" }}>{w.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showTx && <TransactionHistoryScreen transactions={transactions} onClose={() => setShowTx(false)} />}
    </ScreenFrame>
  );

  return frame ? createPortal(content, frame) : content;
}

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase();
}

const DOC_ICON = { Passport: BookUser, "PAN card": CreditCard };

function TravellersScreen({ profile, onClose }) {
  const [list, setList] = useState(() => (profile.travellers || []).map((t, i) => ({ ...t, id: i })));
  const [selfId, setSelfId] = useState(() => {
    const s = list.find(t => t.isSelf);
    return s ? s.id : (list[0] ? list[0].id : null);
  });
  const [expandedId, setExpandedId] = useState(null);
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;

  const removeTraveller = (id) => {
    setList(prev => {
      const next = prev.filter(t => t.id !== id);
      if (id === selfId) setSelfId(next[0] ? next[0].id : null);
      return next;
    });
    setExpandedId(cur => (cur === id ? null : cur));
  };

  const content = (
    <ScreenFrame title="Travellers & documents" onClose={onClose}>
      <p style={{ fontSize: 13, color: C.sub, margin: "0 0 14px", lineHeight: "18px" }}>
        Everyone booked on your trips. Tap a traveller to view their documents.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((t) => {
          const isMe = t.id === selfId;
          const open = expandedId === t.id;
          const docCount = (t.docs || []).length;
          return (
            <div key={t.id} style={{
              position: "relative", borderRadius: 16, background: C.white, overflow: "hidden",
              border: `1px solid ${isMe ? C.p300 : C.div}`,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}>
              {/* Identity row (tap to expand) */}
              <button
                onClick={() => setExpandedId(open ? null : t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px",
                  background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: C.p100, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${C.p300}`, fontSize: 15, fontWeight: 700, color: C.p600,
                }}>
                  {initials(t.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <p style={{ fontSize: 15.5, fontWeight: 700, color: C.head, margin: 0 }}>{t.name}</p>
                    {isMe && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase",
                        color: C.p600, background: C.p100, border: `1px solid ${C.p300}`,
                        padding: "2px 7px", borderRadius: 999,
                      }}>You</span>
                    )}
                  </div>
                  <p style={{ fontSize: 12.5, color: C.sub, margin: "2px 0 0" }}>
                    {t.relation} · {docCount ? `${docCount} document${docCount > 1 ? "s" : ""}` : "No documents"}
                  </p>
                </div>
                <ChevronDown size={18} color={C.inact} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s" }} />
              </button>

              {/* Expanded: documents + actions */}
              {open && (
                <div style={{ borderTop: `1px solid ${C.div}`, background: "#FCFCFD", padding: "14px 16px" }}>
                  {/* Inline actions: This is me + delete */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <button
                      onClick={() => setSelfId(t.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 9, flex: 1,
                        background: "none", border: "none", cursor: isMe ? "default" : "pointer",
                        fontFamily: "inherit", padding: 0, textAlign: "left",
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: isMe ? C.p600 : C.white,
                        border: `1.5px solid ${isMe ? C.p600 : C.inact}`,
                      }}>
                        {isMe && <Check size={14} color="#fff" strokeWidth={3} />}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: isMe ? C.head : C.sub }}>This is me</span>
                    </button>
                    <button
                      onClick={() => removeTraveller(t.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 9,
                        background: C.white, border: "1px solid #FDA29B", color: "#D92D20",
                        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>

                  {docCount === 0 ? (
                    <div style={{ textAlign: "center", padding: "8px 0 12px" }}>
                      <p style={{ fontSize: 13.5, color: C.sub, margin: "0 0 12px" }}>No documents uploaded yet.</p>
                      <button style={{
                        display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10,
                        background: C.white, border: `1px solid ${C.p300}`, color: C.p600, fontSize: 13.5, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                        <Plus size={15} /> Upload passport / PAN
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {t.docs.map((d, di) => <DocCard key={di} doc={d} />)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add traveller */}
      <button style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        width: "100%", marginTop: 16, padding: "13px 0", borderRadius: 12,
        background: C.white, border: `1px dashed ${C.p300}`, cursor: "pointer", fontFamily: "inherit",
        color: C.p600, fontSize: 14.5, fontWeight: 600,
      }}>
        <UserPlus size={17} /> Add a traveller
      </button>
    </ScreenFrame>
  );

  return frame ? createPortal(content, frame) : content;
}

function DocCard({ doc }) {
  const Icon = DOC_ICON[doc.type] || FileText;
  return (
    <div style={{ borderRadius: 12, background: C.white, border: `1px solid ${C.div}`, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: `1px solid ${C.div}` }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, background: C.p100,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon size={15} color={C.p600} />
        </div>
        <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: C.head }}>{doc.type}</span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase",
          color: "#067647", background: "#F6FEF9", border: "1px solid #ABEFC6", padding: "2px 7px", borderRadius: 999,
        }}>Verified</span>
      </div>

      {/* Extracted fields */}
      <div style={{ padding: "4px 12px" }}>
        {doc.fields.map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "7px 0", borderBottom: `1px solid ${C.bg}` }}>
            <span style={{ fontSize: 12.5, color: C.sub }}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.head, textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>

      {/* File chip */}
      <button style={{
        display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
        background: "#FCFCFD", border: "none", borderTop: `1px solid ${C.div}`, cursor: "pointer", fontFamily: "inherit",
      }}>
        <div style={{ width: 34, height: 34, borderRadius: 7, background: C.div, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileText size={16} color={C.sub} />
        </div>
        <span style={{ flex: 1, fontSize: 13, color: C.head, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.file}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.p600 }}>View</span>
      </button>
    </div>
  );
}

function ContactSupportScreen({ onClose }) {
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  const rows = [
    { icon: Phone, label: SUPPORT.phone, href: `tel:${SUPPORT.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: SUPPORT.email, href: `mailto:${SUPPORT.email}` },
  ];

  const content = (
    <ScreenFrame title="Contact Support" onClose={onClose}>
      <div style={{
        borderRadius: 16, background: C.white, overflow: "hidden",
        border: `1px solid ${C.div}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}>
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <a key={r.label} href={r.href} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px",
              textDecoration: "none",
              borderBottom: i < rows.length - 1 ? `1px solid ${C.div}` : "none",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 11, background: C.p100,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={18} color={C.p600} />
              </div>
              <span style={{ flex: 1, fontSize: 15.5, fontWeight: 600, color: C.head }}>{r.label}</span>
              <ChevronRight size={16} color={C.inact} />
            </a>
          );
        })}
      </div>
      <p style={{ fontSize: 12.5, color: C.sub, textAlign: "center", margin: "16px 8px 0", lineHeight: "18px" }}>
        Our team is available 9 AM – 9 PM IST, all days.
      </p>
    </ScreenFrame>
  );

  return frame ? createPortal(content, frame) : content;
}

function TransactionHistoryScreen({ transactions, onClose }) {
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;

  const content = (
    <ScreenFrame title="Transaction History" onClose={onClose}>
      {transactions.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "90px 24px 0", textAlign: "center" }}>
          <span style={{ fontSize: 46, filter: "grayscale(1)", opacity: 0.7 }}>🪙</span>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: "14px 0 6px" }}>No transactions found</h3>
          <p style={{ fontSize: 14, color: C.sub, margin: 0 }}>Your transaction history will show up here</p>
        </div>
      ) : (
        <div style={{
          borderRadius: 16, background: C.white, overflow: "hidden",
          border: `1px solid ${C.div}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}>
          {transactions.map((t, i) => {
            const credit = t.amount >= 0;
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                borderBottom: i < transactions.length - 1 ? `1px solid ${C.div}` : "none",
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14.5, fontWeight: 600, color: C.head, margin: 0 }}>{t.title}</p>
                  <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0" }}>{t.date}</p>
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: credit ? "#16A34A" : "#D92D20" }}>
                  {credit ? "+" : "−"}🪙{Math.abs(t.amount).toLocaleString("en-IN")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </ScreenFrame>
  );

  return frame ? createPortal(content, frame) : content;
}

const REFER_STEPS = [
  { t: "Share your code", d: "Share your code or link on WhatsApp." },
  { t: "They book with us", d: "Your friend books and gets ₹2,500 off." },
  { t: "You earn coins", d: "Once they pay their first instalment, you get 2,500 stamps in your wallet for future trips." },
];

const REFER_TERMS = [
  ["Eligibility", "The referral program is open to all registered 30 Sundays app users. To participate, you must have a valid customer account with us."],
  ["Referral Rewards", "The Referrer (existing customer) earns 2,500 stamps once the Referred Friend completes their first payment towards a booking with a minimum transaction value of ₹50,000. The Referred Friend also receives 2,500 instant credits on their first eligible booking."],
  ["Usage of Rewards", "Wallet credits are valid for 1 year from the date of issue, can be redeemed only against bookings on the 30 Sundays platform, are non-transferable, and cannot be exchanged for cash. A minimum booking value of ₹1 lakh (excluding taxes) applies."],
  ["Referral Process", "Referrals must be made through the official referral link or code generated from the customer's account. Only new users who have never booked with 30 Sundays will be considered valid referrals."],
  ["Fair Usage Policy", "Self-referrals (referring yourself or your spouse using another email or number) are not allowed; referral is based on unique passports. Duplicate, fake, or fraudulent accounts lead to disqualification and forfeiture of rewards. 30 Sundays reserves the right to verify referred bookings."],
];

function ReferEarnScreen({ profile, onClose }) {
  const code = profile.referralCode || "MGS-5Z7J";
  const earnings = profile.referEarnings ?? 0;
  const referrals = profile.referrals || [];
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState(null); // "history" | "terms"
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;

  const copyCode = () => {
    try { navigator.clipboard?.writeText(code); } catch (e) { /* noop */ }
    setCopied(true);
  };
  const share = () => {
    const msg = `Join me on 30 Sundays and get ₹2,500 off your first trip. Use my code ${code}.`;
    try { navigator.share?.({ title: "30 Sundays", text: msg }); } catch (e) { /* noop */ }
  };

  const content = (
    <ScreenFrame title="Refer & Earn" onClose={onClose}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.head, margin: "0 0 14px", lineHeight: "24px" }}>
        Refer & earn 🪙 2,500 on their first booking
      </p>

      {/* Code + copy */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "14px 0", borderRadius: 12, background: C.white, border: `1px solid ${C.div}`,
          fontSize: 19, fontWeight: 800, letterSpacing: "1px", color: C.head,
        }}>{code}</div>
        <button onClick={copyCode} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "0 16px", borderRadius: 12,
          background: C.white, border: `1px solid ${C.div}`, cursor: "pointer", fontFamily: "inherit",
          fontSize: 14, fontWeight: 600, color: copied ? "#16A34A" : C.head,
        }}>
          {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Share link */}
      <button onClick={share} style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9, width: "100%",
        padding: "15px 0", borderRadius: 14, border: "none", background: C.p600, color: "#fff",
        fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        boxShadow: "0 6px 18px rgba(227,27,83,0.3)",
      }}>
        <Share2 size={18} /> Share link
      </button>

      {/* Earnings card */}
      <div style={{
        position: "relative", marginTop: 16, borderRadius: 16, background: C.white, overflow: "hidden",
        border: `1px solid ${C.div}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "16px 16px 4px",
      }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>Total Earning by Referrals</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 14px" }}>
          <span style={{ fontSize: 22 }}>🪙</span>
          <span style={{ fontSize: 26, fontWeight: 800, color: C.p600 }}>{earnings.toLocaleString("en-IN")}</span>
        </div>
        <span style={{ position: "absolute", right: 14, top: 14, fontSize: 38, opacity: 0.9 }}>🪙</span>
        <button onClick={() => setView("history")} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%",
          padding: "13px 0", background: "none", border: "none", borderTop: `1px solid ${C.div}`,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.p600 }}>View History</span>
          <ChevronRight size={18} color={C.p600} />
        </button>
      </div>

      {/* How it works */}
      <div style={{
        marginTop: 16, borderRadius: 16, background: C.white,
        border: `1px solid ${C.div}`, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", padding: "18px 16px",
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 16px" }}>How It Works</h3>
        {REFER_STEPS.map((s, i) => {
          const last = i === REFER_STEPS.length - 1;
          return (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 28 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: C.white, border: `1.5px solid ${C.p300}`, color: C.p600, fontSize: 13, fontWeight: 700,
                }}>{i + 1}</div>
                {!last && <div style={{ flex: 1, width: 1, borderLeft: `1.5px dashed ${C.p300}`, margin: "4px 0" }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: last ? 0 : 16 }}>
                <p style={{ fontSize: 15.5, fontWeight: 700, color: C.head, margin: "2px 0 3px" }}>{s.t}</p>
                <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "19px" }}>{s.d}</p>
              </div>
            </div>
          );
        })}
        <button onClick={() => setView("terms")} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width: "100%",
          marginTop: 8, padding: "12px 0", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
          color: C.p600, fontSize: 14.5, fontWeight: 600,
        }}>
          <AlertCircle size={16} /> Terms & Conditions
        </button>
      </div>

      {view === "history" && <ReferralHistoryScreen referrals={referrals} onClose={() => setView(null)} />}
      {view === "terms" && <ReferTermsSheet onClose={() => setView(null)} />}
    </ScreenFrame>
  );

  return frame ? createPortal(content, frame) : content;
}

function ReferralHistoryScreen({ referrals, onClose }) {
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;

  const content = (
    <ScreenFrame title="History" onClose={onClose}>
      {referrals.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "90px 24px 0", textAlign: "center" }}>
          <UserPlus size={44} color={C.inact} />
          <h3 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: "16px 0 6px" }}>No invites yet!</h3>
          <p style={{ fontSize: 14, color: C.sub, margin: 0, lineHeight: "20px" }}>
            Start sharing your referral code and see your friends here once they join.
          </p>
        </div>
      ) : (
        <div style={{
          borderRadius: 16, background: C.white, overflow: "hidden",
          border: `1px solid ${C.div}`, boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}>
          {referrals.map((rf, i) => {
            const earned = rf.status === "earned";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                borderBottom: i < referrals.length - 1 ? `1px solid ${C.div}` : "none",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", background: C.p100, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: `2px solid ${C.p300}`, fontSize: 14, fontWeight: 700, color: C.p600,
                }}>{initials(rf.name)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14.5, fontWeight: 600, color: C.head, margin: 0 }}>{rf.name}</p>
                  <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0" }}>{rf.date}</p>
                </div>
                {earned ? (
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#16A34A" }}>+🪙{rf.amount.toLocaleString("en-IN")}</span>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: "#B8860B", background: "#FFF1D6",
                    border: "1px solid #F0C97A", padding: "3px 9px", borderRadius: 999,
                  }}>Pending</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </ScreenFrame>
  );

  return frame ? createPortal(content, frame) : content;
}

function ReferTermsSheet({ onClose }) {
  const frame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;

  const content = (
    <div style={{ position: "absolute", inset: 0, zIndex: 410 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "82%",
        background: C.white, borderRadius: "20px 20px 0 0",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.2)", animation: "fadeUp 0.22s ease-out",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ padding: "16px 18px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: 19, fontWeight: 700, color: C.head, margin: 0 }}>Terms & Conditions</h3>
          <button onClick={onClose} aria-label="Close" style={{
            width: 30, height: 30, borderRadius: "50%", background: C.bg, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <XIcon size={18} color={C.sub} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "0 18px 24px" }}>
          {REFER_TERMS.map(([title, body], i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.head, flexShrink: 0 }}>{i + 1}.</span>
              <p style={{ fontSize: 13.5, color: C.sub, margin: 0, lineHeight: "20px" }}>
                <span style={{ fontWeight: 700, color: C.head }}>{title}</span>: {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return frame ? createPortal(content, frame) : content;
}
