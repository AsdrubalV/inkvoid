"use client";
import Link from "next/link";

type Story = {
  id: string;
  title: string;
  cover_url: string | null;
  category: string | null;
  views: number | null;
  likes: number | null;
  profiles: { username: string } | { username: string }[] | null;
};

type Props = {
  title: string;
  stories: Story[];
  href?: string;
};

const PATTERNS = [
  { col: "col-span-2 row-span-2" },
  { col: "col-span-1 row-span-1" },
  { col: "col-span-1 row-span-1" },
  { col: "col-span-1 row-span-2" },
  { col: "col-span-2 row-span-1" },
  { col: "col-span-1 row-span-1" },
  { col: "col-span-1 row-span-1" },
];

export default function MoodboardRow({ title, stories, href }: Props) {
  if (!stories.length) return null;

  const displayed = stories.slice(0, 10);

  return (
    <section className="space-y-0">
      <div className="relative rounded-2xl overflow-hidden">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: "100px" }}
        >
          {displayed.map((story, i) => {
            const pattern = PATTERNS[i % PATTERNS.length];
            return (
              <Link
                key={story.id}
                href={"/story/" + story.id}
                className={"group relative overflow-hidden bg-gray-100 " + pattern.col}
              >
                {story.cover_url ? (
                  <img
                    src={story.cover_url}
                    alt={story.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center p-2">
                    <p className="text-xs text-gray-500 text-center line-clamp-3">{story.title}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                  <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{story.title}</p>
                  {story.category && (
                    <p className="text-white/60 text-[9px] mt-0.5">{story.category}</p>
                  )}
                </div>
              </Link>
            );
          })}

          <div className="col-span-2 row-span-1 bg-black flex flex-col items-start justify-center px-5 gap-1">
            <p className="text-white font-bold text-base leading-tight">{title}</p>
            {href && (
              <Link
                href={href}
                className="text-white/50 text-[10px] hover:text-white transition mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                Ver todo
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}