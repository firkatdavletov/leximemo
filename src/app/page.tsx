import Link from "next/link";

import { APP_DESCRIPTION, APP_NAME, ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

const highlights = [
  {
    title: "Интервальные повторения",
    description: "Карточки попадают в review-сессию по мере наступления срока повторения.",
  },
  {
    title: "AI генерация карточек",
    description: "По prompt можно быстро получить превью карточек и сохранить его в колоду.",
  },
  {
    title: "Installable PWA",
    description: "Приложение можно установить на desktop и mobile без сложного offline-first слоя.",
  },
];

export default function HomePage() {
  return (
    <Container className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm sm:p-10">
        <PageTitle
          title={`${APP_NAME} — дипломный MVP`}
          description="Приложение для изучения и запоминания слов по карточкам."
        />

        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">{APP_DESCRIPTION}</p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          В проекте уже есть авторизация, колоды, карточки, review flow, streak,
          achievements, AI generation и браузерная озвучка слов.
        </p>

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
