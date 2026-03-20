import type { Metadata, Viewport } from "next";

import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  APP_THEME_COLOR,
} from "@/shared/config/app";
import { InstallPrompt } from "@/shared/pwa/install-prompt";
import { PwaBootstrap } from "@/shared/pwa/pwa-bootstrap";
import { Header } from "@/widgets/header/header";

import "./globals.css";

function getMetadataBase() {
  const fallbackUrl = "http://localhost:3000";

  try {
    return new URL(process.env.NEXTAUTH_URL ?? fallbackUrl);
  } catch {
    return new URL(fallbackUrl);
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  applicationName: APP_NAME,
  title: {
    default: `${APP_NAME} | Word Learning MVP`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/pwa-icons/192", sizes: "192x192", type: "image/png" },
      { url: "/pwa-icons/512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/pwa-icons/180", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: APP_SHORT_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: APP_THEME_COLOR,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-background text-foreground antialiased">
        <PwaBootstrap />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 py-6 sm:py-8">{children}</main>
        </div>
        <InstallPrompt />
      </body>
    </html>
  );
}
