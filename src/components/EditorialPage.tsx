"use client";
import { useState } from "react";
import Link from "next/link";

const FAQ = [
  { q: "¿Qué son los servicios editoriales de InkVoid?", a: "Son servicios profesionales de edición y producción literaria gestionados por InkVoid. Conectamos autores con profesionales verificados en lectura editorial, corrección, estilo, maquetación y diseño de portadas." },
  { q: "¿Cómo garantiza InkVoid la calidad del servicio?", a: "InkVoid actúa como intermediario: retiene el pago hasta que el trabajo se completa satisfactoriamente. Si el profesional no cumple, InkVoid interviene y gestiona una solución o reembolso." },
  { q: "¿Cuánto cobra InkVoid por gestionar el servicio?", a: "InkVoid cobra un 10% sobre el honorario del profesional. Este fee cubre la garantía del servicio, la gestión del pago y el seguimiento de calidad." },
  { q: "¿Cuánto tiempo tarda cada servicio?", a: "Depende del tipo de servicio y la extensión de la obra. Una lectura editorial puede tomar 1-2 semanas. Una corrección completa puede tomar 2-4 semanas. La maquetación y portada suelen tomar 1 semana. Los tiempos exactos se acuerdan con el profesional asignado." },
  { q: "¿Qué es una lectura editorial?", a: "Es una evaluación profesional de tu obra que analiza estructura narrativa, coherencia, ritmo, personajes y potencial de publicación. Recibirás un informe detallado con recomendaciones." },
  { q: "¿Qué diferencia hay entre corrección editorial y corrección de estilo?", a: "La corrección editorial revisa aspectos de fondo: estructura, coherencia, continuidad y lógica narrativa. La corrección de estilo revisa la forma: gramática, ortografía, puntuación y fluidez del texto." },
  { q: "¿Qué incluye la maquetación?", a: "La maquetación prepara tu obra para publicación digital o impresa. Incluye diseño de interior, tipografía, márgenes, portadilla y exportación en los formatos necesarios (PDF, EPUB, MOBI)." },
  { q: "¿Puedo solicitar solo una portada?", a: "Sí. El servicio de diseño de portada es independiente y puede contratarse sin otros servicios. El diseñador trabajará contigo para crear una portada que refleje el género y tono de tu obra." },
  { q: "¿Los precios son fijos?", a: "Los precios base son orientativos. El precio final se acuerda con el profesional según la extensión de la obra y la complejidad del trabajo. InkVoid garantiza transparencia en todos los costos antes de iniciar." },
  { q: "¿Qué pasa si no estoy satisfecho con el resultado?", a: "Tienes derecho a solicitar revisiones dentro de los límites acordados. Si el profesional no cumple con lo pactado, InkVoid mediará para resolver la situación antes de liberar el pago." },
];

const SERVICES = [
  {
    id: "lectura",
    title: "Lectura editorial",
    description: "Un editor profesional lee tu obra completa y te entrega un informe detallado con análisis narrativo, recomendaciones de mejora y evaluación del potencial de publicación.",
    price: "Desde $40",
    tag: "Recomendado para primeras obras",
    details: ["Informe de 5-10 páginas", "Análisis de estructura y ritmo", "Evaluación de personajes", "Recomendaciones de mejora", "Tiempo estimado: 1-2 semanas"],
  },
  {
    id: "editorial",
    title: "Corrección editorial",
    description: "Revisión profunda de tu manuscrito enfocada en coherencia narrativa, continuidad, lógica interna y estructura. Ideal para obras que ya tienen un borrador avanzado.",
    price: "Desde $80",
    tag: null,
    details: ["Corrección de coherencia y continuidad", "Revisión de estructura narrativa", "Notas en el documento", "Reunión de cierre con el editor", "Tiempo estimado: 2-4 semanas"],
  },
  {
    id: "estilo",
    title: "Corrección de estilo",
    description: "Revisión exhaustiva de gramática, ortografía, puntuación y fluidez del texto. Tu obra quedará lista para publicación con el estándar de calidad de una editorial profesional.",
    price: "Desde $60",
    tag: "Más solicitado",
    details: ["Corrección ortográfica y gramatical", "Revisión de puntuación", "Mejora de fluidez y legibilidad", "Documento con cambios registrados", "Tiempo estimado: 1-3 semanas"],
  },
  {
    id: "maquetacion",
    title: "Maquetación",
    description: "Diseño profesional del interior de tu obra para publicación digital o impresa. Incluye tipografía, márgenes, portadilla y exportación en múltiples formatos.",
    price: "Desde $50",
    tag: null,
    details: ["Diseño de interior profesional", "Exportación en PDF, EPUB y MOBI", "Portadilla y páginas legales", "Hasta 2 rondas de revisión", "Tiempo estimado: 1 semana"],
  },
  {
    id: "portada",
    title: "Diseño de portada",
    description: "Un diseñador profesional crea la portada de tu obra adaptada al género y tono de tu historia. Incluye versión para eBook y versión para impresión.",
    price: "Desde $35",
    tag: "Alta demanda",
    details: ["Diseño personalizado al género", "3 propuestas iniciales", "Versión digital e impresión", "Hasta 3 rondas de revisión", "Tiempo estimado: 5-7 días"],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full py-4 text-left gap-4">
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <span className={"text-gray-400 transition-transform flex-shrink-0 " + (open ? "rotate-180" : "")}>▾</span>
      </button>
      {open && <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

function ServiceCard({ service }: { service: typeof SERVICES[0] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-3 relative">
      {service.tag && (
        <span className="absolute top-4 right-4 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
          {service.tag}
        </span>
      )}
      <div>
        <p className="font-semibold text-sm pr-24">{service.title}</p>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{service.description}</p>
      </div>

      {expanded && (
        <ul className="space-y-1">
          {service.details.map((d, i) => (
            <li key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
              <span className="text-gray-300 mt-0.5">•</span>
              {d}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="space-y-0.5">
          <span className="text-base font-bold text-gray-900">{service.price}</span>
          <p className="text-[10px] text-gray-400">+ 10% fee InkVoid</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition"
          >
            {expanded ? "Menos" : "Ver más"}
          </button>
          <button disabled className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed">
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditorialPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 py-8">

      <div className="space-y-3">
        <button onClick={() => window.history.back()} className="text-sm text-gray-400 hover:text-black transition">
          ← Volver
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Servicios editoriales</h1>
        <p className="text-gray-500 text-base max-w-xl">
          Lleva tu obra al siguiente nivel. InkVoid te conecta con profesionales editoriales verificados y garantiza que el trabajo se complete antes de liberar el pago.
        </p>
      </div>

      {/* Garantía InkVoid */}
      <div className="rounded-2xl bg-gray-900 text-white p-6 space-y-3">
        <p className="font-semibold text-base">Garantía InkVoid</p>
        <p className="text-sm text-gray-300">
          InkVoid retiene el pago hasta que el trabajo se completa satisfactoriamente. Si el profesional no cumple, intervenimos para resolver la situación. Cobramos un 10% de fee sobre el honorario del profesional por esta garantía.
        </p>
        <div className="grid grid-cols-3 gap-3 pt-1">
          {[
            { icon: "🔒", label: "Pago seguro", desc: "Tu dinero está protegido hasta recibir el trabajo" },
            { icon: "✓", label: "Profesionales verificados", desc: "Revisamos la experiencia de cada profesional" },
            { icon: "🔄", label: "Revisiones incluidas", desc: "Cada servicio incluye rondas de revisión" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/10 p-3 space-y-1">
              <p className="text-lg">{item.icon}</p>
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Servicios */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Servicios disponibles</h2>
        <div className="space-y-3">
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>

      {/* Cómo funciona */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">¿Cómo funciona?</h2>
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
          {[
            { n: "1", title: "Solicitas el servicio", desc: "Seleccionas el servicio y nos cuentas sobre tu obra: género, extensión y necesidades específicas." },
            { n: "2", title: "InkVoid asigna un profesional", desc: "Buscamos el profesional más adecuado según tu obra y presupuesto. Te presentamos el perfil antes de confirmar." },
            { n: "3", title: "Acuerdan los detalles y precio", desc: "Hablas directamente con el profesional para acordar el alcance exacto, tiempo de entrega y precio final." },
            { n: "4", title: "Realizas el pago a InkVoid", desc: "Pagas a InkVoid, que retiene el dinero hasta que el trabajo esté completo. El profesional recibe el 90% al finalizar." },
            { n: "5", title: "Recibes tu obra trabajada", desc: "El profesional entrega el trabajo. Si todo está bien, apruebas y se libera el pago. Si hay ajustes, se solicitan antes." },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-4">
              <div className="flex-shrink-0 h-7 w-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Preguntas frecuentes</h2>
        <div className="rounded-2xl border border-border bg-white/70 px-5 divide-y divide-border">
          {FAQ.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-border bg-white/70 p-6 text-center space-y-3">
        <p className="font-semibold">¿Tienes preguntas sobre algún servicio?</p>
        <p className="text-sm text-gray-500">Escríbenos y te orientamos antes de contratar.</p>
        <Link href="/mensajes" className="inline-block rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition">
          Contactar a InkVoid
        </Link>
      </div>

    </div>
  );
}