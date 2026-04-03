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

  // Offsets verticales para efecto masonry
  const offsets1 = [0, 16, 8, 24, 4, 20];
  const offsets2 = [12, 0, 0, 8, 18, 6];

  return (
    <section className="space-y-1">
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>

        {/* Fila 1 — 6 portadas con offset */}
        {s.slice(0, 6).map((story, i) => (
          <CoverCell key={story.id + "-1-" + i} story={story} offset={offsets1[i]} />
        ))}

        {/* Fila 2 — 2 portadas + titulo central (2 cols) + 2 portadas */}
        <CoverCell story={s[6]} offset={offsets2[0]} />
        <CoverCell story={s[7]} offset={offsets2[1]} />

        {/* Celda título — ocupa 2 columnas */}
        <div
          className="col-span-2 rounded-xl bg-black flex flex-col items-center justify-center text-center px-4 gap-2"
          style={{ aspectRatio: "1/1", marginTop: "0px" }}
        >
          <p className="text-[9px] text-white/40 uppercase tracking-widest font-medium">InkVoid</p>
          <p className="text-white font-bold text-sm leading-tight">{title}</p>
          {href && (
            <Link
              href={href}
              className="text-[10px] text-white/40 hover:text-white transition mt-0.5"
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