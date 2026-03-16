import React from "react";

interface Props {
  page: number;
  hasMore: boolean;
  sort: string;
  period: string;
  category: string;
}

export default function TrendingPagination(props: Props) {
  const categoryParam = props.category ? "&category=" + encodeURIComponent(props.category) : "";
  const base = "/trending?sort=" + props.sort + "&period=" + props.period + categoryParam;
  const prevHref = base + "&page=" + (props.page - 1);
  const nextHref = base + "&page=" + (props.page + 1);

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      {props.page > 1 && (
        <a href={prevHref} className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-gray-50">
          Anterior
        </a>
      )}
      <span className="text-sm text-gray-500">Pagina {props.page}</span>
      {props.hasMore && (
        <a href={nextHref} className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-gray-50">
          Siguiente
        </a>
      )}
    </div>
  );
}