import Link from "next/link";

import { buttonClassName } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { EmptyState } from "@/shared/ui/empty-state";

export default function NotFoundPage() {
  return (
    <Container className="py-8">
      <EmptyState
        title="Страница не найдена"
        description="Возможно, ссылка устарела или у вас нет доступа к этому ресурсу."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/" className={buttonClassName()}>
              На главную
            </Link>
            <Link href="/decks" className={buttonClassName({ variant: "secondary" })}>
              К колодам
            </Link>
          </div>
        }
      />
    </Container>
  );
}
