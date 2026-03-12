"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function AuthPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            username
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
      }
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message ?? "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-sm rounded-xl border border-border bg-white/80 p-6">
      <div className="mb-4 flex gap-3 text-sm">
        <button
          className={`flex-1 rounded-full px-3 py-1 ${
            mode === "login"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-gray-700"
          }`}
          onClick={() => setMode("login")}
        >
          Sign in
        </button>
        <button
          className={`flex-1 rounded-full px-3 py-1 ${
            mode === "register"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-gray-700"
          }`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        {mode === "register" && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Username</label>
            <input
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-black disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

