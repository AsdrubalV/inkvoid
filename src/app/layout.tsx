import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";
import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "InkVoid",
  description: "Minimalist web fiction platform"
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <div className="border-b border-border bg-white/70 backdrop-blur">
          <header className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-semibold tracking-tight">
                InkVoid
              </Link>
              <nav className="flex items-center gap-4 text-sm text-gray-700">
                <Link href="/trending" className="hover:text-black">
                  Trending
                </Link>
                <Link href="/publish" className="hover:text-black">
                  Publish
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <Link
                    href={`/profile/${user.user_metadata?.username || user.email}`}
                    className="rounded-full border border-border px-3 py-1 hover:bg-gray-50"
                  >
                    Profile
                  </Link>
                  <form action="/auth/sign-out" method="post">
                    <button
                      type="submit"
                      className="rounded-full border border-border px-3 py-1 text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-black"
                >
                  Sign in
                </Link>
              )}
            </div>
          </header>
        </div>
        <main className="container py-8">{children}</main>
      </body>
    </html>
  );
}