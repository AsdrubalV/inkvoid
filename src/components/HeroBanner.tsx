"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  { src: "/banner1.jpg", alt: "Banner 1", href: "/story/ea3658b0-d2d8-41da-8054-cefaec0c14c3" },
  { src: "/banner2.jpg", alt: "Banner 2", href: "/story/d2ab3c65-b572-42f1-b8d7-2b58c5a4e848" },
  { src: "/banner3.jpg", alt: "Banner 3", href: "/story/9b78bd06-8f96-449d-8144-ef54cd773dc6" },
  { src: "/banner4.jpg", alt: "Banner 4", href: null },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900" style={{ height: "380px" }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
        >
          {slide.href ? (
            <Link href={slide.href} className="absolute inset-0 z-10" aria-label={slide.alt} />
          ) : null}
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition z-20"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition z-20"
        aria-label="Siguiente"
      >
        ›
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? "bg-white w-4" : "bg-white/50 w-2"}`}
          />
        ))}
      </div>
    </div>
  );
}