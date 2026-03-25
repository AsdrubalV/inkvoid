"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  url: string | null;
  read: boolean;
  created_at: string;
}

export default function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    loadNotifications();
    const channel = supabase
      .channel("notifications-" + userId)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: "user_id=eq." + userId,
      }, (payload) => {
        setNotifications((prev) => [payload.new as Notification, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications(data ?? []);
  }

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
        className="relative flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition"
        aria-label="Notificaciones"
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold">Notificaciones</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-gray-400 hover:text-black transition">
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-2xl">🔕</p>
                <p className="text-sm text-gray-400">No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={() => markRead(n.id)} />
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <Link
                href="/notificaciones"
                className="block text-center text-xs text-gray-400 hover:text-black transition"
                onClick={() => setOpen(false)}
              >
                Ver todas →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: () => void }) {
  const timeAgo = getTimeAgo(notification.created_at);
  const content = (
    <div
      className={"flex gap-3 px-4 py-3 hover:bg-gray-50 transition cursor-pointer " + (!notification.read ? "bg-blue-50/50" : "")}
      onClick={onRead}
    >
      <div className="flex-shrink-0 text-lg mt-0.5">
        {notification.type === "new_chapter" ? "📖" : "🔔"}
      </div>
      <div className="flex-1 min-w-0">
        <p className={"text-xs leading-snug " + (!notification.read ? "font-semibold text-gray-900" : "text-gray-700")}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">{timeAgo}</p>
      </div>
      {!notification.read && (
        <div className="flex-shrink-0 mt-1.5">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
        </div>
      )}
    </div>
  );
  if (notification.url) {
    return <Link href={notification.url}>{content}</Link>;
  }
  return content;
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return "hace " + mins + " min";
  if (hours < 24) return "hace " + hours + "h";
  if (days < 7) return "hace " + days + "d";
  return new Date(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}