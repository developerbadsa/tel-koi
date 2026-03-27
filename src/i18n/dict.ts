export type Lang = "en" | "bn";

export const areas = [
  "Lalmonirhat Sadar",
  "Aditmari",
  "Hatibandha",
  "Kaliganj",
  "Patgram",
] as const;

const common = {
  appName: "PetrolKoiLal",
  tagline: "লালমনিরহাটের মানুষে মিলে পেট্রোল/ডিজেল পাম্পের লাইভ খবর",
  addMosque: "স্টেশন যোগ দাও",
  about: "এই সাইটের কথা",
  search: "পাম্প/স্টেশনের নাম, ঠিকানা, এলাকা লিখো",
  allAreas: "সব এলাকা",
  list: "তালিকা",
  map: "ম্যাপ",
  trending: "চলতি খবর",
  yes: "তেল আছে",
  no: "তেল নাই",
  openMaps: "গুগল ম্যাপে খুলো",
  lastReport: "শেষ খবর",
  confidence: "ভরসার মান",
  votes: "ভোট",
  mostActive: "বেশি সক্রিয়",
  topYes: "সবচেয়ে বেশি আছে",
  topNo: "সবচেয়ে বেশি নাই",
};

export const dict = {
  en: common,
  bn: common,
};

export type Dict = (typeof dict)[Lang];
