import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";
import { getCurrentUserId } from "@/server/auth/session";
import {
  DEFAULT_DEMO_EMAIL,
  DEFAULT_DEMO_PASSWORD,
  ROUTES,
} from "@/shared/config/app";
import { BackLink } from "@/shared/ui/back-link";
import { Container } from "@/shared/ui/container";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import { PageTitle } from "@/shared/ui/page-title";

export default async function LoginPage() {
  const userId = await getCurrentUserId();

  if (userId) {
    redirect(ROUTES.decks);
  }

  return (
    <Container className="max-w-md space-y-6">
      <BackLink href={ROUTES.home} label="На главную" />

      <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <PageTitle
          title="Вход"
          description="Войдите в аккаунт, чтобы работать со своими колодами и карточками."
        />

        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-muted">Загрузка формы...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>

      <FeedbackMessage variant="info" title="Демо-вход для защиты">
        Email: <strong>{DEFAULT_DEMO_EMAIL}</strong>
        <br />
        Пароль: <strong>{DEFAULT_DEMO_PASSWORD}</strong>
      </FeedbackMessage>
    </Container>
  );
}
