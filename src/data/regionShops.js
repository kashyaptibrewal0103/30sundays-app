// ─── Where to shop, per region ───
//
// The question that comes after "where do we eat": is there a market, and is
// it the kind you go to or the kind you get taken to. Every region carries a
// short list, three to five places, in the same shape as the restaurants so
// the page can draw them the same way.
//
// Written by hand. Names, areas and notes are a starting list and need a pass
// from somebody who sells these trips before this goes in front of a customer:
// markets move, change their days, and a boutique strip can turn over in a
// season. Nothing here carries a price or an opening time for the same reason,
// and the one-line note is what a consultant would say on the call, not a
// review.
//
// One tag each, saying what kind of place it is:
//   Market        a daytime market, covered or open
//   Night market  opens at dusk, usually with food
//   Boutiques     a street or cluster of shops worth walking
//   Crafts        a workshop or craft village, buy from the maker
//   Mall          air-conditioned, fixed prices, useful on a wet afternoon
//
// The area is a neighbourhood, not an address, and km is the distance from
// the centre of the region. Where a place is on another island, or at your
// resort, km is left out rather than guessed.

export const REGION_SHOPS = {
  // ── Bali ──
  "Bali::Ubud": [
    { name: "Ubud Art Market", area: "Jalan Raya Ubud", km: 0.3, tag: "Market", note: "Sarongs, baskets, carvings. Bargain, and go early." },
    { name: "Sukawati Art Market", area: "Sukawati", km: 11, tag: "Market", note: "Where the Ubud stalls buy their stock. Half the price." },
    { name: "Celuk silver village", area: "Celuk", km: 9, tag: "Crafts", note: "Silversmiths at the bench. Buy from the workshop, not the showroom." },
    { name: "Threads of Life", area: "Jalan Kajeng", km: 0.5, tag: "Boutiques", note: "Hand-dyed textiles with the weaver's name on the tag." },
    { name: "Mas woodcarving village", area: "Mas", km: 5, tag: "Crafts", note: "Carvers on every verandah. Ask before you pick anything up." },
  ],
  "Bali::Seminyak": [
    { name: "Seminyak Village", area: "Jalan Kayu Aya", km: 0.4, tag: "Mall", note: "Small, cool, and the only mall in walking range." },
    { name: "Jalan Kayu Aya boutiques", area: "Jalan Kayu Aya", km: 0.3, tag: "Boutiques", note: "Linen, resort wear and local labels along Eat Street." },
    { name: "Seminyak Flea Market", area: "Jalan Kayu Aya", km: 0.5, tag: "Market", note: "Stalls behind the boutiques. Bargain hard." },
    { name: "Biasa", area: "Jalan Raya Seminyak", km: 0.8, tag: "Boutiques", note: "The island's own linen label, in its home shop." },
  ],
  "Bali::Sanur": [
    { name: "Sanur Night Market", area: "Danau Tamblingan", km: 0.6, tag: "Night market", note: "Opens at dusk. Food first, then the stalls." },
    { name: "Hardy's Sanur", area: "Danau Tamblingan", km: 1.0, tag: "Mall", note: "A supermarket with a floor of souvenirs above it. Fixed prices." },
    { name: "Sindhu morning market", area: "North Sanur", km: 1.4, tag: "Market", note: "Fruit, flowers and offerings. Done by nine." },
    { name: "Beach path art stalls", area: "Sanur beach path", km: 0.4, tag: "Crafts", note: "Paintings and kites along the walk. Prices mostly fixed." },
  ],
  "Bali::Canggu": [
    { name: "Love Anchor Market", area: "Batu Bolong", km: 0.5, tag: "Market", note: "Weekend bazaar under a bamboo roof. Jewellery and prints." },
    { name: "Batu Bolong boutiques", area: "Batu Bolong", km: 0.4, tag: "Boutiques", note: "Surf labels and linen along the one road to the beach." },
    { name: "Samadi Sunday Market", area: "Padang Linjong", km: 0.9, tag: "Market", note: "Organic produce and bread. Sunday mornings only." },
    { name: "Berawa shophouses", area: "Berawa", km: 1.2, tag: "Boutiques", note: "Quieter than Batu Bolong, same labels, smaller crowds." },
  ],
  "Bali::Uluwatu": [
    { name: "Jalan Labuansait shops", area: "Jalan Labuansait", km: 0.8, tag: "Boutiques", note: "Surf and swimwear along the road to Padang Padang." },
    { name: "Uluwatu temple stalls", area: "Uluwatu temple", km: 2.5, tag: "Market", note: "Sarongs and kites by the car park. Fine for small gifts." },
    { name: "Jimbaran market", area: "Jimbaran", km: 11, tag: "Market", note: "A real town market. Go for the fish and the fruit." },
  ],
  "Bali::Nusa Penida": [
    { name: "Toyapakeh harbour stalls", area: "Toyapakeh harbour", km: 0.2, tag: "Market", note: "Sarongs and snacks at the boat. Little else on the island." },
    { name: "Ped village shops", area: "Ped, north coast", km: 3, tag: "Crafts", note: "Seaweed soap and woven baskets from the north coast villages." },
    { name: "Sampalan market", area: "Sampalan", km: 7, tag: "Market", note: "The island's one proper market. Mornings." },
  ],
  "Bali::Labuan Bajo": [
    { name: "Waterfront night market", area: "Waterfront", km: 0.2, tag: "Night market", note: "Grilled fish and a few stalls of pearls and sarongs." },
    { name: "Komodo pearl shops", area: "Jalan Soekarno Hatta", km: 0.3, tag: "Boutiques", note: "Flores pearls. Ask for a certificate, pay less than in Bali." },
    { name: "Ikat weaving stalls", area: "Jalan Soekarno Hatta", km: 0.4, tag: "Crafts", note: "Flores ikat, woven inland and sold on the main street." },
  ],

  // ── Vietnam ──
  "Vietnam::Hanoi": [
    { name: "Dong Xuan Market", area: "Old Quarter", km: 0.7, tag: "Market", note: "The big covered market. Wholesale upstairs, everything downstairs." },
    { name: "Hang Gai silk street", area: "Old Quarter", km: 0.3, tag: "Boutiques", note: "Silk shops end to end. Tailoring in a day or two." },
    { name: "Weekend night market", area: "Old Quarter", km: 0.4, tag: "Night market", note: "Hang Dao to Dong Xuan, Friday to Sunday. Street food too." },
    { name: "Trang Tien Plaza", area: "Hoan Kiem", km: 0.6, tag: "Mall", note: "Luxury labels by the lake. Cool and quiet." },
    { name: "Bat Trang ceramics village", area: "Bat Trang", km: 13, tag: "Crafts", note: "Pottery village across the river. Paint your own, or buy." },
  ],
  "Vietnam::Ha Long": [
    { name: "Ha Long night market", area: "Bai Chay", km: 1.0, tag: "Night market", note: "Pearls, dried seafood and T-shirts along the seafront." },
    { name: "Ha Long pearl farms", area: "On the bay", tag: "Crafts", note: "Most cruises stop at one. Buy here, not at the market." },
    { name: "Vincom Plaza Ha Long", area: "Bai Chay", km: 1.5, tag: "Mall", note: "Modern mall with a cinema. Useful on a wet afternoon." },
  ],
  "Vietnam::Hoi An": [
    { name: "Hoi An Central Market", area: "Tran Phu", km: 0.3, tag: "Market", note: "Food downstairs, fabric and tailors upstairs." },
    { name: "Tailors of the old town", area: "Tran Phu", km: 0.2, tag: "Boutiques", note: "Hundreds of them. Pick one on fit, allow two fittings." },
    { name: "Hoi An night market", area: "Nguyen Hoang", km: 0.4, tag: "Night market", note: "Across the bridge. Lanterns, and the people who make them." },
    { name: "Reaching Out Arts and Crafts", area: "Nguyen Thai Hoc", km: 0.3, tag: "Crafts", note: "Fair-trade workshop run by artisans with disabilities." },
    { name: "Kim Bong carpentry village", area: "Cam Kim island", km: 3, tag: "Crafts", note: "A short ferry across. Woodwork and boatbuilding." },
  ],
  "Vietnam::Da Nang": [
    { name: "Han Market", area: "Bach Dang", km: 0.5, tag: "Market", note: "The city market. Dried fruit, ao dai fabric, spices." },
    { name: "Con Market", area: "Hai Chau", km: 1.0, tag: "Market", note: "Bigger, cheaper, more local. Snacks in the middle." },
    { name: "Vincom Plaza Da Nang", area: "Ngo Quyen", km: 2.0, tag: "Mall", note: "The reliable mall over the river. Cinema upstairs." },
    { name: "Non Nuoc stone carving village", area: "Marble Mountains", km: 9, tag: "Crafts", note: "Marble carvers at the foot of the mountains. They ship home." },
  ],
  "Vietnam::HCMC": [
    { name: "Ben Thanh Market", area: "District 1", km: 0.4, tag: "Market", note: "The famous one. Coffee, lacquer, bargaining. Night stalls outside." },
    { name: "Saigon Square", area: "District 1", km: 0.5, tag: "Market", note: "Air-conditioned stalls of clothes and bags. Prices mostly fixed." },
    { name: "Takashimaya Saigon Centre", area: "District 1", km: 0.5, tag: "Mall", note: "Japanese department store with the best food hall in town." },
    { name: "Dong Khoi boutiques", area: "District 1", km: 0.6, tag: "Boutiques", note: "Silk, lacquer and galleries on the old French street." },
    { name: "Binh Tay Market", area: "Cho Lon, District 6", km: 6, tag: "Market", note: "Chinatown's wholesale market. Quieter, more real." },
  ],
  "Vietnam::Phu Quoc": [
    { name: "Dinh Cau Night Market", area: "Duong Dong", km: 0.3, tag: "Night market", note: "Seafood grills, pearls and pepper. Every evening." },
    { name: "Phu Quoc pearl farms", area: "Duong To", km: 8, tag: "Crafts", note: "Pearls grown here. Buy at the farm, with a certificate." },
    { name: "Fish sauce and pepper shops", area: "Duong Dong", km: 0.6, tag: "Market", note: "The two things the island is known for, in bottles and jars." },
    { name: "Grand World Phu Quoc", area: "North island", km: 25, tag: "Mall", note: "A built resort town. Shops, shows, a canal." },
  ],

  // ── Thailand ──
  "Thailand::Bangkok": [
    { name: "Chatuchak Weekend Market", area: "Chatuchak", km: 9, tag: "Market", note: "Fifteen thousand stalls. Saturday and Sunday only." },
    { name: "ICONSIAM", area: "Thonburi riverside", km: 4, tag: "Mall", note: "Riverside mall with an indoor floating market." },
    { name: "Siam Paragon", area: "Siam", km: 2.5, tag: "Mall", note: "The big one. Food hall downstairs, cinema upstairs." },
    { name: "Pratunam Market", area: "Pratunam", km: 2, tag: "Market", note: "Wholesale clothes at retail prices. Go early." },
    { name: "Asiatique", area: "Charoen Krung riverside", km: 5, tag: "Night market", note: "Night market and a ferris wheel. Free shuttle boat." },
  ],
  "Thailand::Chiang Mai": [
    { name: "Sunday Walking Street", area: "Ratchadamnoen", km: 0.2, tag: "Night market", note: "The old town's main road closes for it. Crafts, food, music." },
    { name: "Night Bazaar", area: "Chang Khlan", km: 1, tag: "Night market", note: "Every night. Bigger, touristier, open late." },
    { name: "Warorot Market", area: "Chang Moi", km: 1.2, tag: "Market", note: "The locals' market. Spices, textiles, snacks." },
    { name: "Nimman boutiques", area: "Nimman", km: 2.5, tag: "Boutiques", note: "Design shops and galleries along the sois." },
    { name: "Baan Tawai woodcarving village", area: "Hang Dong", km: 15, tag: "Crafts", note: "Furniture and carving. Shipping arranged." },
  ],
  "Thailand::Krabi": [
    { name: "Krabi Weekend Night Market", area: "Krabi Town", km: 0.3, tag: "Night market", note: "Friday to Sunday. Food, crafts, live music." },
    { name: "Ao Nang walking street", area: "Ao Nang beach", km: 0.4, tag: "Market", note: "Stalls along the beach road every evening." },
    { name: "Maharaj Market", area: "Krabi Town", km: 0.6, tag: "Market", note: "The morning market. Fruit, flowers, curry pastes." },
  ],
  "Thailand::Phuket": [
    { name: "Phuket Walking Street", area: "Phuket Old Town", km: 0.3, tag: "Night market", note: "Thalang Road, Sunday evenings. The best one." },
    { name: "Chillva Market", area: "Phuket Town", km: 2, tag: "Night market", note: "Container stalls and food trucks. Young and local." },
    { name: "Jungceylon", area: "Patong", km: 0.5, tag: "Mall", note: "Patong's mall. Useful for essentials and the cool air." },
    { name: "Central Phuket", area: "Wichit", km: 4, tag: "Mall", note: "The island's big mall, with a floating market inside." },
    { name: "Banzaan Fresh Market", area: "Patong", km: 0.6, tag: "Market", note: "Buy fish downstairs, have it cooked upstairs." },
  ],
  "Thailand::Koh Samui": [
    { name: "Fisherman's Village Walking Street", area: "Bophut", km: 0.3, tag: "Night market", note: "Fridays. The prettiest market on the island." },
    { name: "Chaweng Walking Street", area: "Chaweng", km: 0.4, tag: "Night market", note: "Nightly stalls behind the beach road." },
    { name: "Central Samui", area: "Chaweng", km: 0.6, tag: "Mall", note: "Small open-air mall. Fine for essentials." },
    { name: "Lamai Sunday Night Market", area: "Lamai", km: 7, tag: "Night market", note: "Sunday evenings. Food and crafts, fewer crowds." },
  ],

  // ── Maldives ──
  "Maldives::Malé": [
    { name: "Malé Local Market", area: "Waterfront", km: 0.3, tag: "Market", note: "Fruit, dried fish and coconut sweets. Mornings." },
    { name: "Majeedhee Magu", area: "Majeedhee Magu", km: 0.2, tag: "Boutiques", note: "The main shopping street. Electronics, fabric, perfume." },
    { name: "Chaandhanee Magu souvenirs", area: "Chaandhanee Magu", km: 0.2, tag: "Crafts", note: "Lacquerware and woven mats, the real Maldivian crafts." },
  ],
  "Maldives::Baa Atoll": [
    { name: "Resort boutique", area: "At your resort", tag: "Boutiques", note: "Most resorts keep one. Swimwear, sunscreen, a few crafts." },
    { name: "Eydhafushi island shops", area: "Eydhafushi", tag: "Crafts", note: "The atoll's capital island. Lacquerware from the workshops." },
    { name: "Thulhaadhoo lacquer village", area: "Thulhaadhoo", tag: "Crafts", note: "The island the Maldivian lacquer trade comes from." },
  ],
  "Maldives::S.Ari": [
    { name: "Resort boutique", area: "At your resort", tag: "Boutiques", note: "Most resorts keep one. Swimwear, sunscreen, a few crafts." },
    { name: "Maamigili island shops", area: "Maamigili", tag: "Market", note: "Small shops by the airstrip. Snacks and a few souvenirs." },
    { name: "Dhangethi harbour stalls", area: "Dhangethi", tag: "Crafts", note: "A guesthouse island with a few craft stalls by the harbour." },
  ],
  "Maldives::Addu": [
    { name: "Hithadhoo shops", area: "Hithadhoo", tag: "Market", note: "The main island's shops. Everyday goods, some crafts." },
    { name: "Link road stalls", area: "Feydhoo and Maradhoo", tag: "Crafts", note: "Small stalls along the causeway islands." },
    { name: "Resort boutique", area: "At your resort", tag: "Boutiques", note: "Swimwear, sunscreen, a few crafts." },
  ],

  // ── Sri Lanka ──
  "Sri Lanka::Sigiriya": [
    { name: "Dambulla carving shops", area: "Dambulla road", km: 15, tag: "Crafts", note: "Masks and carved elephants along the main road." },
    { name: "Sigiriya village stalls", area: "Sigiriya village", km: 1, tag: "Market", note: "Batik and small crafts outside the rock." },
    { name: "Matale spice gardens", area: "Matale", km: 40, tag: "Market", note: "Spice gardens on the road to Kandy. Buy small amounts." },
  ],
  "Sri Lanka::Kandy": [
    { name: "Kandy Municipal Market", area: "Dalada Veediya", km: 0.4, tag: "Market", note: "Two floors. Spices and tea downstairs, batik upstairs." },
    { name: "Kandy City Centre", area: "Dalada Veediya", km: 0.3, tag: "Mall", note: "The one mall. Gem shops and a food court." },
    { name: "Laksala", area: "Temple Street", km: 0.5, tag: "Crafts", note: "The government craft shop. Fixed prices, no bargaining." },
    { name: "Pilimathalawa brassware", area: "Pilimathalawa", km: 12, tag: "Crafts", note: "Brass and silver workshops on the Colombo road." },
  ],
  "Sri Lanka::Ella": [
    { name: "Main Street shops", area: "Main Street", km: 0.1, tag: "Boutiques", note: "Tea, spices and linen shirts along the one street." },
    { name: "Ella Sunday market", area: "Main Street", km: 0.2, tag: "Market", note: "Small weekly market by the station." },
    { name: "Tea factory shops", area: "Passara road", km: 3, tag: "Market", note: "Buy tea where it is made. Cheaper than Colombo." },
  ],
  "Sri Lanka::Galle": [
    { name: "Barefoot Galle", area: "Inside the fort", km: 0.2, tag: "Boutiques", note: "Hand-woven textiles and books. Colombo's design shop, in the fort." },
    { name: "Church Street boutiques", area: "Church Street", km: 0.2, tag: "Boutiques", note: "Jewellery, linen and antiques along the fort's lanes." },
    { name: "Galle Fort gem shops", area: "Inside the fort", km: 0.3, tag: "Crafts", note: "Sapphires. Buy only with a certificate." },
    { name: "Galle Main Market", area: "Main Street", km: 1.0, tag: "Market", note: "The town market outside the fort. Fruit and spice." },
  ],
  "Sri Lanka::Mirissa": [
    { name: "Mirissa beach stalls", area: "East end beach", km: 0.2, tag: "Market", note: "Sarongs, shells and ice cream along the sand." },
    { name: "Weligama shops", area: "Matara road", km: 6, tag: "Boutiques", note: "Surf shops and a few boutiques in the next town." },
    { name: "Matara market", area: "Matara", km: 15, tag: "Market", note: "A real town market. Weekday mornings." },
  ],

  // ── New Zealand ──
  "New Zealand::Auckland": [
    { name: "Queen Street", area: "CBD", km: 0.3, tag: "Boutiques", note: "The main shopping street. Chains and department stores." },
    { name: "Ponsonby Road", area: "Ponsonby", km: 2, tag: "Boutiques", note: "Design shops and cafes. The best browsing in the city." },
    { name: "Britomart", area: "Fort Lane, CBD", km: 0.5, tag: "Boutiques", note: "Restored warehouses. New Zealand labels and good coffee." },
    { name: "La Cigale French Market", area: "Parnell", km: 2.5, tag: "Market", note: "Saturday and Sunday morning food market." },
    { name: "Karangahape Road", area: "Karangahape Road", km: 1.2, tag: "Boutiques", note: "Vintage, record shops and the city's odd corners." },
  ],
  "New Zealand::Rotorua": [
    { name: "Rotorua Night Market", area: "Tutanekai Street", km: 0.2, tag: "Night market", note: "Thursday evenings. Food and local crafts." },
    { name: "Te Puia carving school shop", area: "Te Puia", km: 3, tag: "Crafts", note: "Bone and greenstone carved by the students." },
    { name: "Eat Streat shops", area: "Eat Streat", km: 0.2, tag: "Boutiques", note: "Outdoor gear and souvenirs along the main street." },
    { name: "Mountain Jade", area: "Fenton Street", km: 0.5, tag: "Crafts", note: "Greenstone, with the carvers at work." },
  ],
  "New Zealand::Queenstown": [
    { name: "Queenstown Mall", area: "The Mall", km: 0.1, tag: "Boutiques", note: "The pedestrian street. Outdoor brands and merino." },
    { name: "Remarkables Market", area: "Frankton", km: 8, tag: "Market", note: "Saturday mornings, October to April. Food and crafts." },
    { name: "Creative Queenstown Market", area: "Earnslaw Park", km: 0.3, tag: "Market", note: "Saturdays by the lake. Local makers." },
    { name: "Shotover Street outdoor stores", area: "Shotover Street", km: 0.3, tag: "Boutiques", note: "Every outdoor brand on one street. Good sales." },
  ],
  "New Zealand::Wanaka": [
    { name: "Ardmore Street shops", area: "Ardmore Street", km: 0.1, tag: "Boutiques", note: "The lakefront street. Merino, art, outdoor gear." },
    { name: "Wanaka Artisan Market", area: "Pembroke Park", km: 0.4, tag: "Market", note: "Summer Sundays on the lakefront." },
    { name: "Helwick Street galleries", area: "Helwick Street", km: 0.2, tag: "Crafts", note: "Small galleries and jewellers." },
  ],
  "New Zealand::Christchurch": [
    { name: "Riverside Market", area: "Cashel Street", km: 0.3, tag: "Market", note: "Food hall and farmers' market, open daily." },
    { name: "Ballantynes", area: "Cashel Street", km: 0.3, tag: "Mall", note: "The city's department store since 1854." },
    { name: "New Regent Street", area: "New Regent Street", km: 0.4, tag: "Boutiques", note: "Pastel shopfronts. Cafes and small shops." },
    { name: "The Tannery", area: "Woolston", km: 5, tag: "Boutiques", note: "A restored tannery with boutiques and a cinema." },
    { name: "Christchurch Farmers' Market", area: "Riccarton", km: 4, tag: "Market", note: "Saturday mornings in the grounds of Riccarton House." },
  ],
};

// No photographs. We hold none of any of these places, and a stock shot of a
// market under a real market's name would be claiming something we do not
// know. The row carries an icon instead.
export const regionShops = (dest, city) => REGION_SHOPS[`${dest}::${city}`] || [];

// One quiet tone per kind of place. None of them pink: on this page pink is
// the heart and the buttons, and a tag is a fact, not a call to act.
export const SHOP_TAG = {
  "Market": { bg: "#FFF4E0", fg: "#B54708" },
  "Night market": { bg: "#EEF0FF", fg: "#3538CD" },
  "Boutiques": { bg: "#F3F4F6", fg: "#475467" },
  "Crafts": { bg: "#ECFDF3", fg: "#027A48" },
  "Mall": { bg: "#EAF2FE", fg: "#1570EF" },
};
