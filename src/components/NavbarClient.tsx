"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import NotificationBell from "@/components/NotificationBell";
import SearchBar from "@/components/SearchBar";

interface Props {
  user: { id: string } | null;
  username: string | null;
  hasSubscription: boolean;
}

export default function NavbarClient({ user, username, hasSubscription }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    setMenuOpen(false);
  }

  return (
    <div className="border-b border-border bg-white/70 backdrop-blur relative z-50">
      <header className="container flex h-16 items-center justify-between gap-4">

        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <Image src="/inkvoidlogo4.png" alt="InkVoid" width={140} height={40} priority className="h-8 w-auto" />
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-700">
            <Link href="/trending" className="hover:text-black transition">Trending</Link>
            <Link href="/publish" className="hover:text-black transition">Publish</Link>
          </nav>
        )}

        <div className="hidden md:flex flex-1 justify-center">
          <SearchBar />
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm">
          {user ? (
            <>
              <NotificationBell userId={user.id} />
              {!hasSubscription && (
                <Link
                  href="/subscribe"
                  className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600 transition"
                >
                  Premium
                </Link>
              )}
              {hasSubscription && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  Premium
                </span>
              )}
              {username && (
                <Link href={"/user/" + username} className="rounded-full border border-border px-3 py-1 hover:bg-gray-50 transition">
                  {username}
                </Link>
              )}
              <button onClick={handleSignOut} className="rounded-full border border-border px-3 py-1 text-gray-700 hover:bg-gray-100 transition">
                Sign out
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link href="/subscribe" className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition">
                Premium
              </Link>
              <Link href="/signup" className="rounded-full border border-border px-4 py-1.5 hover:bg-gray-50 transition">
                Sign up
              </Link>
              <Link href="/login" className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800 transition">
                Sign in
              </Link>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-3 ml-auto">
          {user && <NotificationBell userId={user.id} />}
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col justify-center items-center w-9 h-9 gap-1.5" aria-label="Menu">
            <span className={"block h-0.5 w-6 bg-gray-800 transition-all duration-300 " + (menuOpen ? "rotate-45 translate-y-2" : "")} />
            <span className={"block h-0.5 w-6 bg-gray-800 transition-all duration-300 " + (menuOpen ? "opacity-0" : "")} />
            <span className={"block h-0.5 w-6 bg-gray-800 transition-all duration-300 " + (menuOpen ? "-rotate-45 -translate-y-2" : "")} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-white/95 backdrop-blur px-4 py-4 space-y-4">
          <div onClick={() => setMenuOpen(false)}>
            <SearchBar />
          </div>

          <nav className="space-y-1">
            <Link href="/trending" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Trending
            </Link>
            {user && (
              <Link href="/publish" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                Publish
              </Link>
            )}
            {!hasSubscription && (
              <Link href="/subscribe" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 transition">
                Premium — $5.99/mes
              </Link>
            )}
          </nav>

          <div className="border-t border-border pt-3 space-y-1">
            {user ? (
              <>
                {username && (
                  <Link href={"/user/" + username} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-gray-50 transition">
                    <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                      {username[0].toUpperCase()}
                    </div>
                    {username}
                    {hasSubscription && <span className="ml-auto text-[10px] bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Premium</span>}
                  </Link>
                )}
                <button onClick={handleSignOut} className="w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                  Cerrar sesion
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/subscribe" onClick={() => setMenuOpen(false)} className="w-full text-center rounded-full bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition">
                  Suscribirme — Premium
                </Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="w-full text-center rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition">
                  Crear cuenta
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full text-center rounded-full border border-border px-4 py-2.5 text-sm hover:bg-gray-50 transition">
                  Iniciar sesion
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}