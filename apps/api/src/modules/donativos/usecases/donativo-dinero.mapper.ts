import { Prisma } from '@prisma/client';
import { DonativoDineroResponseDto } from '../dto/donativo-dinero.dto';

export const DONATIVO_DINERO_SELECT = {
  id: true,
  monto: true,
  fecha: true,
  metodoPago: true,
  folioRecibo: true,
  nota: true,
  createdAt: true,
  bienhechor: { select: { id: true, nombre: true } },
  turno: { select: { id: true, fecha: true, horario: true } },
  registradoPor: { select: { id: true, nombre: true } },
} satisfies Prisma.DonativoDineroSelect;

type DonativoDineroConRelaciones = Prisma.DonativoDineroGetPayload<{
  select: typeof DONATIVO_DINERO_SELECT;
}>;

export function mapDonativoDinero(
  donativo: DonativoDineroConRelaciones,
): DonativoDineroResponseDto {
  return {
    id: donativo.id,
    monto: Number(donativo.monto),
    // `fecha` es date-only (@db.Date): se devuelve como YYYY-MM-DD para que el
    // front no la corra un día al interpretar el timestamp UTC en zona local.
    fecha: donativo.fecha.toISOString().slice(0, 10),
    metodoPago: donativo.metodoPago,
    folioRecibo: donativo.folioRecibo,
    nota: donativo.nota,
    bienhechor: donativo.bienhechor,
    turno: donativo.turno,
    registradoPor: donativo.registradoPor,
    createdAt: donativo.createdAt,
  };
}
