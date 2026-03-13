import Link from "next/link";

import { APP_DESCRIPTION, APP_NAME, ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

const highlights = [
  {
    title: "Авторизация",
    description: "Регистрация и вход через email/password на базе Auth.js.",
  },
  {
    title: "CRUD колод",
    description: "Создание, просмотр, редактирование и удаление колод пользователя.",
  },
  {
    title: "CRUD карточек",
    description: "Полный цикл работы с карточками внутри каждой колоды.",
  },
];

export default function HomePage() {
  return (
    <Container className="space-y-8">
      <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <PageTitle
          title={`${APP_NAME} — дипломный MVP`}
          description="Приложение для изучения и запоминания слов по карточкам."
        />

        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">{APP_DESCRIPTION}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={ROUTES.decks} className={buttonClassName()}>
            Перейти к колодам
          </Link>
          <Link href={ROUTES.login} className={buttonClassName({ variant: "secondary" })}>
            Войти
          </Link>
          <Link href={ROUTES.register} className={buttonClassName({ variant: "secondary" })}>
            Регистрация
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
          </article>
        ))}
      </section>
    </Container>
  );
}
