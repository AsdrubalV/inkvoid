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

function CoverCell({ story }: { story: Story }) {
  return (
    <Link
      href={"/story/" + story.id}
      className="group relative overflow-hidden bg-gray-100 aspect-[2/3]"
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
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

  const s = stories.slice(0, 8);
  // Rellenar hasta 8 si hay menos
  while (s.length < 8) s.push(s[0]);

  return (
    <section>
      <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
        {/* Fila 1: portada, portada, portada */}
        <CoverCell story={s[0]} />
        <CoverCell story={s[1]} />
        <CoverCell story={s[2]} />

        {/* Fila 2: portada, TITULO (centro), portada */}
        <CoverCell story={s[3]} />
        <div className="aspect-[2/3] bg-white border border-border flex flex-col items-center justify-center text-center px-4 gap-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">InkVoid</p>
          <p className="text-gray-900 font-bold text-base leading-tight">{title}</p>
          {href && (
            <Link
              href={href}
              className="text-[11px] text-gray-400 hover:text-black transition mt-1 underline"
              onClick={(e) => e.stopPropagation()}
            >
              Ver todo
            </Link>
          )}
        </div>
        <CoverCell story={s[4]} />

        {/* Fila 3: portada, portada, portada */}
        <CoverCell story={s[5]} />
        <CoverCell story={s[6]} />
        <CoverCell story={s[7]} />
      </div>
    </section>
  );
}