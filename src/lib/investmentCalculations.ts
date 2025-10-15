// Investment and property appreciation rates (10-year historical averages)
export const ONTARIO_CITY_RATES: Record<string, number> = {
  'Toronto': 0.065, // 6.5% annual
  'Ottawa': 0.055,
  'Mississauga': 0.062,
  'Brampton': 0.060,
  'Hamilton': 0.070,
  'London': 0.058,
  'Markham': 0.063,
  'Vaughan': 0.064,
  'Kitchener-Waterloo': 0.059,
  'Windsor': 0.045,
  'Oshawa': 0.061,
  'Barrie': 0.068,
  'Kingston': 0.052,
  'Sudbury': 0.042,
  'Thunder Bay': 0.038,
};

// Combined 10-year average of S&P 500, TSX, and Dow Jones
export const MARKET_INVESTMENT_RATE = 0.072; // 7.2% annual

export function calculateFutureValue(
  currentValue: number,
  annualRate: number,
  years: number
): number {
  return currentValue * Math.pow(1 + annualRate, years);
}

export function formatCityName(city: string): string {
  return city;
}

export const ONTARIO_CITIES = Object.keys(ONTARIO_CITY_RATES);
