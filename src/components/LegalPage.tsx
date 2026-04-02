"use client";
import { useState } from "react";
import Link from "next/link";

const FAQ = [
  { q: "¿Qué son los servicios legales de InkVoid?", a: "Es una sección pensada para orientar a los autores sobre cómo proteger sus obras en los sistemas legales de sus países. InkVoid no sustituye a un abogado ni a una entidad oficial, pero facilita información práctica y conecta autores con profesionales legales verificados." },
  { q: "¿Es obligatorio registrar mi obra antes de publicarla?", a: "No es obligatorio para publicar en InkVoid, pero sí es altamente recomendable. Registrar tu obra te da una prueba legal sólida de autoría en caso de disputas." },
  { q: "¿Qué es el derecho de autor?", a: "Es un conjunto de derechos que protegen las obras originales como novelas, cuentos o poemas. Reconoce al autor como creador y le otorga control sobre el uso y distribución de su obra." },
  { q: "¿Cómo registro mi obra en mi país?", a: "Cada país tiene su propia entidad encargada del registro de derechos de autor. Generalmente puedes hacerlo de forma presencial o en línea. InkVoid proporcionará guías básicas por país con enlaces y pasos resumidos." },
  { q: "¿El registro de derechos de autor tiene costo?", a: "Depende del país. En Colombia es gratuito ante la DNDA. En Venezuela el registro en el SAPI puede costar aproximadamente $18. En México tiene un costo mayor. Los valores pueden cambiar, siempre verifica en la entidad oficial de tu país." },
  { q: "¿Qué pasa si no registro mi obra?", a: "Aunque tu obra está protegida desde el momento de su creación en muchos países, sin un registro formal es más difícil demostrar legalmente que eres el autor en caso de conflicto." },
  { q: "¿Qué respaldo ofrece InkVoid sobre mi obra?", a: "InkVoid puede generar un certificado PDF que acredita que una obra con determinado título, descripción y autor fue publicada en la plataforma en una fecha concreta. Este documento puede servir como evidencia complementaria, aunque no sustituye un registro oficial." },
  { q: "¿Ese certificado tiene validez legal?", a: "No reemplaza un registro oficial de derechos de autor. Sin embargo, puede servir como evidencia complementaria que demuestra que la obra existía en una fecha determinada y estaba asociada a un usuario específico en InkVoid." },
  { q: "¿Qué pasa si alguien copió mi obra?", a: "Debes reunir pruebas de autoría: registro oficial, fecha de publicación en InkVoid y borradores originales. InkVoid podrá colaborar retirando contenido si se demuestra una infracción. Para defensa legal, te conectamos con un abogado especializado." },
  { q: "¿InkVoid elimina contenido por plagio?", a: "Sí. Si se demuestra que una obra infringe derechos de autor, puede ser eliminada y la cuenta sancionada según la gravedad del caso." },
  { q: "¿Qué recomienda InkVoid antes de publicar?", a: "Finalizar la obra o una parte significativa, registrarla en la entidad correspondiente de tu país, conservar comprobantes oficiales y luego subirla a la plataforma." },
];

const SERVICES = [
  { id: "consulta", title: "Consulta legal inicial", description: "Una hora con un abogado especializado en propiedad intelectual. Resuelve tus dudas sobre registro, contratos o protección de tu obra.", price: "Desde $28.75", tag: "Más solicitado" },
  { id: "registro", title: "Gestión de registro de obra", description: "El abogado gestiona el proceso completo de registro ante la entidad oficial de tu país. Incluye preparación de documentos y seguimiento.", price: "Desde $92", tag: null },
  { id: "plagio", title: "Defensa por plagio", description: "Si alguien ha copiado tu obra, un abogado te representará y gestionará el proceso legal de defensa según las leyes de tu país.", price: "Desde $172.50", tag: "Alta demanda" },
  { id: "certificado", title: "Certificado InkVoid", description: "Documento PDF oficial de InkVoid que certifica el título, descripción, autor y fecha de publicación de tu obra en la plataforma.", price: "$1.00", tag: "Disponible pronto" },
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

export default function LegalPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12 py-8">

      <div className="space-y-3">
        <button onClick={() => window.history.back()} className="text-sm text-gray-400 hover:text-black transition">
          ← Volver
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Servicios legales</h1>
        <p className="text-gray-500 text-base max-w-xl">
          Protege tu obra. InkVoid te conecta con abogados especializados en propiedad intelectual y te proporciona documentación oficial de tu publicación.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Servicios disponibles</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <div key={service.id} className="rounded-2xl border border-border bg-white/70 p-5 space-y-3 relative">
              {service.tag && (
                <span className="absolute top-4 right-4 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                  {service.tag}
                </span>
              )}
              <div>
                <p className="font-semibold text-sm pr-20">{service.title}</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{service.description}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">{service.price}</span>
                <button disabled className="rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed">
                  Próximamente
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-gray-50 border border-border p-4 text-xs text-gray-500 space-y-1">
          <p className="font-medium text-gray-700">Sobre los precios</p>
          <p>Los precios varían según el país del autor y la complejidad del caso. InkVoid cobra un 15% de comisión sobre el honorario del abogado por garantizar el servicio y gestionar la calidad. Todos los pagos se procesan a través de InkVoid.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">¿Cómo funciona?</h2>
        <div className="rounded-2xl border border-border bg-white/70 p-5 space-y-4">
          {[
            { n: "1", title: "Solicitas el servicio", desc: "Seleccionas el tipo de servicio que necesitas y completas el formulario con los detalles de tu caso." },
            { n: "2", title: "InkVoid asigna un abogado", desc: "Verificamos tu caso y te asignamos un abogado especializado según tu país y tipo de necesidad." },
            { n: "3", title: "Realizas el pago", desc: "El pago se realiza a través de InkVoid, que garantiza que el abogado cumplirá el servicio acordado." },
            { n: "4", title: "El abogado te contacta", desc: "En un máximo de 48 horas hábiles recibirás contacto del profesional para iniciar el proceso." },
            { n: "5", title: "InkVoid hace seguimiento", desc: "Monitoreamos que el servicio se complete correctamente. Si hay problemas, InkVoid interviene." },
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

      <div className="rounded-2xl bg-gray-900 text-white p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-semibold">Certificado de publicación InkVoid</p>
            <p className="text-sm text-gray-300 max-w-md">
              Por solo $1.00 obtienes un documento PDF oficial que certifica que tu obra existe en InkVoid desde una fecha determinada. Útil como evidencia complementaria en disputas de autoría.
            </p>
          </div>
          <span className="text-2xl font-bold flex-shrink-0 ml-4">$1</span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <p>El certificado incluye:</p>
          <ul className="space-y-0.5 ml-3">
            <li>• Nombre del autor (@username de InkVoid)</li>
            <li>• Título y descripción de la obra</li>
            <li>• Fecha exacta de primera publicación</li>
            <li>• Número de capítulos publicados</li>
            <li>• Sello oficial de InkVoid con código de verificación</li>
          </ul>
        </div>
        <button disabled className="rounded-full bg-white/20 px-5 py-2 text-sm font-medium text-white/60 cursor-not-allowed">
          Próximamente — $1.00
        </button>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-semibold">Preguntas frecuentes</h2>
        <div className="rounded-2xl border border-border bg-white/70 px-5 divide-y divide-border">
          {FAQ.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white/70 p-6 text-center space-y-3">
        <p className="font-semibold">¿Tienes una duda que no aparece aquí?</p>
        <p className="text-sm text-gray-500">Escríbenos y te orientamos de forma general y gratuita.</p>
        <Link href="/mensajes" className="inline-block rounded-full bg-black px-6 py-2 text-sm font-medium text-white hover:bg-gray-800 transition">
          Contactar a InkVoid
        </Link>
      </div>

    </div>
  );
}