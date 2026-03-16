"use client";
import Link from "next/link";
import { useRef } from "react";

type Story = {
  id: string;
  title: string;
  cover_url: string | null;
  category: string | null;
  views: number | null;
  likes: number | null;
  profiles: { username: string } | null;
};

type Props = {
  title: string;
  stories: Story[];
  href?: string;
};

export default function StoryRow({ title, stories, href }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({ left: dir === "right" ? 300 : -300, behavior: "smooth" });
  };

  if (!stories.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {href && (
          <Link href={href} className="text-xs text-gray-500 hover:text-black">
            Ver todo →
          </Link>
        )}
      </div>

      <div className="relative group">
        {/* Botón izquierda */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md border border-border p-1.5 opacity-0 group-hover:opacity-100 transition"
        >
          ‹
        </button>

        {/* Fila de portadas */}
        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {stories.map((story) => (
            <Link
              key={story.id}
              href={`/story/${story.id}`}
              className="flex-shrink-0 w-[110px] space-y-1 group/card"
            >
              <div className="w-[110px] h-[160px] rounded-lg overflow-hidden border border-border bg-gray-100">
                {story.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={story.cover_url}
                    alt={story.title}
                    className="h-full w-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs text-center px-2">
                    {story.title}
                  </div>
                )}
              </div>
              <p className="text-xs font-medium leading-tight line-clamp-2">{story.title}</p>
              <p className="text-[10px] text-gray-500">{story.category}</p>
            </Link>
          ))}
        </div>

        {/* Botón derecha */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white shadow-md border border-border p-1.5 opacity-0 group-hover:opacity-100 transition"
        >
          ›
        </button>
      </div>
    </section>
  );
}