import { createServerSupabase } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import ChatWindow from "./ChatWindow";

interface Props {
  params: { username: string };
}

export default async function ConversationPage({ params }: Props) {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio")
    .eq("username", params.username)
    .single();

  if (!otherProfile) return notFound();
  if (otherProfile.id === user.id) redirect("/mensajes");

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .single();

  // Traer mensajes de la conversación
  const { data: messages } = await supabase
    .from("direct_messages")
    .select("id, sender_id, receiver_id, content, read, created_at")
    .or(
      "and(sender_id.eq." + user.id + ",receiver_id.eq." + otherProfile.id + ")," +
      "and(sender_id.eq." + otherProfile.id + ",receiver_id.eq." + user.id + ")"
    )
    .order("created_at", { ascending: true });

  // Marcar como leídos los mensajes recibidos
  await supabase
    .from("direct_messages")
    .update({ read: true })
    .eq("receiver_id", user.id)
    .eq("sender_id", otherProfile.id)
    .eq("read", false);

  return (
    <ChatWindow
      currentUser={{ id: user.id, username: myProfile?.username ?? "", avatar_url: myProfile?.avatar_url ?? null }}
      otherUser={{ id: otherProfile.id, username: otherProfile.username, avatar_url: otherProfile.avatar_url }}
      initialMessages={messages ?? []}
    />
  );
}