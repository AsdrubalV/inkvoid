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

function CoverCell({ story, tall }: { story: Story; tall?: boolean }) {
  return (
    <Link
      href={"/story/" + story.id}
      className={
        "group relative overflow-hidden bg-gray-100 rounded-lg " +
        (tall ? "row-span-2" : "")
      }
      style={{ aspectRatio: "2/3" }}
    >
      {story.cover_url ? (
        <img
          src={story.cover_url}
          alt={story.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center p-2">
          <p className="text-xs text-gray-500 text-center line-clamp-3">
            {story.title}
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
        <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">
          {story.title}
        </p>
        {story.category && (
          <p className="text-white/60 text-[9px] mt-0.5">
            {story.category}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function MoodboardRow({ title, stories, href }: Props) {
  if (!stories.length) return null;

  const s = [...stories.slice(0, 11)];
  while (s.length < 11) s.push(s[0]);

  return (
    <section>
      <div
        className="grid gap-2 rounded-2xl overflow-hidden"
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          maxWidth: "900px", // 👈 controla tamaño de TODO el moodboard
          margin: "0 auto",  // 👈 lo centra correctamente
        }}
      >
        {/* Fila 1 */}
        {s.slice(0, 6).map((story, i) => (
          <div
            key={story.id + "-a-" + i}
            style={{ marginTop: [0, 12, 6, 18, 4, 14][i] + "px" }}
          >
            <CoverCell story={story} />
          </div>
        ))}

        {/* Fila 2 */}
        {[0, 1, 2, 3, 4].map((i) => {
          if (i === 2) {
            return (
              <div
                key="title-cell"
                className="rounded-lg bg-white border border-border flex flex-col items-center justify-center text-center px-2 py-3 gap-1"
                style={{ aspectRatio: "2/3", marginTop: "6px" }}
              >
                <p className="text-[8px] text-gray-400 uppercase tracking-widest font-medium">
                  InkVoid
                </p>
                <p className="text-gray-900 font-bold text-xs leading-tight">
                  {title}
                </p>
                {href && (
                  <Link
                    href={href}
                    className="text-[9px] text-gray-400 hover:text-black transition underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver todo
                  </Link>
                )}
              </div>
            );
          }

          const storyIndex = 6 + (i < 2 ? i : i - 1);

          return (
            <div
              key={s[storyIndex].id + "-b-" + i}
              style={{ marginTop: [8, 0, 0, 10, 4][i] + "px" }}
            >
              <CoverCell story={s[storyIndex]} />
            </div>
          );
        })}
      </div>
    </section>
  );
}