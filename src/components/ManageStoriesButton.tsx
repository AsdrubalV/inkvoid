"use client";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

interface Props {
  profileUsername: string;
}

export default function ManageStoriesButton({ profileUsername }: Props) {
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
      href="/publish/manage"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-1.5 text-xs font-medium text-gray-700 hover:border-black hover:text-black transition"
    >
      📚 Mis historias
    </Link>
  );
}