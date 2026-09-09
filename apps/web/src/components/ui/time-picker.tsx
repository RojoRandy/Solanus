import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

const INTERVALO_MINUTOS = 30

interface OpcionHora {
  value: string
  label: string
}

// ponytail: intervalos de 30 min (48 opciones); agregar entrada libre al minuto si algún evento lo necesita.
function generarOpciones(): OpcionHora[] {
  const opciones: OpcionHora[] = []
  for (let minutosDelDia = 0; minutosDelDia < 24 * 60; minutosDelDia += INTERVALO_MINUTOS) {
    const horas = Math.floor(minutosDelDia / 60)
    const minutos = minutosDelDia % 60
    const value = `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`
    opciones.push({ value, label: formatEtiqueta(value) })
  }
  return opciones
}

function formatEtiqueta(value: string): string {
  const [horasStr, minutosStr] = value.split(":")
  const horas = Number(horasStr)
  const hora12 = horas % 12 === 0 ? 12 : horas % 12
  const ampm = horas < 12 ? "AM" : "PM"
  return `${hora12}:${minutosStr} ${ampm}`
}

const OPCIONES_HORA = generarOpciones()

interface TimePickerProps {
  value?: string
  onChange: (value: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  id?: string
  className?: string
}

/** Selector de hora en intervalos de 30 min sobre Popover + Command (reemplaza <input type="time">). */
function TimePicker({ value, onChange, placeholder = "Selecciona una hora", disabled, id, className }: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const listRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open || !value) return
    // El popup de Base UI monta su contenido con un pequeño retraso tras abrir
    // (coordinado con su animación de entrada), por eso no basta un solo frame.
    const timeout = setTimeout(() => {
      const item = listRef.current?.querySelector(`[data-time-value="${value}"]`)
      item?.scrollIntoView({ block: "center" })
    }, 50)
    return () => clearTimeout(timeout)
  }, [open, value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground", className)}
          />
        }
      >
        <Clock />
        {value ? formatEtiqueta(value) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Buscar hora…" />
          <div ref={listRef}>
            <CommandList>
              <CommandEmpty>Sin resultados</CommandEmpty>
              <CommandGroup>
                {OPCIONES_HORA.map((opcion) => (
                  <CommandItem
                    key={opcion.value}
                    value={opcion.label}
                    data-time-value={opcion.value}
                    data-checked={value === opcion.value}
                    onSelect={() => {
                      onChange(opcion.value)
                      setOpen(false)
                    }}
                  >
                    {opcion.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { TimePicker }
