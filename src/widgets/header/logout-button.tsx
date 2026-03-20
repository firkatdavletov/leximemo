"use client";

import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

import { buttonClassName } from "@/shared/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={buttonClassName({ variant: "secondary", size: "sm" })}
    >
      Выйти
    </button>
  );
}
