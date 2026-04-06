"use client";
import { useState } from "react";

interface Props {
  title: string;
  storyId: string;
}

export default function ShareButtons({ title, storyId }: Props) {
  const [copied, setCopied] = useState(false);
  const url = "https://inkvoid.ink/story/" + storyId;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent("Lee " + title + " en InkVoid");

  function copyLink() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-400">Compartir:</span>
      <a href={"https://twitter.com/intent/tweet?text=" + encodedText + "&url=" + encodedUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition">
        X
      </a>
      <a href={"https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition">
        Facebook
      </a>
      <a href={"https://wa.me/?text=" + encodedText + "%20" + encodedUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-border px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition">
        WhatsApp
      </a>
      <button onClick={copyLink} className={"rounded-full border px-3 py-1 text-xs transition " + (copied ? "border-green-300 bg-green-50 text-green-700" : "border-border text-gray-600 hover:bg-gray-50")}>
        {copied ? "Copiado" : "Copiar link"}
      </button>
    </div>
  );
}