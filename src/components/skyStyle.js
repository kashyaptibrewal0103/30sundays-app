import { Sun, CloudSun, CloudDrizzle, CloudRain } from "lucide-react";

// One icon and colour per sky state, so the wizard's month chip and the
// destination page cannot drift apart. The states themselves come from
// monthSky in weatherData.
export const SKY_STYLE = {
  sunny:  { Icon: Sun,          color: "#F5B301" },
  cloudy: { Icon: CloudSun,     color: "#8A94A6" },
  rainy:  { Icon: CloudDrizzle, color: "#5B8DEF" },
  heavy:  { Icon: CloudRain,    color: "#3B6FD4" },
};
