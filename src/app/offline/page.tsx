import Link from "next/link";

import { APP_NAME, ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import { PageTitle } from "@/shared/ui/page-title";

export const metadata = {
  title: "Офлайн",
};

export default function OfflinePage() {
  return (
    <Container className="max-w-2xl space-y-6">
      <PageTitle
        title="Соединение недоступно"
        description={`${APP_NAME} можно установить как PWA, но сетевые действия и актуальные данные доступны только онлайн.`}
      />

      <FeedbackMessage
        title="Что доступно без сети"
        variant="info"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={ROUTES.home} className={buttonClassName()}>
              На главную
            </Link>
            <Link
              href={ROUTES.login}
              className={buttonClassName({ variant: "secondary" })}
            >
              Открыть логин
            </Link>
          </div>
        }
      >
        Установленное приложение сохранит базовую оболочку и статические ресурсы,
        но авторизация, API-запросы, AI-генерация и синхронизация карточек
        требуют подключения к сети.
      </FeedbackMessage>
    </Container>
  );
}
