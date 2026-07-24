import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useParams } from "react-router-dom";
import PhoneFrame from "./components/PhoneFrame";
import BottomNav from "./components/BottomNav";
import UserToggle from "./components/UserToggle";
import TripNudge from "./components/TripNudge";
import CallbackNudge from "./components/CallbackNudge";
import Home from "./pages/Home";
import HomeV2 from "./pages/HomeV2";
import HomeV3 from "./pages/HomeV3";
import HomeV4 from "./pages/HomeV4";
import HomeV5 from "./pages/HomeV5";
import HomeV5Clone from "./pages/HomeV5Clone";
import HomeBannerLab from "./pages/HomeBannerLab";
import HomeV6 from "./pages/HomeV6";
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
import HotelUpgradeNudge from "./prototypes/HotelUpgradeNudge";
import WatchDeepLink from "./pages/WatchDeepLink";
import Offline from "./pages/Offline";
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
  const hideShell = pathname === "/login-v2" || pathname === "/logo-anim" || pathname === "/media-lab" || pathname === "/build" || pathname.startsWith("/compare/") || pathname.startsWith("/saved") || (pathname === "/plan" && userState === "new");

  if (isPrototype) {
    return (
      <Routes>
        <Route path="/prototype/hotel-upgrade" element={<HotelUpgradeNudge />} />
      </Routes>
    );
  }

  return (
    <PhoneFrame>
      <UserToggle userState={userState} setUserState={setUserState} />
      <Routes>
        <Route path="/" element={<HomeV5 userState={userState} />} />
        <Route path="/landing-clone" element={<HomeV5Clone userState={userState} />} />
        <Route path="/banner-lab" element={<HomeBannerLab userState={userState} />} />
        <Route path="/v3" element={<HomeV3 />} />
        <Route path="/v4" element={<HomeV4 userState={userState} />} />
        <Route path="/v5" element={<HomeV2 />} />
        <Route path="/v6" element={<HomeV6 userState={userState} />} />
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
        <Route path="/watch/:videoId" element={<WatchDeepLink />} />
      </Routes>
      {showNudge && (leadData?.salesRequest ? <CallbackNudge /> : <TripNudge userState={userState} />)}
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
    </WishlistProvider>
    </SavesProvider>
    </DealsProvider>
    </ErrorBoundary>
  );
}
