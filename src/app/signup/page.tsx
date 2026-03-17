"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    if (!user) {
      setError("User creation failed");
      setLoading(false);
      return;
    }

    // Esperar a que el perfil se cree en la tabla profiles
    // (lo crea un trigger de Supabase, puede tardar un momento)
    let profile = null;
    let attempts = 0;
    while (!profile && attempts < 10) {
      await new Promise((res) => setTimeout(res, 800));
      const { data: p } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      profile = p;
      attempts++;
    }

    router.push(`/user/${username}`);
    router.refresh();
  };

  return (
    <div className="flex justify-center mt-20">
      <form onSubmit={signUp} className="w-[400px] space-y-4">
        <h1 className="text-2xl font-semibold">Sign up</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border w-full p-2"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}