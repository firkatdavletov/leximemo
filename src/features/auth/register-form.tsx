"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import { helperTextClassName, inputClassName } from "@/shared/ui/form-fields";
import type { ApiError } from "@/shared/types/api";

type RegisterFormState = {
  email: string;
  password: string;
  name: string;
};

const initialState: RegisterFormState = {
  email: "",
  password: "",
  name: "",
};

export function RegisterForm() {
  const [formState, setFormState] = useState<RegisterFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.email || !formState.password) {
      setError("Email и пароль обязательны.");
      return;
    }

    if (formState.password.length < 6) {
      setError("Пароль должен быть не короче 6 символов.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const registerResponse = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formState.email.trim(),
          password: formState.password,
          name: formState.name,
        }),
      });

      if (!registerResponse.ok) {
        const errorBody = (await registerResponse.json().catch(() => null)) as
          | ApiError
          | null;
        setError(errorBody?.error ?? "Не удалось зарегистрироваться.");
        return;
      }

      const signInResponse = await signIn("credentials", {
        email: formState.email.trim(),
        password: formState.password,
        redirect: false,
        callbackUrl: ROUTES.decks,
      });

      if (!signInResponse || signInResponse.error) {
        setError("Регистрация прошла, но автоматически войти не удалось.");
        return;
      }

      router.push(ROUTES.decks);
      router.refresh();
    } catch {
      setError("Не удалось завершить регистрацию. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
      <div className="space-y-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          autoFocus
          value={formState.email}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, email: event.target.value }))
          }
          className={inputClassName}
          placeholder="you@example.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "register-form-error" : "register-password-hint"}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-password" className="text-sm font-medium text-foreground">
          Пароль
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={formState.password}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, password: event.target.value }))
          }
          className={inputClassName}
          placeholder="Минимум 6 символов"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "register-form-error" : "register-password-hint"}
          required
          minLength={6}
        />
        <p id="register-password-hint" className={helperTextClassName}>
          Используйте минимум 6 символов.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-name" className="text-sm font-medium text-foreground">
          Имя (опционально)
        </label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          value={formState.name}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, name: event.target.value }))
          }
          className={inputClassName}
          placeholder="Как к вам обращаться"
        />
      </div>

      {error ? (
        <FeedbackMessage variant="error" className="py-2" title="Ошибка регистрации">
          <span id="register-form-error">{error}</span>
        </FeedbackMessage>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonClassName({ fullWidth: true })}
      >
        {isSubmitting ? "Создаем аккаунт..." : "Создать аккаунт"}
      </button>

      <p className="text-sm text-muted">
        Уже есть аккаунт?{" "}
        <Link href={ROUTES.login} className="font-medium text-foreground underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
