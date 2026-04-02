"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

type FontFamily = "serif" | "sans" | "mono";
type Theme = "light" | "dark" | "sepia";

interface Settings {
  fontSize: number;
  fontFamily: FontFamily;
  theme: Theme;
  lineHeight: number;
  maxWidth: number;
}

const DEFAULTS: Settings = {
  fontSize: 18,
  fontFamily: "serif",
  theme: "light",
  lineHeight: 1.8,
  maxWidth: 680,
};

const FONTS: { value: FontFamily; label: string; style: string }[] = [
  { value: "serif", label: "Serif",  style: "Georgia, 'Times New Roman', serif" },
  { value: "sans",  label: "Sans",   style: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { value: "mono",  label: "Mono",   style: "'Courier New', Courier, monospace" },
];

const THEMES: { value: Theme; label: string; bg: string; text: string; border: string }[] = [
  { value: "light", label: "☀️ Claro",  bg: "#ffffff", text: "#111111", border: "#e5e7eb" },
  { value: "dark",  label: "🌙 Oscuro", bg: "#0f0f0f", text: "#e5e5e5", border: "#2a2a2a" },
  { value: "sepia", label: "📜 Sepia",  bg: "#f5efe0", text: "#3b2f1a", border: "#d4c5a0" },
];

const EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👏", "💯", "🤯"];

const MIN_READ_SECONDS = 120; // 2 minutos

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface Props {
  content: string;
  chapterId: string;
  storyId: string;
  authorId: string;
  currentUserId: string | null;
  isPremium: boolean;
}

export default function ReaderSettings({ content, chapterId, storyId, authorId, currentUserId, isPremium }: Props) {
  const supabase = createClient();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [open, setOpen] = useState(false);
  const [reactions, setReactions] = useState<Record<string, Reaction[]>>({});
  const [commentPopup, setCommentPopup] = useState<{ paragraphId: string; x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [readRegistered, setReadRegistered] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const articleRef = useRef<HTMLDivElement>(null);
  const secondsOnPageRef = useRef(0);
  const scrolledToBottomRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer — cuenta segundos activos en la página
  useEffect(() => {
    if (!isPremium || !currentUserId || readRegistered) return;

    timerRef.current = setInterval(() => {
      secondsOnPageRef.current += 1;
      checkAndRegister();
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPremium, currentUserId, readRegistered]);

  // Scroll tracker
  useEffect(() => {
    if (!isPremium || !currentUserId || readRegistered) return;

    function handleScroll() {
      const article = articleRef.current;
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const articleBottom = rect.bottom;
      const articleHeight = article.offsetHeight;
      const scrolled = Math.max(0, windowHeight - rect.top);
      const progress = Math.min(100, Math.round((scrolled / articleHeight) * 100));
      setReadProgress(progress);

      if (articleBottom <= windowHeight + 100) {
        scrolledToBottomRef.current = true;
        checkAndRegister();
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isPremium, currentUserId, readRegistered]);

  const checkAndRegister = useCallback(async () => {
    if (readRegistered) return;
    if (!scrolledToBottomRef.current) return;
    if (secondsOnPageRef.current < MIN_READ_SECONDS) return;
    if (!currentUserId) return;

    // Condiciones cumplidas — registrar lectura pagada
    if (timerRef.current) clearInterval(timerRef.current);
    setReadRegistered(true);

    try {
      await fetch("/api/paid-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, storyId, authorId }),
      });
    } catch (err) {
      console.error("Error registrando lectura:", err);
    }
  }, [readRegistered, currentUserId, chapterId, storyId, authorId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("inkvoid-reader-settings");
      if (saved) setSettings({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    loadReactions();
  }, [chapterId]);

  async function loadReactions() {
    const { data } = await supabase
      .from("paragraph_reactions")
      .select("paragraph_id, emoji, user_id")
      .eq("chapter_id", chapterId);

    if (!data) return;
    const grouped: Record<string, Reaction[]> = {};
    data.forEach((r: any) => {
      if (!grouped[r.paragraph_id]) grouped[r.paragraph_id] = [];
      const existing = grouped[r.paragraph_id].find((x) => x.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === currentUserId) existing.reacted = true;
      } else {
        grouped[r.paragraph_id].push({ emoji: r.emoji, count: 1, reacted: r.user_id === currentUserId });
      }
    });
    setReactions(grouped);
  }

  async function toggleReaction(paragraphId: string, emoji: string) {
    if (!currentUserId) return;
    const existing = reactions[paragraphId]?.find((r) => r.emoji === emoji && r.reacted);
    if (existing) {
      await supabase.from("paragraph_reactions").delete()
        .eq("chapter_id", chapterId).eq("user_id", currentUserId)
        .eq("paragraph_id", paragraphId).eq("emoji", emoji);
    } else {
      await supabase.from("paragraph_reactions").insert({
        chapter_id: chapterId, user_id: currentUserId, paragraph_id: paragraphId, emoji,
      });
    }
    await loadReactions();
  }

  async function submitParagraphComment(paragraphId: string) {
    if (!commentText.trim() || !currentUserId) return;
    setSubmitting(true);
    try {
      await supabase.from("comments").insert({
        chapter_id: chapterId,
        content: commentText,
        paragraph_id: paragraphId,
        parent_id: null,
      });
      setCommentText("");
      setCommentPopup(null);
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try { localStorage.setItem("inkvoid-reader-settings", JSON.stringify(next)); } catch {}
  }

  function processContent(html: string): string {
    let index = 0;
    return html.replace(/<p(\s[^>]*)?>/gi, (match, attrs) => {
      const id = "p-" + index++;
      return "<p" + (attrs || "") + " data-pid=\"" + id + "\">";
    });
  }

  function handleParagraphClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = (e.target as HTMLElement).closest("[data-pid]") as HTMLElement | null;
    if (!target || !currentUserId) return;
    const paragraphId = target.getAttribute("data-pid");
    if (!paragraphId) return;
    const rect = target.getBoundingClientRect();
    const containerRect = articleRef.current?.getBoundingClientRect();
    setCommentPopup({
      paragraphId,
      x: rect.right - (containerRect?.left ?? 0) - 40,
      y: rect.top - (containerRect?.top ?? 0),
    });
    setCommentText("");
  }

  const theme = THEMES.find((t) => t.value === settings.theme) ?? THEMES[0];
  const font  = FONTS.find((f) => f.value === settings.fontFamily) ?? FONTS[0];
  const processedContent = processContent(content);

  return (
    <div className="relative">

      {/* Barra de controles */}
      <div
        className="flex items-center justify-between px-4 py-2 rounded-xl mb-2 border"
        style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs opacity-50">
            {currentUserId ? "Toca un párrafo para comentar o reaccionar" : "Configuración de lectura"}
          </span>
          {/* Indicador de lectura válida solo para capítulos premium */}
          {isPremium && currentUserId && !readRegistered && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-24 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-green-400 transition-all duration-300"
                  style={{ width: readProgress + "%" }}
                />
              </div>
              <span className="text-[10px] text-gray-400">{readProgress}%</span>
            </div>
          )}
          {isPremium && currentUserId && readRegistered && (
            <span className="text-[10px] text-green-600 font-medium">✓ Lectura registrada</span>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="text-xs px-3 py-1 rounded-full border transition"
          style={{ borderColor: theme.border, color: theme.text }}
        >
          {open ? "✕ Cerrar" : "⚙️ Ajustar"}
        </button>
      </div>

      {/* Panel de ajustes */}
      {open && (
        <div
          className="rounded-xl border p-5 mb-4 space-y-5"
          style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">Tema</p>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button key={t.value} onClick={() => update("theme", t.value)}
                  className="flex-1 rounded-lg py-2 text-xs font-medium border transition"
                  style={{ background: t.bg, color: t.text, borderColor: settings.theme === t.value ? t.text : t.border, boxShadow: settings.theme === t.value ? "0 0 0 2px " + t.text : "none" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">Fuente</p>
            <div className="flex gap-2">
              {FONTS.map((f) => (
                <button key={f.value} onClick={() => update("fontFamily", f.value)}
                  className="flex-1 rounded-lg py-2 text-xs border transition"
                  style={{ fontFamily: f.style, borderColor: settings.fontFamily === f.value ? theme.text : theme.border, background: settings.fontFamily === f.value ? theme.text : "transparent", color: settings.fontFamily === f.value ? theme.bg : theme.text }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">Tamaño</p>
              <span className="text-xs opacity-60">{settings.fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => update("fontSize", Math.max(14, settings.fontSize - 1))}
                className="h-8 w-8 rounded-full border text-sm font-bold flex items-center justify-center"
                style={{ borderColor: theme.border, color: theme.text }}>−</button>
              <input type="range" min={14} max={26} step={1} value={settings.fontSize}
                onChange={(e) => update("fontSize", Number(e.target.value))} className="flex-1" />
              <button onClick={() => update("fontSize", Math.min(26, settings.fontSize + 1))}
                className="h-8 w-8 rounded-full border text-sm font-bold flex items-center justify-center"
                style={{ borderColor: theme.border, color: theme.text }}>+</button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">Interlineado</p>
              <span className="text-xs opacity-60">{settings.lineHeight}x</span>
            </div>
            <input type="range" min={1.4} max={2.4} step={0.1} value={settings.lineHeight}
              onChange={(e) => update("lineHeight", Number(e.target.value))} className="w-full" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">Ancho</p>
            <div className="flex gap-2">
              {[{ label: "Estrecho", value: 500 }, { label: "Normal", value: 680 }, { label: "Amplio", value: 860 }].map((w) => (
                <button key={w.value} onClick={() => update("maxWidth", w.value)}
                  className="flex-1 rounded-lg py-2 text-xs border transition"
                  style={{ borderColor: settings.maxWidth === w.value ? theme.text : theme.border, background: settings.maxWidth === w.value ? theme.text : "transparent", color: settings.maxWidth === w.value ? theme.bg : theme.text }}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { setSettings(DEFAULTS); try { localStorage.removeItem("inkvoid-reader-settings"); } catch {} }}
            className="text-xs opacity-50 hover:opacity-100 transition underline" style={{ color: theme.text }}>
            Restablecer
          </button>
        </div>
      )}

      {/* Artículo */}
      <div
        ref={articleRef}
        className="relative rounded-xl border px-6 py-8 transition-all duration-200"
        style={{ background: theme.bg, borderColor: theme.border, color: theme.text, maxWidth: settings.maxWidth, margin: "0 auto" }}
        onClick={handleParagraphClick}
      >
        {commentPopup && (
          <div
            className="absolute z-50 w-72 rounded-xl border bg-white shadow-xl p-3 space-y-2"
            style={{ top: commentPopup.y, right: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-xs font-semibold text-gray-700">Comentar en este párrafo</p>
            <div className="flex gap-1 flex-wrap">
              {EMOJIS.map((emoji) => (
                <button key={emoji} onClick={() => toggleReaction(commentPopup.paragraphId, emoji)}
                  className={"rounded-full border px-2 py-0.5 text-sm transition " +
                    (reactions[commentPopup.paragraphId]?.find((r) => r.emoji === emoji && r.reacted)
                      ? "border-blue-300 bg-blue-100" : "border-border hover:bg-gray-50")}>
                  {emoji}
                  {reactions[commentPopup.paragraphId]?.find((r) => r.emoji === emoji)?.count
                    ? " " + reactions[commentPopup.paragraphId].find((r) => r.emoji === emoji)?.count
                    : ""}
                </button>
              ))}
            </div>
            <textarea
              className="w-full rounded-lg border border-border px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-black"
              rows={2}
              placeholder="Escribe un comentario..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => submitParagraphComment(commentPopup.paragraphId)}
                disabled={submitting || !commentText.trim()}
                className="rounded-full bg-black px-3 py-1 text-xs text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? "..." : "Comentar"}
              </button>
              <button onClick={() => setCommentPopup(null)}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div
          style={{ fontSize: settings.fontSize + "px", fontFamily: font.style, lineHeight: settings.lineHeight, color: theme.text }}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        {Object.entries(reactions).map(([paragraphId, paraReactions]) => {
          if (!paraReactions.length) return null;
          return (
            <div key={paragraphId} className="flex gap-1 flex-wrap my-1 ml-2">
              {paraReactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={(e) => { e.stopPropagation(); toggleReaction(paragraphId, r.emoji); }}
                  className={"rounded-full border px-2 py-0.5 text-xs transition " + (r.reacted ? "border-blue-300 bg-blue-100" : "border-border bg-white/80 hover:bg-gray-50")}
                >
                  {r.emoji} {r.count}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}