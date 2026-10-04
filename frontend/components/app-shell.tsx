import { LogoutButton } from "@/components/logout-button";
import type { SessionUser } from "@/lib/types";
import Link from "next/link";

type NavItem = { href: string; label: string };

export function AppShell({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  const teacher = user?.role === "TEACHER" || user?.role === "ADMIN";
  const links: NavItem[] = user
    ? [
        { href: "/", label: "Home" },
        ...(teacher ? [{ href: "/ai-tutor", label: "AI Practice" }] : []),
        { href: "/subjects", label: "Subjects" },
        { href: "/classrooms", label: "Classes" },
        { href: "/me", label: "Rank" },
      ]

    : [
        { href: "/login", label: "Log in" },
        { href: "/register", label: "Register" },
      ];

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href={user ? "/" : "/login"} className="text-lg font-semibold tracking-tight">
            Exam Warehouse
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {links.map((item) => (
              <Link key={item.href} href={item.href} className="text-muted hover:text-foreground">
                {item.label}
              </Link>
            ))}
            {user ? (
              <span className="flex items-center gap-3 text-muted">
                <span>
                  {user.displayName} · {user.rankCode} {user.eloRating}
                </span>
                <LogoutButton />
              </span>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
