import { logoutAction } from "@/lib/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button type="submit" className="text-sm text-muted hover:text-foreground">
        Log out
      </button>
    </form>
  );
}
