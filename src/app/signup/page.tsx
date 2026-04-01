"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function sanitizeUsername(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-]/g, "");
}

function validateUsername(value: string): string | null {
  if (value.length < 3) return "Mínimo 3 caracteres.";
  if (value.length > 30) return "Máximo 30 caracteres.";
  if (!/^[a-zA-Z0-9_\-]+$/.test(value)) return "Solo letras, números, guiones y guiones bajos.";
  return null;
}

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeUsername(e.target.value);
    setUsername(sanitized);
    setUsernameError(validateUsername(sanitized) ?? "");
  }

  async function signInWithGoogle() {
    setLoadingGoogle(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://inkvoid.ink/auth/callback" },
    });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const validationError = validateUsername(username);
    if (validationError) { setUsernameError(validationError); return; }
    setLoading(true);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) { setUsernameError("Este username ya está en uso."); setLoading(false); return; }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: "https://inkvoid.ink/auth/callback",
      },
    });

    if (error) { setError(error.message); setLoading(false); return; }
    if (!data.user) { setError("Error al crear cuenta."); setLoading(false); return; }

    if (data.session) {
      router.push("/user/" + username);
      router.refresh();
    } else {
      setConfirmationSent(true);
      setLoading(false);
    }
  }

  if (confirmationSent) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-full max-w-sm space-y-4 text-center">
          <div className="text-4xl">📬</div>
          <h1 className="text-2xl font-semibold">Revisa tu correo</h1>
          <p className="text-gray-600 text-sm">
            Enviamos un enlace de confirmación a <strong>{email}</strong>.
          </p>
          <p className="text-xs text-gray-400">Si no lo ves, revisa spam.</p>
          <button onClick={() => router.push("/login")} className="text-sm text-black underline hover:no-underline">
            Ir al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-20">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
          <p className="text-sm text-gray-500">Únete a InkVoid gratis.</p>
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={loadingGoogle}
          className="flex items-center justify-center gap-3 w-full rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loadingGoogle ? "Redirigiendo..." : "Continuar con Google"}
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-gray-400">o con email</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={signUp} className="space-y-3">
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              className={"w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black " + (usernameError ? "border-red-400" : "border-border")}
              required
              maxLength={30}
            />
            {usernameError && <p className="text-red-500 text-xs">{usernameError}</p>}
            {username && !usernameError && <p className="text-green-600 text-xs">Username disponible</p>}
            <p className="text-[10px] text-gray-400">Solo letras, números, guiones y guiones bajos.</p>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            required
          />
          <input
            type="password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
            required
            minLength={6}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !!usernameError}
            className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-black underline hover:no-underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}