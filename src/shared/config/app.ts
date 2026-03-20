export const APP_NAME = "LexiMemo";
export const APP_SHORT_NAME = "LexiMemo";
export const APP_DESCRIPTION =
  "MVP-приложение для изучения и запоминания иностранных слов по карточкам.";
export const APP_LANGUAGE = "ru";
export const APP_THEME_COLOR = "#0f766e";
export const APP_BACKGROUND_COLOR = "#f8fafc";
export const APP_START_URL = "/?source=pwa";
export const APP_OFFLINE_URL = "/offline";
export const DEFAULT_DEMO_EMAIL = "demo@leximemo.local";
export const DEFAULT_DEMO_PASSWORD = "demo12345";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  decks: "/decks",
  offline: APP_OFFLINE_URL,
} as const;
