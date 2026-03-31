import { notFound, redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import EditProfileForm from "@/components/EditProfileForm";

interface Props {
  params: { username: string };
}

export default async function EditProfilePage({ params }: Props) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, banner_url, amazon_url, patreon_url, tiktok_url, website_url")
    .eq("id", user.id)
    .single();

  if (!profile) return notFound();
  if (profile.username !== params.username) redirect("/user/" + profile.username + "/edit");

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="flex items-center gap-3">
        <a href={"/user/" + profile.username} className="text-sm text-gray-500 hover:text-black">
          ← Volver al perfil
        </a>
        <h1 className="text-2xl font-semibold tracking-tight">Editar perfil</h1>
      </div>

      <EditProfileForm profile={profile} />

      <DeleteAccountButton />
    </div>
  );
}