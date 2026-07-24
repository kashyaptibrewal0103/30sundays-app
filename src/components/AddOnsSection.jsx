import { useState } from "react";
import { IdCard, Banknote, ShieldCheck, X as XIcon, Check, FileText, ExternalLink, ChevronDown, ChevronUp, ChevronRight, MoreVertical } from "lucide-react";
import { C } from "../data";

const ADD_ONS = [
  { key: "visa", label: "Visa", Icon: IdCard },
  { key: "forex", label: "Forex", Icon: Banknote },
  { key: "insurance", label: "Insurance", Icon: ShieldCheck },
];

// ─── Tile (same small size/layout as the Documents tiles) ───
function AddOnTile({ label, Icon, purchased, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "12px 6px", minHeight: 84,
        background: C.white, border: "1px solid #E0E2EB", borderRadius: 12,
        boxShadow: "0 4px 4px -2px rgba(0,0,0,0.06)",
        cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <Icon size={22} color="#FD014F" strokeWidth={1.8} />
      <span style={{ fontSize: 11, fontWeight: 400, color: "#181E4C", textAlign: "center", lineHeight: "14px" }}>{label}</span>
      {purchased && (
        <div style={{
          position: "absolute", top: -6, right: -6, width: 18, height: 18,
          borderRadius: "50%", background: "#4EAC7E", border: "2px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Check size={10} color="#fff" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ─── Sheet shell ───
function Sheet({ title, onClose, children, footer }) {
  const [closing, setClosing] = useState(false);
  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 220);
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <div
        onClick={handleClose}
        style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
          animation: closing ? "fadeOutBg 0.22s ease-out forwards" : "fadeInBg 0.2s ease-out",
        }}
      />
      <div style={{
        position: "relative", background: C.white, borderRadius: "16px 16px 0 0",
        maxHeight: "88vh", display: "flex", flexDirection: "column",
        animation: closing ? "sheetSlideDown 0.22s ease-out forwards" : "sheetSlideUp 0.25s ease-out",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "20px 20px 8px",
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: C.head, margin: 0 }}>{title}</h3>
          <button onClick={handleClose} style={{ width: 32, height: 32, borderRadius: "50%", background: C.bg, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <XIcon size={16} color={C.sub} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "0 20px 16px", flex: 1 }}>{children}</div>
        {footer && (
          <div style={{ padding: "12px 20px 24px", background: C.white, boxShadow: "0 -4px 12px rgba(0,0,0,0.04)" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Illustration block (Lucide icon on pink circle) ───
function Illustration({ Icon }) {
  return (
    <div style={{
      background: C.p100, borderRadius: 16, height: 180, display: "flex",
      alignItems: "center", justifyContent: "center", margin: "8px 0 16px",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", width: 200, height: 200, borderRadius: "50%",
        background: "rgba(255,255,255,0.45)", top: -50, right: -40,
      }} />
      <div style={{
        width: 100, height: 100, borderRadius: "50%", background: C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 16px rgba(227,27,83,0.15)", zIndex: 1,
      }}>
        <Icon size={48} color={C.p600} strokeWidth={1.6} />
      </div>
    </div>
  );
}

// ─── Footer: Included pill ───
function IncludedPill() {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      padding: "14px 16px", borderRadius: 999, background: C.sBg,
      border: `1px solid ${C.sBorder}`,
    }}>
      <Check size={16} color={C.sText} strokeWidth={3} />
      <span style={{ fontSize: 15, fontWeight: 600, color: C.sText }}>Included in your itinerary</span>
    </div>
  );
}

// ─── Footer: Get CTA ───
function GetCTA({ label }) {
  return (
    <button style={{
      width: "100%", padding: "14px 16px", borderRadius: 999, background: C.p600,
      color: "#fff", fontSize: 16, fontWeight: 600, border: "none", cursor: "pointer",
      fontFamily: "inherit",
    }}>{label}</button>
  );
}

// ─── Document row (purchased state) ───
function DocumentRow({ available, label, meta, url }) {
  if (available) {
    return (
      <a href={url || "#"} target="_blank" rel="noreferrer" style={{
        display: "flex", alignItems: "center", gap: 12, padding: 14,
        background: C.white, border: `1px solid ${C.div}`, borderRadius: 12,
        textDecoration: "none", marginTop: 4,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, background: C.p100,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <FileText size={18} color={C.p600} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>{label}</p>
          <p style={{ fontSize: 12, color: meta ? C.sub : C.p600, margin: "2px 0 0", fontWeight: meta ? 400 : 500 }}>{meta || "Tap to view"}</p>
        </div>
        <ExternalLink size={16} color={C.sub} />
      </a>
    );
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: 14,
      background: C.bg, borderRadius: 12, marginTop: 4,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: C.white,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FileText size={18} color={C.inact} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.head, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 12, color: C.sub, margin: "2px 0 0" }}>Available soon, we'll notify you.</p>
      </div>
    </div>
  );
}

// ─── Visa Sheet ───
function VisaSheet({ state, travelers = [], onClose }) {
  const purchased = state?.purchased;

  return (
    <Sheet
      title="Visa"
      onClose={onClose}
      footer={purchased ? <IncludedPill /> : <GetCTA label="Get visa" />}
    >
      <Illustration Icon={IdCard} />

      {purchased ? (
        <>
          <div style={{ background: C.bg, borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 8px" }}>
              You're ready to fly
            </h4>
            <p style={{ fontSize: 14, color: C.head, margin: "0 0 12px", lineHeight: "21px" }}>
              Your <b>Bali Tourist e-Visa</b> is booked. Single-entry, 30-day stay, issued by Indonesian Immigration. No airport queues, no foreign-currency fees.
            </p>
            <p style={{ fontSize: 13, color: C.sub, margin: 0, lineHeight: "19px" }}>
              We'll email you the visa PDF as soon as it's stamped - usually within 1 business day of departure.
            </p>
          </div>
          {(travelers.length ? travelers : [{ name: "Your visa document" }]).map((t, i) => (
            <DocumentRow
              key={i}
              available={Boolean(state?.documentUrl)}
              url={state?.documentUrl}
              label={t.name}
              meta="e-Visa document"
            />
          ))}
        </>
      ) : (
        <div style={{ background: C.bg, borderRadius: 14, padding: 16 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 10px" }}>Description</h4>
          <p style={{ fontSize: 14, color: C.head, margin: "0 0 12px", lineHeight: "21px" }}>
            We can guarantee your <b>Bali Tourist e-Visa</b> before you fly.
          </p>
          <p style={{ fontSize: 14, color: C.head, margin: "0 0 12px" }}>
            Cost: <b>INR 3,675 (inc TCS)</b>
          </p>
          <p style={{ fontSize: 14, color: C.head, margin: "0 0 10px", fontWeight: 600 }}>Why it's worth it?</p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.head, lineHeight: "22px" }}>
            <li><b>One-day processing</b>, paperwork sorted while you pack</li>
            <li><b>30-day stay</b>, perfect for your trip duration</li>
            <li>Official single-entry e-Visa issued by Indonesian Immigration</li>
            <li>No airport payment or currency hassles, everything's prepaid in INR</li>
          </ul>
        </div>
      )}
    </Sheet>
  );
}

// ─── Insurance Sheet ───
function InsuranceSheet({ state, travelers = [], onClose }) {
  const purchased = state?.purchased;

  return (
    <Sheet
      title="Insurance"
      onClose={onClose}
      footer={purchased ? <IncludedPill /> : <GetCTA label="Get insurance" />}
    >
      <Illustration Icon={ShieldCheck} />

      {purchased ? (
        <>
          <div style={{ background: C.bg, borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 8px" }}>
              You're covered, end to end
            </h4>
            <p style={{ fontSize: 14, color: C.head, margin: "0 0 14px", lineHeight: "21px" }}>
              Your <b>30 Sundays Travel One</b> policy is active. Adventure-ready coverage from the moment you leave home until you're back.
            </p>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.sub, margin: "0 0 8px", letterSpacing: 0.4 }}>
              YOUR COVERAGE
            </p>
            <ul style={{ margin: "0 0 0", paddingLeft: 18, fontSize: 14, color: C.head, lineHeight: "22px" }}>
              <li>Medical Expenses: <b>$50,000</b></li>
              <li>Trip Cancellation: <b>$800</b></li>
              <li>Baggage Loss: <b>$500</b></li>
            </ul>
          </div>
          <DocumentRow
            available={Boolean(state?.documentUrl)}
            url={state?.documentUrl}
            label="Travel insurance policy"
            meta={travelers.length ? travelers.map((t) => t.name).join(", ") : undefined}
          />
        </>
      ) : (
        <div style={{ background: C.bg, borderRadius: 14, padding: 16 }}>
          <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 10px" }}>
            Travel with confidence knowing you're covered
          </h4>
          <p style={{ fontSize: 14, color: C.head, margin: "0 0 14px", lineHeight: "21px" }}>
            Here are our comprehensive plans, offering enhanced protection and adventure-ready coverage for ultimate peace of mind. Valid for your trips to Indonesia, Thailand, Vietnam, Maldives, and Dubai.
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.sub, margin: "0 0 8px", letterSpacing: 0.4 }}>
            30 SUNDAYS TRAVEL ONE
          </p>
          <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 14, color: C.head, lineHeight: "22px" }}>
            <li>Medical Expenses: $50,000</li>
            <li>Trip Cancellation: $800</li>
            <li>Baggage Loss: $500</li>
          </ul>
          <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
            Details:{" "}
            <a href="https://t.ly/travel_one_insurance" target="_blank" rel="noreferrer" style={{ color: C.p600, fontWeight: 500 }}>
              https://t.ly/travel_one_insurance
            </a>
          </p>
        </div>
      )}
    </Sheet>
  );
}

// ─── Forex Sheet (info-only) ───
function ForexSheet({ onClose }) {
  return (
    <Sheet title="Forex" onClose={onClose}>
      <Illustration Icon={Banknote} />
      <div style={{ background: C.bg, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <h4 style={{ fontSize: 18, fontWeight: 700, color: C.head, margin: "0 0 10px" }}>Spend smarter abroad</h4>
        <p style={{ fontSize: 14, color: C.head, margin: "0 0 12px", lineHeight: "21px" }}>
          Load multiple currencies on a single card and avoid messy conversions at your destination. Your travel consultant can help you set one up before you fly.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: C.head, lineHeight: "22px" }}>
          <li>Zero markup on forex conversions</li>
          <li>Works at POS + ATMs worldwide</li>
          <li>Lock rates ahead of your trip</li>
          <li>Reload or refund unused balance anytime</li>
        </ul>
      </div>
    </Sheet>
  );
}

// ─── Status chip (Added / Optional / Not added) ───
function StatusChip({ tone, icon, text }) {
  const tones = {
    green: { color: "#2E7D52", background: "#E6F4EC", border: "#BBE3CA" },
    gray: { color: "#666C99", background: "#F1F2F6", border: "#E0E2EB" },
  };
  const t = tones[tone] || tones.gray;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: t.color, background: t.background, border: `1px solid ${t.border}`, padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>
      {icon}
      {text}
    </span>
  );
}

// ─── Demo state switcher (3-dot), mirrors the Visa section ───
function AddOnStateMenu({ mode, setMode }) {
  const [open, setOpen] = useState(false);
  const options = [{ k: "added", label: "Added" }, { k: "notadded", label: "Not added" }];
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <button onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }} aria-label="Change state"
        style={{ width: 28, height: 28, borderRadius: 8, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <MoreVertical size={18} color="#666C99" />
      </button>
      {open && (
        <>
          <div onClick={(e) => { e.stopPropagation(); setOpen(false); }} style={{ position: "fixed", inset: 0, zIndex: 30 }} />
          <div style={{ position: "absolute", top: 30, right: 0, zIndex: 40, background: C.white, border: `1px solid ${C.div}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 132 }}>
            {options.map((o) => (
              <button key={o.k} onClick={(e) => { e.stopPropagation(); setMode(o.k); setOpen(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 14px", background: mode === o.k ? C.p100 : "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: mode === o.k ? 700 : 500, color: mode === o.k ? C.p600 : C.head }}>
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Accordion line item (used in the collapsible variant) ───
// Header (icon + label + subtitle + status chip + menu + chevron) is always
// visible; details expand inline below. Reads as a plain list, no box.
function AddOnAccordionItem({ label, subtitle, Icon, statusChip, menu, open, onToggle, showDivider, children }) {
  return (
    <div style={{ borderTop: showDivider ? "1px solid #E9EAEB" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 0" }}>
        <button
          onClick={onToggle}
          aria-expanded={open}
          style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12, padding: 0, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
        >
          <span style={{ width: 44, height: 44, borderRadius: 12, background: "#FFE6ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={22} color="#FD014F" strokeWidth={1.8} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#181E4C", lineHeight: "20px" }}>{label}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: "#666C99", lineHeight: "17px", marginTop: 1 }}>{subtitle}</div>}
          </div>
        </button>
        {statusChip}
        {menu}
        <button onClick={onToggle} aria-label={open ? "Collapse" : "Expand"} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}>
          {open ? <ChevronUp size={20} color="#666C99" /> : <ChevronDown size={20} color="#666C99" />}
        </button>
      </div>
      {open && <div style={{ padding: "0 0 18px 56px" }}>{children}</div>}
    </div>
  );
}

// ─── Main Section ───
// `collapsible` renders the section as vertical cards inside a header that is
// collapsed by default (used on the booked trip itinerary). Default is the
// original 4-up tile grid, so other screens are unchanged.
export default function AddOnsSection({ addOns, travelers = [], collapsible = false }) {
  const [openKey, setOpenKey] = useState(null);
  // Accordion state (collapsible variant): purchased add-ons start expanded.
  const [openItems, setOpenItems] = useState({
    visa: !!addOns?.visa?.purchased,
    forex: false,
    insurance: !!addOns?.insurance?.purchased,
  });
  // Demo state per add-on (collapsible variant), switchable via the 3-dot menu
  // so both the added and not-added cases can be previewed.
  const [modes, setModes] = useState({
    forex: addOns?.forex?.purchased ? "added" : "notadded",
    insurance: addOns?.insurance?.purchased ? "added" : "notadded",
  });

  const sheets = (
    <>
      {openKey === "visa" && <VisaSheet state={addOns?.visa} travelers={travelers} onClose={() => setOpenKey(null)} />}
      {openKey === "insurance" && <InsuranceSheet state={addOns?.insurance} travelers={travelers} onClose={() => setOpenKey(null)} />}
      {openKey === "forex" && <ForexSheet onClose={() => setOpenKey(null)} />}
    </>
  );

  if (collapsible) {
    const SUBTITLES = {
      visa: "Tourist e-Visa for your trip",
      forex: "Multi-currency travel card",
      insurance: "Medical, cancellation and baggage cover",
    };
    const isAdded = (key) => modes[key] === "added";
    const chipFor = (key) => isAdded(key)
      ? <StatusChip tone="green" icon={<Check size={12} color="#2E7D52" strokeWidth={3} />} text="Added" />
      : <StatusChip tone="gray" text="Not added" />;

    const primaryBtn = { marginTop: 14, width: "100%", padding: "12px 16px", borderRadius: 10, background: "#FD014F", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit" };
    const secondaryBtn = { marginTop: 14, width: "100%", padding: "12px 16px", borderRadius: 10, background: C.white, color: "#FD014F", fontSize: 14, fontWeight: 600, border: "1.5px solid #FD014F", cursor: "pointer", fontFamily: "inherit" };
    const detailText = { margin: "0 0 8px", fontSize: 13, color: C.sub, lineHeight: "19px" };
    const detailList = { margin: 0, paddingLeft: 18, fontSize: 13, color: C.sub, lineHeight: "20px" };

    const renderDetail = (key) => {
      if (key === "visa") {
        if (addOns?.visa?.purchased) {
          const people = travelers.length ? travelers : [{ name: "Your visa document" }];
          return (
            <>
              <p style={detailText}>Your e-Visa is booked. We'll email the visa PDF as soon as it's stamped, usually within 1 business day of departure.</p>
              {people.map((t, i) => (
                <DocumentRow key={i} available={Boolean(addOns?.visa?.documentUrl)} url={addOns?.visa?.documentUrl} label={t.name} meta="e-Visa document" />
              ))}
            </>
          );
        }
        return (
          <>
            <p style={{ ...detailText, margin: 0 }}>We can guarantee your tourist e-Visa before you fly, sorted while you pack.</p>
            <button style={primaryBtn} onClick={() => alert("Get visa - our team will add it to your trip.")}>Get visa</button>
          </>
        );
      }
      if (key === "insurance") {
        if (isAdded("insurance")) {
          return (
            <>
              <p style={detailText}>Your travel policy is active, covering medical, cancellation and baggage.</p>
              <DocumentRow available={Boolean(addOns?.insurance?.documentUrl)} url={addOns?.insurance?.documentUrl} label="Travel insurance policy" meta={travelers.map((t) => t.name).join(", ")} />
            </>
          );
        }
        return (
          <>
            <p style={detailText}>Comprehensive cover for your trip - medical, trip cancellation and baggage protection.</p>
            <ul style={detailList}>
              <li>Medical expenses: $50,000</li>
              <li>Trip cancellation: $800</li>
              <li>Baggage loss: $500</li>
            </ul>
            <button style={primaryBtn} onClick={() => alert("Get insurance - add 30 Sundays Travel One to your trip.")}>Get insurance</button>
          </>
        );
      }
      // Forex
      if (isAdded("forex")) {
        return (
          <>
            <p style={detailText}>Your multi-currency forex card is active and loaded, ready to spend abroad with zero markup.</p>
            <ul style={detailList}>
              <li>Loaded currencies: USD, THB, EUR</li>
              <li>Zero markup on conversions</li>
              <li>Works at POS and ATMs worldwide</li>
            </ul>
            <DocumentRow available={Boolean(addOns?.forex?.documentUrl)} url={addOns?.forex?.documentUrl} label="Forex card" meta="Balance and card details" />
          </>
        );
      }
      return (
        <>
          <p style={detailText}>Load multiple currencies on one card and skip messy conversions abroad.</p>
          <ul style={detailList}>
            <li>Zero markup on forex conversions</li>
            <li>Works at POS and ATMs worldwide</li>
            <li>Lock rates ahead of your trip</li>
          </ul>
          <button style={primaryBtn} onClick={() => alert("Set up a forex card with your trip manager.")}>Set up forex card</button>
        </>
      );
    };

    return (
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181E4C", margin: "0 0 4px" }}>Add Ons</h4>
        <div>
          {ADD_ONS.filter((a) => a.key !== "visa").map(({ key, label, Icon }, i) => (
            <AddOnAccordionItem
              key={key}
              label={label}
              subtitle={SUBTITLES[key]}
              Icon={Icon}
              statusChip={chipFor(key)}
              menu={<AddOnStateMenu mode={modes[key]} setMode={(m) => setModes((o) => ({ ...o, [key]: m }))} />}
              open={!!openItems[key]}
              onToggle={() => setOpenItems((o) => ({ ...o, [key]: !o[key] }))}
              showDivider={i > 0}
            >
              {renderDetail(key)}
            </AddOnAccordionItem>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181E4C", margin: "0 0 16px" }}>Add Ons</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {ADD_ONS.map(({ key, label, Icon }) => {
            const purchased = key !== "forex" && addOns?.[key]?.purchased;
            return (
              <AddOnTile
                key={key}
                label={label}
                Icon={Icon}
                purchased={purchased}
                onClick={() => setOpenKey(key)}
              />
            );
          })}
        </div>
      </div>

      {sheets}
    </>
  );
}
