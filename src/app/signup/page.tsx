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

```
setError("");
setLoading(true);

// 1️⃣ Crear usuario en auth
const { data, error: signUpError } = await supabase.auth.signUp({
  email,
  password
});

if (signUpError) {
  setError(signUpError.message);
  setLoading(false);
  return;
}

const user = data.user;

if (!user) {
  setError("User creation failed");
  setLoading(false);
  return;
}

// 2️⃣ Esperar a que exista sesión
const { data: sessionData } = await supabase.auth.getSession();

if (!sessionData.session) {
  setError("Session not ready yet. Please login.");
  setLoading(false);
  return;
}

// 3️⃣ Crear perfil
const { error: profileError } = await supabase
  .from("profiles")
  .insert({
    id: user.id,
    email: email,
    username: username
  });

if (profileError) {
  setError(profileError.message);
  setLoading(false);
  return;
}

// 4️⃣ Redirigir al perfil
router.push(`/user/${username}`);
router.refresh();
```

};

return ( <div className="flex justify-center mt-20">

```
  <form
    onSubmit={signUp}
    className="w-[400px] space-y-4"
  >

    <h1 className="text-2xl font-semibold">Sign up</h1>

    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e)=>setUsername(e.target.value)}
      className="border w-full p-2"
      required
    />

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
      {loading ? "Creating account..." : "Sign up"}
    </button>

  </form>

</div>
```

);
}
