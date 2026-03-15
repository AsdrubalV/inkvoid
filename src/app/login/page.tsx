"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {

  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/profile/${data.user.id}`);
    router.refresh();
  };

  return (
    <div className="flex justify-center mt-20">

      <form
        onSubmit={signIn}
        className="w-[400px] space-y-4"
      >

        <h1 className="text-2xl font-semibold">Sign in</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="border w-full p-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="border w-full p-2"
          required
        />

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

      </form>

    </div>
  );
}
