"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";
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

    const registerResponse = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formState.email,
        password: formState.password,
        name: formState.name,
      }),
    });

    if (!registerResponse.ok) {
      const errorBody = (await registerResponse.json().catch(() => null)) as
        | ApiError
        | null;
      setError(errorBody?.error ?? "Не удалось зарегистрироваться.");
      setIsSubmitting(false);
      return;
    }

    const signInResponse = await signIn("credentials", {
      email: formState.email,
      password: formState.password,
      redirect: false,
      callbackUrl: ROUTES.decks,
    });

    setIsSubmitting(false);

    if (!signInResponse || signInResponse.error) {
      setError("Регистрация прошла, но автоматически войти не удалось.");
      return;
    }

    router.push(ROUTES.decks);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={formState.email}
          onChange={(event) =>
            setFormState((prev) => ({ ...prev, email: event.target.value }))
          }
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
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
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
          required
          minLength={6}
        />
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
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
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
