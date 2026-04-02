"use client";
import { useState } from "react";

interface Extra {
  id: string;
  type: "image" | "lore" | "video";
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  video_url: string | null;
  order_index: number;
}

interface Props {
  extras: Extra[];
  storyId: string;
}

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match?.[1] ?? null;
}

export default function ExtrasViewer({ extras, storyId }: Props) {
  const [activeTab, setActiveTab] = useState<"all" | "image" | "lore" | "video">("all");
  const [selectedImage, setSelectedImage] = useState<Extra | null>(null);
  const [selectedLore, setSelectedLore] = useState<Extra | null>(null);

  const tabs = [
    { key: "all", label: "Todo", count: extras.length },
    { key: "image", label: "Arte y mapas", count: extras.filter((e) => e.type === "image").length },
    { key: "lore", label: "Lore", count: extras.filter((e) => e.type === "lore").length },
    { key: "video", label: "Videos", count: extras.filter((e) => e.type === "video").length },
  ].filter((t) => t.key === "all" || t.count > 0);

  const filtered = activeTab === "all" ? extras : extras.filter((e) => e.type === activeTab);

  if (!extras.length) {
    return (
      <div className="rounded-2xl border border-border bg-white/70 py-16 text-center space-y-3">
        <p className="text-4xl">✦</p>
        <p className="text-gray-500 text-sm">El autor aún no ha publicado contenido extra.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={"px-4 py-2 text-sm font-medium border-b-2 transition -mb-px " + (activeTab === tab.key ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black")}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={"ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] " + (activeTab === tab.key ? "bg-black text-white" : "bg-gray-100 text-gray-500")}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((extra) => {
          if (extra.type === "image") {
            return (
              <button
                key={extra.id}
                onClick={() => setSelectedImage(extra)}
                className="group rounded-2xl border border-border overflow-hidden bg-white/70 hover:shadow-md transition text-left"
              >
                {extra.image_url && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={extra.image_url}
                      alt={extra.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-3 space-y-0.5">
                  <p className="text-sm font-medium">{extra.title}</p>
                  {extra.description && <p className="text-xs text-gray-500 line-clamp-1">{extra.description}</p>}
                </div>
              </button>
            );
          }

          if (extra.type === "lore") {
            return (
              <button
                key={extra.id}
                onClick={() => setSelectedLore(extra)}
                className="rounded-2xl border border-border bg-white/70 p-4 hover:shadow-md transition text-left space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">📖</span>
                  <p className="text-sm font-medium">{extra.title}</p>
                </div>
                {extra.description && <p className="text-xs text-gray-500 line-clamp-2">{extra.description}</p>}
                {extra.content && (
                  <p className="text-xs text-gray-400 line-clamp-3 mt-1">{extra.content.replace(/<[^>]*>/g, "")}</p>
                )}
                <span className="text-[11px] text-black font-medium">Leer →</span>
              </button>
            );
          }

          if (extra.type === "video") {
            const ytId = extra.video_url ? getYoutubeId(extra.video_url) : null;
            const vimeoId = extra.video_url ? getVimeoId(extra.video_url) : null;

            return (
              <div key={extra.id} className="rounded-2xl border border-border overflow-hidden bg-white/70 space-y-0">
                {ytId && (
                  <div className="aspect-video">
                    <iframe
                      src={"https://www.youtube.com/embed/" + ytId}
                      title={extra.title}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {vimeoId && (
                  <div className="aspect-video">
                    <iframe
                      src={"https://player.vimeo.com/video/" + vimeoId}
                      title={extra.title}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                )}
                {!ytId && !vimeoId && (
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <p className="text-xs text-gray-400">URL de video no válida</p>
                  </div>
                )}
                <div className="p-3 space-y-0.5">
                  <p className="text-sm font-medium">{extra.title}</p>
                  {extra.description && <p className="text-xs text-gray-500">{extra.description}</p>}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Modal imagen */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-3xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            {selectedImage.image_url && (
              <img src={selectedImage.image_url} alt={selectedImage.title} className="w-full rounded-2xl" />
            )}
            <div className="bg-white rounded-xl p-4 space-y-1">
              <p className="font-semibold">{selectedImage.title}</p>
              {selectedImage.description && <p className="text-sm text-gray-600">{selectedImage.description}</p>}
            </div>
            <button onClick={() => setSelectedImage(null)} className="w-full rounded-full border border-white/30 py-2 text-sm text-white hover:bg-white/10 transition">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal lore */}
      {selectedLore && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedLore(null)}
        >
          <div className="max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-white rounded-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedLore.title}</h2>
              <button onClick={() => setSelectedLore(null)} className="text-gray-400 hover:text-black transition text-lg">✕</button>
            </div>
            {selectedLore.description && (
              <p className="text-sm text-gray-500 italic">{selectedLore.description}</p>
            )}
            {selectedLore.content && (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedLore.content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}