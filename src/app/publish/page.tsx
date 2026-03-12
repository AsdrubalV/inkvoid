"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RichTextEditor } from "@/components/Editor";

export default function PublishPage() {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be signed in to publish.");
        setLoading(false);
        return;
      }

      let coverUrl: string | null = null;
      if (coverFile) {
        const fileExt = coverFile.name.split(".").pop();
        const path = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        const { data: storageData, error: storageError } = await supabase.storage
          .from("story-covers")
          .upload(path, coverFile, { cacheControl: "3600", upsert: false });

        if (storageError) throw storageError;
        const {
          data: { publicUrl }
        } = supabase.storage.from("story-covers").getPublicUrl(storageData.path);
        coverUrl = publicUrl;
      }

      const { data: story, error: storyError } = await supabase
        .from("stories")
        .insert({
          title,
          description,
          category,
          cover_url: coverUrl,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          author_id: user.id
        })
        .select("id")
        .single();

      if (storyError) throw storyError;

      const { error: chapterError } = await supabase.from("chapters").insert({
        story_id: story.id,
        title: chapterTitle || "Chapter 1",
        content_html: chapterContent,
        chapter_number: 1
      });

      if (chapterError) throw chapterError;

      window.location.href = `/story/${story.id}`;
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to publish story.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Publish a new story</h1>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-white/70 p-5">
        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Title</label>
              <input
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Short description</label>
              <textarea
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Category</label>
              <input
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Fantasy, Sci-Fi, Romance..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Tags</label>
              <input
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma separated: magic, academy, slow burn"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Cover image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-gray-600"
              />
              <p className="text-[11px] text-gray-400">Recommended: portrait 600x800 JPG/PNG.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">First chapter</h2>
          <input
            className="mb-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            placeholder="Chapter title"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
          />
          <RichTextEditor value={chapterContent} onChange={setChapterContent} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-black disabled:opacity-60"
        >
          {loading ? "Publishing..." : "Publish story"}
        </button>
      </form>
    </div>
  );
}

