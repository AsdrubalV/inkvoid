import React from "react";
import Link from "next/link";

export default function Footer(): React.ReactElement {
  return (
    <div className="mt-16 border-t border-border bg-white/70 backdrop-blur">
      <div className="container py-10 space-y-8">
        <div className="grid gap-8 sm:grid-cols-4">

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Soporte</h3>
            <div className="space-y-2">
              <Link href="/info/faq" className="block text-sm text-gray-600 hover:text-black transition">Preguntas frecuentes</Link>
              <Link href="/info/publishing-rules" className="block text-sm text-gray-600 hover:text-black transition">Reglas de publicación</Link>
              <Link href="/info/monetization-rules" className="block text-sm text-gray-600 hover:text-black transition">Reglas de monetización</Link>
              <Link href="/info/privacy" className="block text-sm text-gray-600 hover:text-black transition">Política de privacidad</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Plataforma</h3>
            <div className="space-y-2">
              <Link href="/trending" className="block text-sm text-gray-600 hover:text-black transition">Trending</Link>
              <Link href="/publish" className="block text-sm text-gray-600 hover:text-black transition">Publicar</Link>
              <Link href="/signup" className="block text-sm text-gray-600 hover:text-black transition">Crear cuenta</Link>
              <Link href="/escritores" className="block text-sm text-gray-600 hover:text-black transition">Centro de escritores</Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Comunidad</h3>
            <div className="space-y-2">
              <Link href="/trabaja-con-nosotros" className="block text-sm text-gray-600 hover:text-black transition font-medium">
                Trabaja con nosotros
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Síguenos</h3>
            <div className="flex gap-3">
              <a href="https://tiktok.com/@inkvoid" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-gray-600 hover:border-black hover:text-black transition" title="TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/>
                </svg>
              </a>
              <a href="https://instagram.com/inkvoid" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-gray-600 hover:border-black hover:text-black transition" title="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://x.com/inkvoid" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-gray-600 hover:border-black hover:text-black transition" title="X / Twitter">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>
            {"\u00a9"} {new Date().getFullYear()} InkVoid. Creado por{" "}
            <a href="https://tiktok.com/@aava22" target="_blank" rel="noopener noreferrer" className="hover:text-black transition">
              Asdrubal Vargas
            </a>
            . Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/info/privacy" className="hover:text-black transition">
              Privacy Policy
            </Link>
            <p className="text-center sm:text-right">
              El contenido publicado en InkVoid es responsabilidad exclusiva de sus autores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}