import React from "react";
import Link from "next/link";

const INFO_PAGES: Record<string, { title: string; emoji: string }> = {
  faq: { title: "Preguntas frecuentes", emoji: "❓" },
  "publishing-rules": { title: "Reglas de publicación", emoji: "📖" },
  "monetization-rules": { title: "Reglas de monetización", emoji: "💰" },
};

function FAQSection({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
      <h3 className="text-sm font-semibold text-gray-800">{question}</h3>
      <div className="text-sm text-gray-600 space-y-1">{children}</div>
    </div>
  );
}

function FAQPage() {
  return (
    <div className="space-y-8">

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">General</h2>
        <div className="space-y-4">
          <FAQSection question="¿Qué es InkVoid?">
            <p>InkVoid es una plataforma donde cualquier persona puede publicar, leer y monetizar historias. Está diseñada para dar libertad creativa a los autores y facilitar a los lectores descubrir contenido de calidad.</p>
          </FAQSection>
          <FAQSection question="¿Necesito pagar para usar InkVoid?">
            <p>No. Puedes leer contenido gratuito y publicar tus propias historias sin costo. La membresía solo aplica para acceder a contenido exclusivo.</p>
          </FAQSection>
          <FAQSection question="¿Qué tipo de contenido puedo encontrar?">
            <p>En InkVoid encontrarás fantasía, ciencia ficción, terror, romance, contenido adulto y fanfiction. La plataforma permite una amplia variedad de géneros.</p>
          </FAQSection>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">✍️ Publicación de contenido</h2>
        <div className="space-y-4">
          <FAQSection question="¿Quién puede publicar en InkVoid?">
            <p>Cualquier usuario registrado puede publicar sus historias sin restricciones iniciales.</p>
          </FAQSection>
          <FAQSection question="¿Soy dueño de lo que publico?">
            <p>Sí. Tú mantienes el 100% de los derechos de tu obra. InkVoid solo muestra tu contenido dentro de la plataforma.</p>
          </FAQSection>
          <FAQSection question="¿Qué requisitos debe cumplir una historia?">
            <p>Toda obra debe incluir género, etiquetas de contenido e idioma. Esto permite una mejor experiencia para los lectores.</p>
          </FAQSection>
          <FAQSection question="¿Puedo publicar contenido erótico o adulto?">
            <p>Sí, pero es obligatorio etiquetarlo correctamente y advertir al lector. Si no se etiqueta correctamente, la obra puede ser ocultada, suspendida o eliminada.</p>
          </FAQSection>
          <FAQSection question="¿Puedo subir fanfiction?">
            <p>Sí, bajo estas condiciones: debes usar la etiqueta Fanfic y debes reconocer la obra original.</p>
          </FAQSection>
          <FAQSection question="¿Qué contenido está prohibido?">
            <p>No está permitido el plagio, contenido ilegal ni suplantación de identidad. Este contenido será eliminado y puede causar suspensión de la cuenta.</p>
          </FAQSection>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">💰 Monetización</h2>
        <div className="space-y-4">
          <FAQSection question="¿Cuándo puedo empezar a monetizar?">
            <p>Tu historia puede monetizar cuando tenga mínimo 10 capítulos con al menos 2.000 palabras cada uno.</p>
          </FAQSection>
          <FAQSection question="¿Cómo gano dinero en InkVoid?">
            <p>Los ingresos provienen de una pool global de la plataforma, distribuidos según tiempo real de lectura e interacción de los lectores.</p>
          </FAQSection>
          <FAQSection question="¿Qué es la pool de ingresos?">
            <p>Es el total de dinero generado por la plataforma (membresías, etc.), que se reparte entre los autores activos.</p>
          </FAQSection>
          <FAQSection question="¿Cómo se calcula lo que gano?">
            <p>Se basa en minutos de lectura confirmados y proporción respecto a otros autores. Más lectura real equivale a mayor ingreso.</p>
          </FAQSection>
          <FAQSection question="¿Puedo manipular las lecturas para ganar más?">
            <p>No. Está prohibido el uso de bots, cuentas falsas o granjas de lectura. Esto puede causar pérdida de ingresos, suspensión o baneo permanente.</p>
          </FAQSection>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">📚 Lectura</h2>
        <div className="space-y-4">
          <FAQSection question="¿Todo el contenido es gratuito?">
            <p>No. Los primeros capítulos son siempre gratuitos. Obras menores a 20.000 palabras son completamente gratuitas. El resto puede requerir membresía si el autor lo decide.</p>
          </FAQSection>
          <FAQSection question="¿Qué incluye la membresía?">
            <p>Acceso al contenido exclusivo de todos los autores dentro de la plataforma.</p>
          </FAQSection>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">🔗 Perfil y promoción</h2>
        <div className="space-y-4">
          <FAQSection question="¿Puedo promocionar mis libros fuera de InkVoid?">
            <p>Sí. Puedes añadir enlaces en tu perfil a Amazon, Patreon y redes sociales.</p>
          </FAQSection>
          <FAQSection question="¿InkVoid me ayuda a vender mis libros físicos?">
            <p>Sí. La plataforma facilita que los lectores encuentren y compren tus obras fuera de InkVoid.</p>
          </FAQSection>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">⚖️ Seguridad y normas</h2>
        <div className="space-y-4">
          <FAQSection question="¿Qué pasa si rompo las reglas?">
            <p>Dependiendo del caso: advertencia, ocultamiento del contenido, suspensión temporal o eliminación de cuenta.</p>
          </FAQSection>
          <FAQSection question="¿InkVoid puede eliminar mi contenido?">
            <p>Sí. InkVoid se reserva el derecho de eliminar contenido que viole las normas, sea ilegal o afecte la experiencia de otros usuarios.</p>
          </FAQSection>
          <FAQSection question="¿Cómo protegen a los autores?">
            <p>InkVoid planea ofrecer herramientas legales, protección contra plagio y apoyo en regalías.</p>
          </FAQSection>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider">🚀 Filosofía de InkVoid</h2>
        <div className="space-y-4">
          <FAQSection question="¿Cuál es el objetivo de InkVoid?">
            <p>Crear un ecosistema donde los escritores tengan libertad real, los lectores tengan transparencia, la monetización sea justa y el contenido fluya sin barreras innecesarias.</p>
          </FAQSection>
        </div>
      </section>

    </div>
  );
}

function PublishingRules() {
  return (
    <div className="space-y-8">

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">1. Reglas de Publicación</h2>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">1.1 Propiedad del contenido</h3>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Cada autor mantiene la propiedad total de sus obras.</li>
            <li>Al publicar en InkVoid, el autor otorga a la plataforma una licencia no exclusiva para mostrar y distribuir el contenido dentro del sitio.</li>
            <li>InkVoid no reclama derechos de autor sobre ninguna obra publicada.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">1.2 Contenido permitido</h3>
          <p className="text-sm text-gray-600">InkVoid es una plataforma de libertad creativa amplia, incluyendo:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Ficción general</li>
            <li>Fantasía, sci-fi, horror</li>
            <li>Contenido adulto (incluyendo erótico)</li>
            <li>Fanfiction</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">1.3 Contenido prohibido</h3>
          <p className="text-sm text-gray-600">No está permitido:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Plagio o copia de obras protegidas</li>
            <li>Contenido ilegal según leyes aplicables</li>
            <li>Contenido que promueva daño real (fraudes, estafas, explotación)</li>
            <li>Suplantación de identidad</li>
          </ul>
          <p className="text-sm text-gray-600 font-medium mt-2">Acciones:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Eliminación inmediata</li>
            <li>Suspensión temporal o permanente</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">1.4 Etiquetas obligatorias</h3>
          <p className="text-sm text-gray-600">Toda obra debe incluir género, etiquetas de contenido e idioma.</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {["erótico", "violencia", "horror extremo", "contenido adulto"].map((tag) => (
              <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-xs text-gray-600">{tag}</span>
            ))}
          </div>
          <p className="text-sm text-gray-600 font-medium mt-2">Incumplimiento:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Ocultamiento del contenido</li>
            <li>Suspensión temporal</li>
            <li>Eliminación en caso de reincidencia</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">1.5 Responsabilidad del autor</h3>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>El autor es totalmente responsable de su contenido.</li>
            <li>Debe garantizar que tiene los derechos para publicarlo.</li>
            <li>InkVoid puede remover contenido en cualquier momento si viola estas reglas.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">1.6 Fanfiction</h3>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Usar etiqueta Fanfic</li>
            <li>Reconocer la obra original</li>
            <li>No monetizar si infringe derechos de terceros</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">1.7 Enlaces externos</h3>
          <p className="text-sm text-gray-600">Los autores pueden incluir enlaces a Amazon, Patreon y redes sociales para promover su obra o facilitar la compra de versiones físicas.</p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">2. Reglas de Lectura</h2>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">2.1 Acceso al contenido</h3>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Los primeros capítulos de toda obra son gratuitos.</li>
            <li>Obras menores a 20.000 palabras serán siempre gratuitas.</li>
          </ul>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">2.2 Contenido premium</h3>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>El acceso completo puede requerir membresía.</li>
            <li>La membresía da acceso al catálogo premium completo.</li>
          </ul>
        </div>
      </section>

    </div>
  );
}

function MonetizationRules() {
  return (
    <div className="space-y-8">

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">3. Reglas de Monetización</h2>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">3.1 Requisitos para monetizar</h3>
          <p className="text-sm text-gray-600">Una obra puede monetizar solo si cumple:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Mínimo 10 capítulos</li>
            <li>Cada capítulo con al menos 2.000 palabras</li>
          </ul>
          <p className="text-sm text-gray-600 mt-1">Objetivo: garantizar calidad mínima y evitar contenido vacío o spam.</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">3.2 Modelo de pago</h3>
          <p className="text-sm text-gray-600">Los autores monetizados reciben ingresos desde una pool global basada en tiempo de lectura real e interacción del usuario.</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">3.3 Sistema de distribución</h3>
          <p className="text-sm text-gray-600">El pago se calcula en función de:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Minutos de lectura confirmados</li>
            <li>Proporción dentro del total de la plataforma</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">3.4 Manipulación prohibida</h3>
          <p className="text-sm text-gray-600">Está estrictamente prohibido:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Bots</li>
            <li>Granjas de lectura</li>
            <li>Cuentas falsas</li>
            <li>Auto-consumo artificial</li>
          </ul>
          <p className="text-sm text-gray-600 font-medium mt-2">Consecuencias:</p>
          <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
            <li>Pérdida de monetización</li>
            <li>Retención de pagos</li>
            <li>Suspensión o baneo permanente</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">3.5 Elegibilidad</h3>
          <p className="text-sm text-gray-600">InkVoid se reserva el derecho de aprobar o rechazar monetización y suspender ingresos si detecta abuso.</p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">4. Seguridad y cumplimiento</h2>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">4.1 Moderación</h3>
          <p className="text-sm text-gray-600">InkVoid puede revisar, ocultar o eliminar contenido sin previo aviso si viola las reglas.</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">4.2 Reincidencia</h3>
          <p className="text-sm text-gray-600">Usuarios que violen repetidamente las normas pueden recibir suspensión prolongada o eliminación de cuenta.</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-800">4.3 Servicios legales (futuro)</h3>
          <p className="text-sm text-gray-600">InkVoid podrá ofrecer asesoría para derechos de autor, gestión de regalías y protección contra plagio.</p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">5. Filosofía de InkVoid</h2>
        <p className="text-sm text-gray-600">InkVoid existe para:</p>
        <ul className="space-y-1 text-sm text-gray-600 list-disc list-inside">
          <li>Dar libertad total al escritor</li>
          <li>Proteger al lector mediante transparencia</li>
          <li>Facilitar la monetización justa</li>
          <li>Conectar contenido digital con venta real (Amazon, etc.)</li>
        </ul>
      </section>

    </div>
  );
}

interface Props {
  params: { page: string };
}

export default function InfoPage({ params }: Props) {
  const info = INFO_PAGES[params.page];

  if (!info) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center space-y-4">
        <div className="text-5xl">📄</div>
        <h1 className="text-2xl font-semibold tracking-tight">Página no encontrada</h1>
        <Link href="/" className="inline-block mt-4 rounded-full border border-border px-5 py-2 text-sm hover:bg-gray-50 transition">
          ← Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-10 space-y-8">
      <div className="space-y-2">
        <div className="text-4xl">{info.emoji}</div>
        <h1 className="text-2xl font-semibold tracking-tight">{info.title}</h1>
      </div>
      <div className="rounded-2xl border border-border bg-white/70 p-6">
        {params.page === "faq" && <FAQPage />}
        {params.page === "publishing-rules" && <PublishingRules />}
        {params.page === "monetization-rules" && <MonetizationRules />}
      </div>
      <Link href="/" className="inline-block rounded-full border border-border px-5 py-2 text-sm hover:bg-gray-50 transition">
        ← Volver al inicio
      </Link>
    </div>
  );
}