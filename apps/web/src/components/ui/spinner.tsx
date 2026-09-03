import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2
      data-slot="spinner"
      className={cn("size-4 animate-spin text-muted-foreground", className)}
      {...props}
    />
  )
}

/** Overlay centrado para recargas sobre datos ya visibles (cambio de página, filtro, búsqueda). */
function SpinnerOverlay({ className }: { className?: string }) {
  return (
    <div
      data-slot="spinner-overlay"
      className={cn(
        "flex animate-in fade-in items-center justify-center gap-2 py-10 text-sm text-muted-foreground",
        className
      )}
    >
      <Spinner />
      <span>Cargando…</span>
    </div>
  )
}

export { Spinner, SpinnerOverlay }
