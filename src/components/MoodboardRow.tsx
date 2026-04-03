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

function CoverCell({ story, offset = 0 }: { story: Story; offset?: number }) {
  return (
    <Link
      href={"/story/" + story.id}
      className="group relative overflow-hidden bg-gray-100 rounded-xl block"
      style={{ aspectRatio: "2/3", marginTop: offset + "px" }}
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
        <p className="text-white text-xs font-semibold line-clamp-2 leading-tight">{story.title}</p>
        {story.category && (
          <p className="text-white/60 text-[9px] mt-0.5">{story.category}</p>
        )}
      </div>
    </Link>
  );
}

export default function MoodboardRow({ title, stories, href }: Props) {
  if (!stories.length) return null;

  const s = [...stories.slice(0, 12)];
  while (s.length < 12) s.push(s[s.length - 1]);

  const offsets1 = [0, 16, 8, 24, 4, 20];
  const offsets2 = [12, 0, 8, 18, 6];

  // Partir el título en palabras para el efecto tipográfico
  const words = title.split(" ");
  const firstWord = words[0];
  const restWords = words.slice(1).join(" ");

  return (
    <section className="space-y-1">
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>

        {/* Fila 1 */}
        {s.slice(0, 6).map((story, i) => (
          <CoverCell key={story.id + "-1-" + i} story={story} offset={offsets1[i]} />
        ))}

        {/* Fila 2 */}
        <CoverCell story={s[6]} offset={offsets2[0]} />
        <CoverCell story={s[7]} offset={offsets2[1]} />

        {/* Celda título — mismo tamaño que portada */}
        <div
          className="rounded-xl bg-black flex flex-col items-start justify-between p-3 overflow-hidden relative"
          style={{ aspectRatio: "2/3", marginTop: offsets2[2] + "px" }}
        >
          {/* Fondo decorativo */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white" />
            <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full bg-white" />
          </div>

          <p className="text-[8px] text-white/30 uppercase tracking-widest font-medium relative z-10">
            InkVoid
          </p>

          <div className="relative z-10 space-y-0">
            {/* Primera palabra grande */}
            <p
              className="text-white font-black leading-none uppercase"
              style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", letterSpacing: "-0.02em" }}
            >
              {firstWord}
            </p>
            {restWords && (
              <p
                className="text-white/70 font-bold leading-tight"
                style={{ fontSize: "clamp(0.6rem, 1.2vw, 0.85rem)" }}
              >
                {restWords}
              </p>
            )}
          </div>

          {href && (
            <Link
              href={href}
              className="relative z-10 text-[9px] text-white/40 hover:text-white transition border-b border-white/20 hover:border-white pb-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              Ver todo
            </Link>
          )}
        </div>

        <CoverCell story={s[8]} offset={offsets2[3]} />
        <CoverCell story={s[9]} offset={offsets2[4]} />

      </div>
    </section>
  );
}
