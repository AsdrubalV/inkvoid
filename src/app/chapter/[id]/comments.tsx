"use client";

import { useEffect, useState, FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
}

interface CommentsSectionProps {
  chapterId: string;
  currentUserId: string | null;
}

export default function CommentsSection({
  chapterId,
  currentUserId
}: CommentsSectionProps) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("chapter_comments")
        .select(
          `
          id,
          content,
          created_at,
          profiles (
            username
          )
        `
        )
        .eq("chapter_id", chapterId)
        .order("created_at", { ascending: false });
      setComments((data as Comment[]) ?? []);
    })();
  }, [chapterId, supabase]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chapter_comments")
        .insert({
          chapter_id: chapterId,
          content
        })
        .select(
          `
        id,
        content,
        created_at,
        profiles (
          username
        )
      `
        )
        .single();
      if (error) throw error;
      setComments((prev) => [data as Comment, ...prev]);
      setContent("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-3 rounded-xl border border-border bg-white/70 p-4 text-sm">
      <h2 className="font-semibold">Comments</h2>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <textarea
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            rows={3}
            placeholder="Share your thoughts on this chapter..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-black disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post comment"}
          </button>
        </form>
      ) : (
        <p className="text-xs text-gray-500">Sign in to leave a comment.</p>
      )}

      <div className="divide-y divide-border">
        {comments.length ? (
          comments.map((c) => (
            <div key={c.id} className="py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">
                  {c.profiles?.username ?? "User"}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(c.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-800">{c.content}</p>
            </div>
          ))
        ) : (
          <p className="py-2 text-xs text-gray-500">No comments yet.</p>
        )}
      </div>
    </section>
  );
}

