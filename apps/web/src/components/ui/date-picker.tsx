import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

function isoAFecha(iso?: string): Date | undefined {
  if (!iso) return undefined
  const [anio, mes, dia] = iso.split("-").map(Number)
  if (!anio || !mes || !dia) return undefined
  return new Date(anio, mes - 1, dia)
}

function fechaAIso(fecha: Date): string {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, "0")
  const dia = String(fecha.getDate()).padStart(2, "0")
  return `${anio}-${mes}-${dia}`
}

interface DatePickerProps {
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

/** Selector de fecha en español sobre Popover + Calendar (reemplaza <input type="date">). */
function DatePicker({ value, onChange, placeholder = "Selecciona una fecha", disabled, id, className }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const fecha = isoAFecha(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start text-left font-normal", !fecha && "text-muted-foreground", className)}
          />
        }
      >
        <CalendarIcon />
        {fecha ? format(fecha, "d 'de' MMMM 'de' yyyy", { locale: es }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          locale={es}
          selected={fecha}
          defaultMonth={fecha}
          onSelect={(nuevaFecha) => {
            onChange(nuevaFecha ? fechaAIso(nuevaFecha) : undefined)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, isoAFecha, fechaAIso }
