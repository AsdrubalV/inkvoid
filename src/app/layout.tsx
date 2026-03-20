import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "InkVoid",
  description: "Lee, escribe y descubre historias",
  icons: {
    icon: "/inkvoidlogo1.png",
    apple: "/inkvoidlogo1.png"
  }
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <AuthProvider>
          <ServiceWorkerRegister />
          <div className="border-b border-border bg-white/70 backdrop-blur">
            <header className="container flex h-16 items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <Image
                    src="/inkvoidlogo4.png"
                    alt="InkVoid"
                    width={140}
                    height={40}
                    priority
                    className="h-8 w-auto"
                  />
                </Link>
                {user && (
                  <nav className="flex items-center gap-4 text-sm text-gray-700">
                    <Link href="/trending" className="hover:text-black">Trending</Link>
                    <Link href="/publish" className="hover:text-black">Publish</Link>
                  </nav>
                )}
              </div>
              <div className="flex-1 flex justify-center">
                <SearchBar />
              </div>
              <div className="flex items-center gap-4 text-sm">
                {user ? (
                  <>
                    {username && (
                      <Link
                        href={`/user/${username}`}
                        className="rounded-full border border-border px-3 py-1 hover:bg-gray-50"
                      >
                        {username}
                      </Link>
                    )}
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
                  <div className="flex gap-3">
                    <Link href="/signup" className="rounded-full border border-border px-4 py-1.5 hover:bg-gray-50">
                      Sign up
                    </Link>
                    <Link href="/login" className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800">
                      Sign in
                    </Link>
                  </div>
                )}
              </div>
            </header>
          </div>
          <main className="container py-8">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}