// The preset destination locations for the lab, one folder per country in the
// dropped image set. Each entry is a name the prompt substitutes in, plus the
// scene photo that gets sent as IMAGE 1.
//
// Files live in public/lab-locations, downscaled to 2048px on the long edge so
// requests stay quick. Locations added in the UI are stored in the browser and
// merged on top of these.
export const PRESET_LOCATIONS = [
  { id: "bali-atv-ride-ubud", country: "Bali", name: "ATV Ride (Ubud)", image: "/lab-locations/bali-atv-ride-ubud.jpg" },
  { id: "bali-kelingking-beach-viewpoint", country: "Bali", name: "Kelingking Beach viewpoint", image: "/lab-locations/bali-kelingking-beach-viewpoint.jpg" },
  { id: "bali-mount-batur", country: "Bali", name: "Mount Batur", image: "/lab-locations/bali-mount-batur.jpg" },
  { id: "bali-tegallalang-rice-terraces", country: "Bali", name: "Tegallalang Rice Terraces", image: "/lab-locations/bali-tegallalang-rice-terraces.jpg" },
  { id: "bali-uluwatu-clifftop", country: "Bali", name: "Uluwatu clifftop", image: "/lab-locations/bali-uluwatu-clifftop.jpg" },
  { id: "maldives-dhoni-sunset-cruise", country: "Maldives", name: "Dhoni sunset cruise", image: "/lab-locations/maldives-dhoni-sunset-cruise.jpg" },
  { id: "maldives-infinity-pool-over-the-lagoon", country: "Maldives", name: "Infinity pool over the lagoon", image: "/lab-locations/maldives-infinity-pool-over-the-lagoon.jpg" },
  { id: "maldives-overwater-villa-deck", country: "Maldives", name: "Overwater villa deck", image: "/lab-locations/maldives-overwater-villa-deck.jpg" },
  { id: "maldives-sandbank-picnic", country: "Maldives", name: "Sandbank picnic", image: "/lab-locations/maldives-sandbank-picnic.jpg" },
  { id: "maldives-underwater-restaurant", country: "Maldives", name: "Underwater restaurant", image: "/lab-locations/maldives-underwater-restaurant.jpg" },
  { id: "mauritius-black-river-gorges-viewpoint", country: "Mauritius", name: "Black River Gorges viewpoint", image: "/lab-locations/mauritius-black-river-gorges-viewpoint.jpg" },
  { id: "mauritius-chamarel-seven-coloured-earths", country: "Mauritius", name: "Chamarel Seven Coloured Earths", image: "/lab-locations/mauritius-chamarel-seven-coloured-earths.jpg" },
  { id: "mauritius-ile-aux-cerfs", country: "Mauritius", name: "Ile aux Cerfs", image: "/lab-locations/mauritius-ile-aux-cerfs.jpg" },
  { id: "mauritius-le-morne-brabant", country: "Mauritius", name: "Le Morne Brabant", image: "/lab-locations/mauritius-le-morne-brabant.jpg" },
  { id: "mauritius-pamplemousses-botanical-garden", country: "Mauritius", name: "Pamplemousses Botanical Garden", image: "/lab-locations/mauritius-pamplemousses-botanical-garden.jpg" },
  { id: "new-zealand-hooker-valley-track-aoraki", country: "New Zealand", name: "Hooker Valley Track, Aoraki", image: "/lab-locations/new-zealand-hooker-valley-track-aoraki.jpg" },
  { id: "new-zealand-lake-tekapo", country: "New Zealand", name: "Lake Tekapo", image: "/lab-locations/new-zealand-lake-tekapo.jpg" },
  { id: "new-zealand-milford-sound-cruise", country: "New Zealand", name: "Milford Sound Cruise", image: "/lab-locations/new-zealand-milford-sound-cruise.jpg" },
  { id: "new-zealand-queenstown-gondola-viewpoint", country: "New Zealand", name: "Queenstown gondola viewpoint", image: "/lab-locations/new-zealand-queenstown-gondola-viewpoint.jpg" },
  { id: "new-zealand-that-wanaka-tree", country: "New Zealand", name: "That Wanaka Tree", image: "/lab-locations/new-zealand-that-wanaka-tree.jpg" },
  { id: "thailand-big-buddha-phuket", country: "Thailand", name: "Big Buddha (Phuket)", image: "/lab-locations/thailand-big-buddha-phuket.jpg" },
  { id: "thailand-maya-bay", country: "Thailand", name: "Maya Bay", image: "/lab-locations/thailand-maya-bay.jpg" },
  { id: "thailand-railay-beach-krabi", country: "Thailand", name: "Railay Beach, Krabi", image: "/lab-locations/thailand-railay-beach-krabi.jpg" },
  { id: "thailand-wat-arun-bangkok", country: "Thailand", name: "Wat Arun, Bangkok", image: "/lab-locations/thailand-wat-arun-bangkok.jpg" },
  { id: "thailand-white-temple-chiang-rai", country: "Thailand", name: "White Temple (Chiang Rai)", image: "/lab-locations/thailand-white-temple-chiang-rai.jpg" },
  { id: "vietnam-ba-na-hills", country: "Vietnam", name: "Ba Na Hills", image: "/lab-locations/vietnam-ba-na-hills.jpg" },
  { id: "vietnam-golden-bridge-ba-na-hills", country: "Vietnam", name: "Golden Bridge (Ba Na Hills)", image: "/lab-locations/vietnam-golden-bridge-ba-na-hills.jpg" },
  { id: "vietnam-ha-long-bay-cruise", country: "Vietnam", name: "Ha Long Bay Cruise", image: "/lab-locations/vietnam-ha-long-bay-cruise.jpg" },
  { id: "vietnam-hoi-an-ancient-town", country: "Vietnam", name: "Hoi An ancient town", image: "/lab-locations/vietnam-hoi-an-ancient-town.jpg" },
  { id: "vietnam-phu-quoc-beach", country: "Vietnam", name: "Phu Quoc Beach", image: "/lab-locations/vietnam-phu-quoc-beach.jpg" },
];

export const PRESET_COUNTRIES = [...new Set(PRESET_LOCATIONS.map((l) => l.country))];
