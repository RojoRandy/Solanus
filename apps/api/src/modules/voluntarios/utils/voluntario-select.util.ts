import { Prisma } from '@prisma/client';
import { VoluntarioResponseDto } from '../dto/voluntario.dto';

export const voluntarioSelect = {
  id: true,
  nombres: true,
  apellidos: true,
  telefono: true,
  fotoPath: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.VoluntarioSelect;

type VoluntarioConSelect = Prisma.VoluntarioGetPayload<{
  select: typeof voluntarioSelect;
}>;

export function mapVoluntarioResponse(
  voluntario: VoluntarioConSelect,
): VoluntarioResponseDto {
  return { ...voluntario };
}
