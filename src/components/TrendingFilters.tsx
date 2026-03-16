"use client";
import { useRouter } from "next/navigation";

const SORT_OPTIONS = [
  { value: "views",  label: "👁️ Más leídas" },
  { value: "likes",  label: "❤️ Más votadas" },
  { value: "recent", label: "🆕 Actualizadas" },
  { value: "new",    label: "✨ Más nuevas" },
];

const PERIOD_OPTIONS = [
  { value: "all",   label: "Todo" },
  { value: "day",   label: "Hoy" },
  { value: "week",  label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year",  label: "Año" },
];

interface Props {
  categories: string[];
  currentSort: string;
  currentPeriod: string;
  currentCategory: string;
}

export default function TrendingFilters({ categories, currentSort, currentPeriod, currentCategory }: Props) {
  const router = useRouter();

  function navigate(sort: string, period: string, category: string) {
    const params = new URLSearchParams();
    params.set("sort", sort);
    params.set("period", period);
    if (category) params.set("category", category);
    router.push(`/trending?${params.toString()}`);
  }

  const btn = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition whitespace-nowrap ${
      active
        ? "bg-black text-white border-black"
        : "border-border text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="space-y-3">

      {/* Fila 1: Sort */}
      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => navigate(opt.value, currentPeriod, currentCategory)}
            className={btn(currentSort === opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Fila 2: Período — solo visible cuando sort=views */}
      {currentSort === "views" && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-400 mr-1">Período:</span>
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => navigate(currentSort, opt.value, currentCategory)}
              className={btn(currentPeriod === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Fila 3: Categorías */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => navigate(currentSort, currentPeriod, "")}
          className={btn(currentCategory === "")}
        >
          Todas
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => navigate(currentSort, currentPeriod, cat)}
            className={btn(currentCategory === cat)}
          >
            {cat}
          </button>
        ))}
      </div>

    </div>
  );
}