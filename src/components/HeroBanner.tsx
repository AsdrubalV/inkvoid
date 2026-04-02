"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Slide {
  src: string;
  srcMobile?: string;
  alt: string;
  href: string | null;
  promotionId?: string;
}

const FALLBACK_SLIDES: Slide[] = [
  { src: "/banner1.jpg", alt: "Banner 1", href: "/story/ea3658b0-d2d8-41da-8054-cefaec0c14c3" },
  { src: "/banner2.jpg", alt: "Banner 2", href: "/story/d2ab3c65-b572-42f1-b8d7-2b58c5a4e848" },
  { src: "/banner3.jpg", alt: "Banner 3", href: "/story/9b78bd06-8f96-449d-8144-ef54cd773dc6" },
  { src: "/banner4.jpg", alt: "Banner 4", href: null },
];

export default function HeroBanner() {
  const supabase = createClient();
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const impressionRegistered = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function loadSlides() {
      // Banners dinámicos desde Supabase
      const { data: banners } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("order_index", { ascending: true });

      const bannerSlides: Slide[] = (banners ?? []).map((b) => ({
        src: b.src,
        srcMobile: b.src_mobile ?? undefined,
        alt: b.alt,
        href: b.href,
      }));

      // Campañas pagadas activas
      const { data: promos } = await supabase
        .from("promotions")
        .select("id, image_desktop_url, image_mobile_url, story_id, impressions_purchased, impressions_used")
        .eq("status", "active");

      const promoSlides: Slide[] = (promos ?? [])
        .filter((p) => p.impressions_used < p.impressions_purchased)
        .map((p) => ({
          src: p.image_desktop_url,
          srcMobile: p.image_mobile_url,
          alt: "Promoción",
          href: "/story/" + p.story_id,
          promotionId: p.id,
        }));

      // Intercalar — cada 2 banners normales, 1 promoción
      const base = bannerSlides.length ? bannerSlides : FALLBACK_SLIDES;
      const mixed: Slide[] = [];
      let promoIndex = 0;
      base.forEach((slide, i) => {
        mixed.push(slide);
        if ((i + 1) % 2 === 0 && promoIndex < promoSlides.length) {
          mixed.push(promoSlides[promoIndex++]);
        }
      });
      while (promoIndex < promoSlides.length) {
        mixed.push(promoSlides[promoIndex++]);
      }

      setSlides(mixed);
    }

    loadSlides();
  }, []);

  // Registrar impresión cuando se muestra un slide de promoción
  useEffect(() => {
    const slide = slides[current];
    if (!slide?.promotionId) return;
    if (impressionRegistered.current.has(slide.promotionId)) return;
    impressionRegistered.current.add(slide.promotionId);

    fetch("/api/promo-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promotionId: slide.promotionId, eventType: "impression" }),
    }).catch(() => {});
  }, [current, slides]);

  // Auto-avance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  function handleClick(slide: Slide) {
    if (!slide.promotionId) return;
    fetch("/api/promo-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ promotionId: slide.promotionId, eventType: "click" }),
    }).catch(() => {});
  }

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gray-900" style={{ height: "380px" }}>
      {slides.map((slide, i) => (
        <div
          key={i}
          className={"absolute inset-0 transition-opacity duration-700 " + (i === current ? "opacity-100" : "opacity-0")}
        >
          {slide.href ? (
            <Link
              href={slide.href}
              className="absolute inset-0 z-10"
              aria-label={slide.alt}
              onClick={() => handleClick(slide)}
            />
          ) : null}

          {/* Desktop */}
          <div className="hidden sm:block absolute inset-0">
            <Image src={slide.src} alt={slide.alt} fill className="object-cover" priority={i === 0} />
          </div>

          {/* Mobile */}
          <div className="block sm:hidden absolute inset-0">
            <Image src={slide.srcMobile ?? slide.src} alt={slide.alt} fill className="object-cover" priority={i === 0} />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {slide.promotionId && (
            <div className="absolute top-3 right-3 z-20 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white/70">
              Promocionado
            </div>
          )}
        </div>
      ))}

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition z-20" aria-label="Anterior">‹</button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/70 transition z-20" aria-label="Siguiente">›</button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={"h-2 rounded-full transition-all " + (i === current ? "bg-white w-4" : "bg-white/50 w-2")} />
        ))}
      </div>
    </div>
  );
}