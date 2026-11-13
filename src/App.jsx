import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
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
import HomeAI from "./pages/HomeAI";
import HomeV6 from "./pages/HomeV6";
import NudgeOptions from "./pages/NudgeOptions";
import AISectionOptions from "./pages/AISectionOptions";
import AIPhotos from "./pages/AIPhotos";
import { HomeLabIndex, CtaLab, CardsLab, PlansLab, StatesLab, HOME_LAB_PAGES } from "./pages/home_lab";
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
import OtpSmsLab from "./pages/OtpSmsLab";
import PendingLab from "./pages/PendingLab";
import LogoAnim from "./pages/LogoAnim";
import MediaLab from "./pages/MediaLab";
import RouteCardLab from "./pages/RouteCardLab";
import TransferLab from "./pages/TransferLab";
import DayDetailLab from "./pages/DayDetailLab";
import DayDetailImmersive from "./pages/DayDetailImmersive";
import GlanceCardLab from "./pages/GlanceCardLab";
import RatingLab from "./pages/RatingLab";
import StepperLab from "./pages/StepperLab";
import ProfileLab from "./pages/ProfileLab";
import ActivitiesEduLab from "./pages/ActivitiesEduLab";
import SaveVersionLab from "./pages/SaveVersionLab";
import WeatherOptionsLab from "./pages/WeatherOptionsLab";
import DestWeatherLab from "./pages/DestWeatherLab";
import PastPlansLab from "./pages/PastPlansLab";
import StageHomeLab from "./pages/StageHomeLab";
import HotelDetailLab from "./pages/HotelDetailLab";
import HotelDetailLabRefined from "./pages/HotelDetailLabRefined";
import HotelDetailLabCrisp from "./pages/HotelDetailLabCrisp";
import HotelDetailLabPostcard from "./pages/HotelDetailLabPostcard";
import ConsultantLab from "./pages/ConsultantLab";
import BookedTripsLab from "./pages/BookedTripsLab";
import RegionDetail from "./pages/RegionDetail";
import ScoreStripLab from "./pages/ScoreStripLab";
import RouteEditLab from "./pages/RouteEditLab";
import Generating from "./pages/Generating";
import ReadSummaryLab from "./pages/ReadSummaryLab";
import ReadHeaderLab from "./pages/ReadHeaderLab";
import TripHeaderLab from "./pages/TripHeaderLab";
import TripEditLab from "./pages/TripEditLab";
import TripChipLab from "./pages/TripChipLab";
import RouteChooserLab from "./pages/RouteChooserLab";
import RouteStyleLab from "./pages/RouteStyleLab";
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
import WishlistWF from "./pages/WishlistWF";
import RoutesWF from "./pages/RoutesWF";
import CompareVersions from "./pages/CompareVersions";
import SavedWishlist from "./pages/SavedWishlist";
import WishlistHotelDetail from "./pages/WishlistHotelDetail";
import WishlistActivityDetail from "./pages/WishlistActivityDetail";
import { DealsProvider } from "./data/deals";
import { SavesProvider } from "./data/saves";
import { WishlistProvider } from "./data/wishlist";
import { ProfileProvider } from "./data/profile";
import { AIPhotosProvider } from "./state/useAIPhotos";
import { GiftingProvider } from "./state/useGifting";
import { AI_PHOTOS_VARIANT } from "./data/aiPhotosVariant";
import { LAB_VARIANT } from "./data/labVariant";

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
  const showNudge = pathname === "/";
  const isPrototype = pathname.startsWith("/prototype/");
  // Returning users see the tab bar on /plan (their plans); new users get the full-screen login.
  const giftPaths = pathname === "/wallet" || pathname.startsWith("/gift-cards") || pathname.startsWith("/gift/") || pathname.startsWith("/g/") || pathname.startsWith("/registry");
  const hideShell = pathname === "/login-v2" || pathname === "/otp-sms" || pathname === "/logo-anim" || pathname === "/media-lab" || pathname === "/day-lab" || pathname === "/glance-lab" || pathname === "/rating-lab" || pathname === "/profile-lab" || pathname === "/activities-lab" || pathname === "/save-lab" || pathname === "/weather-lab" || pathname === "/dest-weather-lab" || pathname === "/plans-lab" || pathname === "/pending-lab" || pathname === "/hotel-lab" || pathname === "/hotel-lab-2" || pathname === "/hotel-lab-3" || pathname === "/hotel-lab-3b" || pathname === "/consultant-lab" || pathname === "/booked-lab" || pathname === "/score-strip" || pathname.startsWith("/day-media") || pathname === "/build" || pathname === "/ai-photos" || pathname.startsWith("/compare/") || pathname.startsWith("/saved") || giftPaths || (pathname === "/plan" && userState === "new");

  if (isPrototype) {
    return (
      <Routes>
        <Route path="/prototype/hotel-upgrade" element={<HotelUpgradeNudge />} />
      </Routes>
    );
  }

  // The two share links (/day-media/v1, /day-media/v2) go to the dev team, so they
  // show only the screen, no demo-state switcher.
  // Design labs hide it too, so the cards can be judged without it on top of them.
  const shareLink = pathname.startsWith("/day-media/") || pathname === "/otp-sms" ||pathname === "/glance-lab" || pathname === "/rating-lab" || pathname === "/profile-lab" || pathname === "/activities-lab" || pathname === "/save-lab" || pathname === "/weather-lab" || pathname === "/dest-weather-lab" || pathname === "/plans-lab" || pathname === "/pending-lab" || pathname === "/stage-home" || pathname === "/hotel-lab" || pathname === "/hotel-lab-2" || pathname === "/hotel-lab-3" || pathname === "/hotel-lab-3b" || pathname === "/consultant-lab" || pathname === "/booked-lab" || pathname === "/score-strip";

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

  return (
    <PhoneFrame>
      <ProfileDemoSync userState={userState} />
      {!shareLink && <UserToggle userState={userState} setUserState={setUserState} />}
      <Routes>
        {/* The new home. The AI Couple Photos home is still here, at /ai and on
            its own subdomain build, but it no longer stands in for /. */}
        <Route path="/" element={AI_PHOTOS_VARIANT ? <HomeAI userState={userState} /> : <HomeV5 />} />
        <Route path="/ai" element={<HomeAI userState={userState} />} />
        {/* Review page for the invitation options. Not part of the feature. */}
        <Route path="/nudge-options" element={<NudgeOptions />} />
        <Route path="/ai-section-options" element={<AISectionOptions />} />
        {/* The AI photos module. Full screen, its own shell. */}
        <Route path="/ai-photos" element={<AIPhotos />} />
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
        <Route path="/destination/:name/region/:city" element={<RegionDetail />} />
        <Route path="/old-bali-page" element={<Destination name="Bali" />} />
        <Route path="/listing" element={<Listing userState={userState} leadData={leadData} />} />
        <Route path="/detail/:id" element={<Detail />} />
        <Route path="/itinerary/:id" element={<ItineraryDetail selectedFlights={selectedFlights} selectedHotels={selectedHotels} setSelectedHotels={setSelectedHotels} />} />
        {/* The same screen, read-only: a trip somebody else booked, opened off
            the "Real itineraries by real travellers" rails. */}
        <Route path="/real/:id" element={<ItineraryDetail viewOnly selectedFlights={selectedFlights} selectedHotels={selectedHotels} setSelectedHotels={setSelectedHotels} />} />
        <Route path="/itinerary/:id/payment-plan" element={<PaymentPlan />} />
        <Route path="/plan" element={<Plan userState={userState} setUserState={setUserState} leadData={leadData} setLeadData={setLeadData} />} />
        <Route path="/compare/:dealId" element={<CompareVersions />} />
        <Route path="/saved" element={<SavedWishlist />} />
        <Route path="/saved/hotel/:id" element={<WishlistHotelDetail />} />
        <Route path="/saved/activity/:id" element={<WishlistActivityDetail />} />
        <Route path="/build" element={<Build userState={userState} otpVerified={otpVerified} setOtpVerified={setOtpVerified} />} />
        <Route path="/login-v2" element={<LoginV2 showSkip />} />
        <Route path="/otp-sms" element={<OtpSmsLab />} />
        <Route path="/pending-lab" element={<PendingLab />} />
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
        <Route path="/stepper-lab" element={<StepperLab />} />
        <Route path="/profile-lab" element={<ProfileLab />} />
        <Route path="/activities-lab" element={<ActivitiesEduLab />} />
        <Route path="/save-lab" element={<SaveVersionLab />} />
        <Route path="/weather-lab" element={<WeatherOptionsLab />} />
        <Route path="/dest-weather-lab" element={<DestWeatherLab />} />
        <Route path="/plans-lab" element={<PastPlansLab />} />
        <Route path="/stage-home" element={<StageHomeLab />} />
        <Route path="/hotel-lab" element={<HotelDetailLab />} />
        <Route path="/hotel-lab-2" element={<HotelDetailLabRefined />} />
        <Route path="/hotel-lab-3" element={<HotelDetailLabCrisp />} />
        <Route path="/hotel-lab-3b" element={<HotelDetailLabPostcard />} />
        <Route path="/consultant-lab" element={<ConsultantLab />} />
        <Route path="/booked-lab" element={<BookedTripsLab />} />
        <Route path="/score-strip" element={<ScoreStripLab />} />
        <Route path="/route-edit-lab" element={<RouteEditLab />} />
        <Route path="/building-v1" element={<Generating leadData={leadData} />} />
        <Route path="/read-summary-lab" element={<ReadSummaryLab />} />
        <Route path="/trip-header-lab" element={<TripHeaderLab />} />
        <Route path="/trip-edit-lab" element={<TripEditLab />} />
        <Route path="/trip-chip-lab" element={<TripChipLab />} />
        <Route path="/read-header-lab" element={<ReadHeaderLab />} />
        <Route path="/route-style-lab" element={<RouteStyleLab />} />
        <Route path="/route-chooser-lab" element={<RouteChooserLab />} />
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
      {showNudge && <ProfileGate userState={userState} />}
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
    <AIPhotosProvider>
    <GiftingProvider>
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
    </GiftingProvider>
    </AIPhotosProvider>
    </ProfileProvider>
    </WishlistProvider>
    </SavesProvider>
    </DealsProvider>
    </ErrorBoundary>
  );
}
