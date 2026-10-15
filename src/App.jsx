import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame";
import BottomNav from "./components/BottomNav";
import UserToggle from "./components/UserToggle";
import TripNudge from "./components/TripNudge";
import CallbackNudge from "./components/CallbackNudge";
import ProfileGate from "./components/ProfileGate";
import ProfileDemoSync from "./components/ProfileDemoSync";
import Home from "./pages/Home";
import HomeV2 from "./pages/HomeV2";
import HomeV3 from "./pages/HomeV3";
import HomeV4 from "./pages/HomeV4";
import HomeV5 from "./pages/HomeV5";
import HomeV5Clone from "./pages/HomeV5Clone";
import HomeBannerLab from "./pages/HomeBannerLab";
import HomeV6 from "./pages/HomeV6";
import { HomeLabIndex, CtaLab, CardsLab, PlansLab, StatesLab, LinesLab, ProofLab, CircleLineLab, BookedHome, BookedHomeIndex, MatchHome, HOME_LAB_PAGES } from "./pages/home_lab";
import ChatScreen from "./pages/ChatScreen";
import Destination from "./pages/Destination";
import MaldivesDestination from "./pages/MaldivesDestination";
import MaldivesQuote from "./pages/MaldivesQuote";
import ResortDetail from "./pages/ResortDetail";
import Listing from "./pages/Listing";
import Detail from "./pages/Detail";
import ItineraryDetail from "./pages/ItineraryDetail";
import Plan from "./pages/Plan";
import Build from "./pages/Build";
import LoginV2 from "./pages/LoginV2";
import LogoAnim from "./pages/LogoAnim";
import MediaLab from "./pages/MediaLab";
import RouteCardLab from "./pages/RouteCardLab";
import TransferLab from "./pages/TransferLab";
import DayDetailLab from "./pages/DayDetailLab";
import DayDetailImmersive from "./pages/DayDetailImmersive";
import GlanceCardLab from "./pages/GlanceCardLab";
import RatingLab from "./pages/RatingLab";
import ProfileLab from "./pages/ProfileLab";
import ActivitiesEduLab from "./pages/ActivitiesEduLab";
import SaveVersionLab from "./pages/SaveVersionLab";
import FlightListing from "./pages/FlightListing";
import FlightDetail from "./pages/FlightDetail";
import ReviewChanges from "./pages/ReviewChanges";
import HotelListing from "./pages/HotelListing";
import HotelPDP from "./pages/HotelPDP";
import ReviewHotel from "./pages/ReviewHotel";
import MyTrips from "./pages/MyTrips";
import TripDetails from "./pages/TripDetails";
import BookedTripItinerary from "./pages/BookedTripItinerary";
import TripDocsDemo from "./pages/TripDocsDemo";
import TravelerDocsDemo from "./pages/TravelerDocsDemo";
import BookedHotelPDP from "./pages/BookedHotelPDP";
import ActivityDetail from "./pages/ActivityDetail";
import PaymentDetails from "./pages/PaymentDetails";
import PaymentPlan from "./pages/PaymentPlan";
import Account from "./pages/Account";
import Wallet from "./pages/Wallet";
import GiftCards from "./pages/GiftCards";
import CommunityIndex from "./pages/CommunityIndex";
import CommunityFeed from "./pages/CommunityFeed";
import CommunityQuestion from "./pages/CommunityQuestion";
import CommunitySearch from "./pages/CommunitySearch";
import CommunitySaved from "./pages/CommunitySaved";
import CommunityGuidelines from "./pages/CommunityGuidelines";
import CommunityBookingConfirmed from "./pages/CommunityBookingConfirmed";
import MyTripsCommunity from "./pages/MyTripsCommunity";
import CommunityEntries from "./pages/CommunityEntries";
import LoungeLayouts from "./pages/LoungeLayouts";
import LoungeGoldCopy from "./pages/LoungeGoldCopy";
import LoungeSignals from "./pages/LoungeSignals";
import LoungeParts from "./pages/LoungeParts";
import LoungeStyles from "./pages/LoungeStyles";
import LoungeReplyRows from "./pages/LoungeReplyRows";
import LoungeNative from "./pages/LoungeNative";
import LoungeMix from "./pages/LoungeMix";
import LoungeMeta from "./pages/LoungeMeta";
import LoungeHome from "./pages/LoungeHome";
import LoungeRooms from "./pages/LoungeRooms";
import LoungeSwitcher from "./pages/LoungeSwitcher";
import LoungeDirectory from "./pages/LoungeDirectory";
import LoungePaused from "./pages/LoungePaused";
import LoungePending from "./pages/LoungePending";
import CommunityNotifications from "./pages/CommunityNotifications";
import CommunityNotifySettings from "./pages/CommunityNotifySettings";
import CommunityProfile from "./pages/CommunityProfile";
import CommunityMyPosts from "./pages/CommunityMyPosts";
import CommunitySuggest from "./pages/CommunitySuggest";
import LoungeRules from "./pages/LoungeRules";
import RouteHelpLab from "./pages/RouteHelpLab";
import GiftCardBuy from "./pages/GiftCardBuy";
import GiftCardClaim from "./pages/GiftCardClaim";
import GiftRegistry from "./pages/GiftRegistry";
import RegistryCreate from "./pages/RegistryCreate";
import RegistryPage from "./pages/RegistryPage";
import HotelUpgradeNudge from "./prototypes/HotelUpgradeNudge";
import WatchDeepLink from "./pages/WatchDeepLink";
import Offline from "./pages/Offline";
import AILab from "./pages/AILab";
import ErrorBoundary from "./components/ErrorBoundary";
import Discover from "./pages/Discover";
import DiscoverRoutes from "./pages/DiscoverRoutes";
import RoutesCouples from "./pages/RoutesCouples";
import DiscoverWF from "./pages/DiscoverWF";
import CityDetail from "./pages/CityDetail";
import { Building } from "./pages/Build";
import Generating from "./pages/Generating";
import ChecksLab from "./pages/ChecksLab";
import WishlistWF from "./pages/WishlistWF";
import RoutesWF from "./pages/RoutesWF";
import CompareVersions from "./pages/CompareVersions";
import SavedWishlist from "./pages/SavedWishlist";
import WishlistHotelDetail from "./pages/WishlistHotelDetail";
import WishlistActivityDetail from "./pages/WishlistActivityDetail";
import { DealsProvider } from "./data/deals";
import { SavesProvider } from "./data/saves";
import { WishlistProvider } from "./data/wishlist";
import { GiftingProvider } from "./state/useGifting";
import { CommunityProvider } from "./state/useCommunity";
import { LAB_VARIANT } from "./data/labVariant";
import { ProfileProvider } from "./data/profile";

// Destination pages: new discover-style layout everywhere except Maldives and
// Mauritius, which keep their existing layouts.
function DestinationLayout() {
  const { name } = useParams();
  const dn = decodeURIComponent(name || "");
  if (dn === "Maldives") return <MaldivesDestination />;
  if (dn === "Mauritius") return <Destination />;
  return <DiscoverWF />;
}

function AppContent({ userState, setUserState, otpVerified, setOtpVerified, leadData, setLeadData, selectedFlights, setSelectedFlights, selectedHotels, setSelectedHotels }) {
  const { pathname } = useLocation();
  // The floating card is off the home for everybody. A booked traveller has
  // their trip at the top of the page already, and for a lead or a new visitor
  // it sat over the content and had to be dismissed before the page could be
  // read. The profile prompt is a different thing and stays.
  const showNudge = false;
  const showProfileGate = pathname === "/";
  const isPrototype = pathname.startsWith("/prototype/");
  // Returning users see the tab bar on /plan (their plans); new users get the full-screen login.
  const communityPaths = pathname.startsWith("/community") || pathname.startsWith("/community-");
  const giftPaths = pathname === "/wallet" || pathname.startsWith("/gift-cards") || pathname.startsWith("/gift/") || pathname.startsWith("/g/") || pathname.startsWith("/registry");
  const hideShell = pathname === "/login-v2" || pathname === "/logo-anim" || pathname === "/media-lab" || pathname === "/day-lab" || pathname === "/glance-lab" || pathname === "/rating-lab" || pathname === "/profile-lab" || pathname === "/activities-lab" || pathname === "/save-lab" || pathname.startsWith("/day-media") || pathname === "/build" || pathname.startsWith("/compare/") || pathname.startsWith("/saved") || giftPaths || communityPaths || (pathname === "/plan" && userState === "new");

  if (isPrototype) {
    return (
      <Routes>
        <Route path="/prototype/hotel-upgrade" element={<HotelUpgradeNudge />} />
      </Routes>
    );
  }

  // The photo lab is a desktop testing tool that talks to Gemini for real, so
  // it sits outside the phone frame and outside the app shell entirely. On its
  // own subdomain it is the home page.
  if (pathname === "/lab" || (LAB_VARIANT && pathname === "/")) {
    return (
      <Routes>
        <Route path="*" element={<AILab />} />
      </Routes>
    );
  }

  // The two share links (/day-media/v1, /day-media/v2) go to the dev team, so they
  // show only the screen, no demo-state switcher.
  // Design labs hide it too, so the cards can be judged without it on top of them.
  const shareLink = pathname.startsWith("/day-media/") || pathname === "/glance-lab" || pathname === "/rating-lab" || pathname === "/profile-lab" || pathname === "/activities-lab" || pathname === "/save-lab";

  return (
    <PhoneFrame>
      <ProfileDemoSync userState={userState} />
      {!shareLink && <UserToggle userState={userState} setUserState={setUserState} />}
      <Routes>
        <Route path="/" element={<MatchHome userState={userState} />} />
        {/* The home this replaced, kept reachable while it is still being reviewed. */}
        <Route path="/home-v5" element={<HomeV5 userState={userState} />} />
        <Route path="/landing-clone" element={<HomeV5Clone userState={userState} />} />
        <Route path="/banner-lab" element={<HomeBannerLab userState={userState} />} />
        <Route path="/v3" element={<HomeV3 />} />
        <Route path="/v4" element={<HomeV4 userState={userState} />} />
        <Route path="/v5" element={<HomeV2 />} />
        <Route path="/v6" element={<HomeV6 userState={userState} />} />
        {/* Home page lab: ten takes on everything above Sunday School */}
        <Route path="/home-lab" element={<HomeLabIndex />} />
        <Route path="/home-lab/cta" element={<CtaLab />} />
        <Route path="/home-lab/cards" element={<CardsLab />} />
        <Route path="/home-lab/plans" element={<PlansLab />} />
        <Route path="/home-lab/states" element={<StatesLab />} />
        <Route path="/home-lab/lines" element={<LinesLab />} />
        <Route path="/home-lab/proof" element={<ProofLab />} />
        <Route path="/home-lab/line" element={<CircleLineLab />} />
        {/* Both booked openings, forced to the booked state so neither needs the
            demo switcher. The clip one is what the home itself now shows. */}
        <Route path="/home-lab/booked-hero" element={<MatchHome userState="customer" bookedStyle="hero" />} />
        <Route path="/home-lab/booked-flat" element={<MatchHome userState="customer" bookedStyle="flat" />} />
        <Route path="/home-lab/booked" element={<BookedHomeIndex />} />
        <Route path="/home-lab/booked/:n" element={<BookedHome />} />
        {HOME_LAB_PAGES.map((Page, i) => <Route key={i} path={`/home-lab/${i + 1}`} element={<Page userState={userState} />} />)}
        <Route path="/discover/:name" element={<Discover />} />
        <Route path="/discover/:name/routes" element={<DiscoverRoutes />} />
        <Route path="/discover-couples/:name" element={<Discover routesBase="/discover-couples" />} />
        <Route path="/discover-couples/:name/routes" element={<RoutesCouples />} />
        <Route path="/wf/:name" element={<DiscoverWF />} />
        <Route path="/wf/:name/wishlist" element={<WishlistWF />} />
        <Route path="/wf/:name/routes" element={<RoutesWF />} />
        <Route path="/v1" element={<Home userState={userState} />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/resort/:resortId" element={<ResortDetail />} />
        <Route path="/maldives-quote" element={<MaldivesQuote />} />
        <Route path="/destination/:name" element={<DestinationLayout />} />
        <Route path="/destination/:destSlug/city/:citySlug" element={<CityDetail leadData={leadData} />} />
        {/* The generating screen on its own route, so it can be looked at
            without walking the whole wizard and catching 1.4 seconds of it. */}
        <Route path="/building-lab" element={<Building dest="Thailand" />} />
        {/* The reworked wait screen, two variants. The only difference is where
            the questions sit; they never share the screen with the footage. */}
        <Route path="/building-v1" element={<Generating leadData={leadData} />} />
        <Route path="/checks-lab" element={<ChecksLab />} />
        <Route path="/route-help-lab" element={<RouteHelpLab />} />
        <Route path="/old-bali-page" element={<Destination name="Bali" />} />
        <Route path="/listing" element={<Listing userState={userState} leadData={leadData} />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/itinerary/:id" element={<ItineraryDetail selectedFlights={selectedFlights} selectedHotels={selectedHotels} setSelectedHotels={setSelectedHotels} />} />
        <Route path="/itinerary/:id/payment-plan" element={<PaymentPlan />} />
        <Route path="/plan" element={<Plan userState={userState} setUserState={setUserState} leadData={leadData} setLeadData={setLeadData} />} />
        <Route path="/compare/:dealId" element={<CompareVersions />} />
        <Route path="/saved" element={<SavedWishlist />} />
        <Route path="/saved/hotel/:id" element={<WishlistHotelDetail />} />
        <Route path="/saved/activity/:id" element={<WishlistActivityDetail />} />
        <Route path="/build" element={<Build userState={userState} otpVerified={otpVerified} setOtpVerified={setOtpVerified} />} />
        <Route path="/login-v2" element={<LoginV2 />} />
        <Route path="/logo-anim" element={<LogoAnim />} />
        <Route path="/media-lab" element={<MediaLab />} />
        <Route path="/route-lab" element={<RouteCardLab />} />
        <Route path="/offline" element={<Offline />} />
        <Route path="/transfer-lab" element={<TransferLab />} />
        <Route path="/day-lab" element={<DayDetailLab />} />
        <Route path="/day-media" element={<DayDetailImmersive />} />
        <Route path="/day-media/:variant" element={<DayDetailImmersive />} />
        <Route path="/glance-lab" element={<GlanceCardLab />} />
        <Route path="/rating-lab" element={<RatingLab />} />
        <Route path="/profile-lab" element={<ProfileLab />} />
        <Route path="/activities-lab" element={<ActivitiesEduLab />} />
        <Route path="/save-lab" element={<SaveVersionLab />} />
        <Route path="/flights/:itineraryId/:legIndex" element={<FlightListing selectedFlights={selectedFlights} setSelectedFlights={setSelectedFlights} />} />
        <Route path="/flight-detail/:itineraryId/:legIndex/:flightId" element={<FlightDetail />} />
        <Route path="/review-flight/:itineraryId/:legIndex" element={<ReviewChanges selectedFlights={selectedFlights} setSelectedFlights={setSelectedFlights} />} />
        <Route path="/hotels/:itineraryId/:stayIndex" element={<HotelListing selectedHotels={selectedHotels} setSelectedHotels={setSelectedHotels} />} />
        <Route path="/hotel-detail/:itineraryId/:stayIndex/:hotelId" element={<HotelPDP />} />
        <Route path="/review-hotel/:itineraryId/:stayIndex" element={<ReviewHotel selectedHotels={selectedHotels} setSelectedHotels={setSelectedHotels} />} />
        <Route path="/trips" element={<MyTrips userState={userState} leadData={leadData} />} />
        <Route path="/trips/:tripId" element={<TripDetails />} />
        <Route path="/trips/:tripId/booked-itinerary" element={<BookedTripItinerary />} />
        <Route path="/trips/:tripId/documents" element={<TripDocsDemo />} />
        <Route path="/trips/:tripId/traveler-documents" element={<TravelerDocsDemo />} />
        <Route path="/trip-docs-demo/:tripId" element={<TripDocsDemo />} />
        <Route path="/trip-docs-demo" element={<TripDocsDemo />} />
        <Route path="/traveler-docs-demo/:tripId" element={<TravelerDocsDemo />} />
        <Route path="/traveler-docs-demo" element={<TravelerDocsDemo />} />
        <Route path="/trips/:tripId/hotel/:hotelIdx" element={<BookedHotelPDP />} />
        <Route path="/trips/:tripId/day/:dayIdx/activity/:actIdx" element={<ActivityDetail />} />
        <Route path="/itinerary/:id/day/:dayIdx/activity/:actIdx" element={<ActivityDetail />} />
        <Route path="/trips/:tripId/payments" element={<PaymentDetails />} />
        <Route path="/account" element={<Account userState={userState} leadData={leadData} setUserState={setUserState} setLeadData={setLeadData} />} />
        <Route path="/wallet" element={<Wallet userState={userState} leadData={leadData} />} />
        {/* Community: Q&A, the cohort, and the parallel My Trips with the card on it */}
        {/* The Community used to live at /lounge. Every old address still
            lands on the new one, so links already shared keep working. */}
        <Route path="/lounge" element={<Navigate to="/community" replace />} />
        <Route path="/lounge/search" element={<Navigate to="/community/search" replace />} />
        <Route path="/lounge/notifications" element={<Navigate to="/community/notifications" replace />} />
        <Route path="/lounge/settings" element={<Navigate to="/community/settings" replace />} />
        <Route path="/lounge/profile" element={<Navigate to="/community/profile" replace />} />
        <Route path="/lounge/my-posts" element={<Navigate to="/community/my-posts" replace />} />
        <Route path="/lounge/suggest" element={<Navigate to="/community/suggest" replace />} />
        <Route path="/lounge-rules" element={<Navigate to="/community-rules" replace />} />
        <Route path="/lounge-rooms" element={<Navigate to="/community-rooms" replace />} />
        <Route path="/lounge-switcher" element={<Navigate to="/community-switcher" replace />} />
        <Route path="/lounge-index" element={<Navigate to="/community-index" replace />} />
        <Route path="/lounge-paused" element={<Navigate to="/community-paused" replace />} />
        <Route path="/lounge-pending" element={<Navigate to="/community-pending" replace />} />
        <Route path="/lounge-layouts" element={<Navigate to="/community-layouts" replace />} />
        <Route path="/lounge-copy" element={<Navigate to="/community-copy" replace />} />
        <Route path="/lounge-signals" element={<Navigate to="/community-signals" replace />} />
        <Route path="/lounge-parts" element={<Navigate to="/community-parts" replace />} />
        <Route path="/lounge-styles" element={<Navigate to="/community-styles" replace />} />
        <Route path="/lounge-rows" element={<Navigate to="/community-rows" replace />} />
        <Route path="/lounge-native" element={<Navigate to="/community-native" replace />} />
        <Route path="/lounge-mix" element={<Navigate to="/community-mix" replace />} />
        <Route path="/lounge-meta" element={<Navigate to="/community-meta" replace />} />
        {/* And again from the Circle spelling. */}
        <Route path="/circle" element={<Navigate to="/community" replace />} />
        <Route path="/circle/search" element={<Navigate to="/community/search" replace />} />
        <Route path="/circle/notifications" element={<Navigate to="/community/notifications" replace />} />
        <Route path="/circle/settings" element={<Navigate to="/community/settings" replace />} />
        <Route path="/circle/profile" element={<Navigate to="/community/profile" replace />} />
        <Route path="/circle/my-posts" element={<Navigate to="/community/my-posts" replace />} />
        <Route path="/circle/suggest" element={<Navigate to="/community/suggest" replace />} />
        <Route path="/circle-rules" element={<Navigate to="/community-rules" replace />} />
        <Route path="/circle-rooms" element={<Navigate to="/community-rooms" replace />} />
        <Route path="/circle-switcher" element={<Navigate to="/community-switcher" replace />} />
        <Route path="/circle-index" element={<Navigate to="/community-index" replace />} />
        <Route path="/circle-paused" element={<Navigate to="/community-paused" replace />} />
        <Route path="/circle-pending" element={<Navigate to="/community-pending" replace />} />
        <Route path="/circle-layouts" element={<Navigate to="/community-layouts" replace />} />
        <Route path="/circle-copy" element={<Navigate to="/community-copy" replace />} />
        <Route path="/circle-signals" element={<Navigate to="/community-signals" replace />} />
        <Route path="/circle-parts" element={<Navigate to="/community-parts" replace />} />
        <Route path="/circle-styles" element={<Navigate to="/community-styles" replace />} />
        <Route path="/circle-rows" element={<Navigate to="/community-rows" replace />} />
        <Route path="/circle-native" element={<Navigate to="/community-native" replace />} />
        <Route path="/circle-mix" element={<Navigate to="/community-mix" replace />} />
        <Route path="/circle-meta" element={<Navigate to="/community-meta" replace />} />
        <Route path="/community" element={<LoungeHome />} />
        <Route path="/community/search" element={<CommunitySearch everywhere />} />
        <Route path="/community/notifications" element={<CommunityNotifications />} />
        <Route path="/community/settings" element={<CommunityNotifySettings />} />
        <Route path="/community/profile" element={<CommunityProfile />} />
        <Route path="/community/my-posts" element={<CommunityMyPosts />} />
        <Route path="/community/suggest" element={<CommunitySuggest />} />
        <Route path="/community-rules" element={<LoungeRules />} />
        <Route path="/community-rooms" element={<LoungeRooms />} />
        <Route path="/community-switcher" element={<LoungeSwitcher />} />
        <Route path="/community-index" element={<LoungeDirectory />} />
        <Route path="/community-paused" element={<LoungePaused />} />
        <Route path="/community-pending" element={<LoungePending />} />
        <Route path="/community-demo" element={<CommunityIndex />} />
        <Route path="/community/booking-confirmed" element={<CommunityBookingConfirmed />} />
        <Route path="/community/:dest" element={<CommunityFeed />} />
        <Route path="/community/:dest/search" element={<CommunitySearch />} />
        <Route path="/community/:dest/saved" element={<CommunitySaved />} />
        <Route path="/community/:dest/q/:qid" element={<CommunityQuestion />} />
        <Route path="/community/:dest/guidelines" element={<CommunityGuidelines />} />
        <Route path="/trips-community" element={<MyTripsCommunity userState={userState} leadData={leadData} />} />
        <Route path="/community-entries" element={<CommunityEntries />} />
        <Route path="/community-layouts" element={<LoungeLayouts />} />
        <Route path="/community-copy" element={<LoungeGoldCopy />} />
        <Route path="/community-signals" element={<LoungeSignals />} />
        <Route path="/community-parts" element={<LoungeParts />} />
        <Route path="/community-styles" element={<LoungeStyles />} />
        <Route path="/community-rows" element={<LoungeReplyRows />} />
        <Route path="/community-native" element={<LoungeNative />} />
        <Route path="/community-mix" element={<LoungeMix />} />
        <Route path="/community-meta" element={<LoungeMeta />} />
        <Route path="/gift-cards" element={<GiftCards />} />
        <Route path="/gift-cards/buy" element={<GiftCardBuy />} />
        <Route path="/gift/:code" element={<GiftCardClaim />} />
        {/* The short link printed on a card: 30sundays.club/g/<code> */}
        <Route path="/g/:code" element={<GiftCardClaim />} />
        <Route path="/registry" element={<GiftRegistry />} />
        <Route path="/registry/new" element={<RegistryCreate />} />
        <Route path="/registry/:id" element={<RegistryPage />} />
        <Route path="/watch/:videoId" element={<WatchDeepLink />} />
      </Routes>
      {showNudge && (leadData?.salesRequest ? <CallbackNudge /> : <TripNudge userState={userState} />)}
      {showProfileGate && <ProfileGate userState={userState} />}
      {!hideShell && <BottomNav userState={userState} />}
    </PhoneFrame>
  );
}

export default function App() {
  const [userState, setUserState] = useState("new");
  const [leadData, setLeadData] = useState(null); // { phone, countryCode, name, dests, adults, children }
  // Mobile OTP verification done this session (gates the Build flow for new users)
  const [otpVerified, setOtpVerified] = useState(false);
  const [selectedFlights, setSelectedFlights] = useState({});
  const [selectedHotels, setSelectedHotels] = useState({});

  return (
    <ErrorBoundary>
    <DealsProvider>
    <SavesProvider>
    <WishlistProvider>
    <ProfileProvider>
    <GiftingProvider>
    <CommunityProvider>
      <BrowserRouter>
        <AppContent
          userState={userState}
          setUserState={setUserState}
          otpVerified={otpVerified}
          setOtpVerified={setOtpVerified}
          leadData={leadData}
          setLeadData={setLeadData}
          selectedFlights={selectedFlights}
          setSelectedFlights={setSelectedFlights}
          selectedHotels={selectedHotels}
          setSelectedHotels={setSelectedHotels}
        />
      </BrowserRouter>
    </CommunityProvider>
    </GiftingProvider>
    </ProfileProvider>
    </WishlistProvider>
    </SavesProvider>
    </DealsProvider>
    </ErrorBoundary>
  );
}
