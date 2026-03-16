import Link from "next/link";

type Story = {
  id: string;
  title: string;
  cover_url: string | null;
  category: string | null;
  views: number | null;
  likes: number | null;
  profiles: { username: string } | null;
};

export default function TrendingGrid({ stories }: { stories: Story[] }) {
  if (!stories.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 space-y-2">
        <p className="text-4xl">📭</p>
        <p className="text-sm">No hay historias con estos filtros todavía.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {stories.map((story) => (
        <Link
          key={story.id}
          href={`/story/${story.id}`}
          className="group space-y-1.5"
        >
          {/* Portada */}
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border border-border bg-gray-100">
            {story.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.cover_url}
                alt={story.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] text-gray-400">
                {story.title}
              </div>
            )}
            {/* Overlay con stats al hacer hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-3 gap-1">
              <span className="text-white text-[10px]">👁️ {story.views?.toLocaleString() ?? 0}</span>
              <span className="text-white text-[10px]">❤️ {story.likes?.toLocaleString() ?? 0}</span>
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-medium leading-tight line-clamp-2 group-hover:text-black">
              {story.title}
            </p>
            {story.profiles?.username && (
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">
                @{story.profiles.username}
              </p>
            )}
            {story.category && (
              <span className="inline-block mt-0.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] text-gray-500">
                {story.category}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}