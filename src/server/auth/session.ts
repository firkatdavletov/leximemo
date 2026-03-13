import { getServerSession } from "next-auth";

import { authOptions } from "@/server/auth/auth-options";

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
