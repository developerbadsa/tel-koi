import { dict, type Lang } from "@/i18n/dict";

export async function getLang(): Promise<Lang> {
  return "bn";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dict[lang] };
}
