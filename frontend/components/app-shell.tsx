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
  const isAdmin = user?.role === "ADMIN";
  const isTeacher = user?.role === "TEACHER";

  let links: NavItem[] = [];

  if (user) {
    if (isAdmin) {
      links = [];
    } else if (isTeacher) {
      links = [
        { href: "/", label: "Home" },
        { href: "/ai-tutor", label: "AI Practice" },
        { href: "/subjects", label: "Subjects" },
        { href: "/classrooms", label: "Classes" },
        { href: "/me", label: "Rank" },
      ];
    } else {
      // Student
      links = [
        { href: "/", label: "Home" },
        { href: "/subjects", label: "Subjects" },
        { href: "/classrooms", label: "Classes" },
        { href: "/me", label: "Rank" },
      ];
    }
  } else {
    links = [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Register" },
    ];
  }

  const brandHref = isAdmin ? "/admin" : user ? "/" : "/login";

  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-card shadow-xs">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href={brandHref} className="flex items-center gap-2 text-lg font-semibold tracking-tight text-foreground">
            {isAdmin && (
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-white font-black text-xs">
                AD
              </span>
            )}
            <span>{isAdmin ? "Admin Portal" : "Exam Warehouse"}</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {links.map((item) => {
              const isAdminLink = item.href === "/admin";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isAdminLink
                      ? "rounded-md bg-accent/10 px-2.5 py-1 font-semibold text-accent border border-accent/25 hover:bg-accent hover:text-white transition-all shadow-xs"
                      : "text-muted hover:text-foreground transition-colors"
                  }
                >
                  {item.label}
                </Link>
              );
            })}

            {user ? (
              <span className="flex items-center gap-3 text-muted">
                <span>
                  {user.displayName} {isAdmin ? "(Admin)" : `· ${user.rankCode} ${user.eloRating}`}
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
