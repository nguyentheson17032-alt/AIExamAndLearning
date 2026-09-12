import { getSessionUser, isTeacher } from "@/lib/session";
import type { SessionUser } from "@/lib/types";
import { redirect } from "next/navigation";

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireTeacher(): Promise<SessionUser> {
  const user = await requireUser();
  if (!isTeacher(user)) {
    redirect("/");
  }
  return user;
}
