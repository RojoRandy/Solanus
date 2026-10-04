import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { CLAVES_SAT } from '../claves-sat';
import { ClaveSatResponseDto, ListarClavesSatQueryDto } from '../dto/producto.dto';

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CLAVES_SAT_NORMALIZADAS = CLAVES_SAT.map(
  ({ clave, descripcion, palabrasClave }) => ({
    clave,
    descripcion,
    textoNormalizado: normalizar(`${clave} ${descripcion} ${palabrasClave}`),
  }),
);

@Injectable()
export class ListarClavesSatUseCase implements UseCase<
  ListarClavesSatQueryDto,
  ClaveSatResponseDto[]
> {
  async execute({ buscar }: ListarClavesSatQueryDto): Promise<ClaveSatResponseDto[]> {
    const termino = normalizar(buscar ?? '');
    const palabras = termino.split(' ');
    const terminoSinSeparadores = termino.replace(/ /g, '');
    const esPrefijoNumerico = /^[0-9]+$/.test(terminoSinSeparadores);
    const resultados = termino
      ? CLAVES_SAT_NORMALIZADAS.filter(
          ({ clave, textoNormalizado }) =>
            palabras.every((palabra) => textoNormalizado.includes(palabra)) ||
            (esPrefijoNumerico && clave.startsWith(terminoSinSeparadores)),
        ).slice(0, 20)
      : CLAVES_SAT;

    return resultados.map(({ clave, descripcion }) => ({ clave, descripcion }));
  }
}
