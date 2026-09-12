import { PageHeader } from "@/components/page-header";
import { RegisterForm } from "@/components/register-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <PageHeader title="Register" description="New accounts start as students at Bronze rank." />
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-muted">
        Already registered?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
