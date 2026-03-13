import type { Metadata } from "next";

import { APP_DESCRIPTION, APP_NAME } from "@/shared/config/app";
import { Header } from "@/widgets/header/header";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Word Learning MVP`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
