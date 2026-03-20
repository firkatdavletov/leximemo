"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

import { ROUTES } from "@/shared/config/app";
import { buttonClassName } from "@/shared/ui/button";

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

    const callbackUrl = searchParams.get("next") || ROUTES.decks;
    const callbackPath = callbackUrl.startsWith("/") ? callbackUrl : ROUTES.decks;

    const result = await signIn("credentials", {
      email: formState.email,
      password: formState.password,
      redirect: false,
      callbackUrl: callbackPath,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError("Неверный email или пароль.");
      return;
    }

    router.push(callbackPath);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
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
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm outline-none ring-accent/40 transition focus:ring-2"
          required
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
