export function formatTime(date?: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-BD", { hour12: true, timeZone: "Asia/Dhaka" });
}

export function minsUntil(date: Date) {
  const diff = Math.ceil((date.getTime() - Date.now()) / 60000);
  return Math.max(1, diff);
}
