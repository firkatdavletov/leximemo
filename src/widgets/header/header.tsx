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
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <Container className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <Link href={ROUTES.home} className="text-base font-semibold text-foreground">
            {APP_NAME}
          </Link>
          <p className="text-xs text-muted">
            Карточки, интервальные повторения и демо-ready PWA.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <nav aria-label="Основная навигация" className="flex flex-wrap items-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-slate-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {user ? (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <span className="text-sm text-muted">
                {user.name || user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link
                href={ROUTES.login}
                className={buttonClassName({ variant: "secondary", size: "sm" })}
              >
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
