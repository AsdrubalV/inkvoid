import Link from "next/link";

interface StoryCardProps {
  id: string;
  title: string;
  description: string | null;
  coverUrl: string | null;
  category: string | null;
  authorUsername?: string | null;
  tags?: string[] | null;
}

export function StoryCard({
  id,
  title,
  description,
  coverUrl,
  category,
  authorUsername,
  tags
}: StoryCardProps) {
  return (
    <Link
      href={`/story/${id}`}
      className="flex gap-4 rounded-xl border border-border bg-white/70 p-4 hover:bg-gray-50"
    >
      {coverUrl && (
        <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-md border border-border bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt={title} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-sm font-semibold leading-snug">{title}</h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-600">{description}</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
          {category && <span>{category}</span>}
          {authorUsername && (
            <>
              <span>•</span>
              <span>@{authorUsername}</span>
            </>
          )}
          {tags?.length ? (
            <>
              <span>•</span>
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-2 py-0.5 text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-[10px] text-gray-400">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

