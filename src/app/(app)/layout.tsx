import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getCurrentUserId } from "@/server/auth/session";
import { ROUTES } from "@/shared/config/app";

type PrivateLayoutProps = {
  children: ReactNode;
};

export default async function PrivateLayout({ children }: PrivateLayoutProps) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect(`${ROUTES.login}?next=${encodeURIComponent(ROUTES.decks)}`);
  }

  return <>{children}</>;
}
