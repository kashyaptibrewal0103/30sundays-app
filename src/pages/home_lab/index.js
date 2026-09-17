import CrewHome from "./CrewHome";
import ChapterHome from "./ChapterHome";
import PinnedHome from "./PinnedHome";
import BlankHome from "./BlankHome";
import PosterHome from "./PosterHome";

export { default as HomeLabIndex } from "./HomeLabIndex";
export { default as CtaLab } from "./CtaLab";
export { default as CardsLab } from "./CardsLab";
export { default as PlansLab } from "./PlansLab";
export { default as StatesLab } from "./StatesLab";

// Index order is the route order: /home-lab/1 to /home-lab/5.
export const HOME_LAB_PAGES = [CrewHome, ChapterHome, PinnedHome, BlankHome, PosterHome];
