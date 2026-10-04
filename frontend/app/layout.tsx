import { AppShell } from "@/components/app-shell";
import { backendFetch, rethrowIfRedirect } from "@/lib/backend";
import { getSessionUser } from "@/lib/session";
import type { SessionUser, UserProfile } from "@/lib/types";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam Warehouse",
  description: "Question bank, papers, and AI-assisted exams",
};

export const dynamic = "force-dynamic";

async function liveSessionUser(): Promise<SessionUser | null> {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }
  try {
    const profile = await backendFetch<UserProfile>("/api/v1/me");
    return {
      ...session,
      displayName: profile.displayName,
      role: profile.role,
      eloRating: profile.eloRating,
      rankCode: profile.rankCode,
    };
  } catch (error) {
    rethrowIfRedirect(error);
    return session;
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await liveSessionUser();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShell user={user}>{children}</AppShell>
      </body>
    </html>
  );
}
