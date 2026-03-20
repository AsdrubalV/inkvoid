"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveChapterOffline, getOfflineChaptersByStory, removeStoryOffline } from "@/lib/offline";

interface Props {
  storyId: string;
  storyTitle: string;
}

export default function OfflineButton({ storyId, storyTitle }: Props) {
  const supabase = createClient();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getOfflineChaptersByStory(storyId).then((chapters) => setSaved(chapters.length > 0));
  }, [storyId]);

  async function handleSave() {
    setLoading(true);
    setProgress(0);
    try {
      const { data: chapters } = await supabase
        .from("chapters")
        .select("id, title, content_html, chapter_number, story_id, is_premium")
        .eq("story_id", storyId)
        .order("chapter_number", { ascending: true });

      if (!chapters?.length) return;

      for (let i = 0; i < chapters.length; i++) {
        await saveChapterOffline({
          ...chapters[i],
          story_title: storyTitle,
        });
        setProgress(Math.round(((i + 1) / chapters.length) * 100));
      }
      setSaved(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    setLoading(true);
    try {
      await removeStoryOffline(storyId);
      setSaved(false);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-gray-500">
        <div className="h-1.5 w-20 rounded-full bg-gray-100">
          <div className="h-1.5 rounded-full bg-black transition-all" style={{ width: progress + "%" }} />
        </div>
        <span>{progress}%</span>
      </div>
    );
  }

  if (saved) {
    return (
      <button
        onClick={handleRemove}
        className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
      >
        ✓ Guardado offline
      </button>
    );
  }

  return (
    <button
      onClick={handleSave}
      className="rounded-full border border-border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition"
    >
      Guardar para offline
    </button>
  );
}