"use client";

import { signOut } from "next-auth/react";

import { buttonClassName } from "@/shared/ui/button";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={buttonClassName({ variant: "secondary", size: "sm" })}
    >
      Выйти
    </button>
  );
}
