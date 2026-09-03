import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { fechaAIso, isoAFecha } from "@/components/ui/date-picker"

export interface RangoFechaIso {
  desde?: string
  hasta?: string
}

interface DateRangePickerProps {
  value: RangoFechaIso
  onChange: (value: RangoFechaIso) => void
  placeholder?: string
  className?: string
}

function DateRangePicker({ value, onChange, placeholder = "Selecciona un periodo", className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const desde = isoAFecha(value.desde)
  const hasta = isoAFecha(value.hasta)
  const range: DateRange | undefined = desde || hasta ? { from: desde, to: hasta } : undefined

  const texto =
    desde && hasta
      ? `${format(desde, "d MMM yyyy", { locale: es })} – ${format(hasta, "d MMM yyyy", { locale: es })}`
      : desde
        ? `Desde ${format(desde, "d MMM yyyy", { locale: es })}`
        : placeholder

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn("w-auto justify-start text-left font-normal", !desde && !hasta && "text-muted-foreground", className)}
          />
        }
      >
        <CalendarIcon />
        {texto}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          locale={es}
          numberOfMonths={2}
          selected={range}
          defaultMonth={desde}
          onSelect={(nuevoRango) => {
            onChange({
              desde: nuevoRango?.from ? fechaAIso(nuevoRango.from) : undefined,
              hasta: nuevoRango?.to ? fechaAIso(nuevoRango.to) : undefined,
            })
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DateRangePicker }
