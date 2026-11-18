import { destData } from "../data";

// ─── Alternate Day Plans per destination ───
// Each city has 3 vibe variants. The system picks based on day type and generates options.

export const cityVibes = {
  // Bali
  Ubud: [
    { vibe: "Culture Deep Dive", activities: ["Sacred Monkey Forest", "Tirta Empul purification", "Ubud Art Market stroll"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["White water rafting", "Tegallalang rice terrace trek", "Kintamani volcano hike"], pace: "active", activityHours: 6, travelHours: 2, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Yoga by the river", "Campuhan ridge walk", "Spa afternoon"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  Seminyak: [
    { vibe: "The Classic", activities: ["Beach club day", "Sunset cocktails", "Boutique shopping"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Foodie Trail", activities: ["Balinese cooking class", "Jimbaran seafood dinner", "Local warung hopping"], pace: "relaxed", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Culture Deep Dive", activities: ["Tanah Lot temple visit", "Kecak fire dance show", "Batik workshop"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
  ],
  Sanur: [
    { vibe: "Chill & Scenic", activities: ["Sunrise beach walk", "Cycling along coast", "Traditional market"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Snorkeling trip", "Stand-up paddleboarding", "Mangrove forest kayak"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "The Classic", activities: ["Le Mayeur Museum", "Sanur Night Market", "Beachfront spa"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "low" },
  ],
  "Nusa Dua": [
    { vibe: "Chill & Scenic", activities: ["Resort pool day", "Water blow viewpoint", "Sunset dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Jet ski & parasailing", "Glass-bottom boat", "Turtle island visit"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Culture Deep Dive", activities: ["Uluwatu temple & dance", "Garuda Wisnu Kencana park", "Jimbaran bay dinner"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
  ],
  Canggu: [
    { vibe: "Adventure Day", activities: ["Surf lesson", "Beach club party", "Tanah Lot sunset"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Brunch at cafe", "Echo Beach sunset", "Yoga session"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Foodie Trail", activities: ["Smoothie bowl trail", "Night market street food", "Cocktail masterclass"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
  ],
  Uluwatu: [
    { vibe: "The Classic", activities: ["Uluwatu temple", "Kecak dance at sunset", "Cliff-edge dinner"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Surfing at Padang Padang", "Blue Point beach", "Rock bar sunset"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Sundays Beach Club", "Private pool villa", "Sunset yoga"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  "Labuan Bajo": [
    { vibe: "Adventure Day", activities: ["Komodo dragon trek", "Pink Beach snorkeling", "Padar Island viewpoint"], pace: "active", activityHours: 7, travelHours: 3, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Island-hop by boat", "Manta Point snorkel", "Harbour sunset cruise"], pace: "relaxed", activityHours: 5, travelHours: 2, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["Rangko Cave swim", "Cunca Wulang waterfall", "Local fishing village"], pace: "balanced", activityHours: 6, travelHours: 2.5, crowdLevel: "low" },
  ],
  "Gili Trawangan": [
    { vibe: "Chill & Scenic", activities: ["Turtle snorkel at Turtle Point", "Island cycling loop", "Sunset at Sunset Point"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Three Gilis snorkel trip", "Intro scuba dive", "Stand-up paddleboarding"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "The Classic", activities: ["Beach day on the east coast", "Glass-bottom boat", "Night market dinner"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
  ],
  "Nusa Penida": [
    { vibe: "Adventure Day", activities: ["Kelingking Beach hike", "Broken Beach viewpoint", "Snorkeling with mantas"], pace: "active", activityHours: 6, travelHours: 2, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Crystal Bay beach", "Angel's Billabong", "Island sunset"], pace: "relaxed", activityHours: 4, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["Tembeling forest pool", "Peguyangan waterfall", "Local village visit"], pace: "balanced", activityHours: 5, travelHours: 2, crowdLevel: "low" },
  ],
  Sidemen: [
    { vibe: "Off the Beaten Path", activities: ["Rice terrace walk", "Silver jewelry workshop", "Village homestay cooking"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Mt Agung sunrise trek", "River tubing", "Waterfall chase"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Valley meditation", "Organic farm visit", "Sunset painting class"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  Munduk: [
    { vibe: "Off the Beaten Path", activities: ["Hidden waterfall trek", "Coffee plantation tour", "Twin lakes viewpoint"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Jungle canopy walk", "Mountain cycling", "Cliff-edge trekking"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Misty lake sunrise", "Hot springs soak", "Stargazing session"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  Amed: [
    { vibe: "Adventure Day", activities: ["Shipwreck dive", "Snorkeling coral garden", "Sunrise fishing trip"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Black sand beach", "Salt farming village", "Seaside sunset dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Culture Deep Dive", activities: ["Tirta Gangga water palace", "Lempuyang temple gates", "Local weaving class"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "low" },
  ],
  Kintamani: [
    { vibe: "Adventure Day", activities: ["Mt Batur sunrise hike", "Hot springs soak", "Coffee tasting tour"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Lake Batur viewpoint", "Organic farm lunch", "Village pottery class"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["Trunyan cemetery visit", "Lake kayaking", "Local Kintamani walk"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  Pemuteran: [
    { vibe: "Adventure Day", activities: ["Menjangan Island dive", "Coral reef snorkeling", "Mangrove kayak"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Beach relaxation", "Bio-Rock garden snorkel", "Sunset boat ride"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Culture Deep Dive", activities: ["Pulaki temple visit", "Grape vineyard tour", "Traditional dance show"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  Lovina: [
    { vibe: "The Classic", activities: ["Dolphin watching sunrise", "Hot springs visit", "Black sand beach walk"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Waterfall trekking", "Snorkeling trip", "Cycling tour"], pace: "active", activityHours: 5, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Fishing village stroll", "Spa morning", "Cliffside dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  // Vietnam
  Hanoi: [
    { vibe: "Culture Deep Dive", activities: ["Old Quarter walking tour", "Water puppet show", "Street food trail"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "high" },
    { vibe: "Foodie Trail", activities: ["Pho masterclass", "Egg coffee crawl", "Night market feast"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Off the Beaten Path", activities: ["Train Street visit", "Ceramic village tour", "West Lake cycling"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "low" },
  ],
  "Ha Long": [
    { vibe: "The Classic", activities: ["Bay cruise", "Kayaking through caves", "Floating village visit"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Rock climbing", "Deep cave exploration", "Night squid fishing"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Sunrise tai chi on deck", "Cooking class on boat", "Sunset cocktails"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  HCMC: [
    { vibe: "Culture Deep Dive", activities: ["Cu Chi Tunnels", "War Remnants Museum", "Notre-Dame Cathedral"], pace: "balanced", activityHours: 5, travelHours: 2, crowdLevel: "moderate" },
    { vibe: "Foodie Trail", activities: ["Ben Thanh market tour", "Banh mi trail", "Rooftop dining"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "The Classic", activities: ["Mekong Delta day trip", "Saigon river cruise", "Night market"], pace: "balanced", activityHours: 5, travelHours: 2, crowdLevel: "moderate" },
  ],
  "Da Nang": [
    { vibe: "The Classic", activities: ["Golden Bridge", "Marble Mountains", "My Khe Beach"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Beach morning", "Spa afternoon", "Seafood dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Son Tra Peninsula hike", "Surfing lesson", "Dragon Bridge night"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
  ],
  "Hoi An": [
    { vibe: "Culture Deep Dive", activities: ["Ancient town walk", "Lantern making class", "Japanese Bridge"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Foodie Trail", activities: ["Cooking class", "Cao Lau tasting", "Night market feast"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Off the Beaten Path", activities: ["Tra Que herb village", "Basket boat ride", "Tailor session"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "low" },
  ],
  "Phu Quoc": [
    { vibe: "Chill & Scenic", activities: ["Beach day", "Sunset fishing village", "Night market"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Snorkeling tour", "Cable car ride", "Waterfall trek"], pace: "active", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "Foodie Trail", activities: ["Fish sauce factory", "Pepper farm visit", "Seafood BBQ feast"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  "Ninh Binh": [
    { vibe: "The Classic", activities: ["Tam Coc boat ride", "Bich Dong Pagoda", "Mua Cave climb"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Off the Beaten Path", activities: ["Cycling through villages", "Thung Nham bird garden", "Local homestay dinner"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Cuc Phuong jungle trek", "Kayaking rivers", "Mountain biking"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "low" },
  ],
  "Phong Nha": [
    { vibe: "Adventure Day", activities: ["Paradise Cave", "Dark Cave zip-line & swim", "Jungle trekking"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["Abandoned highway ride", "Local farm visit", "Cave kayaking"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Chay River swim", "Village cycling", "Riverside dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  // Thailand
  Bangkok: [
    { vibe: "Culture Deep Dive", activities: ["Grand Palace & Wat Phra Kaew", "Wat Arun boat ride", "Chinatown walk"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "high" },
    { vibe: "Foodie Trail", activities: ["Street food crawl", "Floating market visit", "Thai cooking class"], pace: "relaxed", activityHours: 4, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "The Classic", activities: ["Chatuchak Weekend Market", "Rooftop bar sunset", "Tuk-tuk city tour"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "high" },
  ],
  "Chiang Mai": [
    { vibe: "Culture Deep Dive", activities: ["Doi Suthep temple", "Night Bazaar walk", "Monk chat session"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Elephant sanctuary", "Zip-lining", "Waterfall hike"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "Foodie Trail", activities: ["Khao Soi tasting", "Cooking class", "Sunday walking street"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
  ],
  "Phi Phi": [
    { vibe: "The Classic", activities: ["Maya Bay boat trip", "Phi Phi viewpoint hike", "Long Beach sunset"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "high" },
    { vibe: "Adventure Day", activities: ["Snorkel at Bamboo Island", "Kayak to Monkey Beach", "Cliff jumping"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Loh Dalum beach day", "Sunset longtail boat", "Beachfront dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "moderate" },
  ],
  Krabi: [
    { vibe: "Adventure Day", activities: ["4-island hop", "Rock climbing", "Kayaking through mangroves"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Railay Beach day", "Tiger Cave temple", "Sunset longboat ride"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Off the Beaten Path", activities: ["Emerald Pool swim", "Hot Springs dip", "Mangrove forest walk"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "low" },
  ],
  Phuket: [
    { vibe: "The Classic", activities: ["Phi Phi Island day trip", "Patong nightlife", "Big Buddha visit"], pace: "balanced", activityHours: 5, travelHours: 2, crowdLevel: "high" },
    { vibe: "Chill & Scenic", activities: ["Kata Beach day", "Old Town walk", "Sunset at Promthep Cape"], pace: "relaxed", activityHours: 3, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Snorkeling tour", "ATV ride", "Zip-line through jungle"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "moderate" },
  ],
  "Koh Samui": [
    { vibe: "Chill & Scenic", activities: ["Beach club day", "Fisherman's Village walk", "Spa retreat"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Ang Thong Marine Park", "Jungle safari", "Snorkeling trip"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "Culture Deep Dive", activities: ["Big Buddha temple", "Grandmother Rock", "Night market"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
  ],
  "Chiang Rai": [
    { vibe: "Culture Deep Dive", activities: ["White Temple", "Blue Temple", "Black House museum"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "Off the Beaten Path", activities: ["Hill tribe village visit", "Tea plantation tour", "Golden Triangle viewpoint"], pace: "balanced", activityHours: 5, travelHours: 2, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Singha Park cycling", "Hot springs visit", "Night market stroll"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  Pai: [
    { vibe: "Off the Beaten Path", activities: ["Pai Canyon sunrise", "Hot springs soak", "Bamboo bridge walk"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["White water rafting", "Waterfall jumping", "Mountain scooter ride"], pace: "active", activityHours: 5, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Yun Lai viewpoint", "Coffee shop hopping", "Night market dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  // Maldives
  Malé: [
    { vibe: "Culture Deep Dive", activities: ["Hukuru Miskiy mosque", "Fish market tour", "Local island walk"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Villingili beach", "Waterfront cafe", "City stroll"], pace: "relaxed", activityHours: 2, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Foodie Trail", activities: ["Maldivian hedhikaa tasting", "Tuna market experience", "Local cafe crawl"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "moderate" },
  ],
  Addu: [
    { vibe: "Chill & Scenic", activities: ["Overwater villa morning", "Sunset dolphin cruise", "Private beach dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Scuba diving", "Snorkeling safari", "Kayaking lagoon"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["British base ruins", "Nature trail walk", "Local island visit"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  "Baa Atoll": [
    { vibe: "Adventure Day", activities: ["Manta ray snorkeling", "Reef diving", "Sandbank picnic"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Overwater spa morning", "Lagoon swim", "Starlight dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "The Classic", activities: ["Island hopping", "Dolphin watching", "Underwater restaurant"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  "S.Ari": [
    { vibe: "Adventure Day", activities: ["Whale shark dive", "Night snorkeling", "Reef exploration"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Beach villa morning", "Infinity pool day", "Sunset cruise"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "The Classic", activities: ["Sandbank BBQ", "Dolphin cruise", "Spa afternoon"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "low" },
  ],
  Fuvahmulah: [
    { vibe: "Adventure Day", activities: ["Tiger shark dive", "Ocean swimming", "Island cycling"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["Freshwater lake visit", "Local village walk", "Fruit garden tour"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Thundi Beach morning", "Bandaara Kilhi lake", "Sunset from reef edge"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  // Sri Lanka
  Kandy: [
    { vibe: "Culture Deep Dive", activities: ["Temple of the Tooth", "Botanical gardens walk", "Kandyan dance show"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Lake walk", "Tea factory visit", "Hilltop cafe afternoon"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["Hanthana mountain hike", "Spice garden tour", "Village cooking class"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "low" },
  ],
  Ella: [
    { vibe: "The Classic", activities: ["Nine Arches Bridge", "Little Adam's Peak", "Tea plantation tour"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Ella Rock sunrise hike", "Ravana Falls swim", "Zip-lining"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Scenic train ride", "Cafe hopping", "Sunset viewpoint"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  Mirissa: [
    { vibe: "Adventure Day", activities: ["Whale watching trip", "Surfing lesson", "Coconut tree hill climb"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Beach day", "Sunset at Secret Beach", "Seafood dinner"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Off the Beaten Path", activities: ["Stilt fishermen visit", "Snake island kayak", "Night beach walk"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  Colombo: [
    { vibe: "Culture Deep Dive", activities: ["Gangaramaya Temple", "National Museum", "Pettah market walk"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "high" },
    { vibe: "Foodie Trail", activities: ["Colombo street food tour", "Ministry of Crab dinner", "Galle Face promenade"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "The Classic", activities: ["Independence Square", "Floating market", "Rooftop sunset drinks"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
  ],
  Sigiriya: [
    { vibe: "The Classic", activities: ["Sigiriya Rock climb", "Pidurangala Rock sunset", "Village safari"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Off the Beaten Path", activities: ["Dambulla cave temple", "Village cycling", "Lake boat ride"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Sunrise viewpoint", "Herb garden walk", "Pottery village visit"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  Galle: [
    { vibe: "Culture Deep Dive", activities: ["Galle Fort walk", "Maritime museum", "Dutch Reformed Church"], pace: "balanced", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Unawatuna Beach", "Lighthouse viewpoint", "Fort cafe afternoon"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Surfing at Hikkaduwa", "Turtle hatchery visit", "Mangrove boat ride"], pace: "active", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
  ],
  Trincomalee: [
    { vibe: "The Classic", activities: ["Pigeon Island snorkeling", "Koneswaram temple", "Nilaveli Beach"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Marble Beach morning", "Hot springs visit", "Fort Frederick sunset"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Whale watching", "Diving trip", "Kayaking lagoon"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
  ],
  Yala: [
    { vibe: "Adventure Day", activities: ["Leopard safari (dawn)", "Bird watching walk", "Beach camp evening"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "The Classic", activities: ["Morning safari drive", "Tissa Wewa lake", "Temple visit"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Off the Beaten Path", activities: ["Bundala wetland trek", "Kirinda temple visit", "Village cooking class"], pace: "balanced", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  // New Zealand
  Auckland: [
    { vibe: "The Classic", activities: ["Sky Tower visit", "Waiheke Island ferry", "Harbour cruise"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "Foodie Trail", activities: ["Ponsonby cafe crawl", "Fish market tour", "Wine tasting"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Rangitoto Island hike", "Bridge climb", "Kayaking Hauraki Gulf"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "low" },
  ],
  Queenstown: [
    { vibe: "Adventure Day", activities: ["Bungee jumping", "Jet boat ride", "Skyline gondola & luge"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Lake Wakatipu cruise", "Arrowtown walk", "Hot pools soak"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "The Classic", activities: ["Milford Sound day trip", "LOTR location tour", "Fergburger & wine"], pace: "balanced", activityHours: 5, travelHours: 2, crowdLevel: "moderate" },
  ],
  Rotorua: [
    { vibe: "Culture Deep Dive", activities: ["Te Puia geothermal", "Maori cultural show", "Hobbiton tour"], pace: "balanced", activityHours: 5, travelHours: 1.5, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Zorbing", "White water rafting", "Mountain biking Redwoods"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Hot pools morning", "Redwoods treewalk", "Lake Tarawera cruise"], pace: "relaxed", activityHours: 4, travelHours: 1, crowdLevel: "low" },
  ],
  Waiheke: [
    { vibe: "Chill & Scenic", activities: ["Vineyard lunch", "Beach walk", "Olive grove visit"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Foodie Trail", activities: ["Wine trail tour", "Artisan market", "Sunset dining"], pace: "relaxed", activityHours: 4, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "Adventure Day", activities: ["Kayaking coast", "Zip-lining forest", "Beach horseback ride"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "low" },
  ],
  Christchurch: [
    { vibe: "Culture Deep Dive", activities: ["Canterbury Museum", "Botanic Gardens", "Arts Centre walk"], pace: "balanced", activityHours: 4, travelHours: 0.5, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["TranzAlpine train", "Port Hills hike", "Punting on Avon"], pace: "active", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Chill & Scenic", activities: ["Riverside cafe morning", "New Regent Street", "Hagley Park walk"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
  ],
  Milford: [
    { vibe: "The Classic", activities: ["Milford Sound cruise", "Mitre Peak viewpoint", "Rainforest walk"], pace: "balanced", activityHours: 5, travelHours: 1, crowdLevel: "moderate" },
    { vibe: "Adventure Day", activities: ["Kayaking the sound", "Glacier hiking", "Overnight cruise"], pace: "active", activityHours: 6, travelHours: 1.5, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Scenic drive stops", "Mirror Lakes walk", "Te Anau glowworm caves"], pace: "relaxed", activityHours: 4, travelHours: 1.5, crowdLevel: "low" },
  ],
  Wanaka: [
    { vibe: "Adventure Day", activities: ["Roys Peak hike", "Skydiving", "Jet boat ride"], pace: "active", activityHours: 6, travelHours: 1, crowdLevel: "low" },
    { vibe: "Chill & Scenic", activities: ["Wanaka Tree photo", "Lavender farm visit", "Lake swim"], pace: "relaxed", activityHours: 3, travelHours: 0.5, crowdLevel: "low" },
    { vibe: "The Classic", activities: ["Puzzling World", "Iron Mountain walk", "Cinema Paradiso night"], pace: "balanced", activityHours: 4, travelHours: 0.5, crowdLevel: "low" },
  ],
};

// ─── Day type detection ───
function getDayType(dayIndex, totalDays, itinerary) {
  const isFirstDay = dayIndex === 0;
  const isLastDay = dayIndex === totalDays - 1;

  // Check if this day involves a hotel transfer
  let cumulativeDays = 0;
  let isTransferDay = false;
  for (let i = 0; i < itinerary.days.length; i++) {
    if (dayIndex === cumulativeDays && i > 0) {
      isTransferDay = true;
      break;
    }
    cumulativeDays += itinerary.days[i].n;
  }

  if (isFirstDay) return "arrival";
  if (isLastDay) return "departure";
  if (isTransferDay) return "inter_hotel_transfer";
  return "full_day";
}

// ─── Context line for bottom sheet header ───
function getContextLine(dayType, itinerary, dayIndex) {
  const expandedDays = [];
  let cumDays = 0;
  itinerary.days.forEach((stay, i) => {
    for (let d = 0; d < stay.n; d++) {
      expandedDays.push({ city: stay.city, stayIndex: i, dayInStay: d });
      cumDays++;
    }
  });

  const day = expandedDays[dayIndex];
  const prevCity = dayIndex > 0 ? expandedDays[dayIndex - 1]?.city : null;

  switch (dayType) {
    case "arrival":
      return "Choose from our curated day plans below";
    case "departure":
      return "You'll head to the airport in the afternoon, pick how you'd like to spend your morning";
    case "inter_hotel_transfer":
      return `You're moving from ${prevCity} to ${day.city} today, here's what we can fit in`;
    case "full_day":
    default:
      return "Full day to explore, pick the vibe you prefer";
  }
}

// ─── Generate alternate day options for a specific day ───
export function generateDayOptions(itinerary, dayIndex, daysWithActivities) {
  const day = daysWithActivities[dayIndex];
  if (!day) return null;

  const totalDays = daysWithActivities.length;
  const dayType = getDayType(dayIndex, totalDays, itinerary);
  const contextLine = getContextLine(dayType, itinerary, dayIndex);
  const city = day.city;
  const vibes = cityVibes[city];

  if (!vibes || vibes.length === 0) return null;

  const destImgs = destData[itinerary.dest];
  const actImgs = destImgs?.actImgs || [];

  // Build the current option from existing data
  const currentOption = {
    id: `opt_current_${dayIndex}`,
    vibeLabel: "Your Current Plan",
    heroImage: day.activities[0]?.img || itinerary.img,
    activities: day.activities.map(a => a.name),
    scoring: {
      pace: itinerary.pace === "Unhurried" ? "relaxed" : itinerary.pace === "Balanced" ? "balanced" : "active",
      activityHours: 4,
      travelHours: 1,
      crowdLevel: itinerary.crowds === "Low" ? "low" : "moderate",
    },
    priceDelta: 0,
    isCurrent: true,
  };

  // Generate up to 3 alternate options from city vibes (current + 3 fills the 2×2 "Our picks" grid)
  const priceSeed = (dayIndex * 17 + itinerary.id * 31) % 100;
  const alternates = vibes.slice(0, 3).map((vibe, vi) => {
    const imgIdx = (dayIndex * 3 + vi * 5 + itinerary.id) % (actImgs.length || 1);
    // Distinct per-person deltas: pricier, cheaper, then a small bump.
    const priceDelta = [
      (Math.floor(priceSeed / 10) + 2) * 500,
      -((Math.floor(priceSeed / 15) + 1) * 500),
      (Math.floor(priceSeed / 20) + 1) * 500,
    ][vi] ?? 0;

    return {
      id: `opt_${dayIndex}_${vi}`,
      vibeLabel: vibe.vibe,
      heroImage: actImgs[imgIdx] || itinerary.img,
      activities: vibe.activities,
      scoring: {
        pace: vibe.pace,
        activityHours: vibe.activityHours,
        travelHours: vibe.travelHours,
        crowdLevel: vibe.crowdLevel,
      },
      priceDelta,
      isCurrent: false,
    };
  });

  // Fixed elements for this day
  let cumulativeDays = 0;
  let stayIndex = 0;
  for (let i = 0; i < itinerary.days.length; i++) {
    if (dayIndex < cumulativeDays + itinerary.days[i].n) {
      stayIndex = i;
      break;
    }
    cumulativeDays += itinerary.days[i].n;
  }

  const fixedElements = [];
  fixedElements.push({
    type: "hotel",
    icon: "🏨",
    text: `${city} Grand Resort · Deluxe Room`,
  });

  if (dayType === "arrival") {
    fixedElements.push({ type: "transfer", icon: "✈️", text: "Airport transfer included" });
  } else if (dayType === "departure") {
    fixedElements.push({ type: "transfer", icon: "✈️", text: "Airport drop-off included" });
  } else if (dayType === "inter_hotel_transfer") {
    const prevCity = daysWithActivities[dayIndex - 1]?.city;
    fixedElements.push({ type: "transfer", icon: "🚐", text: `Transfer to ${city} included` });
  }

  return {
    dayNumber: day.dayNum,
    city,
    dayType,
    contextLine,
    options: [currentOption, ...alternates],
    fixedElements,
  };
}

// ─── Full combination pool for the "see all" browse screen ───
// The carousel shows a curated few; this expands the city's 3 vibes into a
// larger, deterministically-recombined pool so the filters are meaningful.
export function getAllDayCombinations(itinerary, dayIndex, daysWithActivities) {
  const day = daysWithActivities[dayIndex];
  if (!day) return null;

  const city = day.city;
  const vibes = cityVibes[city];
  if (!vibes || vibes.length === 0) return null;

  const destImgs = destData[itinerary.dest];
  const actImgs = destImgs?.actImgs || [];
  const paces = ["relaxed", "balanced", "active"];

  // Activity pool, each tagged with its source vibe's pace.
  const pool = vibes.flatMap(v => v.activities.map(name => ({ name, pace: v.pace })));
  const N = pool.length;
  const ACT_DURS = [2, 3, 1.5, 2.5];

  const seen = new Set();
  const combos = [];

  const pushCombo = (activities, pace) => {
    const key = activities.slice().sort().join("|");
    if (seen.has(key)) return;
    seen.add(key);
    const i = combos.length;
    const imgIdx = (dayIndex * 3 + i * 4 + itinerary.id) % (actImgs.length || 1);
    const activityHours = Math.round(activities.reduce((s, _, k) => s + ACT_DURS[k % 4], 0) * 2) / 2;
    const travelHours = pace === "active" ? 2 : pace === "balanced" ? 1 : 0.5;
    const crowdLevel = ["low", "moderate", "high"][(dayIndex + i) % 3];
    const priceSeed = (dayIndex * 17 + itinerary.id * 31 + i * 13) % 100;
    const priceDelta = i % 3 === 2
      ? 0
      : i % 2 === 0
        ? (Math.floor(priceSeed / 12) + 1) * 500
        : -((Math.floor(priceSeed / 14) + 1) * 500);
    combos.push({
      id: `combo_${dayIndex}_${i}`,
      vibeLabel: "",
      heroImage: actImgs[imgIdx] || itinerary.img,
      activities,
      scoring: { pace, activityHours, travelHours, crowdLevel },
      priceDelta,
      isCurrent: false,
    });
  };

  // 1. The curated vibes, as-is.
  vibes.forEach(v => pushCombo(v.activities.slice(), v.pace));

  // 2. Recombinations - vary the triple + pace to expand the pool.
  for (let i = 0; i < N * 2 && combos.length < 14; i++) {
    const names = [...new Set([pool[i % N].name, pool[(i + 2) % N].name, pool[(i + 5) % N].name])];
    if (names.length < 2) continue;
    pushCombo(names, paces[i % 3]);
  }

  return { dayNumber: day.dayNum, city, combinations: combos };
}
