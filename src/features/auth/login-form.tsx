"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";
import { FeedbackMessage } from "@/shared/ui/feedback-message";
import { inputClassName } from "@/shared/ui/form-fields";

type LoginFormState = {
  email: string;
  password: string;
};

const initialState: LoginFormState = {
  email: "",
  password: "",
};

export function LoginForm() {
  const [formState, setFormState] = useState<LoginFormState>(initialState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formState.email || !formState.password) {
      setError("Введите email и пароль.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const callbackUrl = searchParams.get("next") || ROUTES.decks;
      const callbackPath = callbackUrl.startsWith("/") ? callbackUrl : ROUTES.decks;

      const result = await signIn("credentials", {
        email: formState.email.trim(),
        password: formState.password,
        redirect: false,
        callbackUrl: callbackPath,
      });

      if (!result || result.error) {
        setError("Неверный email или пароль.");
        return;
      }

      router.push(callbackPath);
      router.refresh();
    } catch {
      setError("Не удалось выполнить вход. Проверьте соединение и попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
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
          aria-describedby={error ? "login-form-error" : undefined}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Пароль
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={formState.password}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, password: event.target.value }))
          }
          className={inputClassName}
          placeholder="Введите пароль"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-form-error" : undefined}
          required
        />
      </div>

      {error ? (
        <FeedbackMessage variant="error" className="py-2" title="Не удалось войти">
          <span id="login-form-error">{error}</span>
        </FeedbackMessage>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className={buttonClassName({ fullWidth: true })}
      >
        {isSubmitting ? "Входим..." : "Войти"}
      </button>

      <p className="text-sm text-muted">
        Нет аккаунта?{" "}
        <Link href={ROUTES.register} className="font-medium text-foreground underline">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
