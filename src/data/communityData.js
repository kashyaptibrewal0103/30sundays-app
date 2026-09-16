// ─── Community: Q&A and group chat, all fake ───
// Thailand October 2026 is the main scenario, on trip-1. Mauritius sits below
// the group threshold so the Q&A only state can be shown, and Vietnam has
// already travelled so its group is closed and read only.
//
// Everyone here is a traveller, not a couple. The app is going wider than
// honeymoons, so the voices are a mix: people travelling alone, with a
// partner, with friends, and with family.

export const COHORT_THRESHOLD = 8;

// The person using the app. They have been to Vietnam, so they have a stamp of
// their own to answer with, and they are going to Thailand in October.
export const ME = {
  name: "Priya Sharma",
  city: "Mumbai",
  stamp: { destination: "Vietnam", month: "August 2026" },
};

export const DESTINATIONS = {
  thailand: {
    id: "thailand",
    booked: true,
    name: "Thailand",
    month: "October 2026",
    tripId: "trip-1",
    hero: "/lab-locations/thailand-railay-beach-krabi.jpg",
    // Travellers who went with us in the last three months. Real proof that
    // exists before anybody has booked for this month, which is what makes it
    // safe to lead with at launch.
    recent3m: 142,
    // The full catalogue behind the sample below. The seeded questions and
    // chat are a handful each; these are what the real counts would be.
    questionsTotal: 143,
    messagesTotal: 312,
    cohort: { state: "open", members: 19, lastActiveMins: 5 },
    about: "Most questions here are about the boat days around Phuket and Krabi, how much of Bangkok to keep for the end, and what October weather actually does. Ask anything.",
  },
  bali: {
    id: "bali",
    name: "Bali",
    month: "November 2026",
    tripId: "trip-5",
    hero: "/lab-locations/bali-kelingking-beach-viewpoint.jpg",
    recent3m: 168,
    questionsTotal: 186,
    messagesTotal: 268,
    cohort: { state: "open", members: 14, lastActiveMins: 12 },
    about: "Most questions here are about the drive times between the south and Ubud, what to pack for November, and which beach clubs are worth it. Ask anything.",
  },
  mauritius: {
    id: "mauritius",
    name: "Mauritius",
    month: "October 2026",
    tripId: "trip-4",
    hero: "/lab-locations/mauritius-le-morne-brabant.jpg",
    recent3m: 39,
    questionsTotal: 31,
    messagesTotal: 24,
    // Below the threshold, so there is no group to join yet.
    cohort: { state: "below", members: 3 },
    about: "A quieter month for Mauritius, so answers here come mostly from our team and from travellers who went earlier in the year.",
  },
  vietnam: {
    id: "vietnam",
    name: "Vietnam",
    month: "August 2026",
    tripId: "trip-3",
    hero: "/lab-locations/vietnam-ha-long-bay-cruise.jpg",
    recent3m: 74,
    questionsTotal: 88,
    messagesTotal: 190,
    // The month has been and gone, so the group is read only.
    cohort: { state: "closed", members: 11, closedOn: "31 August 2026" },
    about: "This group has wrapped up. The questions stay here for whoever travels after you.",
  },
};

// The room that is not a destination. It has no month and no group, because
// nothing in it belongs to one trip: it is the set of things that are true for
// anybody flying out of India. Open to everyone, booked or not.
DESTINATIONS.india = {
  id: "india",
  booked: true,
  everyone: true,
  name: "Travelling from India",
  short: "From India",
  about: "General questions about going abroad, whatever you booked. Anyone who has booked a trip with us can answer.",
};

export const getDest = (id) => DESTINATIONS[id] || DESTINATIONS.bali;

// A room somebody has not booked can be read but not written in.
export const canPost = (id) => !!(DESTINATIONS[id] || {}).booked;
export const isEveryone = (id) => !!(DESTINATIONS[id] || {}).everyone;

// Rooms in the order they are useful: the trip this traveller is on, then the
// room that applies whatever they booked, then everywhere else.
export const roomOrder = () => {
  const ids = Object.keys(DESTINATIONS);
  const mine = ids.filter(id => DESTINATIONS[id].booked && id !== "india");
  const rest = ids.filter(id => !DESTINATIONS[id].booked);
  return [...mine, "india", ...rest];
};

// "June 2026" becomes "Jun '26". A byline has no room for the long form and
// nobody reads it anyway.
export const shortMonth = (month) => {
  const [name, year] = String(month || "").split(" ");
  if (!name || !year) return month || "";
  return `${name.slice(0, 3)} '${year.slice(2)}`;
};

// Who is in a group. Names only: a list of strangers does not need cities,
// stamps or anything else to be worth glancing at before you post.
const ROSTER = {
  thailand: [
    "Aisha Rahman", "Gaurav Deshpande", "Farah Sheikh", "Lakshmi Ravichandran",
    "Nikhil Warrier", "Sana Kapoor", "Devika Menon", "Rehan Malik",
    "Anita Gupta", "Meghna Rao", "Yash Thakkar", "Simran Kaur",
    "Kabir Sethi", "Anjali Pillai", "Rohit Bhatia", "Shweta Fernandes",
    "Ira Chandra", "Vikram Joshi", "Tanvi Shah",
  ],
  bali: [
    "Riya Menon", "Neha Vaidya", "Sana Qureshi", "Meera Kulkarni",
    "Tara Iyer", "Ananya Bose", "Divya Shah", "Karan Batra",
    "Nandini Roy", "Aman Sethi", "Preeti Joseph", "Shruti Nair",
    "Vivek Anand", "Ritika Chopra",
  ],
  vietnam: [
    "Ishita Chandra", "Priya Sharma", "Arjun Kale", "Maya Dutta",
    "Zoya Khan", "Harsh Naidu", "Neel Varma", "Tanya Bose",
    "Rahul Iyengar", "Kavya Sequeira", "Manav Rao",
  ],
  mauritius: ["Pooja Desai", "Aditi Sen", "Nikhil Rao"],
};
export const membersOf = (dest) => ROSTER[dest] || [];

// ─── People who answer ───
// A stamp is what makes an answer worth reading, so everyone carries one.
// Who went, as counts. Advice from a party of four is not advice for somebody
// travelling alone, and advice from a party with children is different again.
// The numbers say that without labelling anybody a couple or a family.
const c = (name, city, destination, month, adults = 1, children = 0) => ({
  name, city, adults, children, stamp: { destination, month },
});
export const OPS = { name: "Sanjana Menon", ops: true };

export const PEOPLE = {
  riya: c("Riya Menon", "Pune", "Bali", "March 2026", 1),
  neha: c("Neha Vaidya", "Bengaluru", "Bali", "June 2026", 2),
  sana: c("Sana Qureshi", "Hyderabad", "Bali", "January 2026", 3),
  meera: c("Meera Kulkarni", "Delhi", "Bali", "April 2026", 2, 2),
  tara: c("Tara Iyer", "Chennai", "Bali", "July 2026", 1),
  ananya: c("Ananya Bose", "Kolkata", "Bali", "February 2026", 2),
  divya: c("Divya Shah", "Ahmedabad", "Bali", "May 2026", 3),
  ishita: c("Ishita Chandra", "Jaipur", "Vietnam", "May 2026", 2),
  pooja: c("Pooja Desai", "Surat", "Mauritius", "March 2026", 1),
  aisha: c("Aisha Rahman", "Mumbai", "Thailand", "February 2026", 3),
  gaurav: c("Gaurav Deshpande", "Pune", "Thailand", "June 2026", 2, 1),
  lakshmi: c("Lakshmi Ravichandran", "Chennai", "Thailand", "December 2025", 2),
  farah: c("Farah Sheikh", "Bengaluru", "Thailand", "April 2026", 1),
};

// ─── Questions ───
// `answers` are in posting order. There is no accepted or solved state: a
// thread is a conversation, not a ticket.
// `quotes` on an answer points at what it is replying to.

export const QUESTIONS = [
  // ── Travelling from India: true whatever you booked ──
  // Every one of these carries an answer from the team, because these have
  // right answers rather than opinions. What travellers add underneath is what
  // actually happened at the desk, which is a different kind of useful.
  {
    id: "in1", tags: ["Visas"], dest: "india",
    title: "Is Thailand really visa free for an Indian passport right now?",
    body: "We keep reading different things and our travel dates are in October.",
    author: PEOPLE.aisha, minsAgo: 130,
    answers: [
      { id: "in1a", author: OPS, minsAgo: 120,
        body: "Yes. Indian passport holders can enter Thailand without a visa for stays up to 60 days. You still need a passport valid for six months, a return ticket and proof of where you are staying, and the officer can ask for funds. We send all three in your trip pack before you fly.",
        likes: 41 },
      { id: "in1b", author: PEOPLE.gaurav, minsAgo: 80,
        body: "Nobody asked us for anything beyond the passport and the return ticket at Bangkok. Took about twenty minutes.", likes: 12 },
      { id: "in1c", author: PEOPLE.farah, minsAgo: 40,
        body: "We were asked for the hotel booking at Phuket. Had it on the phone, that was enough.", likes: 9 },
    ],
  },
  {
    id: "in2", tags: ["Passport"], dest: "india",
    title: "How much passport validity do we actually need?",
    body: "Mine runs out five months after we come back and I do not want to renew if I do not have to.",
    author: PEOPLE.lakshmi, minsAgo: 400,
    answers: [
      { id: "in2a", author: OPS, minsAgo: 380,
        body: "Six months from the date you enter, not from the date you come back. Five months will be refused at check-in in Delhi or Mumbai, before you ever reach the destination. If yours is inside six months, renew before you book anything.",
        likes: 55 },
      { id: "in2b", author: PEOPLE.gaurav, minsAgo: 300,
        body: "Tatkal took us nine days including the police check. Do not leave it to the last month.", likes: 18 },
    ],
  },
  {
    id: "in3", tags: ["Forex"], dest: "india",
    title: "Forex card or just use our regular debit card abroad?",
    body: "Trying to work out what is cheaper for a week of small spends.",
    author: PEOPLE.gaurav, minsAgo: 900,
    answers: [
      { id: "in3a", author: OPS, minsAgo: 880,
        body: "A forex card locks the rate and avoids the markup your bank adds on every swipe, so it wins for anything you plan to spend. Keep one regular card as a backup for deposits at hotels. Carry a small amount of cash for the first day, because the airport rate is always the worst one you will see.",
        likes: 33 },
      { id: "in3b", author: PEOPLE.aisha, minsAgo: 700,
        body: "We loaded the forex card and used cash for boats and markets. Barely touched the bank card.", likes: 14 },
      { id: "in3c", author: PEOPLE.farah, minsAgo: 500,
        body: "Watch the ATM fee at the other end. Withdrawing in two big amounts cost us far less than five small ones.", likes: 21 },
    ],
  },
  {
    id: "in4", tags: ["Immigration"], dest: "india",
    title: "What actually happens at the immigration desk on the way out?",
    body: "First international trip and I have no idea what to expect at Delhi.",
    author: PEOPLE.farah, minsAgo: 1500,
    answers: [
      { id: "in4a", author: OPS, minsAgo: 1450,
        body: "Emigration at the Indian end takes your passport and boarding pass, stamps it and asks where you are going. That is usually the whole conversation. There is no departure form any more. Reach the airport three hours before an international flight and the queue is the only thing that will cost you time.",
        likes: 29 },
      { id: "in4b", author: PEOPLE.lakshmi, minsAgo: 1200,
        body: "Nobody asked us a single question on the way out. The queue at T3 was the long bit.", likes: 7 },
    ],
  },
  {
    id: "in5", tags: ["Insurance"], dest: "india",
    title: "Is travel insurance worth it for a week in Southeast Asia?",
    body: "It feels like an extra cost for a short trip.",
    author: PEOPLE.aisha, minsAgo: 2600,
    answers: [
      { id: "in5a", author: OPS, minsAgo: 2500,
        body: "For a week it costs less than one airport meal a day and it covers the two things that actually go wrong: a hospital visit and a cancelled leg. A scooter accident abroad is the common one and it is not cheap. Every 30 Sundays trip includes cover, so check what you already have before buying a second policy.",
        likes: 26 },
      { id: "in5b", author: PEOPLE.gaurav, minsAgo: 2000,
        body: "Used ours for a stomach bug in Krabi. Clinic bill came back in about three weeks.", likes: 16 },
    ],
  },
  {
    id: "in6", tags: ["Flying"], dest: "india",
    title: "Do we need to collect our bags on a layover?",
    body: "One stop each way and the booking does not say.",
    author: PEOPLE.lakshmi, minsAgo: 4000,
    answers: [
      { id: "in6a", author: OPS, minsAgo: 3900,
        body: "On a single ticket your bags are checked through to the final airport and you stay inside the terminal. On two separate tickets you have to collect them, clear immigration and check in again, which needs at least four hours. Your itinerary says which one you are on, and we only book through fares unless you asked otherwise.",
        likes: 31 },
    ],
  },
  // ── Thailand: October 2026, the trip on /trips/trip-1 ──
  {
    id: "t1", tags: ["Boats"], dest: "thailand",
    title: "Phi Phi or Phang Nga if we only want one boat day?",
    body: "Our Phuket leg has room for one full day on the water and we cannot pick. We would rather have a calm day than a packed one.",
    author: PEOPLE.aisha, minsAgo: 14,
    answers: [
      { id: "t1a", author: PEOPLE.gaurav, minsAgo: 11,
        body: "Phang Nga was the calmer of the two for us. Phi Phi is prettier but there are a lot more boats in the same bay.", likes: 6 },
      { id: "t1b", author: OPS, minsAgo: 9,
        body: "For one day we would send you to Phang Nga on a longtail rather than a speedboat. Less time in the sun, fewer stops, and the sea inside the bay stays flat. Keep Phi Phi for the Krabi leg instead, you are much closer to it from Railay and the crossing is shorter.",
        likes: 24 },
      { id: "t1c", author: PEOPLE.farah, minsAgo: 6,
        body: "We did exactly this split and it worked. Two short water days felt much better than one long one.",
        quotes: { author: OPS, text: "Keep Phi Phi for the Krabi leg instead" },
        likes: 8 },
    ],
  },
  {
    id: "t2", tags: ["Weather"], dest: "thailand",
    title: "Is October still rainy in Phuket?",
    body: "Every forecast we look at shows rain for the whole week and it is making us nervous about the beach days.",
    author: PEOPLE.farah, minsAgo: 90,
    answers: [
      { id: "t2a", author: OPS, minsAgo: 70,
        body: "October is the tail end of the wet season on the west coast. In practice that means bright mornings and a heavy hour in the late afternoon, not washed out days. Boat days get decided the evening before, and if the sea is rough we move the day rather than cancel it.",
        likes: 17 },
      { id: "t2b", author: PEOPLE.lakshmi, minsAgo: 45,
        body: "We went in December so slightly different, but everyone we met in October said the same thing. Mornings were fine.", likes: 4 },
      { id: "t2c", author: PEOPLE.aisha, minsAgo: 20,
        body: "Pack one light rain jacket each and stop watching the ten day forecast. It changes every morning anyway.", likes: 9 },
    ],
  },
  {
    id: "t3", tags: ["Cities"], dest: "thailand",
    title: "Two nights in Bangkok at the end, is that enough?",
    body: "We land back in Bangkok from Krabi and have two nights before flying home. Worried we will feel rushed.",
    author: PEOPLE.gaurav, minsAgo: 300,
    answers: [
      { id: "t3a", author: OPS, minsAgo: 260,
        body: "Two nights is the right amount after a week of beaches. Keep the first evening for the river and Wat Arun at sunset, and the second day for one market and one rooftop. Trying to add the palace as well is what makes people feel rushed.",
        likes: 21 },
      { id: "t3b", author: PEOPLE.aisha, minsAgo: 180,
        body: "Agree. We skipped the Grand Palace and did not miss it. The river boat at sunset was the best hour of our whole trip.", likes: 12 },
    ],
  },
  {
    id: "t4", tags: ["Boats"], dest: "thailand",
    title: "Railay: is the boat the only way in?",
    body: "We have two nights there and someone told us there is no road. Is that right?",
    author: PEOPLE.lakshmi, minsAgo: 800,
    answers: [
      { id: "t4a", author: PEOPLE.farah, minsAgo: 700,
        body: "Yes, longtail only, about fifteen minutes from Ao Nang. It sounds like a hassle and then it turns out to be the nicest part.", likes: 10 },
      { id: "t4b", author: OPS, minsAgo: 640,
        body: "Longtail is the only way in and your transfer covers it both ways. One thing worth knowing: they wait until the boat is full, so allow a little time on the morning you check out.",
        likes: 14 },
    ],
  },
  {
    id: "t5", tags: ["Money"], dest: "thailand",
    title: "How much cash should we carry for the islands?",
    body: "Trying to work out what to change before we fly.",
    author: PEOPLE.aisha, minsAgo: 1900,
    answers: [
      { id: "t5a", author: PEOPLE.gaurav, minsAgo: 1700,
        body: "Cards everywhere in the hotels and bigger restaurants. Cash for longtails, markets and tipping. We used a lot less than we expected.", likes: 7 },
    ],
  },
  {
    id: "t6", tags: ["Transport"], dest: "thailand",
    title: "Anything we should know about the Phuket to Krabi transfer?",
    body: "Ours is by road. Is the ferry better?",
    author: PEOPLE.farah, minsAgo: 4200,
    answers: [],
  },
  {
    id: "t7", tags: ["Food"], dest: "thailand",
    title: "Worth doing a Thai cooking class or is it a tourist thing?",
    body: "We have a free afternoon in Krabi and are tempted.",
    author: PEOPLE.lakshmi, minsAgo: 9000,
    answers: [
      { id: "t7a", author: PEOPLE.aisha, minsAgo: 8600,
        body: "Do the one that starts at the market. The cooking is fine, the market hour is what you will remember.", likes: 11 },
    ],
  },

  {
    id: "q1", tags: ["Transport"], dest: "bali",
    title: "How bad is the drive from the airport to Ubud in the evening?",
    body: "We land at 7pm and our first two nights are in Ubud. Should we just stay near the airport the first night instead? We would rather not spend the first evening stuck in a car.",
    author: PEOPLE.riya, minsAgo: 8,
    answers: [
      { id: "a1", author: PEOPLE.neha, minsAgo: 6,
        body: "It took us close to three hours on a Friday evening. Worth knowing before you book.", likes: 4 },
      { id: "a2", author: OPS, minsAgo: 5,
        body: "Ninety minutes on a good day, and closer to two and a half hours on a Friday or Saturday evening. For a 7pm landing we usually put people in Seminyak for the first night and move them to Ubud after breakfast, so the trip starts rested. Tell your consultant and they will shift it at no cost.",
        likes: 22 },
      { id: "a3", author: PEOPLE.sana, minsAgo: 4,
        body: "We did exactly this and it was the right call. Ubud in the morning light is much nicer as a first impression anyway.",
        quotes: { author: OPS, text: "we usually put people in Seminyak for the first night and move them to Ubud after breakfast" },
        likes: 9 },
    ],
  },
  {
    id: "q2", tags: ["Weather"], dest: "bali",
    title: "Is November too wet for the beach clubs?",
    body: "Everything we read says November is the start of the rains. Are the beach days still worth planning for, or should we build the trip around indoor things?",
    author: PEOPLE.meera, minsAgo: 64,
    answers: [
      { id: "b1", author: PEOPLE.tara, minsAgo: 52,
        body: "We were there in July so not quite the same, but everyone we met who went in November said mornings were clear and the rain came in short bursts after 3pm.", likes: 6 },
      { id: "b2", author: OPS, minsAgo: 40,
        body: "November averages around twelve rainy days, and the rain tends to be heavy for an hour rather than all day. Plan the beach for mornings and keep the afternoons loose. Every beach club we work with has covered seating, so a shower does not end the day.",
        likes: 18 },
      { id: "b3", author: PEOPLE.divya, minsAgo: 30,
        body: "Add a light rain jacket each and you will barely notice it. We got caught out and ended up buying ponchos at three times the price.", likes: 7 },
      { id: "b4", author: PEOPLE.ananya, minsAgo: 22,
        body: "Agree with the mornings point. We shifted our Nusa Penida day trip to the earliest slot and it made all the difference, the sea was much calmer.",
        quotes: { author: OPS, text: "Plan the beach for mornings and keep the afternoons loose." },
        likes: 11 },
      { id: "b5", author: PEOPLE.neha, minsAgo: 14,
        body: "One more thing. The infinity pool photos everyone wants come out better under cloud than in harsh sun, so a grey afternoon is not a lost one.", likes: 5 },
    ],
  },
  {
    id: "q3", tags: ["Money"], dest: "bali",
    title: "Do we need to carry cash or is card accepted everywhere?",
    body: "Trying to work out how much we should change before we fly out.",
    author: PEOPLE.ananya, minsAgo: 170,
    answers: [
      { id: "c1", author: PEOPLE.sana, minsAgo: 150,
        body: "Cards worked at every hotel and restaurant. We only needed cash for the small warungs and for tipping the driver.", likes: 8 },
      { id: "c2", author: OPS, minsAgo: 120,
        body: "Carry the equivalent of about fifteen thousand rupees in rupiah per person for the first two days, then withdraw as you go. Cards are accepted nearly everywhere you will be. Avoid the airport counters, the rate is noticeably worse.",
        likes: 26 },
    ],
  },
  {
    id: "q4", tags: ["Stays"], dest: "bali",
    title: "Which side of the island for the last two nights?",
    body: "We have two nights left over at the end and cannot decide between Uluwatu and Seminyak. We like quiet evenings more than nightlife.",
    author: PEOPLE.tara, minsAgo: 320,
    answers: [
      { id: "d1", author: PEOPLE.riya, minsAgo: 280,
        body: "Uluwatu, easily, if quiet is what you are after. Seminyak is livelier and you are closer to the airport, which only matters on the last morning.", likes: 12 },
      { id: "d2", author: PEOPLE.divya, minsAgo: 200,
        body: "We did Uluwatu and the clifftop sunsets were the thing we both talk about most.", likes: 9 },
    ],
  },
  {
    id: "q5", tags: ["Boats"], dest: "bali",
    title: "Is the Nusa Penida day trip worth the early start?",
    body: "Our itinerary has a 5am pickup for it. We are not naturally early risers.",
    author: PEOPLE.divya, minsAgo: 700,
    answers: [
      { id: "e1", author: PEOPLE.meera, minsAgo: 620,
        body: "Yes. The early boat is calmer and you get Kelingking before the crowds. We went back to the hotel and slept in the afternoon, which worked out fine.", likes: 15 },
      { id: "e2", author: OPS, minsAgo: 540,
        body: "The early crossing is also the safest one in November, when the afternoon swell picks up. If either of you gets seasick, take something thirty minutes before boarding.",
        likes: 13 },
    ],
  },
  {
    id: "q6", tags: ["Activities"], dest: "bali",
    title: "Can we do a private beach dinner without it feeling staged?",
    body: "We have one night we would like to make a bit special, but the photos we have seen look staged.",
    author: PEOPLE.neha, minsAgo: 1500,
    answers: [
      { id: "f1", author: PEOPLE.ananya, minsAgo: 1400,
        body: "Ask for the simple setup rather than the full one. We did ours at Jimbaran with just lanterns and no flower arch and it was lovely.", likes: 10 },
    ],
  },
  {
    id: "q7", tags: ["Transport"], dest: "bali",
    title: "How much should we budget for a driver for the day?",
    body: "We would rather keep one driver for the whole day than book cars each time.",
    author: PEOPLE.sana, minsAgo: 2600,
    answers: [],
  },
  {
    id: "q8", tags: ["Visas"], dest: "bali",
    title: "Any tips for the visa on arrival queue?",
    body: "We have read it can take a while. Is there anything we can do before we fly to make it quicker?",
    author: PEOPLE.meera, minsAgo: 4300,
    answers: [],
  },
  {
    id: "q9", tags: ["Activities"], dest: "bali",
    title: "Are the rice terrace swings actually worth doing?",
    body: "They are on our itinerary but we are wondering whether to swap them for something else.",
    author: PEOPLE.riya, minsAgo: 7000,
    answers: [
      { id: "g1", author: PEOPLE.tara, minsAgo: 6800,
        body: "We skipped the swings and did a walk through the terraces instead. Quieter, and we got better photos with nobody else in them.", likes: 14 },
    ],
  },

  // ── Thailand, the rest of the catalogue ──
  // Shorter entries, the long tail a real destination accumulates. They give
  // the feed something to page through, and most of them carry no answer yet,
  // which is what an honest young room looks like.
  { id: "t8", tags: ["Temples", "Cities"], dest: "thailand", title: "Is the Grand Palace worth half a day?",
    body: "We have one full day in Bangkok and everything says to go.", author: PEOPLE.aisha, minsAgo: 11000,
    answers: [{ id: "t8a", author: OPS, minsAgo: 10800, body: "Only if temples are your thing. Go at opening or not at all, and cover shoulders and knees or you will be turned away at the gate.", likes: 9 }] },
  { id: "t9", tags: ["Packing"], dest: "thailand", title: "Do we need a plug adaptor?",
    body: "", author: PEOPLE.gaurav, minsAgo: 12500,
    answers: [{ id: "t9a", author: PEOPLE.farah, minsAgo: 12400, body: "Indian round pins fit most sockets there. We carried one universal adaptor between us and never needed it.", likes: 5 }] },
  { id: "t10", tags: ["Transport"], dest: "thailand", title: "How early should we get to Phuket airport for a domestic flight?",
    body: "Flying Phuket to Bangkok on the last day.", author: PEOPLE.lakshmi, minsAgo: 14000, answers: [] },
  { id: "t11", tags: ["Food"], dest: "thailand", title: "Are the street food stalls safe to eat at?",
    body: "Neither of us has a strong stomach and we do not want to lose a day to it.", author: PEOPLE.farah, minsAgo: 16000,
    answers: [{ id: "t11a", author: OPS, minsAgo: 15800, body: "Eat where there is a queue and where the food is cooked in front of you. Skip anything pre-cut and sitting out. Every consultant here eats on the street when they travel.", likes: 21 },
              { id: "t11b", author: PEOPLE.aisha, minsAgo: 15600, body: "Carry a strip of whatever your doctor recommends and you will almost certainly not need it.", likes: 6 }] },
  { id: "t12", tags: ["Weather"], dest: "thailand", title: "Can we swim at Patong or is it too rough in October?",
    body: "", author: PEOPLE.gaurav, minsAgo: 18000, answers: [] },
  { id: "t13", tags: ["Packing"], dest: "thailand", title: "Is a SIM card easy to get at the airport?",
    body: "Or should we sort an eSIM before flying?", author: PEOPLE.aisha, minsAgo: 20000,
    answers: [{ id: "t13a", author: PEOPLE.lakshmi, minsAgo: 19800, body: "Counters right after baggage claim, about ten minutes. An eSIM is easier if your phone takes one.", likes: 8 }] },
  { id: "t14", tags: ["Money"], dest: "thailand", title: "How much do we tip in Thailand?",
    body: "We never know and end up over tipping everywhere.", author: PEOPLE.lakshmi, minsAgo: 23000,
    answers: [{ id: "t14a", author: OPS, minsAgo: 22800, body: "Not expected, and welcome. Round up a taxi fare, twenty to fifty baht for a porter, and a little more for a driver who has had you all day.", likes: 14 }] },
  { id: "t15", tags: ["Boats"], dest: "thailand", title: "Is the Maya Bay trip still allowed?",
    body: "I read it was closed for a few years.", author: PEOPLE.farah, minsAgo: 26000,
    answers: [{ id: "t15a", author: OPS, minsAgo: 25800, body: "Open again, with limits. No swimming in the bay itself and boats moor at the back, so you walk in. Still worth the early slot.", likes: 11 }] },
  { id: "t16", tags: ["Food"], dest: "thailand", title: "Any good vegetarian food in Phuket?",
    body: "One of us does not eat meat or fish at all.", author: PEOPLE.gaurav, minsAgo: 29000, answers: [] },
  { id: "t17", tags: ["Stays"], dest: "thailand", title: "Is it worth upgrading to a pool villa?",
    body: "The upgrade is about eight thousand a night.", author: PEOPLE.aisha, minsAgo: 33000,
    answers: [{ id: "t17a", author: PEOPLE.lakshmi, minsAgo: 32800, body: "We did it for two of our seven nights rather than all seven, and that felt like the right amount.", likes: 12 }] },
  { id: "t18", tags: ["Transport"], dest: "thailand", title: "How long is the drive from Krabi airport to Ao Nang?",
    body: "", author: PEOPLE.lakshmi, minsAgo: 36000,
    answers: [{ id: "t18a", author: PEOPLE.farah, minsAgo: 35900, body: "About forty minutes, and the transfer was waiting when we landed.", likes: 4 }] },
  { id: "t19", tags: ["Activities"], dest: "thailand", title: "Do the elephant sanctuaries treat the animals well?",
    body: "We would rather skip it than support something cruel.", author: PEOPLE.farah, minsAgo: 40000,
    answers: [{ id: "t19a", author: OPS, minsAgo: 39800, body: "The ones we book are no riding, no bathing, no performing. If a place offers rides, that is the answer to your question. Ask your consultant for the name before you book anything independently.", likes: 27 }] },
  { id: "t20", tags: ["Temples", "Packing"], dest: "thailand", title: "Is there a dress code for temples?",
    body: "", author: PEOPLE.aisha, minsAgo: 44000,
    answers: [{ id: "t20a", author: PEOPLE.gaurav, minsAgo: 43900, body: "Shoulders and knees covered for everyone. A scarf in the day bag solves it.", likes: 9 }] },
  { id: "t21", tags: ["Transport", "Cities"], dest: "thailand", title: "Best way to get around Bangkok?",
    body: "Traffic looks frightening in every video we watch.", author: PEOPLE.gaurav, minsAgo: 48000,
    answers: [{ id: "t21a", author: PEOPLE.aisha, minsAgo: 47800, body: "Skytrain wherever it goes, boat along the river, and taxis only late at night.", likes: 15 }] },
  { id: "t22", tags: ["Boats"], dest: "thailand", title: "Can we do a day trip to James Bond island from Krabi?",
    body: "", author: PEOPLE.lakshmi, minsAgo: 52000, answers: [] },
  { id: "t23", tags: ["Packing"], dest: "thailand", title: "How bad are the mosquitoes?",
    body: "Asking for someone who gets bitten by everything.", author: PEOPLE.farah, minsAgo: 57000,
    answers: [{ id: "t23a", author: PEOPLE.lakshmi, minsAgo: 56800, body: "Worse at dusk near the water. Repellent in the bag and long sleeves at dinner and it was fine.", likes: 7 }] },
  { id: "t24", tags: ["Cities"], dest: "thailand", title: "Is Chiang Mai worth adding for two nights?",
    body: "We have a week and are already doing Phuket, Krabi and Bangkok.", author: PEOPLE.aisha, minsAgo: 62000,
    answers: [{ id: "t24a", author: OPS, minsAgo: 61800, body: "Not in a week. You would spend most of those two nights getting there and back. It is a trip of its own.", likes: 18 }] },
  { id: "t25", tags: ["Money"], dest: "thailand", title: "Do we need travel insurance for the boat days?",
    body: "", author: PEOPLE.gaurav, minsAgo: 68000, answers: [] },
  { id: "t26", tags: ["Money"], dest: "thailand", title: "Are there ATMs on the islands?",
    body: "Thinking about Phi Phi and Railay specifically.", author: PEOPLE.lakshmi, minsAgo: 74000,
    answers: [{ id: "t26a", author: PEOPLE.farah, minsAgo: 73900, body: "Yes, but the fees are high. Take what you need with you.", likes: 6 }] },
  { id: "t27", tags: ["Packing"], dest: "thailand", title: "What is the one thing you wish you had packed?",
    body: "", author: PEOPLE.farah, minsAgo: 82000,
    answers: [{ id: "t27a", author: PEOPLE.aisha, minsAgo: 81800, body: "Reef safe sunscreen. Everything on the islands costs three times what it does at home.", likes: 13 },
              { id: "t27b", author: PEOPLE.gaurav, minsAgo: 81000, body: "A dry bag. Every boat day soaks something.", likes: 10 }] },

  // ── Mauritius: below the cohort threshold, so Q&A only ──
  {
    id: "m1", tags: ["Weather"], dest: "mauritius",
    title: "Is October a good month for the south coast?",
    body: "We are told the wind picks up. Does that spoil the beach days?",
    author: PEOPLE.pooja, minsAgo: 180,
    answers: [
      { id: "m1a", author: OPS, minsAgo: 140,
        body: "October is one of the better months. The wind is what makes Le Morne good for kitesurfing, but the east and north stay sheltered. We would keep your beach days on the north coast and use the south for the drives and the viewpoints.",
        likes: 7 },
    ],
  },
  {
    id: "m2", tags: ["Boats"], dest: "mauritius",
    title: "Do we need to book the catamaran in advance?",
    body: "Or is it something we can decide on the day once we see the weather?",
    author: PEOPLE.pooja, minsAgo: 900,
    answers: [],
  },

  // ── Vietnam: already travelled, kept for whoever comes after ──
  {
    id: "v1", tags: ["Boats"], dest: "vietnam",
    title: "Is one night on the Ha Long cruise enough?",
    body: "We are deciding between one night and two.",
    author: PEOPLE.ishita, minsAgo: 40000,
    answers: [
      { id: "v1a", author: OPS, minsAgo: 39000,
        body: "One night suits most people. The second night adds a quieter bay and a kayak morning, so take it if you want slow rather than more.",
        likes: 19 },
      { id: "v1b", author: PEOPLE.ishita, minsAgo: 20000,
        body: "We went with one and did not regret it. By the second morning we were ready to be back on land.", likes: 6 },
    ],
  },
];

export const questionsFor = (dest) => QUESTIONS.filter(q => q.dest === dest);

// Every subject in use, in the order a traveller would meet them.
export const TAG_ORDER = [
  "Visas", "Passport", "Immigration", "Forex", "Insurance", "Flying",
  "Weather", "Boats", "Transport", "Money", "Food", "Stays",
  "Packing", "Temples", "Activities", "Cities",
];

// The subject a new question gets. In the product this is the model reading
// the question as it is posted; here it is the same job done with words, so
// the flow can be built and tested without a key. Either way the asker never
// picks a subject, and every card is guaranteed to have one.
const TAG_WORDS = {
  Visas: ["visa", "e-visa", "voa", "visa-free", "entry permit"],
  Passport: ["passport", "renew", "validity", "blank page", "ecr"],
  Immigration: ["immigration", "customs", "arrival card", "green channel", "deport", "officer"],
  Forex: ["forex", "currency", "exchange", "atm", "card", "upi", "rupee", "baht", "cash"],
  Insurance: ["insurance", "claim", "medical cover", "policy"],
  Flying: ["flight", "layover", "transit", "baggage", "check-in", "airline", "seat"],
  Weather: ["rain", "weather", "monsoon", "humid", "storm", "season", "temperature"],
  Boats: ["boat", "ferry", "longtail", "speedboat", "island hop", "sea", "crossing"],
  Transport: ["transfer", "taxi", "grab", "drive", "airport", "train", "scooter"],
  Money: ["budget", "cost", "price", "tip", "expensive", "spend"],
  Food: ["food", "eat", "restaurant", "vegetarian", "vegan", "breakfast", "street food"],
  Stays: ["hotel", "resort", "villa", "room", "stay", "check out"],
  Packing: ["pack", "clothes", "adaptor", "plug", "sunscreen", "shoes", "luggage"],
  Temples: ["temple", "palace", "shrine", "dress code", "modest"],
  Activities: ["snorkel", "dive", "class", "cooking", "trek", "spa", "massage"],
  Cities: ["bangkok", "phuket", "krabi", "ubud", "hanoi", "city", "nights in"],
};

// Only the subjects that room uses are candidates. Cash in Thailand is Money;
// cash in the India room is Forex. Without this the same words pull a question
// into a subject its own room does not even have a chip for.
export const INDIA_TAGS = ["Visas", "Passport", "Immigration", "Forex", "Insurance", "Flying"];
const TRIP_TAGS = TAG_ORDER.filter(t => !INDIA_TAGS.includes(t));

export function tagForPost(text, dest) {
  const t = String(text || "").toLowerCase();
  const candidates = dest === "india" ? INDIA_TAGS : TRIP_TAGS;
  let best = null;
  let hits = 0;
  candidates.forEach(tag => {
    const n = (TAG_WORDS[tag] || []).filter(w => t.includes(w)).length;
    if (n > hits) { hits = n; best = tag; }
  });
  // Nothing matched, so it goes where a question with no obvious subject
  // belongs rather than to no subject at all.
  return best || (dest === "india" ? "Visas" : "Transport");
}
export const tagsFor = (dest) => {
  const used = new Set();
  questionsFor(dest).forEach(q => (q.tags || []).forEach(t => used.add(t)));
  return TAG_ORDER.filter(t => used.has(t));
};

// Why a post was reported. The wording is what the reporter sees, so it has to
// be plain rather than legal.
export const REPORT_REASONS = [
  ["off-topic", "Not about the trip", "It has nothing to do with the destination or the plan."],
  ["contact", "Contact details or selling", "A phone number, a handle, or somebody touting for business."],
  ["wrong", "Wrong or misleading", "The advice in it is not true and could cost somebody."],
  ["unkind", "Unkind or personal", "Aimed at a person rather than the question."],
  ["other", "Something else", "Tell us in your own words."],
];
export const findQuestion = (id) => QUESTIONS.find(q => q.id === id);

// ─── Pinned rows, always the first two in the feed ───
export const GUIDELINES = [
  ["Keep it about the trip", "Questions and answers about the destination, the plan, and what to expect. That is what everyone came here for."],
  ["Say where and when you went", "Every answer carries the month you travelled and who you went with. It is the reason people trust what you write, so keep it honest."],
  ["No phone numbers or handles", "Keep contact details out of posts. If you need our team, your consultant is one tap away in your trip."],
  ["Nothing for sale", "No selling, reselling, or promoting anything, including your own trip dates or bookings."],
  ["Be kind about other people's plans", "Everyone wants a different holiday. Answer the question that was asked, and leave the rest."],
];

// ─── Cohort chat ───
export const CHAT = [
  { id: "ch1", author: OPS, minsAgo: 8600, checkpoint: true,
    title: "Visas, six weeks out",
    text: "A quick one for everyone. Visa on arrival is fine for all of you, but every passport in your booking needs six months left on it from 1 November. Have a look tonight and message your consultant if anyone is close." },
  { id: "ch2", author: PEOPLE.riya, minsAgo: 8300,
    text: "Checked ours, all good until 2029. Thanks for the nudge." },
  { id: "ch3", author: PEOPLE.neha, minsAgo: 8100,
    text: "Mine expires in March. Getting it renewed this week, glad this came up now and not in October." },
  { id: "ch4", author: PEOPLE.meera, minsAgo: 6000,
    text: "Is anyone else landing on the 4th? We are on the early flight and would love to know who else is around." },
  { id: "ch5", author: PEOPLE.tara, minsAgo: 5900,
    text: "We land on the 4th too, in the evening. Two nights in Seminyak first." },
  { id: "ch6", author: PEOPLE.ananya, minsAgo: 5400,
    text: "We are the 6th. Doing Ubud first and then south." },
  { id: "ch7", author: OPS, minsAgo: 4300, checkpoint: true,
    title: "What November actually looks like",
    text: "Weather note for the group. Expect clear mornings and short heavy showers in the late afternoon, around twelve days of rain across the month. Pack a light rain jacket and keep afternoons flexible. None of your booked activities get cancelled for rain, and if the sea is rough on a boat day we move it and tell you the night before." },
  { id: "ch8", author: PEOPLE.divya, minsAgo: 4100,
    text: "This is useful. We were about to pack for pure sunshine." },
  { id: "ch9", author: PEOPLE.sana, minsAgo: 3400,
    text: "Has anyone done the cooking class in Ubud? Deciding whether to add it." },
  { id: "ch10", author: PEOPLE.riya, minsAgo: 3200,
    text: "We did it in March. Go for the morning one, you shop at the market first and that is the best part of it." },
  { id: "ch11", author: PEOPLE.meera, minsAgo: 1500,
    text: "Random, but does anyone know if the beach clubs need booking ahead in November?" },
  { id: "ch12", author: PEOPLE.tara, minsAgo: 900,
    text: "We booked two days ahead and that was plenty. Weekends fill up faster." },
  { id: "ch13", author: PEOPLE.neha, minsAgo: 240,
    text: "Passport renewed, appointment done. See you all in November." },
  { id: "ch14", author: PEOPLE.ananya, minsAgo: 120,
    text: "Starting a note of everything from this group so we do not lose it. Happy to share it closer to the date." },
  { id: "ch15", author: PEOPLE.divya, minsAgo: 12,
    text: "Yes please. Ours is a mess of screenshots at the moment." },
];

// The Thailand group, October 2026. Same shape as the Bali one.
export const THAILAND_CHAT = [
  { id: "th1", author: OPS, minsAgo: 7200, checkpoint: true,
    title: "Visas, five weeks out",
    text: "One for everyone. The Thailand e-Visa is already on your trip, so there is nothing to queue for at the airport. Every passport in your booking needs six months left on it from 24 October. Have a look tonight and message your consultant if anyone is close." },
  { id: "th2", author: PEOPLE.aisha, minsAgo: 7000,
    text: "Checked, both fine until 2031. That e-Visa saved us a whole morning last time." },
  { id: "th3", author: PEOPLE.gaurav, minsAgo: 6400,
    text: "Is anyone else landing in Phuket on the 24th? We are on the morning flight." },
  { id: "th4", author: PEOPLE.farah, minsAgo: 6100,
    text: "We land that evening. Three nights in Phuket first, then Krabi." },
  { id: "th5", author: PEOPLE.lakshmi, minsAgo: 5200,
    text: "Same route for us, just a day behind. Happy to swap notes on the boat days." },
  { id: "th6", author: OPS, minsAgo: 4000, checkpoint: true,
    title: "What late October actually looks like",
    text: "Weather note for the group. Expect clear mornings, and a heavy hour most afternoons on the west coast. Around nine rainy days across the month, and almost none of it all day. Boat days are confirmed the evening before, and if the sea is rough we move the day rather than cancel it." },
  { id: "th7", author: PEOPLE.farah, minsAgo: 3800,
    text: "Good to know. We were about to cancel our Phi Phi day off the back of a forecast." },
  { id: "th8", author: PEOPLE.aisha, minsAgo: 2600,
    text: "Has anyone done Railay before? Wondering how much to pack into a day bag for the boat." },
  { id: "th9", author: PEOPLE.lakshmi, minsAgo: 2400,
    text: "Keep it light and waterproof. You step into ankle deep water getting off the longtail, every time." },
  { id: "th10", author: PEOPLE.gaurav, minsAgo: 1200,
    text: "Random question, do the Bangkok rooftops need booking ahead on a weekend?" },
  { id: "th11", author: PEOPLE.aisha, minsAgo: 900,
    text: "A day or two ahead was enough for us. Friday and Saturday fill up first." },
  { id: "th12", author: PEOPLE.farah, minsAgo: 15,
    text: "Starting a shared note with everything from this group. Will share it closer to the date." },
];

// The group each destination reads from. A destination with no entry here has
// no group yet, which is the Mauritius case.
export const CHAT_BY_DEST = { bali: CHAT, thailand: THAILAND_CHAT };

// ─── Moderation ───
// First offence explains and offers an edit. Second offence blocks the post.
const RULES = [
  { id: "contact", test: /(\+?\d[\d\s-]{8,}\d)|([\w.]+@[\w.]+\.\w+)|(@[A-Za-z0-9_]{3,})|(instagram|whatsapp|telegram)/i,
    what: "It looks like there are contact details in this post.",
    why: "We keep phone numbers, emails and handles out of the feed so nobody gets messaged off the back of a question. Your consultant is one tap away inside your trip." },
  { id: "selling", test: /\b(selling|for sale|discount code|dm me|commission|book through me|cheaper rate)\b/i,
    what: "This reads as though something is being sold.",
    why: "Nothing is bought or sold here. Answers are for helping the person who asked, nothing else." },
];

export const checkPost = (text) => {
  for (const r of RULES) if (r.test.test(text || "")) return r;
  return null;
};

// ─── Time ───
export const ago = (mins) => {
  if (mins < 1) return "now";
  if (mins < 60) return `${Math.round(mins)}m`;
  if (mins < 1440) return `${Math.round(mins / 60)}h`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d`;
  return `${Math.round(mins / 43200)}mo`;
};

export const clock = (mins) => {
  const d = new Date(Date.now() - mins * 60000);
  return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

export const dayLabel = (mins) => {
  const d = new Date(Date.now() - mins * 60000);
  const days = Math.floor(mins / 1440);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export const track = (event, props) => console.log("[analytics]", event, props || "");
