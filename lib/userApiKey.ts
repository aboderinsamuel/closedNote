const OPENAI_KEY = "closednote_openai_api_key";
const HF_KEY = "closednote_hf_api_key";

export function getUserApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(OPENAI_KEY) || "";
}

export function setUserApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(OPENAI_KEY, key.trim());
  } else {
    localStorage.removeItem(OPENAI_KEY);
  }
}

export function clearUserApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OPENAI_KEY);
}

export function getUserHfKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(HF_KEY) || "";
}

export function setUserHfKey(key: string): void {
  if (typeof window === "undefined") return;
  if (key.trim()) {
    localStorage.setItem(HF_KEY, key.trim());
  } else {
    localStorage.removeItem(HF_KEY);
  }
}

export function clearUserHfKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HF_KEY);
}
