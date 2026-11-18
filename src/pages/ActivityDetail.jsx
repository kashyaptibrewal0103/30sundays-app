import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Star, MapPin, Navigation, Phone, Globe, Clock, ChevronLeft, ChevronRight,
  X as XIcon, Play, Lock, Accessibility, Baby, Bath, Wand2,
  CircleParking,
} from "lucide-react";
import { C, allItineraries, destData } from "../data";
import { getTripById } from "../data/tripData";
import SaveHeart from "../components/SaveHeart";
import Logo from "../components/Logo";
import { buildActivityDetail, flagChipList } from "../data/activityData";

// ─── Resolve activity from either source ───
function resolveBooked(tripId, dayIdx, actIdx) {
  const trip = getTripById(tripId);
  if (!trip?.dayWise) return null;
  const day = trip.dayWise[Number(dayIdx)];
  if (!day) return null;
  const activity = day.activities?.[Number(actIdx)];
  if (!activity) return null;
  return {
    activity,
    detail: buildActivityDetail(activity, {
      city: day.city,
      country: trip.destination,
      isBooked: true,
      dayDate: day.dateDisplay,
      dayNum: day.dayNumber,
    }),
    backUrl: `/trips/${tripId}`,
  };
}

function resolvePlanning(itineraryId, dayIdx, actIdx) {
  const it = allItineraries.find(i => i.id === Number(itineraryId));
  if (!it) return null;
  // Expand the itinerary the same way ItineraryDetail does
  const destImgs = destData[it.dest];
  const actImgs = destImgs?.actImgs || [];
  const days = [];
  let dayNum = 1;
  it.days.forEach((stay, si) => {
    const actNames = stay.sub.split(" · ");
    for (let d = 0; d < stay.n; d++) {
      const activities = actNames.map((name, ai) => ({
        name,
        img: actImgs[(si * 3 + ai + d) % (actImgs.length || 1)] || it.img,
      }));
      days.push({ city: stay.city, activities, dayNum });
      dayNum++;
    }
  });
  const day = days[Number(dayIdx)];
  if (!day) return null;
  const activity = day.activities[Number(actIdx)];
  if (!activity) return null;
  return {
    activity,
    detail: buildActivityDetail(activity, {
      city: day.city,
      country: it.dest,
      isBooked: false,
      dayNum: day.dayNum,
    }),
    backUrl: `/itinerary/${itineraryId}`,
  };
}

// ─── Page ───
export default function ActivityDetail() {
  const params = useParams();
  const navigate = useNavigate();

  // Detect route by which param is present
  const source = params.tripId
    ? resolveBooked(params.tripId, params.dayIdx, params.actIdx)
    : resolvePlanning(params.id, params.dayIdx, params.actIdx);

  if (!source) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: C.sub }}>Activity not found</p>
        <button onClick={() => navigate(-1)} style={{ marginTop: 16, color: "#FD014F", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>
          Go back
        </button>
      </div>
    );
  }

  const { detail, backUrl } = source;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: C.white, position: "relative" }}>
      <div style={{ flex: 1, paddingBottom: 24 }}>

        {/* Header */}
        <div style={{ padding: "10px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => {
              // Prefer history pop so user returns to the exact previous scroll/state.
              // Fallback to backUrl if there's no history (e.g. deep-linked entry).
              if (window.history.length > 1) navigate(-1);
              else navigate(backUrl);
            }}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: `1px solid ${C.div}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
          >
            <ArrowLeft size={18} color="#181E4C" />
          </button>
          <Logo variant="lockup" height={30} />
        </div>

        <ActivityDetailScroll detail={detail} />

      </div>
    </div>
  );
}

// ─── Reusable activity-detail content (used by the page AND the in-reel bottom sheet) ───
// saved/onSave are optional: when given, the wishlist heart sits beside the name.
export function ActivityDetailScroll({ detail, saved, onSave }) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [aboutExpanded, setAboutExpanded] = useState(false);
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const [showLockedSheet, setShowLockedSheet] = useState(false);

  return (
    <>
      {/* Hero gallery */}
      <HeroGallery
        detail={detail}
        onOpenGallery={(i) => { setGalleryIdx(i); setGalleryOpen(true); }}
        onLockedTap={() => setShowLockedSheet(true)}
      />

      {/* Title block */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <h1 style={{ flex: 1, minWidth: 0, fontSize: 20, fontWeight: 700, color: "#181E4C", margin: 0, lineHeight: 1.25 }}>{detail.name}</h1>
          {onSave && <SaveHeart size={32} saved={!!saved} onToggle={onSave} style={{ marginTop: -4, marginRight: -6 }} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Star size={13} fill="#FBBC05" color="#FBBC05" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#181E4C" }}>{detail.rating}</span>
            <span style={{ fontSize: 12, color: C.sub }}>({detail.reviewCount.toLocaleString()})</span>
          </div>
          <span style={{ color: "#E0E2EB" }}>·</span>
          <span style={{ fontSize: 13, color: "#4A5072" }}>{detail.primaryTypeIcon} {detail.primaryType}</span>
          <OpenStatus detail={detail} />
        </div>

        {/* Flags */}
        <FlagChips flags={detail.flags} />
      </div>

      {/* Action chips */}
      <ActionChipsRow detail={detail} />

      {/* About */}
      <AboutBlock detail={detail} expanded={aboutExpanded} setExpanded={setAboutExpanded} />

      {/* Map preview */}
      <MapPreview detail={detail} />

      {/* Opening hours */}
      <HoursBlock detail={detail} expanded={hoursExpanded} setExpanded={setHoursExpanded} />

      {/* Reviews */}
      <ReviewsBlock detail={detail} />

      {/* Good to know */}
      <GoodToKnowBlock detail={detail} />

      {/* Gallery overlay */}
      {galleryOpen && (
        <GalleryOverlay
          images={detail.photos}
          idx={galleryIdx}
          setIdx={setGalleryIdx}
          onClose={() => setGalleryOpen(false)}
        />
      )}

      {/* Locked guide sheet (planning user) */}
      {showLockedSheet && <LockedGuideSheet onClose={() => setShowLockedSheet(false)} />}
    </>
  );
}

// ─── Hero Gallery ───
function HeroGallery({ detail, onOpenGallery, onLockedTap }) {
  const { isBooked, videoUrl, videoDuration, photos } = detail;

  if (isBooked && videoUrl) {
    return (
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gridTemplateRows: "1fr 1fr", gap: 3, height: 240, borderRadius: 12, overflow: "hidden" }}>
          {/* Video tile (large) */}
          <VideoTile
            videoUrl={videoUrl}
            videoDuration={videoDuration}
            poster={photos[0]}
            onTap={() => onOpenGallery(0)}
          />
          {/* 2 photo tiles */}
          <div style={{ cursor: "pointer" }} onClick={() => onOpenGallery(1)}>
            <img src={photos[1]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ cursor: "pointer" }} onClick={() => onOpenGallery(2)}>
            <img src={photos[2]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
      </div>
    );
  }

  // Planning: 3 images + thin locked-guide banner below
  return (
    <div style={{ padding: "16px 16px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gridTemplateRows: "1fr 1fr", gap: 3, height: 240, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ gridRow: "1 / 3", cursor: "pointer" }} onClick={() => onOpenGallery(0)}>
          <img src={photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ cursor: "pointer" }} onClick={() => onOpenGallery(1)}>
          <img src={photos[1]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
        <div style={{ cursor: "pointer" }} onClick={() => onOpenGallery(2)}>
          <img src={photos[2]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      </div>
    </div>
  );
}

function LockedGuideBanner({ onTap }) {
  return (
    <button
      onClick={onTap}
      style={{
        width: "100%", marginTop: 8,
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 12px",
        background: "linear-gradient(90deg, #181E4C 0%, #2C3470 100%)",
        border: "none", borderRadius: 10,
        cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        boxShadow: "0 2px 8px rgba(24,30,76,0.18)",
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        background: "rgba(255,255,255,0.16)",
        border: "0.5px solid rgba(255,255,255,0.28)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Lock size={13} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3 }}>
          🎬 Curated video guide hidden here
        </p>
        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.7)", margin: "1px 0 0", lineHeight: 1.3 }}>
          Book this trip with 30 Sundays to unlock
        </p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#FD014F", flexShrink: 0 }}>Unlock →</span>
    </button>
  );
}

function VideoTile({ videoUrl, videoDuration, poster, onTap }) {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => { /* autoplay may be blocked, that's fine */ });
  }, []);

  return (
    <div
      onClick={onTap}
      style={{ gridRow: "1 / 3", position: "relative", cursor: "pointer", background: "#000", overflow: "hidden" }}
    >
      <video
        ref={ref}
        src={videoUrl}
        poster={poster}
        muted
        loop
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {/* Guide badge */}
      <div style={{
        position: "absolute", top: 10, left: 10,
        display: "flex", alignItems: "center", gap: 4,
        padding: "4px 8px",
        background: "rgba(20,20,28,0.45)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        border: "0.5px solid rgba(255,255,255,0.28)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22)",
        borderRadius: 999,
      }}>
        <Wand2 size={11} color="#fff" strokeWidth={2} />
        <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", letterSpacing: 0.2 }}>Your guide</span>
      </div>
      {/* Duration badge */}
      <div style={{
        position: "absolute", right: 10, bottom: 10,
        display: "flex", alignItems: "center", gap: 4,
        padding: "4px 8px",
        background: "rgba(20,20,28,0.45)",
        backdropFilter: "blur(14px) saturate(180%)",
        WebkitBackdropFilter: "blur(14px) saturate(180%)",
        border: "0.5px solid rgba(255,255,255,0.28)",
        borderRadius: 999,
      }}>
        <Play size={10} color="#fff" fill="#fff" />
        <span style={{ fontSize: 10, fontWeight: 600, color: "#fff" }}>{videoDuration}</span>
      </div>
    </div>
  );
}

// ─── Open status pill ───
function OpenStatus({ detail }) {
  const open = detail.openNow;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 999,
      background: open ? "#ECFDF3" : "#FEF2F2",
      color: open ? "#027A48" : "#B42318",
      fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: open ? "#16A34A" : "#DC2626", display: "inline-block" }} />
      {open ? "Open now" : `Closed · ${detail.nextOpenLabel}`}
    </span>
  );
}

// ─── Flag chips ───
function FlagChips({ flags }) {
  // The same list the region cards wear, so a chip here and a chip there mean
  // the same thing and look the same doing it.
  const list = flagChipList(flags);
  if (!list.length) return null;
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
      {list.map((f, i) => (
        <span key={i} style={{
          fontSize: 11, fontWeight: 600, color: f.color, background: f.bg,
          padding: "4px 10px", borderRadius: 999,
        }}>
          {f.icon} {f.label}
        </span>
      ))}
    </div>
  );
}

// ─── Action chips row ───
function ActionChipsRow({ detail }) {
  const chips = [];
  chips.push({ Icon: Navigation, label: "Directions", href: detail.googleMapsUri });
  if (detail.phone) chips.push({ Icon: Phone, label: "Call", href: `tel:${detail.phone}` });
  if (detail.website) chips.push({ Icon: Globe, label: "Website", href: detail.website });
  return (
    <div className="hs" style={{ gap: 8, padding: "16px 16px 0" }}>
      {chips.map((c, i) => (
        <a
          key={i}
          href={c.href}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 999,
            background: C.white, border: "1px solid #E0E2EB",
            color: "#181E4C", fontFamily: "inherit",
            fontSize: 12, fontWeight: 600, textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <c.Icon size={14} color="#FD014F" strokeWidth={2} />
          {c.label}
        </a>
      ))}
    </div>
  );
}

// ─── About ───
function AboutBlock({ detail, expanded, setExpanded }) {
  return (
    <div style={{ padding: "20px 16px 0" }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#181E4C", margin: "0 0 8px" }}>About this place</p>
      <div
        style={{
          fontSize: 13, color: "#4A5072", lineHeight: "20px",
          maxHeight: expanded ? 600 : 60,
          overflow: "hidden",
          transition: "max-height 0.32s cubic-bezier(0.4,0,0.2,1)",
          WebkitMaskImage: expanded ? "none" : "linear-gradient(180deg, #000 60%, transparent 100%)",
          maskImage: expanded ? "none" : "linear-gradient(180deg, #000 60%, transparent 100%)",
        }}
      >
        {detail.description}
      </div>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{ marginTop: 6, padding: 0, background: "none", border: "none", color: "#FD014F", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
      >
        {expanded ? "Show less" : "Read more"}
      </button>
      <p style={{
        marginTop: 12, fontSize: 12, color: "#4A5072", fontStyle: "italic",
        background: "#F9F9FB", borderLeft: "3px solid #FD014F",
        padding: "8px 12px", borderRadius: "0 8px 8px 0", margin: "12px 0 0",
      }}>
        {detail.editorialSummary}
      </p>
    </div>
  );
}

// ─── Map preview ───
function MapPreview({ detail }) {
  const mapImage = "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&q=80&auto=format&fit=crop";
  return (
    <a
      href={detail.googleMapsUri}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "block", margin: "20px 16px 0", borderRadius: 16,
        border: `1px solid ${C.div}`, overflow: "hidden",
        textDecoration: "none", color: "inherit",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ position: "relative", height: 130, background: `url(${mapImage}) center/cover no-repeat, #E8ECEF` }}>
        <div style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -100%)",
          width: 32, height: 32, borderRadius: "50%", background: "#FD014F",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 10px rgba(253,1,79,0.45), 0 0 0 4px rgba(253,1,79,0.18)",
        }}>
          <MapPin size={16} color="#fff" fill="#fff" />
        </div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#181E4C", margin: 0 }}>{detail.address}</p>
        <p style={{ fontSize: 11, color: "#FD014F", margin: "4px 0 0", fontWeight: 600 }}>Open in Maps →</p>
      </div>
    </a>
  );
}

// ─── Opening hours ───
function HoursBlock({ detail, expanded, setExpanded }) {
  return (
    <div style={{ padding: "20px 16px 0" }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: "100%", padding: "14px 16px", borderRadius: 14,
          border: `1px solid ${C.div}`, background: C.white,
          display: "flex", alignItems: "center", gap: 12,
          cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F4F5F8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Clock size={18} color="#4A5072" strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#181E4C", margin: 0 }}>Opening hours</p>
          <p style={{ fontSize: 11, color: C.sub, margin: "2px 0 0" }}>{detail.openNow ? "Open now" : `Closed · ${detail.nextOpenLabel}`}</p>
        </div>
        <ChevronRight size={18} color="#666C99" style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {expanded && (
        <div style={{ background: "#F9F9FB", borderRadius: 12, padding: "10px 14px", marginTop: 8 }}>
          {detail.weekdayHours.map((h, i) => (
            <p key={i} style={{ fontSize: 12, color: "#4A5072", margin: i === 0 ? 0 : "4px 0 0", lineHeight: 1.5 }}>{h}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Reviews ───
function ReviewsBlock({ detail }) {
  return (
    <div style={{ padding: "20px 16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#181E4C", margin: 0 }}>Reviews</p>
        <span style={{ fontSize: 11, color: C.sub }}>via Google</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {detail.reviews.map((r, i) => (
          <div key={i} style={{ background: C.white, border: `1px solid ${C.div}`, borderRadius: 12, padding: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <img src={r.avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#181E4C", margin: 0 }}>{r.author}</p>
                <p style={{ fontSize: 10, color: C.sub, margin: 0 }}>{r.date}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={10} fill={j < r.rating ? "#FBBC05" : "#E0E2EB"} color={j < r.rating ? "#FBBC05" : "#E0E2EB"} />
                ))}
              </div>
            </div>
            <p style={{
              fontSize: 12, color: "#4A5072", margin: 0, lineHeight: "18px",
              display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Good to know ───
function GoodToKnowBlock({ detail }) {
  const items = [];
  if (detail.accessibility.wheelchair) items.push({ Icon: Accessibility, label: "Wheelchair accessible" });
  if (detail.accessibility.kidFriendly) items.push({ Icon: Baby, label: "Good for kids" });
  if (detail.accessibility.parking) items.push({ Icon: CircleParking, label: "Parking available" });
  if (detail.accessibility.restroom) items.push({ Icon: Bath, label: "Restroom" });
  if (detail.typicalDuration) items.push({ Icon: Clock, label: detail.typicalDuration });

  if (!items.length) return null;

  return (
    <div style={{ padding: "20px 16px 0" }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#181E4C", margin: "0 0 10px" }}>Good to know</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {items.map((it, i) => (
          <span key={i} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 999,
            background: "#F4F5F8", color: "#4A5072",
            fontSize: 11, fontWeight: 600,
          }}>
            <it.Icon size={12} color="#4A5072" strokeWidth={1.8} />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery overlay (portal to phone-frame) ───
function GalleryOverlay({ images, idx, setIdx, onClose }) {
  const phoneFrame = typeof document !== "undefined" ? document.getElementById("phone-frame") : null;
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (!phoneFrame) return;
    const prev = phoneFrame.style.overflow;
    phoneFrame.style.overflow = "hidden";
    return () => { phoneFrame.style.overflow = prev; };
  }, [phoneFrame]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const overlay = (
    <div style={{
      position: "absolute", inset: 0, zIndex: 320, background: "#000",
      display: "flex", flexDirection: "column", animation: "fadeIn 0.18s ease-out",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
        <span style={{ fontSize: 14, color: "#fff" }}>{idx + 1} / {images.length}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
          <XIcon size={22} color="#fff" />
        </button>
      </div>
      <div
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX == null) return;
          const dx = e.changedTouches[0].clientX - touchStartX;
          if (dx > 40 && idx > 0) setIdx(idx - 1);
          if (dx < -40 && idx < images.length - 1) setIdx(idx + 1);
          setTouchStartX(null);
        }}
        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 0, padding: "0 8px" }}
      >
        <img src={images[idx]} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        {idx > 0 && (
          <button onClick={() => setIdx(idx - 1)} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 20, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronLeft size={20} color="#fff" />
          </button>
        )}
        {idx < images.length - 1 && (
          <button onClick={() => setIdx(idx + 1)} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 20, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <ChevronRight size={20} color="#fff" />
          </button>
        )}
      </div>
    </div>
  );

  return phoneFrame ? createPortal(overlay, phoneFrame) : overlay;
}

// ─── Locked guide sheet ───
function LockedGuideSheet({ onClose }) {
  const navigate = useNavigate();
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 330, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", animation: "fadeInBg 0.2s ease-out" }} />
      <div style={{ position: "relative", background: C.white, borderRadius: "20px 20px 0 0", padding: "24px 20px 28px", animation: "sheetSlideUp 0.25s ease-out" }}>
        <div style={{ width: 40, height: 4, borderRadius: 4, background: "#E0E2EB", margin: "0 auto 18px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#FFEBF1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wand2 size={20} color="#FD014F" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#181E4C", margin: 0 }}>Backstage pass</h3>
        </div>
        <p style={{ fontSize: 14, color: "#4A5072", lineHeight: 1.5, margin: "0 0 18px" }}>
          Book this trip with 30 Sundays and we'll unlock a hand-curated video guide for every stop - local tips, what to skip, and the spots that actually deliver.
        </p>
        <button
          onClick={() => { onClose(); navigate("/plan"); }}
          style={{ width: "100%", padding: "14px 16px", borderRadius: 12, background: "#FD014F", color: "#fff", border: "none", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 8 }}
        >
          Build my trip
        </button>
        <button
          onClick={onClose}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "transparent", color: "#666C99", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          Keep browsing
        </button>
      </div>
    </div>
  );
}
