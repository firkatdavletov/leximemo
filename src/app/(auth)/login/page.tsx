import Link from "next/link";

import { ROUTES } from "@/shared/config/app";
import { Button, buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

export default function LoginPage() {
  return (
    <Container className="max-w-2xl">
      <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <PageTitle
          title="Вход в аккаунт"
          description="Пока это заглушка. На следующем этапе сюда будет подключена авторизация."
        />

        <div className="mt-7 flex flex-wrap gap-3">
          <Button disabled>Войти через Email</Button>
          <Link
            href={ROUTES.decks}
            className={buttonClassName({ variant: "secondary" })}
          >
            Назад к колодам
          </Link>
        </div>

        <p className="mt-6 text-sm text-muted">
          План на следующую итерацию: добавить регистрацию, сессии и защиту приватных
          маршрутов.
        </p>
      </section>
    </Container>
  );
}
