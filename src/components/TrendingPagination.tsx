import React from "react";

interface Props {
  page: number;
  hasMore: boolean;
  sort: string;
  period: string;
  category: string;
}

export default function TrendingPagination({ page, hasMore, sort, period, category }: Props) {
  const base = `/trending?sort=${sort}&period=${period}${
    category ? `&category=${encodeURIComponent(category)}` : ""
  }`;

  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      {page > 1 && (
        
          href={`${base}&page=${page - 1}`}
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          ← Anterior
        </a>
      )}
      <span className="text-sm text-gray-500">Página {page}</span>
      {hasMore && (
        
          href={`${base}&page=${page + 1}`}
          className="rounded-full border border-border px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          Siguiente →
        </a>
      )}
    </div>
  );
}