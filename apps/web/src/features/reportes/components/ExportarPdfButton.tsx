import * as React from 'react';
import { toast } from 'sonner';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api-client';
import { queryPeriodo, type Periodo } from '../periodo';

export function ExportarPdfButton({ periodo }: { periodo: Periodo }) {
  const [descargando, setDescargando] = React.useState(false);

  async function handleDescargar() {
    setDescargando(true);
    try {
      const filename = `reporte-${periodo.anio}-${String(periodo.mes).padStart(2, '0')}.pdf`;
      await api.descargar(`/reportes/mensual.pdf${queryPeriodo(periodo)}`, filename);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo generar el PDF del reporte.');
    } finally {
      setDescargando(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void handleDescargar()} disabled={descargando}>
      <FileDown data-icon="inline-start" />
      {descargando ? 'Generando…' : 'Exportar PDF'}
    </Button>
  );
}
