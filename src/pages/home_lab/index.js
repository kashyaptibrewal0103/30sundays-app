import CrewHome from "./CrewHome";
import ChapterHome from "./ChapterHome";
import PinnedHome from "./PinnedHome";
import BlankHome from "./BlankHome";
import PosterHome from "./PosterHome";
import MatchHome from "./MatchHome";

export { default as HomeLabIndex } from "./HomeLabIndex";
export { default as CtaLab } from "./CtaLab";
export { default as CardsLab } from "./CardsLab";
export { default as PlansLab } from "./PlansLab";
export { default as StatesLab } from "./StatesLab";
export { default as LinesLab } from "./LinesLab";
export { default as ProofLab } from "./ProofLab";
export { default as CircleLineLab } from "./CircleLineLab";
export { default as MatchHome } from "./MatchHome";
export { BookedHome, BookedHomeIndex } from "./BookedHomes";

// Index order is the route order: /home-lab/1 to /home-lab/6.
export const HOME_LAB_PAGES = [CrewHome, ChapterHome, PinnedHome, BlankHome, PosterHome, MatchHome];
