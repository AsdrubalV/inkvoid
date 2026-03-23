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
  const [confirmationSent, setConfirmationSent] = useState(false);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: "https://inkvoid.ink/auth/callback",
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

    // Si Supabase requiere confirmación de email, mostrar mensaje
    // Si no requiere confirmación, redirigir directamente
    if (data.session) {
      // No requiere confirmación — sesión activa inmediatamente
      router.push("/user/" + username);
      router.refresh();
    } else {
      // Requiere confirmación de email
      setConfirmationSent(true);
      setLoading(false);
    }
  };

  // Pantalla de confirmación pendiente
  if (confirmationSent) {
    return (
      <div className="flex justify-center mt-20">
        <div className="w-[400px] space-y-4 text-center">
          <div className="text-4xl">📬</div>
          <h1 className="text-2xl font-semibold">Revisa tu correo</h1>
          <p className="text-gray-600 text-sm">
            Te enviamos un enlace de confirmación a <strong>{email}</strong>.
            Haz click en el enlace para activar tu cuenta.
          </p>
          <p className="text-xs text-gray-400">
            Si no ves el correo, revisa tu carpeta de spam.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-black underline hover:no-underline"
          >
            Ir al login
          </button>
        </div>
      </div>
    );
  }

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