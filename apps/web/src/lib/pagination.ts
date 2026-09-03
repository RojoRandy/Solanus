import { useState } from 'react';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Estado de página para listas paginadas en servidor; resetea a 1 cuando cambian los filtros. */
export function usePaginacion(limit = 25) {
  const [page, setPage] = useState(1);
  return { page, limit, setPage, resetPagina: () => setPage(1) };
}
