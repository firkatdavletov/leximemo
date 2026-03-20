import type { MetadataRoute } from "next";

import {
  APP_BACKGROUND_COLOR,
  APP_DESCRIPTION,
  APP_LANGUAGE,
  APP_NAME,
  APP_SHORT_NAME,
  APP_START_URL,
  APP_THEME_COLOR,
  ROUTES,
} from "@/shared/config/app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: APP_NAME,
    short_name: APP_SHORT_NAME,
    description: APP_DESCRIPTION,
    start_url: APP_START_URL,
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    background_color: APP_BACKGROUND_COLOR,
    theme_color: APP_THEME_COLOR,
    lang: APP_LANGUAGE,
    orientation: "portrait",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/pwa-icons/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa-icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Мои колоды",
        short_name: "Колоды",
        description: "Открыть список колод пользователя.",
        url: ROUTES.decks,
      },
      {
        name: "Вход",
        short_name: "Логин",
        description: "Открыть страницу входа.",
        url: ROUTES.login,
      },
    ],
  };
}
