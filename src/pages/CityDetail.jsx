import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../data";
import { useSaves } from "../data/saves";
import {
  destFromSlug, cityFromSlug, cityPath, citiesWithPages, themeFor,
  cityBasics, cityPhotos, cityVideo, cityFacts, cityMonths,
  cityExperiences, cityStays, cityPaired, cityItineraries,
} from "../data/cityData";
import CityHero from "../components/City/CityHero";
import CityFacts from "../components/City/CityFacts";
import CityWhenToGo from "../components/City/CityWhenToGo";
import CityHonestRead from "../components/City/CityHonestRead";
import CityExperiences from "../components/City/CityExperiences";
import CityStays from "../components/City/CityStays";
import CityPaired from "../components/City/CityPaired";
import CityItineraries from "../components/City/CityItineraries";

// City Detail. One screen per city, answering one question: should this city be
// in my trip, and for how many nights?
//
// It is decision support and nothing else. No arrival logistics, no forex, no
// restaurant lists, and deliberately no call to action pinned to the bottom:
// people carry on through the itineraries, the paired cities, or back.
//
// The page owns no interactive state of its own. The gallery index, the
// selected month and the open price split each live in the block that uses
// them, so a swipe or a tap cannot re-render anything above it.
//
// It runs two ways. On its own route it is a screen with a web address. Given a
// city as a prop it is the same screen as a layer, which is how the trip
// builder opens it: a wizard holds its answers in memory, so sending someone
// away to a URL mid-build would throw their half-made route away.

// The months a trip in Plan actually covers, so the strip can mark them.
function tripSpan(startDate, nights) {
  if (!startDate) return null;
  const from = new Date(startDate);
  if (isNaN(from)) return null;
  const to = new Date(from);
  to.setDate(to.getDate() + (nights || 0));
  const months = new Set([from.getMonth(), to.getMonth()]);
  const opts = { day: "numeric", month: "short" };
  return {
    months,
    first: from.getMonth(),
    label: `${from.toLocaleDateString("en-IN", opts)} to ${to.toLocaleDateString("en-IN", opts)}`,
  };
}

export default function CityDetail({ leadData, dest: destProp, city: cityProp, onBack: onBackProp }) {
  const { destSlug, citySlug } = useParams();
  const navigate = useNavigate();
  const { forDest, toggleRegion } = useSaves();

  const layered = !!cityProp;
  const [layerCity, setLayerCity] = useState(cityProp || null);
  useEffect(() => { if (cityProp) setLayerCity(cityProp); }, [cityProp]);

  const routeDest = destFromSlug(destSlug);
  const dest = layered ? destProp : routeDest;
  const city = layered ? layerCity : (routeDest ? cityFromSlug(routeDest, citySlug) : null);

  const basics = useMemo(() => (dest && city ? cityBasics(dest, city) : null), [dest, city]);
  const photos = useMemo(() => (dest && city ? cityPhotos(dest, city) : []), [dest, city]);
  const facts = useMemo(() => (dest && city ? cityFacts(dest, city) : []), [dest, city]);
  const months = useMemo(() => (dest && city ? cityMonths(dest, city) : null), [dest, city]);
  const experiences = useMemo(() => (dest && city ? cityExperiences(dest, city) : []), [dest, city]);
  const stays = useMemo(() => (dest && city ? cityStays(dest, city, leadData?.startDate) : []), [dest, city, leadData?.startDate]);
  const paired = useMemo(() => (dest && city ? cityPaired(dest, city) : []), [dest, city]);
  const itineraries = useMemo(() => (dest && city ? cityItineraries(dest, city) : []), [dest, city]);

  const siblings = useMemo(() => (dest ? citiesWithPages(dest) : []), [dest]);
  const at = siblings.indexOf(city);
  const prevCity = at > 0 ? siblings[at - 1] : null;
  const nextCity = at >= 0 && at < siblings.length - 1 ? siblings[at + 1] : null;

  const goCity = useCallback((c) => {
    if (!c) return;
    if (layered) setLayerCity(c);
    else navigate(cityPath(dest, c), { replace: true });
  }, [layered, dest, navigate]);
  const onPrevCity = useCallback(() => goCity(prevCity), [goCity, prevCity]);
  const onNextCity = useCallback(() => goCity(nextCity), [goCity, nextCity]);
  const onOpenPaired = useCallback((c) => goCity(c), [goCity]);
  const onBack = useCallback(() => {
    if (layered) onBackProp?.();
    else navigate(`/destination/${encodeURIComponent(dest)}`);
  }, [layered, onBackProp, dest, navigate]);
  const onShare = useCallback(() => {
    const url = typeof window !== "undefined" && dest && city
      ? `${window.location.origin}${cityPath(dest, city)}`
      : "";
    try { navigator.share?.({ title: `${city}, ${dest}`, url }); } catch (e) { /* noop */ }
  }, [city, dest]);

  const saved = dest ? forDest(dest) : null;
  const isSaved = !!saved?.regions?.includes(city);
  const onToggleSave = useCallback(() => toggleRegion(dest, city), [toggleRegion, dest, city]);

  const trip = useMemo(() => tripSpan(leadData?.startDate, leadData?.nights), [leadData?.startDate, leadData?.nights]);

  if (!basics) {
    return <div style={{ padding: 40, textAlign: "center", color: C.sub }}>City not found</div>;
  }

  const t = themeFor(dest, city);
  const initialMonth = trip?.first ?? new Date().getMonth();
  // The callout gives the verdict only. The card right under it already carries
  // the full sentence for that month, so repeating it here would be noise.
  const VERDICT = { good: "a good month", okay: "a mixed month", avoid: "a month we would avoid" };
  const tripLine = trip && months
    ? `Your trip in Plan is ${trip.label}. ${months[trip.first].name} is ${VERDICT[months[trip.first].band]} in ${city}.`
    : null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: layered ? 60 : undefined, display: "flex", flexDirection: "column", background: t.page }}>
      <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <CityHero
          t={t}
          city={city}
          kicker={basics.kicker}
          character={basics.character}
          photos={photos}
          video={cityVideo()}
          saved={isSaved}
          onToggleSave={onToggleSave}
          onShare={onShare}
          onBack={onBack}
          backLabel={layered ? "Close" : "Back"}
          prevCity={prevCity}
          nextCity={nextCity}
          onPrevCity={onPrevCity}
          onNextCity={onNextCity}
        />

        {/* The panel rides up over the hero, so the screen reads as one sheet
            rather than an image with a page stuck underneath it. */}
        <div style={{
          marginTop: -24, background: t.page, borderRadius: "24px 24px 0 0",
          padding: "20px 0 32px", display: "flex", flexDirection: "column", gap: 32,
          position: "relative",
        }}>
          <CityFacts t={t} facts={facts} />
          <CityWhenToGo
            t={t} city={city} months={months} thirdLabel={basics.thirdLabel}
            initial={initialMonth} tripMonths={trip?.months} tripLine={tripLine}
          />
          <CityHonestRead t={t} whyGo={basics.whyGo} whySkip={basics.whySkip} />
          <CityExperiences t={t} items={experiences} />
          <CityStays t={t} items={stays} />
          <CityPaired t={t} items={paired} onOpen={onOpenPaired} />
          <CityItineraries t={t} city={city} items={itineraries} />
        </div>
      </div>
    </div>
  );
}
