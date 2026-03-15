"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Navbar() {

  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (

    <header className="container flex h-16 items-center justify-between">

      <Link href="/">
        InkVoid
      </Link>

      <div className="flex gap-4">

        {user ? (

          <>
            <Link href="/profile">
              Profile
            </Link>

            <button onClick={signOut}>
              Sign out
            </button>
          </>

        ) : (

          <>
            <Link href="/signup">
              Sign up
            </Link>

            <Link href="/login">
              Sign in
            </Link>
          </>

        )}

      </div>

    </header>

  );
}