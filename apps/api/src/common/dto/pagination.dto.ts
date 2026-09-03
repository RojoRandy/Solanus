import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

const LIMITE_POR_DEFECTO = 25;
// 500 acomoda los combobox que piden "todo" para un selector (productos,
// variantes, bienhechores) sin paginar — el volumen esperado de un comedor
// comunitario está muy por debajo de eso.
const LIMITE_MAXIMO = 500;

/** Query de paginación reutilizable: `?page=1&limit=25`. */
export class PaginationQueryDto {
  @ApiProperty({ required: false, default: 1, description: 'Página, empieza en 1' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({ required: false, default: LIMITE_POR_DEFECTO, description: `Registros por página (máx. ${LIMITE_MAXIMO})` })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(LIMITE_MAXIMO)
  limit?: number;
}

export class PaginationMetaDto {
  @ApiProperty()
  total: number;
  @ApiProperty()
  page: number;
  @ApiProperty()
  limit: number;
  @ApiProperty()
  totalPages: number;
  @ApiProperty()
  hasNext: boolean;
}

export class PaginatedDto<T> {
  items: T[];
  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}

/** Convierte page/limit a skip/take para Prisma, aplicando los valores por defecto. */
export function toSkipTake(query: PaginationQueryDto = {}): { skip: number; take: number; page: number; limit: number } {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? Math.min(query.limit, LIMITE_MAXIMO) : LIMITE_POR_DEFECTO;
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

/** Arma la respuesta paginada estándar a partir de los items de la página y el total. */
export function paginado<T>(items: T[], total: number, query: PaginationQueryDto = {}): PaginatedDto<T> {
  const { page, limit } = toSkipTake(query);
  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      hasNext: page * limit < total,
    },
  };
}
