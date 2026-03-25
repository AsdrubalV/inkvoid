"use client";
import { useRouter } from "next/navigation";

interface Props {
  username: string;
  activeTab: string;
  counts: {
    stories: number;
    historial: number;
    bookmarks: number;
    siguiendo: number;
  };
}

const TABS = [
  { key: "stories",   label: "✍️ Historias" },
  { key: "historial", label: "📖 Historial" },
  { key: "bookmarks", label: "🔖 Guardados" },
  { key: "siguiendo", label: "👥 Siguiendo" },
];

export default function ProfileTabs({ username, activeTab, counts }: Props) {
  const router = useRouter();

  return (
    <div className="flex gap-1 border-b border-border pb-0">
      {TABS.map((tab) => {
        const count = counts[tab.key as keyof typeof counts];
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => router.push("/user/" + username + (tab.key === "stories" ? "" : "?tab=" + tab.key))}
            className={"px-4 py-2 text-sm font-medium border-b-2 transition -mb-px " + (isActive ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black hover:border-gray-300")}
          >
            {tab.label}
            {count > 0 && (
              <span className={"ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] " + (isActive ? "bg-black text-white" : "bg-gray-100 text-gray-500")}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}