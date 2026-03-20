"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

import { buttonClassName } from "@/shared/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);

    try {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={buttonClassName({ variant: "secondary", size: "sm" })}
    >
      {isPending ? "Выходим..." : "Выйти"}
    </button>
  );
}
