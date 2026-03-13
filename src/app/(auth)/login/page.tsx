import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/features/auth/login-form";
import { getCurrentUserId } from "@/server/auth/session";
import { ROUTES } from "@/shared/config/app";
import { Container } from "@/shared/ui/container";
import { PageTitle } from "@/shared/ui/page-title";

export default async function LoginPage() {
  const userId = await getCurrentUserId();

  if (userId) {
    redirect(ROUTES.decks);
  }

  return (
    <Container className="max-w-md">
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
    </Container>
  );
}
