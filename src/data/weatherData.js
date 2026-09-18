// Indicative monthly weather by destination, Jan..Dec.
// high = typical daytime high (°C), low = typical overnight low (°C),
// rain = average rainfall (mm). Climate averages, good enough to guide when to
// go, not a forecast. Vietnam is weighted to the north, where our routes start,
// so its winter reads colder than the south.
export const weatherData = {
  Bali:          { high: [30, 30, 31, 31, 31, 30, 29, 29, 30, 31, 31, 30], low: [24, 24, 24, 24, 24, 23, 23, 23, 23, 24, 24, 24], rain: [345, 274, 235, 83, 76, 64, 50, 26, 44, 64, 150, 271] },
  Maldives:      { high: [30, 30, 31, 32, 31, 30, 30, 30, 30, 30, 30, 30], low: [25, 25, 26, 26, 26, 26, 25, 25, 25, 25, 25, 25], rain: [75, 50, 55, 120, 220, 175, 150, 175, 200, 195, 205, 215] },
  Thailand:      { high: [32, 33, 34, 35, 34, 33, 32, 32, 32, 31, 31, 31], low: [21, 23, 25, 26, 25, 25, 25, 25, 24, 24, 22, 20], rain: [10, 20, 30, 65, 190, 150, 155, 200, 300, 230, 55, 10] },
  Vietnam:       { high: [22, 23, 27, 31, 33, 33, 33, 32, 31, 29, 26, 23], low: [15, 17, 20, 23, 26, 27, 27, 26, 25, 22, 19, 16], rain: [18, 26, 44, 90, 190, 240, 290, 320, 265, 130, 45, 22] },
  Mauritius:     { high: [30, 30, 30, 29, 27, 25, 24, 24, 25, 27, 28, 29], low: [22, 22, 22, 21, 19, 18, 17, 17, 17, 18, 20, 21], rain: [215, 220, 180, 110, 95, 75, 65, 55, 45, 40, 70, 145] },
  "New Zealand": { high: [23, 23, 21, 18, 15, 12, 11, 13, 15, 17, 19, 21], low: [15, 15, 14, 11, 9, 7, 6, 7, 9, 10, 12, 14], rain: [75, 65, 85, 95, 115, 135, 145, 120, 95, 105, 90, 85] },
  "Sri Lanka":   { high: [31, 31, 32, 32, 31, 30, 30, 30, 30, 30, 30, 30], low: [22, 23, 24, 25, 26, 26, 25, 25, 25, 24, 23, 22], rain: [60, 70, 110, 230, 340, 210, 130, 110, 160, 350, 320, 175] },
};

// Kept for the callers that still read a daytime high off `temp`.
Object.values(weatherData).forEach((w) => { w.temp = w.high; });

// Simple rain descriptor for a month's rainfall in mm.
export function seasonLabel(rainMm) {
  if (rainMm >= 200) return "wet";
  if (rainMm >= 100) return "some rain";
  return "dry";
}

// What the sky mostly does that month, from its rainfall. Four states, so the
// icon says something rather than decorating.
//   sunny        under 50mm, dry
//   cloudy       50 to 119mm, a shower here and there
//   rainy        120 to 219mm, wet enough to plan around
//   heavy        220mm and over, properly wet
//
// The millimetres stay behind the words. A traveller deciding on a month wants
// to know whether they will be rained on, not by how much.
export function monthSky(dest, monthIdx) {
  const mm = weatherData[dest]?.rain?.[monthIdx];
  if (mm == null) return "partly";
  if (mm < 50) return "sunny";
  if (mm < 120) return "cloudy";
  if (mm < 220) return "rainy";
  return "heavy";
}

// The word on the chip, in the vocabulary people use for weather.
export const SKY_WORD = { sunny: "Sunny", cloudy: "Cloudy", rainy: "Rainy", heavy: "Heavy rain" };

// The numbers a month is judged on, in one call.
export function monthWeather(dest, monthIdx) {
  const w = weatherData[dest];
  if (!w) return null;
  return {
    high: w.high[monthIdx],
    low: w.low[monthIdx],
    rain: w.rain[monthIdx],
    sky: monthSky(dest, monthIdx),
    word: SKY_WORD[monthSky(dest, monthIdx)],
    rainWord: seasonLabel(w.rain[monthIdx]),
  };
}
