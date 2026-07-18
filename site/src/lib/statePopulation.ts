// Census 2011 populations (India's latest full census), keyed by the exact NJDG state name.
// Used only to compute an approximate "pending per lakh people" — a fairer lens than raw
// totals, since big states carry big piles simply by size.
//
// Honest caveats (surfaced on the page): (1) 2011 is the last full census — real populations
// today are higher, and unevenly, so per-capita here is APPROXIMATE. (2) J&K and Ladakh are
// split per the 2019 reorganisation; Dadra & Nagar Haveli and Daman & Diu are summed per the
// 2020 merger — to match how NJDG lists them now.
export const STATE_POPULATION_2011: Record<string, number> = {
  "Uttar Pradesh": 199812341,
  "Maharashtra": 112374333,
  "Bihar": 104099452,
  "West Bengal": 91276115,
  "Madhya Pradesh": 72626809,
  "Tamil Nadu": 72147030,
  "Rajasthan": 68548437,
  "Karnataka": 61095297,
  "Gujarat": 60439692,
  "Andhra Pradesh": 49577103,
  "Odisha": 41974218,
  "Telangana": 35003674,
  "Kerala": 33406061,
  "Jharkhand": 32988134,
  "Assam": 31205576,
  "Punjab": 27743338,
  "Chhattisgarh": 25545198,
  "Haryana": 25351462,
  "Delhi": 16787941,
  "Jammu and Kashmir": 12267013,
  "Uttarakhand": 10086292,
  "Himachal Pradesh": 6864602,
  "Tripura": 3673917,
  "Meghalaya": 2966889,
  "Manipur": 2855794,
  "Nagaland": 1978502,
  "Goa": 1458545,
  "Arunachal Pradesh": 1383727,
  "Puducherry": 1247953,
  "Mizoram": 1097206,
  "Chandigarh": 1055450,
  "Sikkim": 610577,
  "Dadra & Nagar Haveli and Daman & Diu": 586956,
  "Andaman and Nicobar": 380581,
  "Ladakh": 274289,
  "Lakshadweep": 64473,
};
