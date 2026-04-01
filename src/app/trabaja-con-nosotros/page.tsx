"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const ROLES = [
  { value: "editor", label: "Editor", description: "Corrección y mejora de textos narrativos" },
  { value: "abogado", label: "Abogado", description: "Asesoría legal para autores y contratos editoriales" },
  { value: "lector_editorial", label: "Lector editorial", description: "Evaluación y retroalimentación de manuscritos" },
  { value: "corrector_estilo", label: "Corrector de estilo", description: "Revisión de estilo, coherencia y gramática" },
  { value: "maquetador", label: "Maquetador", description: "Diseño y maquetación de libros digitales e impresos" },
  { value: "influencer", label: "Influencer / Booktoker", description: "Promoción de historias y autores en redes sociales" },
  { value: "ilustrador", label: "Ilustrador", description: "Diseño de portadas e ilustraciones para historias" },
  { value: "traductor", label: "Traductor", description: "Traducción de obras a otros idiomas" },
];

function sanitizeUsername(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-]/g, "");
}

export default function TrabajaConNosotrosPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<"info" | "form" | "success">("info");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [professionalBio, setProfessionalBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const sanitized = sanitizeUsername(e.target.value);
    setUsername(sanitized);
    if (sanitized.length < 3) setUsernameError("Mínimo 3 caracteres");
    else setUsernameError("");
  }

  function toggleRole(role: string) {
    setSelectedRoles((prev) => {
      if (prev.includes(role)) return prev.filter((r) => r !== role);
      if (prev.length >= 3) return prev;
      return [...prev, role];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedRoles.length === 0) { setError("Selecciona al menos un rol."); return; }
    if (usernameError) return;
    setError("");
    setLoading(true);

    try {
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existing) { setError("Este username ya está en uso."); setLoading(false); return; }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: "https://inkvoid.ink/auth/callback",
        },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Error al crear cuenta.");

      await supabase.from("profiles").upsert({
        id: data.user.id,
        username,
        roles: selectedRoles,
        professional_bio: professionalBio,
        portfolio_url: portfolioUrl || null,
        is_collaborator: true,
      });

      setStep("success");
    } catch (err: any) {
      setError(err.message ?? "Error al registrarse.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "success") {
    return (
      <div className="mx-auto max-w-lg py-20 text-center space-y-5">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-semibold tracking-tight">¡Registro completado!</h1>
        <p className="text-gray-600 text-sm">
          Gracias por querer ser parte del equipo InkVoid. Revisa tu correo para confirmar tu cuenta y te contactaremos pronto.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <Link href="/" className="rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition text-center">
            Ir a InkVoid
          </Link>
          <button
            onClick={() => {
              const text = "Me acabo de registrar en InkVoid para colaborar como profesional del mundo editorial. ¡Únete tú también! inkvoid.ink/trabaja-con-nosotros";
              window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(text), "_blank");
            }}
            className="rounded-full border border-border px-6 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            Compartir en X / Twitter
          </button>
        </div>
      </div>
    );
  }

  if (step === "info") {
    return (
      <div className="mx-auto max-w-3xl space-y-10 py-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">Trabaja con nosotros</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            InkVoid está construyendo el ecosistema editorial más completo para el mundo hispanohablante. Buscamos profesionales que quieran ser parte de esto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ROLES.map((role) => (
            <div key={role.value} className="rounded-2xl border border-border bg-white/70 p-5 space-y-1">
              <p className="font-semibold text-sm">{role.label}</p>
              <p className="text-xs text-gray-500">{role.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-gray-900 text-white p-8 space-y-4">
          <h2 className="text-xl font-bold">¿Por qué registrarte?</h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>Serás de los primeros en acceder a los servicios profesionales de InkVoid cuando lancemos.</p>
            <p>Conectarás directamente con autores que necesitan tus servicios.</p>
            <p>Tendrás un perfil verificado como profesional dentro de la plataforma.</p>
          </div>
          <button
            onClick={() => setStep("form")}
            className="rounded-full bg-white text-black px-6 py-2.5 text-sm font-medium hover:bg-gray-100 transition"
          >
            Registrarme como colaborador →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 py-8">
      <div className="space-y-1">
        <button onClick={() => setStep("info")} className="text-sm text-gray-400 hover:text-black transition">
          ← Volver
        </button>
        <h1 className="text-2xl font-semibold tracking-tight">Registro de colaborador</h1>
        <p className="text-sm text-gray-500">Crea tu cuenta y cuéntanos qué puedes aportar a InkVoid.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Datos de cuenta */}
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
          <h2 className="text-sm font-semibold">Datos de acceso</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Username *</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              required
              maxLength={30}
              className={"w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black " + (usernameError ? "border-red-400" : "border-border bg-white")}
              placeholder="tu_nombre_profesional"
            />
            {usernameError && <p className="text-xs text-red-500">{usernameError}</p>}
            <p className="text-[10px] text-gray-400">Sin espacios ni caracteres especiales.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Contraseña *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        {/* Roles */}
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold">¿Qué puedes aportar? *</h2>
            <p className="text-xs text-gray-500 mt-0.5">Selecciona hasta 3 roles.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLES.map((role) => {
              const selected = selectedRoles.includes(role.value);
              const disabled = !selected && selectedRoles.length >= 3;
              return (
                <button
                  key={role.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleRole(role.value)}
                  className={"rounded-xl border p-3 text-left transition " + (selected ? "border-black bg-black text-white" : disabled ? "border-border bg-gray-50 opacity-40 cursor-not-allowed" : "border-border bg-white hover:border-black")}
                >
                  <p className={"text-xs font-semibold " + (selected ? "text-white" : "text-gray-900")}>{role.label}</p>
                  <p className={"text-[10px] mt-0.5 " + (selected ? "text-gray-300" : "text-gray-500")}>{role.description}</p>
                </button>
              );
            })}
          </div>
          {selectedRoles.length > 0 && (
            <p className="text-xs text-gray-500">{selectedRoles.length}/3 roles seleccionados</p>
          )}
        </div>

        {/* Info profesional */}
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
          <h2 className="text-sm font-semibold">Información profesional</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Cuéntanos sobre tu experiencia *</label>
            <textarea
              value={professionalBio}
              onChange={(e) => setProfessionalBio(e.target.value)}
              required
              rows={4}
              maxLength={500}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black resize-none"
              placeholder="Describe tu experiencia, especialidad y lo que puedes ofrecer a los autores de InkVoid..."
            />
            <p className="text-[10px] text-gray-400 text-right">{professionalBio.length}/500</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Portfolio o perfil profesional</label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              placeholder="https://linkedin.com/in/... o tu web"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || selectedRoles.length === 0 || !!usernameError}
          className="w-full rounded-full bg-black py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60 transition"
        >
          {loading ? "Registrando..." : "Crear perfil de colaborador"}
        </button>

        <p className="text-center text-xs text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="underline hover:text-black">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
}