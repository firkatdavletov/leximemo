import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/register-form";
import { getCurrentUserId } from "@/server/auth/session";
import { ROUTES } from "@/shared/config/app";
import { BackLink } from "@/shared/ui/back-link";
import { Container } from "@/shared/ui/container";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import { PageTitle } from "@/shared/ui/page-title";

export default async function RegisterPage() {
  const userId = await getCurrentUserId();

  if (userId) {
    redirect(ROUTES.decks);
  }

  return (
    <Container className="max-w-md space-y-6">
      <BackLink href={ROUTES.home} label="На главную" />

      <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <PageTitle
          title="Регистрация"
          description="Создайте аккаунт, чтобы сохранять свои колоды и карточки."
        />

        <div className="mt-6">
          <RegisterForm />
        </div>
      </section>

      <FeedbackMessage variant="info" title="После регистрации">
        Пользователь автоматически попадет в раздел с колодами и сможет сразу
        начать работу с приложением.
      </FeedbackMessage>
    </Container>
  );
}
