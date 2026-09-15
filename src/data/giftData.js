// ─── Gift cards + gift registry: static content ───
// Travel Credit is real money paid in by a buyer. Stamps are the marketing
// currency the app already had. The two never merge into one total.

export const MY = {
  name: "Priya Sharma",
  phone: "9123456780",
  partner: "Karan Sharma",
};

// ─── Money ───
export const CARD_MIN = 1500;
export const CARD_MAX = 50000;
export const CARD_PRESETS = [2500, 5000, 10000];
export const TOPUP_PRESETS = [5000, 10000, 25000, 50000];
export const CONTRIB_TIERS = [1500, 3000, 5000];
export const REGISTRY_CAP = 500000;
export const POOL_VALID_DAYS = 365;
// A gift card must be claimed within a year of being bought. Once claimed it is
// credit, and credit never expires. Same rule an unclaimed registry pool follows.
export const CARD_VALID_DAYS = 365;

export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

// Short form for tight spaces: ₹21,000 stays, ₹1,20,000 becomes ₹1.2L.
export const inrShort = (n) => {
  const v = Number(n || 0);
  if (v >= 100000) return `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L`;
  return inr(v);
};

// ─── Card artwork ───
// A real destination photo, a dark fade at the foot so the type stays readable,
// and the brand logo in white. Same treatment the itinerary screen uses.
export const CARD_ARTS = [
  { id: "villa", name: "Maldives", photo: "/lab-locations/maldives-overwater-villa-deck.jpg" },
  { id: "railay", name: "Krabi", photo: "/lab-locations/thailand-railay-beach-krabi.jpg" },
  { id: "kelingking", name: "Bali", photo: "/lab-locations/bali-kelingking-beach-viewpoint.jpg" },
  { id: "halong", name: "Ha Long", photo: "/lab-locations/vietnam-ha-long-bay-cruise.jpg" },
  { id: "tekapo", name: "Tekapo", photo: "/lab-locations/new-zealand-lake-tekapo.jpg" },
  { id: "lemorne", name: "Mauritius", photo: "/lab-locations/mauritius-le-morne-brabant.jpg" },
];

export const getArt = (id) => CARD_ARTS.find(a => a.id === id) || CARD_ARTS[0];

// ─── Occasions ───
export const OCCASIONS = [
  {
    id: "wedding", label: "Wedding", emoji: "💍",
    arts: ["villa", "tekapo", "lemorne"],
    message: "Wishing you both a lifetime of good days. Here is something towards the first holiday.",
    kicker: "For the newly married",
  },
  {
    id: "anniversary", label: "Anniversary", emoji: "🥂",
    arts: ["railay", "villa", "tekapo"],
    message: "Another year of you two. Go somewhere lovely.",
    kicker: "One more year together",
  },
  {
    id: "engagement", label: "Engagement", emoji: "💐",
    arts: ["lemorne", "kelingking", "villa"],
    message: "So happy for you both. Start planning the honeymoon.",
    kicker: "Just said yes",
  },
  {
    id: "birthday", label: "Birthday", emoji: "🎂",
    arts: ["halong", "kelingking", "tekapo"],
    message: "Happy birthday. Spend this on a trip, not a cake.",
    kicker: "For the birthday",
  },
  {
    id: "justbecause", label: "Just because", emoji: "🌊",
    arts: ["kelingking", "railay", "halong"],
    message: "No reason. Go take a break.",
    kicker: "No occasion needed",
  },
];

export const getOccasion = (id) => OCCASIONS.find(o => o.id === id) || OCCASIONS[0];

// ─── The claim link ───
// One link per card. Tapping it opens the card with the code already filled in.
export const CLAIM_HOST = "30sundays.club";
export const claimUrl = (code) => `https://${CLAIM_HOST}/g/${String(code || "").replace(/-/g, "").toLowerCase()}`;
export const codeFromUrl = (s) => {
  const m = String(s || "").trim().match(/\/g\/([A-Za-z0-9]{8,})/);
  return m ? m[1].toUpperCase() : null;
};

// The two ways in, said plainly. Shown on the sent screen and on the claim page.
export const REDEEM_WAYS = [
  ["Tap the link", "The card opens with the code filled in. One text to their own number and the money is in their wallet."],
  ["Or type it in", "Wallet, then Add a gift card, then the code and PIN from the message."],
];

// ─── Why credit exists ───
export const CREDIT_BENEFITS = [
  { icon: "zap", title: "Faster refunds", desc: "Cancelled booking money lands the same day." },
  { icon: "layers", title: "One balance", desc: "Every gift card and pool adds up here. No codes." },
  { icon: "shield", title: "No transfer limits", desc: "Pay a large instalment in one go." },
];

// ─── Terms ───
export const CREDIT_TERMS_TOP = [
  "Never expires.",
  "Works on any instalment.",
  "Cannot be withdrawn as cash.",
  "Refunds come back as credit.",
];

export const CREDIT_TERMS_FULL = [
  ["What credit is", "Travel Credit is money received against your account, either from a gift card, a gift registry pool, a top up, or a refund from a cancelled booking. It is held as a balance and shown in rupees."],
  ["No expiry", "Travel Credit in your wallet does not expire. You paid for it, so we do not take it back. We will remind you at twelve and twenty four months if it is sitting unused."],
  ["Where it can be used", "Against any instalment of any 30 Sundays package, with no cap and no minimum booking value. It stacks with promotional offers."],
  ["Order of use", "Stamps are used first, then credit. Stamps are capped and can only go against the first instalment, so spending them first leaves you better off."],
  ["Not cash", "Credit cannot be withdrawn, transferred to another account, or exchanged for cash. It is not a payment instrument outside this app."],
  ["Cancellations", "If you cancel a booking that was paid with credit, the credit portion returns to your wallet as credit. Anything paid by card or transfer follows the normal refund route for that method."],
  ["Shared with your partner", "Once you and your partner are linked on a trip, both of you can see the same credit balance and either of you can spend it on a shared booking."],
  ["Buying credit", "Topping up your own credit is a purchase of future travel value. It carries the same rules as gifted credit, including no cash out."],
];

export const GIFT_TERMS_TOP = [
  "Ready the moment you pay. It cannot be cancelled.",
  "They have 365 days to claim it, then it lapses.",
  "Claimable once. After that it belongs to that wallet.",
  "Spendable on 30 Sundays trips, never as cash.",
];

export const GIFT_TERMS_FULL = [
  ["Limits", "A single gift card can be worth between ₹1,500 and ₹50,000."],
  ["Delivery", "You get the card and its link the moment payment is confirmed. If you asked us to send it, it goes out on WhatsApp straight away, with SMS as a backup and email if you gave an address. There is no scheduled delivery and no cancellation window."],
  ["The link", "The link opens the card and fills in the code. Adding it needs a one time code sent to the phone of the person adding it, so a forwarded message cannot be cashed by whoever it reaches next."],
  ["Check the number", "If you ask us to send it, we send to the number you type. A wrong number cannot be reversed by us, so confirm it before you pay."],
  ["Claiming", "A card can be claimed once, by one person. From then it belongs permanently to that account, the code stops working, and the amount sits in that wallet as Travel Credit. There is no version of a card addressed to a couple and no way to split one."],
  ["We tell you when it is used", "The moment the card is claimed, the person who bought it is notified and the card is marked as redeemed with the date. If it has not been claimed, we also remind the buyer at thirty days and seven days before it lapses."],
  ["Valid for 365 days", "A card must be claimed within 365 days of being bought. After that the code lapses and cannot be claimed or reissued, and the amount is not refunded to the buyer. The buyer can see the days remaining on every card they have sent, and we remind them at thirty days and seven days."],
  ["What does not expire", "Once a card is claimed, the amount becomes Travel Credit in that wallet, and Travel Credit does not expire. The 365 days is a deadline to accept the gift, not a deadline to take the holiday."],
  ["PIN attempts", "Five wrong PIN attempts lock that code for twenty four hours."],
  ["Stamps", "Gift cards and stamps do not mix. Stamps cannot be used to buy a gift card, buying a gift card does not earn stamps, and a booking paid for with gifted credit does not earn stamps either."],
  ["No cash out", "A gift card becomes Travel Credit. It cannot be refunded to the buyer or withdrawn by the recipient."],
];

export const REGISTRY_TERMS_TOP = [
  "No account needed to give.",
  "The pool becomes the couple's credit once they claim it.",
  "Unclaimed for a year and it lapses. No refunds.",
  "The organiser can never touch the money.",
];

export const REGISTRY_TERMS_FULL = [
  ["Who it is for", "A registry is usually set up by a friend or family member for a couple. The couple can also set one up themselves."],
  ["Target amount", "A target is a progress marker only. There is no all or nothing. Contributions are kept whether the target is reached or not."],
  ["The pool", "Contributions collect against the couple's phone number. Nothing is issued as a code."],
  ["Claiming", "The couple claims with a one time password on their phone. The pool then becomes Travel Credit in their wallet, shared with their partner."],
  ["Unclaimed pools", "A pool that is never claimed is held for one year from the day the registry was created. After that it lapses. Contributions are not refunded."],
  ["The beneficiary number", "The number is fixed when the registry is created and cannot be changed afterwards. If it is wrong, support has to step in."],
  ["What the organiser can do", "Share, set a target, reveal, and close the registry. They can see contributor names and amounts. They can never spend, withdraw or redirect the pool."],
  ["Privacy", "Contributors can choose to leave their name off the public list. Their contribution still counts towards the total."],
  ["The couple's say", "A couple can decline a registry set up in their name. It stops accepting contributions straight away and support gets in touch with everyone who has already given."],
];

export const FAQS = [
  ["Will I know if my gift was used?", "Yes. You are notified the moment it is claimed, and the card in your list flips to redeemed with the date. If nobody has claimed it, we remind you thirty days and seven days before it lapses."],
  ["Can a gift card be bought or earned with stamps?", "No, in both directions. Stamps cannot buy a gift card, buying one earns no stamps, and a booking paid for with gifted credit earns no stamps either."],
  ["Can a card be given to a couple jointly?", "Not as one card. A card is claimed by one person and lands in that person's wallet. For a couple, either send two cards or use a gift registry."],
  ["Does a gift card expire?", "The card does, the money does not. It has to be claimed within 365 days of being bought. Once it is claimed the amount becomes Travel Credit, and credit never expires, so there is no rush to book the trip itself."],
  ["What is the difference between stamps and credit?", "Stamps are a reward we give you, usually from referrals and campaigns. They are capped per booking, only go against the first instalment, and expire after a year. Credit is real money someone paid in. It has no cap, works on any instalment, and never expires."],
  ["Can I get my credit back as cash?", "No. Credit can only be spent on 30 Sundays packages. That is true whether you topped it up yourself or someone gifted it."],
  ["I sent a gift card to the wrong number. What now?", "Contact support straight away. If it has not been claimed yet we may be able to stop it. Once it is claimed it belongs to that account and we cannot move it."],
  ["Does my partner see my credit?", "Yes, once the two of you are linked on a trip. Either of you can spend it on a booking you share."],
  ["Do I need an account to contribute to a registry?", "No. You pay, leave your name and a message, and you are done."],
  ["Will other contributors see how much I gave?", "No. Everyone sees the total and the list of names. Only the couple and the organiser see individual amounts. You can also leave your name off entirely."],
  ["What if the couple never claims the registry?", "The pool is held for a year from the day it was created. If it is still unclaimed after that it lapses, and contributions are not refunded. The organiser can re-share the link at any time to nudge them."],
  ["Can a gift card be used with a discount offer?", "Yes. Credit stacks with promotional offers. Stamps do not."],
];

// ─── Demo gift codes for the Add gift card drawer ───
// Typing any of these in the prototype exercises a different outcome.
// `boughtDaysAgo` drives the 365 day claim window, so the prototype can show a
// live card, a used one and a lapsed one without editing dates by hand.
export const DEMO_CODES = [
  { code: "GS-4KX2-9PLM", pin: "4821", amount: 11000, from: "Meera Nair", occasion: "wedding", artId: "lemorne", status: "open", boughtDaysAgo: 12 },
  { code: "GS-7TQ1-2MNB", pin: "1109", amount: 5000, from: "Rahul Sethi", occasion: "birthday", artId: "kelingking", status: "claimed", boughtDaysAgo: 90 },
  { code: "GS-3RVW-8KDL", pin: "6034", amount: 2500, from: "Aditi Menon", occasion: "birthday", artId: "railay", status: "open", boughtDaysAgo: 402 },
];

export const normaliseCode = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// ─── Analytics stub ───
export const track = (event, props = {}) => {
  if (typeof console !== "undefined") console.log(`[analytics] ${event}`, props);
};

// ─── Stamps ───
// Carried over from the old wallet so nothing is lost when the two balances
// split apart.
export const STAMP_EARN = [
  { icon: "gift", title: "Refer & earn", desc: "Invite friends to join and book their first trip get wallet credit for successful referral." },
  { icon: "megaphone", title: "Campaigns", desc: "Participate in special promotions and challenges to unlock extra wallet rewards." },
  { icon: "palm", title: "Repeat bookings", desc: "Earn wallet credit every time you book trip with us." },
];

export const STAMP_TERMS_TOP = [
  "A reward from us, not money you paid in.",
  "Expire 12 months after they land.",
  "First instalment only, capped at ₹20,000 or 10%.",
  "Cannot buy a gift card or fund a registry.",
];

// A registry the couple made themselves has no claim step and no pending pool,
// so the rules they see are not the same four.
export const REGISTRY_TERMS_TOP_COUPLE = [
  "No account needed to give.",
  "Money lands in your wallet straight away.",
  "Never expires. Your partner sees it too.",
  "Cannot be withdrawn as cash.",
];
