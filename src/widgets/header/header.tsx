import Link from "next/link";

import { getCurrentUser } from "@/server/auth/session";
import { APP_NAME, ROUTES } from "@/shared/config/app";
import { cn } from "@/shared/lib/cn";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

import { LogoutButton } from "./logout-button";

const publicNavigation = [{ href: ROUTES.home, label: "Главная" }];
const privateNavigation = [
  { href: ROUTES.home, label: "Главная" },
  { href: ROUTES.decks, label: "Колоды" },
];

export async function Header() {
  const user = await getCurrentUser();
  const navigation = user ? privateNavigation : publicNavigation;

  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={ROUTES.home} className="text-base font-semibold text-foreground">
          {APP_NAME}
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-slate-100 hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted sm:inline">
                {user.name || user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={ROUTES.login} className={buttonClassName({ variant: "secondary", size: "sm" })}>
                Войти
              </Link>
              <Link href={ROUTES.register} className={buttonClassName({ size: "sm" })}>
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
