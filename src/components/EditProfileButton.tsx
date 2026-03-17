"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Props {
  profileUsername: string;
}

export default function EditProfileButton({ profileUsername }: Props) {
  const { user, loading } = useAuth();
  const supabase = createClient();
  const [myUsername, setMyUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setMyUsername(data?.username ?? null));
  }, [user]);

  if (loading || !user || myUsername !== profileUsername) return null;

  return (
    <Link
      href={"/user/" + profileUsername + "/edit"}
      className="absolute top-4 right-4 rounded-full bg-black/60 px-4 py-1.5 text-xs font-medium text-white hover:bg-black transition"
    >
      ✏️ Edit profile
    </Link>
  );
}