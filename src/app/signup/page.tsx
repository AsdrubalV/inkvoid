"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function sanitizeUsername(value: string): string {
  return value.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚüÜñÑ]/g, "");
}

function validateUsername(value: string): string | null {
  if (value.length < 3) return "El username debe tener al menos 3 caracteres.";
  if (value.length > 30) return "El username no puede superar 30 caracteres.";
  if (/\s/.test(value)) return "El username no puede contener espacios.";
  if (!/^[a-zA-Z0-9_\-áéíóúÁÉÍÓÚüÜñÑ]+$/.test(value))
    return "Solo se permiten letras, números, guiones y guiones bajos.";
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
  const [confirmationSent, setConfirmationSent] = useState(false);

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    const sanitized = sanitizeUsername(raw);
    setUsername(sanitized);
    const err = validateUsername(sanitized);
    setUsernameError(err ?? "");
  }

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setLoading(true);

    // Verificar que el username no esté tomado
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) {
      setUsernameError("Este username ya está en uso.");
      setLoading(false);
      return;
    }

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

    if (data.session) {
      router.push("/user/" + username);
      router.refresh();
    } else {
      setConfirmationSent(true);
      setLoading(false);
    }
  };

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
        <h1 className="text-2xl font-semibold">Crear cuenta</h1>

        <div className="space-y-1">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            className={"border w-full p-2 rounded " + (usernameError ? "border-red-400" : "")}
            required
            maxLength={30}
          />
          {usernameError && <p className="text-red-500 text-xs">{usernameError}</p>}
          {username && !usernameError && (
            <p className="text-green-600 text-xs">✓ Username disponible</p>
          )}
          <p className="text-[11px] text-gray-400">
            Solo letras, números, guiones y guiones bajos. Sin espacios.
          </p>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border w-full p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full p-2 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !!usernameError}
          className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-60"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}