"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
}

interface Props {
  currentUser: User;
  otherUser: User;
  initialMessages: Message[];
}

export default function ChatWindow({ currentUser, otherUser, initialMessages }: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Realtime — mensajes nuevos llegan sin recargar
    const channel = supabase
      .channel("dm-" + [currentUser.id, otherUser.id].sort().join("-"))
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
      }, (payload) => {
        const msg = payload.new as Message;
        const isRelevant =
          (msg.sender_id === currentUser.id && msg.receiver_id === otherUser.id) ||
          (msg.sender_id === otherUser.id && msg.receiver_id === currentUser.id);
        if (isRelevant) {
          setMessages((prev) => [...prev, msg]);
          // Marcar como leído si es para mí
          if (msg.receiver_id === currentUser.id) {
            supabase.from("direct_messages").update({ read: true }).eq("id", msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser.id, otherUser.id]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      await supabase.from("direct_messages").insert({
        sender_id: currentUser.id,
        receiver_id: otherUser.id,
        content: content.trim(),
      });
      setContent("");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as any);
    }
  }

  // Agrupar mensajes por fecha
  const grouped: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const date = new Date(msg.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      grouped.push({ date, messages: [msg] });
    }
  });

  return (
    <div className="mx-auto max-w-2xl py-8 space-y-0 flex flex-col" style={{ height: "calc(100vh - 140px)" }}>

      {/* Header */}
      <div className="flex items-center gap-3 rounded-t-2xl border border-b-0 border-border bg-white px-5 py-4">
        <Link href="/mensajes" className="text-gray-400 hover:text-black transition text-sm">←</Link>
        <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-gray-100 flex-shrink-0 flex items-center justify-center">
          {otherUser.avatar_url ? (
            <img src={otherUser.avatar_url} alt={otherUser.username} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg text-gray-400">👤</span>
          )}
        </div>
        <div>
          <Link href={"/user/" + otherUser.username} className="text-sm font-semibold hover:underline">
            @{otherUser.username}
          </Link>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto border border-y-0 border-border bg-gray-50 px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
            <p className="text-3xl">👋</p>
            <p className="text-sm text-gray-500">Inicia la conversación con @{otherUser.username}</p>
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.date} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-gray-400">{group.date}</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {group.messages.map((msg) => {
              const isMe = msg.sender_id === currentUser.id;
              return (
                <div key={msg.id} className={"flex " + (isMe ? "justify-end" : "justify-start")}>
                  {!isMe && (
                    <div className="h-7 w-7 overflow-hidden rounded-full border border-border bg-gray-100 flex-shrink-0 flex items-center justify-center mr-2 mt-1">
                      {otherUser.avatar_url ? (
                        <img src={otherUser.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400">👤</span>
                      )}
                    </div>
                  )}
                  <div className={"max-w-[75%] space-y-1"}>
                    <div
                      className={"rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                        (isMe
                          ? "bg-black text-white rounded-tr-sm"
                          : "bg-white border border-border text-gray-800 rounded-tl-sm")}
                    >
                      {msg.content}
                    </div>
                    <p className={"text-[10px] text-gray-400 " + (isMe ? "text-right" : "text-left")}>
                      {new Date(msg.created_at).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      {isMe && (
                        <span className="ml-1">{msg.read ? " ✓✓" : " ✓"}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-end gap-3 rounded-b-2xl border border-t-0 border-border bg-white px-4 py-3"
      >
        <textarea
          className="flex-1 resize-none rounded-xl border border-border bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-black max-h-32"
          rows={1}
          placeholder={"Mensaje a @" + otherUser.username + "..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="flex-shrink-0 rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}