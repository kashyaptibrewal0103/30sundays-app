import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Trash2 } from "lucide-react";
import { CC } from "../components/Community/tokens";
import { useCommunity } from "../state/useCommunity";
import { Screen, Body, TopBar, Primary, Sheet, Secondary } from "../components/Gift/GiftUI";
import { PAD, TravellerMark } from "../components/Community/CommunityUI";
import { ME, track } from "../data/communityData";

const ABOUT_MAX = 140;

// What other travellers see next to everything this person writes.
//
// The name and the trip stamp are not editable: they come from the booking, and
// a community where people can rename themselves is a community where nobody
// knows who they are talking to. The photo and one line about yourself are the
// only things that are genuinely yours to set.

export default function CommunityProfile() {
  const navigate = useNavigate();
  const { profile, saveProfile, asked, answers, deleteMyPosts } = useCommunity();

  const [about, setAbout] = useState(profile.about || "");
  const [photo, setPhoto] = useState(profile.photo || null);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const file = useRef(null);

  const mine = asked.length + Object.values(answers).reduce((n, a) => n + a.length, 0);
  const dirty = about !== (profile.about || "") || photo !== (profile.photo || null);

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result);
    r.readAsDataURL(f);
    track("community_profile_photo_picked", {});
  };

  const save = () => {
    saveProfile({ about: about.trim(), photo });
    setSaved(true);
    setTimeout(() => navigate(-1), 500);
  };

  return (
    <Screen
      footer={
        <div style={{ padding: `10px ${PAD}px calc(12px + env(safe-area-inset-bottom))` }}>
          <Primary onClick={save} disabled={!dirty || saved}>
            {saved ? "Saved" : "Save"}
          </Primary>
        </div>
      }
    >
      <TopBar title="Your Profile" onBack={() => navigate(-1)} />
      <Body>
        <div style={{ padding: `20px ${PAD}px 30px` }}>

          {/* The photo, big enough to be worth setting. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => file.current?.click()}
              style={{
                position: "relative", border: "none", background: "none", padding: 0,
                cursor: "pointer", borderRadius: "50%",
              }}
            >
              {photo ? (
                <img src={photo} alt="" style={{
                  width: 92, height: 92, borderRadius: "50%", objectFit: "cover", display: "block",
                }} />
              ) : <TravellerMark name={ME.name} size={92} />}
              <span style={{
                position: "absolute", right: -2, bottom: -2, width: 30, height: 30,
                borderRadius: "50%", background: CC.white, border: `1px solid ${CC.line}`,
                display: "grid", placeItems: "center",
              }}><Camera size={15} color={CC.body} /></span>
            </button>
            <input
              ref={file} type="file" accept="image/*" onChange={pick}
              style={{ display: "none" }}
            />

            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: CC.ink }}>{ME.name}</p>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px",
              borderRadius: 999, background: CC.tealTint, fontSize: 12, fontWeight: 700,
              color: CC.tealInk,
            }}>Been to {ME.stamp.destination}, {ME.stamp.month}</span>
            <p style={{
              margin: "2px 0 0", fontSize: 12.5, color: CC.soft, textAlign: "center",
              lineHeight: "18px",
            }}>
              Your name and trip come from your booking, so they cannot be changed here.
            </p>
          </div>

          {/* One line. Long enough to say where you have been, short enough that
              nobody writes an advert. */}
          <div style={{ marginTop: 26 }}>
            <p style={{ margin: "0 0 7px", fontSize: 13, fontWeight: 700, color: CC.ink }}>
              About You
            </p>
            <textarea
              value={about}
              onChange={e => setAbout(e.target.value.slice(0, ABOUT_MAX))}
              rows={3}
              placeholder="Beach person, third trip to Southeast Asia, always looking for good vegetarian food."
              style={{
                width: "100%", boxSizing: "border-box", padding: "11px 12px",
                borderRadius: 12, border: `1px solid ${CC.line}`, background: CC.white,
                fontFamily: "inherit", fontSize: 14.5, color: CC.ink, lineHeight: "21px",
                resize: "none", outline: "none",
              }}
            />
            <p style={{ margin: "5px 0 0", fontSize: 11.5, color: CC.soft, textAlign: "right" }}>
              {about.length} of {ABOUT_MAX}
            </p>
          </div>

          {/* The right the moderation policy promises, where a person would
              look for it. */}
          <div style={{ marginTop: 26, paddingTop: 18, borderTop: `1px solid ${CC.line}` }}>
            <button
              onClick={() => setConfirm(true)}
              disabled={mine === 0}
              style={{
                display: "flex", alignItems: "center", gap: 9, width: "100%",
                border: "none", background: "none", padding: 0, cursor: mine ? "pointer" : "default",
                fontFamily: "inherit", textAlign: "left", opacity: mine ? 1 : 0.45,
              }}
            >
              <Trash2 size={16} color={CC.pink} style={{ flexShrink: 0 }} />
              <span>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700, color: CC.pink }}>
                  Delete Everything You Wrote
                </span>
                <span style={{ display: "block", marginTop: 2, fontSize: 12, color: CC.soft }}>
                  {mine === 0 ? "You have not posted yet" : `${mine} ${mine === 1 ? "post" : "posts"}, gone for good`}
                </span>
              </span>
            </button>
          </div>
        </div>
      </Body>

      {confirm && (
        <Sheet
          title="Delete everything you wrote?"
          sub="Your questions and answers go from every room. This cannot be undone."
          onClose={() => setConfirm(false)}
          footer={
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Secondary danger onClick={() => { deleteMyPosts(); setConfirm(false); }}>
                Delete {mine} {mine === 1 ? "post" : "posts"}
              </Secondary>
              <Secondary onClick={() => setConfirm(false)}>Keep them</Secondary>
            </div>
          }
        >
          <p style={{ margin: 0, fontSize: 14, color: CC.body, lineHeight: "21px" }}>
            Answers other travellers found helpful go too, so anyone still reading
            that question loses them.
          </p>
        </Sheet>
      )}
    </Screen>
  );
}
