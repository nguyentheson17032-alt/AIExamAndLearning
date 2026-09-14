import { PageHeader } from "@/components/page-header";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <PageHeader title="Log in" description="Teacher seed: teacher@exam.local / Teacher123!" />
      <LoginForm />
      <p className="mt-4 text-center text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Register
        </Link>
      </p>
    </>
  );
}
