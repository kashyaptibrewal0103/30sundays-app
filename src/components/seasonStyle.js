import { C } from "../data";

// ─── How a month is labelled on the dates step ───
//
// Peak, shoulder and off-season used to run green, amber, red. Red is the
// colour we use for something being wrong, and an off-season month is not
// wrong: it is quieter, cheaper, and for a lot of couples the better trip. The
// palette was talking people out of months we are happy to sell.
//
// So the ramp is one green in two strengths and then nothing: deep green for
// the months at their best, a lighter green for the ones in between, neutral
// grey for the quiet ones. It reads as a scale rather than three verdicts, and
// grey says "less busy", which is exactly what off-season means.
//
// The lighter green is held at 4.6:1 on white. These labels are 9.5px, so a
// prettier, paler green would not be readable outdoors.

export const SEASON_LABEL = { peak: "Peak season", shoulder: "Shoulder", off: "Off-season" };

export const SEASON_COLOR = { peak: "#02593A", shoulder: "#23855C", off: C.sub };
