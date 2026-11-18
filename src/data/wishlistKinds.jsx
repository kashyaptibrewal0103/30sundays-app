import { Map as MapIcon, Ticket, BedDouble, Utensils, ShoppingBag, Route as RouteIcon } from "lucide-react";

// One colour and one icon per kind of save, the same ones the board map and
// its filter chips use (the brand board's shade card), so a thing to do is
// pink wherever the wishlist shows it.
export const KIND_COLOR = {
  region: "#516968", activity: "#FE6795", hotel: "#00A898", restaurant: "#FDB534", shop: "#535862", trip: "#254342",
};
export const KIND_ICON = { region: MapIcon, activity: Ticket, hotel: BedDouble, restaurant: Utensils, shop: ShoppingBag, trip: RouteIcon };

// A small disc in the kind's colour holding its icon in white.
export function KindDisc({ kind, size = 22 }) {
  const Icon = KIND_ICON[kind] || Ticket;
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%", background: KIND_COLOR[kind] || KIND_COLOR.activity,
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <Icon size={Math.round(size * 0.55)} color="#fff" strokeWidth={2.3} />
    </span>
  );
}
