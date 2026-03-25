import Link from "next/link";

interface Props {
  storyId: string;
  storyTitle: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  updatedAt: string;
}

export default function ContinueReading({
  storyId,
  storyTitle,
  chapterId,
  chapterNumber,
  chapterTitle,
  updatedAt,
}: Props) {
  return (
    <Link
      href={"/chapter/" + chapterId}
      className="group flex items-center gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 hover:bg-green-100 transition"
    >
      <div className="flex-shrink-0 text-2xl">▶️</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-green-700 font-medium uppercase tracking-wide">Continúa leyendo</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 truncate">{storyTitle}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Capítulo {chapterNumber} — {chapterTitle}
        </p>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-400">
        {new Date(updatedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
      </div>
      <div className="flex-shrink-0 text-gray-400 group-hover:text-black transition">→</div>
    </Link>
  );
}