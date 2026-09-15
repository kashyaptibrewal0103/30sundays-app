import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, HeartHandshake, FileText, HelpCircle, ChevronRight, Clock, Check, EyeOff,
} from "lucide-react";
import { C } from "../data";
import { useGifting } from "../state/useGifting";
import {
  inr, getOccasion, REGISTRY_TERMS_FULL, REGISTRY_TERMS_TOP, FAQS,
} from "../data/giftData";
import {
  Screen, Body, TopBar, Primary, Secondary, Accordion,
} from "../components/Gift/GiftUI";
import {
  W, APP_BG, T, SettingsSection, TileIcon,
} from "../components/Gift/WalletUI";

export default function GiftRegistry() {
  const navigate = useNavigate();
  const { myRegistries, forMe, registryTotal, daysLeft } = useGifting();
  const [sub, setSub] = useState(null);

  const back = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/account");
  };

  const unclaimed = forMe.filter(r => !r.claimed && r.revealed && r.status !== "declined");
  const claimed = forMe.filter(r => r.claimed || r.status === "declined");
  // Only one filled button on the screen. A pool waiting to be claimed outranks
  // setting a new one up, so it takes the fill and the other steps back.
  const claimIsPrimary = unclaimed.length > 0;

  return (
    <Screen style={APP_BG}>
      <TopBar title="Gift registry" onBack={back} transparent />
      <Body>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Waiting to be claimed */}
          {unclaimed.map(r => (
            <div key={r.id} style={{
              background: C.white, border: `1px solid ${C.p300}`, borderRadius: 16, padding: 16,
              boxShadow: "0 4px 18px rgba(227,27,83,0.10)",
            }}>
              <p style={{ ...T.bodySmall, color: C.p600, fontWeight: 600 }}>
                {r.organiserName} set this up for you
              </p>
              <p style={{ ...T.headlineMedium, marginTop: 6 }}>{inr(registryTotal(r))}</p>
              <p style={{ ...T.bodyMedium, color: W.grey600, marginTop: 4 }}>
                from {r.contributions.length} people
              </p>
              <div style={{ height: 14 }} />
              <Primary onClick={() => navigate(`/registry/${r.id}`)}>Claim it</Primary>
              <p style={{ ...T.bodySmall, color: C.inact, marginTop: 10, display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={12} /> {daysLeft(r)} days left
              </p>
            </div>
          ))}

          {/* Start one */}
          <div style={{ background: C.white, border: `1px solid ${W.grey200}`, borderRadius: 16, padding: 16 }}>
            <p style={{ ...T.titleMedium600, fontSize: 20 }}>One pool, not twenty envelopes</p>
            <p style={{ ...T.bodyMedium, color: W.grey600, marginTop: 6, marginBottom: 16, lineHeight: "20px" }}>
              Share a link and friends put money towards the couple&rsquo;s holiday.
            </p>
            {claimIsPrimary ? (
              <Secondary onClick={() => navigate("/registry/new?for=couple")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <HeartHandshake size={16} /> Set one up for a couple
                </span>
              </Secondary>
            ) : (
              <Primary onClick={() => navigate("/registry/new?for=couple")}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <HeartHandshake size={16} /> Set one up for a couple
                </span>
              </Primary>
            )}
            <button onClick={() => navigate("/registry/new?for=us")} style={{
              width: "100%", marginTop: 10, padding: "6px 0", background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 500, color: C.p600,
            }}>
              Or set one up for us
            </button>
          </div>

          {/* Yours */}
          {myRegistries.length > 0 && (
            <Section title="Registries you set up">
              {myRegistries.map(r => (
                <RegistryRow key={r.id} r={r} total={registryTotal(r)} onClick={() => navigate(`/registry/${r.id}`)} />
              ))}
            </Section>
          )}

          {claimed.length > 0 && (
            <Section title="Registries for you">
              {claimed.map(r => (
                <RegistryRow key={r.id} r={r} total={registryTotal(r)} onClick={() => navigate(`/registry/${r.id}`)} />
              ))}
            </Section>
          )}

          {myRegistries.length === 0 && claimed.length === 0 && unclaimed.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 32px" }}>
              <Users size={36} color={W.grey600} strokeWidth={1.5} style={{ margin: "0 auto" }} />
              <p style={{ ...T.labelLarge, marginTop: 14 }}>No registries yet</p>
              <p style={{ ...T.bodySmall, color: W.grey600, marginTop: 6 }}>
                Anything you set up shows here
              </p>
            </div>
          )}

          {/* Rules */}
          <div>
            <div style={{ background: C.white, border: `1px solid ${W.grey200}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              {REGISTRY_TERMS_TOP.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < REGISTRY_TERMS_TOP.length - 1 ? 9 : 0 }}>
                  <Check size={14} color={C.p600} style={{ flexShrink: 0, marginTop: 3 }} />
                  <p style={{ ...T.bodySmall, color: W.grey600, lineHeight: "18px" }}>{t}</p>
                </div>
              ))}
            </div>
            <SettingsSection>
              <NavRow icon={FileText} label="Registry terms" onClick={() => setSub("terms")} />
              <NavRow icon={HelpCircle} label="FAQs" onClick={() => setSub("faqs")} />
            </SettingsSection>
          </div>

          <div style={{ height: 16 }} />
        </div>
      </Body>

      {sub === "terms" && <TermsScreen title="Registry terms" items={REGISTRY_TERMS_FULL} onClose={() => setSub(null)} />}
      {sub === "faqs" && <TermsScreen title="FAQs" items={FAQS} onClose={() => setSub(null)} />}
    </Screen>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 style={{ ...T.titleMedium600, marginBottom: 12 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{children}</div>
    </div>
  );
}

function NavRow({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 16, width: "100%", padding: 12,
      background: C.white, border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
    }}>
      <TileIcon icon={Icon} color={C.p600} />
      <span style={{ ...T.labelLarge, flex: 1 }}>{label}</span>
      <ChevronRight size={16} color={C.head} />
    </button>
  );
}

function RegistryRow({ r, total, onClick }) {
  const occ = getOccasion(r.occasion);
  const pct = r.target ? Math.min(100, Math.round((total / r.target) * 100)) : null;
  const state = r.status === "declined" ? { label: "Declined", color: W.red600, bg: W.red50, border: W.red200 }
    : r.status === "closed" ? { label: "Closed", color: W.grey600, bg: W.grey50, border: W.grey300 }
    : r.claimed ? { label: "Claimed", color: W.green600, bg: W.green50, border: W.green200 }
    : !r.revealed ? { label: "Surprise", color: "#B54708", bg: "#FFFAEB", border: "#F0C97A" }
    : { label: "Open", color: W.green600, bg: W.green50, border: W.green200 };

  return (
    <button onClick={onClick} style={{
      display: "block", width: "100%", textAlign: "left", cursor: "pointer", fontFamily: "inherit",
      padding: 12, borderRadius: 12, border: `1px solid ${W.grey200}`, background: C.white,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...T.titleMedium }}>{r.coupleNames}</p>
          <p style={{ ...T.bodySmall, color: W.grey600, marginTop: 2 }}>
            {occ.emoji} {occ.label}{r.destination ? ` · ${r.destination}` : ""}
          </p>
        </div>
        <span style={{
          flexShrink: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase",
          color: state.color, background: state.bg, border: `1px solid ${state.border}`,
          padding: "3px 8px", borderRadius: 999,
        }}>{state.label}</span>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 10 }}>
        <span style={{ ...T.titleMedium600, fontSize: 20 }}>{inr(total)}</span>
        {r.target && <span style={{ ...T.bodySmall, color: W.grey600 }}>of {inr(r.target)}</span>}
      </div>

      {pct !== null && (
        <div style={{ height: 5, borderRadius: 3, background: W.grey200, marginTop: 8, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: C.p600, borderRadius: 3 }} />
        </div>
      )}

      <p style={{ ...T.bodySmall, color: C.inact, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
        {!r.revealed && <EyeOff size={12} />}
        {r.contributions.length} {r.contributions.length === 1 ? "person" : "people"}
        {!r.revealed ? " · not told yet" : ""}
      </p>
    </button>
  );
}

function TermsScreen({ title, items, onClose }) {
  return (
    <Screen overlay style={APP_BG}>
      <TopBar title={title} onBack={onClose} transparent />
      <Body>
        <div style={{ padding: "16px 16px 40px" }}>
          <Accordion items={items} />
        </div>
      </Body>
    </Screen>
  );
}
