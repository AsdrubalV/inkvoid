"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {

  const supabase = createClient();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const signIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password
    });
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">

      <h1 className="text-2xl font-semibold">Sign in</h1>

      <input
        type="email"
        placeholder="Email"
        onChange={(e)=>setEmail(e.target.value)}
        className="border p-2 w-full"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e)=>setPassword(e.target.value)}
        className="border p-2 w-full"
      />

      <button
        onClick={signIn}
        className="bg-black text-white px-4 py-2"
      >
        Sign in
      </button>

    </div>
  );
}
