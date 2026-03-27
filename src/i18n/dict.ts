import { siteConfig } from "@/lib/site";

export type Lang = "en" | "bn";

export const areas = [
  "Lalmonirhat Sadar",
  "Aditmari",
  "Hatibandha",
  "Kaliganj",
  "Patgram",
] as const;

const common = {
  appName: siteConfig.name,
  tagline: "লালমনিরহাটের পাম্পের লাইভ কমিউনিটি আপডেট",
  addStation: "পাম্প যোগ করুন",
  about: "আমাদের কথা",
  search: "পাম্পের নাম, ঠিকানা, এলাকা লিখুন",
  allAreas: "সব এলাকা",
  list: "তালিকা",
  map: "ম্যাপ",
  trending: "চলতি আপডেট",
  yes: "তেল আছে",
  no: "তেল নেই",
  openMaps: "গুগল ম্যাপে খুলুন",
  lastReport: "সর্বশেষ রিপোর্ট",
  confidence: "বিশ্বাসের মান",
  votes: "ভোট",
  mostActive: "সবচেয়ে সক্রিয়",
  topYes: "সবচেয়ে বেশি আছে",
  topNo: "সবচেয়ে বেশি নেই",
};

export const dict = {
  en: common,
  bn: common,
};

export type Dict = (typeof dict)[Lang];
