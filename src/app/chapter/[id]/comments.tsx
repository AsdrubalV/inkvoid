"use client";
import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const EMOJIS = ["❤️", "😂", "😮", "😢", "🔥", "👏", "💯", "🤯"];

interface Comment {
  id: string;
  content: string;
  created_at: string;
  paragraph_id: string | null;
  parent_id: string | null;
  profiles: { username: string | null } | null;
  replies?: Comment[];
}

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface ParagraphReactions {
  [paragraphId: string]: Reaction[];
}

interface Props {
  chapterId: string;
  currentUserId: string | null;
}

export default function CommentsSection({ chapterId, currentUserId }: Props) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<ParagraphReactions>({});
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
    loadReactions();
  }, [chapterId]);

  async function loadComments() {
    const { data } = await supabase
      .from("comments")
      .select("id, content, created_at, paragraph_id, parent_id, profiles(username)")
      .eq("chapter_id", chapterId)
      .order("created_at", { ascending: true });

    if (!data) return;

    // Agrupar respuestas bajo su comentario padre
    const top: Comment[] = [];
    const map: Record<string, Comment> = {};
    data.forEach((c: any) => { map[c.id] = { ...c, replies: [] }; });
    data.forEach((c: any) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].replies!.push(map[c.id]);
      } else {
        top.push(map[c.id]);
      }
    });
    setComments(top);
  }

  async function loadReactions() {
    const { data } = await supabase
      .from("paragraph_reactions")
      .select("paragraph_id, emoji, user_id")
      .eq("chapter_id", chapterId);

    if (!data) return;

    const grouped: ParagraphReactions = {};
    data.forEach((r: any) => {
      if (!grouped[r.paragraph_id]) grouped[r.paragraph_id] = [];
      const existing = grouped[r.paragraph_id].find((x) => x.emoji === r.emoji);
      if (existing) {
        existing.count++;
        if (r.user_id === currentUserId) existing.reacted = true;
      } else {
        grouped[r.paragraph_id].push({
          emoji: r.emoji,
          count: 1,
          reacted: r.user_id === currentUserId,
        });
      }
    });
    setReactions(grouped);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim() || !currentUserId) return;
    setLoading(true);
    try {
      await supabase.from("comments").insert({
        chapter_id: chapterId,
        content,
        parent_id: replyTo?.id ?? null,
        paragraph_id: null,
      });
      setContent("");
      setReplyTo(null);
      await loadComments();
    } finally {
      setLoading(false);
    }
  }

  async function toggleReaction(paragraphId: string, emoji: string) {
    if (!currentUserId) return;
    const existing = reactions[paragraphId]?.find((r) => r.emoji === emoji && r.reacted);
    if (existing) {
      await supabase
        .from("paragraph_reactions")
        .delete()
        .eq("chapter_id", chapterId)
        .eq("user_id", currentUserId)
        .eq("paragraph_id", paragraphId)
        .eq("emoji", emoji);
    } else {
      await supabase.from("paragraph_reactions").insert({
        chapter_id: chapterId,
        user_id: currentUserId,
        paragraph_id: paragraphId,
        emoji,
      });
    }
    await loadReactions();
  }

  // Comentarios agrupados por párrafo para mostrar inline
  const byParagraph: Record<string, Comment[]> = {};
  comments.forEach((c) => {
    const key = c.paragraph_id ?? "__general__";
    if (!byParagraph[key]) byParagraph[key] = [];
    byParagraph[key].push(c);
  });

  const generalComments = byParagraph["__general__"] ?? [];

  return (
    <div className="space-y-6">

      {/* Comentarios por párrafo — se muestran agrupados */}
      {Object.entries(byParagraph)
        .filter(([key]) => key !== "__general__")
        .map(([paragraphId, paragraphComments]) => (
          <ParagraphCommentBlock
            key={paragraphId}
            paragraphId={paragraphId}
            comments={paragraphComments}
            reactions={reactions[paragraphId] ?? []}
            currentUserId={currentUserId}
            onReply={(id, username) => setReplyTo({ id, username })}
            onReaction={(emoji) => toggleReaction(paragraphId, emoji)}
            emojis={EMOJIS}
          />
        ))}

      {/* Sección general de comentarios */}
      <section className="space-y-4 rounded-xl border border-border bg-white/70 p-4">
        <h2 className="font-semibold text-sm">
          Comentarios {comments.length > 0 && <span className="text-gray-400 font-normal">({comments.length})</span>}
        </h2>

        {currentUserId ? (
          <form onSubmit={handleSubmit} className="space-y-2">
            {replyTo && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                <span>Respondiendo a <strong>@{replyTo.username}</strong></span>
                <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-gray-400 hover:text-black">✕</button>
              </div>
            )}
            <textarea
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
              rows={3}
              placeholder={replyTo ? "Escribe tu respuesta..." : "Comparte tu opinión sobre este capítulo..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {/* Emojis rápidos */}
            <div className="flex gap-1 flex-wrap">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setContent((c) => c + emoji)}
                  className="rounded-full border border-border px-2 py-0.5 text-sm hover:bg-gray-50 transition"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-black px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Publicando..." : replyTo ? "Responder" : "Comentar"}
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-500">
            <a href="/login" className="underline hover:text-black">Inicia sesión</a> para dejar un comentario.
          </p>
        )}

        {/* Lista de comentarios generales */}
        <div className="space-y-3 divide-y divide-border">
          {generalComments.length ? (
            generalComments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                onReply={(id, username) => setReplyTo({ id, username })}
              />
            ))
          ) : (
            <p className="pt-2 text-xs text-gray-400">Aún no hay comentarios. ¡Sé el primero!</p>
          )}
        </div>
      </section>
    </div>
  );
}

function ParagraphCommentBlock({
  paragraphId, comments, reactions, currentUserId, onReply, onReaction, emojis
}: {
  paragraphId: string;
  comments: Comment[];
  reactions: Reaction[];
  currentUserId: string | null;
  onReply: (id: string, username: string) => void;
  onReaction: (emoji: string) => void;
  emojis: string[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-blue-600 font-medium">💬 {comments.length} comentario{comments.length !== 1 ? "s" : ""} en este párrafo</span>
        {reactions.map((r) => (
          <button
            key={r.emoji}
            onClick={() => onReaction(r.emoji)}
            className={"rounded-full border px-2 py-0.5 text-xs transition " + (r.reacted ? "border-blue-300 bg-blue-100" : "border-border bg-white hover:bg-gray-50")}
          >
            {r.emoji} {r.count}
          </button>
        ))}
        {currentUserId && emojis.map((emoji) => (
          !reactions.find((r) => r.emoji === emoji) && (
            <button
              key={emoji}
              onClick={() => onReaction(emoji)}
              className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs hover:bg-gray-50 transition opacity-50 hover:opacity-100"
            >
              {emoji}
            </button>
          )
        ))}
        <button onClick={() => setOpen(!open)} className="ml-auto text-xs text-blue-500 hover:text-blue-700">
          {open ? "Ocultar" : "Ver comentarios"}
        </button>
      </div>
      {open && (
        <div className="space-y-2 divide-y divide-blue-100">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment, currentUserId, onReply }: {
  comment: Comment;
  currentUserId: string | null;
  onReply: (id: string, username: string) => void;
}) {
  return (
    <div className="pt-2 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-gray-700">
          @{comment.profiles?.username ?? "Usuario"}
        </span>
        <span className="text-[11px] text-gray-400">
          {new Date(comment.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
        </span>
      </div>
      <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
      {currentUserId && (
        <button
          onClick={() => onReply(comment.id, comment.profiles?.username ?? "Usuario")}
          className="text-[11px] text-gray-400 hover:text-black transition"
        >
          Responder
        </button>
      )}
      {/* Respuestas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-2 border-l-2 border-border pl-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="pt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">@{reply.profiles?.username ?? "Usuario"}</span>
                <span className="text-[11px] text-gray-400">
                  {new Date(reply.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                </span>
              </div>
              <p className="text-sm text-gray-800">{reply.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}