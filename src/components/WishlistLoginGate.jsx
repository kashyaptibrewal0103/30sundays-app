import LoginV2 from "../pages/LoginV2";
import { useWishlist } from "../data/wishlist";

// A heart tapped by someone who is not logged in lands here. The login opens
// over whatever they were looking at; Back puts them straight back with
// nothing saved, and logging in saves the thing they tapped, with the usual
// "saved" line, without them having to tap it again.
export default function WishlistLoginGate({ onLoggedIn }) {
  const { loginFor, finishLogin, cancelLogin } = useWishlist();
  if (!loginFor) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 2000, background: "#fff" }}>
      <LoginV2
        hideSkip
        reason={`Log in to save ${loginFor.name}`}
        onBack={cancelLogin}
        onComplete={() => { onLoggedIn?.(); finishLogin(); }}
        validateOtp={(otp) => (otp === "0000" ? "Invalid OTP. Please try again." : null)}
      />
    </div>
  );
}
