"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "views",  label: "Más leídas" },
  { value: "likes",  label: "Más votadas" },
  { value: "recent", label: "Actualizadas" },
  { value: "new",    label: "Más nuevas" },
];

const PERIOD_OPTIONS = [
  { value: "all",   label: "Todo" },
  { value: "day",   label: "Hoy" },
  { value: "week",  label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year",  label: "Año" },
];

const LANGUAGES = ["Español", "English", "Português", "Français", "Deutsch", "日本語", "中文"];

const WORD_RANGES = [
  { value: "", label: "Cualquier longitud" },
  { value: "0-10000", label: "Menos de 10k palabras" },
  { value: "10000-50000", label: "10k – 50k palabras" },
  { value: "50000-100000", label: "50k – 100k palabras" },
  { value: "100000-999999999", label: "Más de 100k palabras" },
];

interface Props {
  categories: string[];
  currentSort: string;
  currentPeriod: string;
  currentCategory: string;
  currentTags?: string;
  currentExcludeTags?: string;
  currentStatus?: string;
  currentLanguage?: string;
  currentAdult?: string;
  currentWords?: string;
}

export default function TrendingFilters({
  categories,
  currentSort,
  currentPeriod,
  currentCategory,
  currentTags = "",
  currentExcludeTags = "",
  currentStatus = "",
  currentLanguage = "",
  currentAdult = "",
  currentWords = "",
}: Props) {
  const router = useRouter();
  const [showAdvanced, setShowAdvanced] = useState(
    !!(currentTags || currentExcludeTags || currentStatus || currentLanguage || currentAdult || currentWords)
  );
  const [includeTags, setIncludeTags] = useState(currentTags);
  const [excludeTags, setExcludeTags] = useState(currentExcludeTags);
  const [status, setStatus] = useState(currentStatus);
  const [language, setLanguage] = useState(currentLanguage);
  const [adult, setAdult] = useState(currentAdult);
  const [words, setWords] = useState(currentWords);

  function navigate(overrides: Record<string, string> = {}) {
    const params = new URLSearchParams();
    params.set("sort", overrides.sort ?? currentSort);
    params.set("period", overrides.period ?? currentPeriod);
    if (overrides.category !== undefined ? overrides.category : currentCategory)
      params.set("category", overrides.category !== undefined ? overrides.category : currentCategory);
    if (includeTags) params.set("tags", includeTags);
    if (excludeTags) params.set("excludeTags", excludeTags);
    if (status) params.set("status", status);
    if (language) params.set("language", language);
    if (adult) params.set("adult", adult);
    if (words) params.set("words", words);
    router.push("/trending?" + params.toString());
  }

  function applyAdvanced() {
    const params = new URLSearchParams();
    params.set("sort", currentSort);
    params.set("period", currentPeriod);
    if (currentCategory) params.set("category", currentCategory);
    if (includeTags) params.set("tags", includeTags);
    if (excludeTags) params.set("excludeTags", excludeTags);
    if (status) params.set("status", status);
    if (language) params.set("language", language);
    if (adult) params.set("adult", adult);
    if (words) params.set("words", words);
    router.push("/trending?" + params.toString());
  }

  function clearAll() {
    setIncludeTags("");
    setExcludeTags("");
    setStatus("");
    setLanguage("");
    setAdult("");
    setWords("");
    router.push("/trending?sort=" + currentSort + "&period=" + currentPeriod);
  }

  const hasActiveFilters = !!(currentTags || currentExcludeTags || currentStatus || currentLanguage || currentAdult || currentWords || currentCategory);

  const btn = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition whitespace-nowrap ${
      active ? "bg-black text-white border-black" : "border-border text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="space-y-3">

      {/* Fila 1: Sort */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => navigate({ sort: opt.value })} className={btn(currentSort === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 transition">
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${showAdvanced ? "bg-gray-900 text-white border-gray-900" : "border-border text-gray-600 hover:bg-gray-100"}`}
          >
            {showAdvanced ? "▲ Filtros" : "▼ Filtros avanzados"}
            {hasActiveFilters && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-black text-white text-[9px]">!</span>}
          </button>
        </div>
      </div>

      {/* Fila 2: Período */}
      {currentSort === "views" && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 mr-1">Período:</span>
          {PERIOD_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => navigate({ period: opt.value })} className={btn(currentPeriod === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Fila 3: Categorías */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => navigate({ category: "" })} className={btn(currentCategory === "")}>Todas</button>
        {categories.map((cat) => (
          <button key={cat} onClick={() => navigate({ category: cat })} className={btn(currentCategory === cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Panel filtros avanzados */}
      {showAdvanced && (
        <div className="rounded-2xl border border-border bg-white/80 p-5 space-y-4">
          <h3 className="text-sm font-semibold">Filtros avanzados</h3>

          <div className="grid gap-4 sm:grid-cols-2">

            {/* Incluir tags */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Incluir tags</label>
              <input
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black"
                placeholder="magic, slow burn, academy..."
                value={includeTags}
                onChange={(e) => setIncludeTags(e.target.value)}
              />
              <p className="text-[10px] text-gray-400">Separados por comas. Muestra historias que tengan TODOS estos tags.</p>
            </div>

            {/* Excluir tags */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Excluir tags</label>
              <input
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black"
                placeholder="gore, ntr, tragedy..."
                value={excludeTags}
                onChange={(e) => setExcludeTags(e.target.value)}
              />
              <p className="text-[10px] text-gray-400">Separados por comas. Oculta historias que tengan CUALQUIERA de estos tags.</p>
            </div>

            {/* Estado */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Estado</label>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Cualquier estado</option>
                <option value="ongoing">En progreso</option>
                <option value="completed">Completa</option>
                <option value="hiatus">En hiatus</option>
              </select>
            </div>

            {/* Idioma */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Idioma</label>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">Cualquier idioma</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Longitud */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Longitud</label>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black"
                value={words}
                onChange={(e) => setWords(e.target.value)}
              >
                {WORD_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            {/* Contenido adulto */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Contenido adulto</label>
              <select
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black"
                value={adult}
                onChange={(e) => setAdult(e.target.value)}
              >
                <option value="">Mostrar todo</option>
                <option value="false">Solo contenido seguro</option>
                <option value="true">Solo contenido adulto</option>
              </select>
            </div>

          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={applyAdvanced}
              className="rounded-full bg-black px-5 py-2 text-xs font-medium text-white hover:bg-gray-800 transition"
            >
              Aplicar filtros
            </button>
            <button
              onClick={clearAll}
              className="rounded-full border border-border px-5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Limpiar todo
            </button>
          </div>
        </div>
      )}

    </div>
  );
}