import { Prisma } from '@prisma/client';
import { EvidenciaResponseDto } from '../dto/evidencia.dto';

export const EVIDENCIA_SELECT = {
  id: true,
  anio: true,
  mes: true,
  rutaArchivo: true,
  createdAt: true,
  subidoPor: { select: { id: true, nombre: true } },
} satisfies Prisma.EvidenciaMensualSelect;

type EvidenciaConRelaciones = Prisma.EvidenciaMensualGetPayload<{
  select: typeof EVIDENCIA_SELECT;
}>;

export function mapEvidencia(evidencia: EvidenciaConRelaciones): EvidenciaResponseDto {
  return {
    id: evidencia.id,
    anio: evidencia.anio,
    mes: evidencia.mes,
    rutaArchivo: evidencia.rutaArchivo,
    subidoPor: evidencia.subidoPor,
    createdAt: evidencia.createdAt,
  };
}
