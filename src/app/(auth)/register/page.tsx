import { redirect } from "next/navigation";

import { RegisterForm } from "@/features/auth/register-form";
import { getCurrentUserId } from "@/server/auth/session";
import { ROUTES } from "@/shared/config/app";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

export default async function RegisterPage() {
  const userId = await getCurrentUserId();

  if (userId) {
    redirect(ROUTES.decks);
  }

  return (
    <Container className="max-w-md">
      <section className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <PageTitle
          title="Регистрация"
          description="Создайте аккаунт, чтобы сохранять свои колоды и карточки."
        />

        <div className="mt-6">
          <RegisterForm />
        </div>
      </section>
    </Container>
  );
}
