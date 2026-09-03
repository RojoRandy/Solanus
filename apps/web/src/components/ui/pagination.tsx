import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PaginationMeta } from "@/lib/pagination"

interface PaginationControlsProps {
  meta: PaginationMeta | undefined
  onPageChange: (page: number) => void
  className?: string
}

/** Controles de paginación en servidor — se usan con el helper usePaginacion(). */
function PaginationControls({ meta, onPageChange, className }: PaginationControlsProps) {
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div data-slot="pagination" className={className ?? "flex items-center justify-between gap-4 pt-2"}>
      <p className="text-sm text-muted-foreground">
        Página {meta.page} de {meta.totalPages} · {meta.total} registro{meta.total === 1 ? '' : 's'}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={!meta.hasNext}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}

export { PaginationControls }
