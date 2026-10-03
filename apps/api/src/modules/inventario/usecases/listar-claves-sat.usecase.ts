import { Injectable } from '@nestjs/common';
import { UseCase } from '@/common/interfaces/use-case.interface';
import { CLAVES_SAT } from '../claves-sat';
import { ClaveSatResponseDto, ListarClavesSatQueryDto } from '../dto/producto.dto';

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

@Injectable()
export class ListarClavesSatUseCase implements UseCase<
  ListarClavesSatQueryDto,
  ClaveSatResponseDto[]
> {
  async execute({ buscar }: ListarClavesSatQueryDto): Promise<ClaveSatResponseDto[]> {
    const termino = normalizar(buscar ?? '');
    const resultados = termino
      ? CLAVES_SAT.filter(({ clave, descripcion, palabrasClave }) =>
          clave.startsWith(termino) ||
          normalizar(descripcion).includes(termino) ||
          normalizar(palabrasClave).includes(termino),
        ).slice(0, 20)
      : CLAVES_SAT;

    return resultados.map(({ clave, descripcion }) => ({ clave, descripcion }));
  }
}
