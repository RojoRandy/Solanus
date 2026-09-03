import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ComensalesController } from './comensales.controller';
import { CrearComensalUseCase } from './usecases/crear-comensal.usecase';
import { ListarComensalesUseCase } from './usecases/listar-comensales.usecase';
import { ObtenerComensalUseCase } from './usecases/obtener-comensal.usecase';
import { ActualizarComensalUseCase } from './usecases/actualizar-comensal.usecase';
import { EliminarComensalUseCase } from './usecases/eliminar-comensal.usecase';
import { SubirFotoComensalUseCase } from './usecases/subir-foto-comensal.usecase';
import { SubirIneFrenteComensalUseCase } from './usecases/subir-ine-frente-comensal.usecase';
import { SubirIneReversoComensalUseCase } from './usecases/subir-ine-reverso-comensal.usecase';
import { FirmarCartaUsoImagenUseCase } from './usecases/firmar-carta-uso-imagen.usecase';
import { GenerarPdfExpedienteUseCase } from './usecases/generar-pdf-expediente.usecase';
import { ListarAsistenciasComensalUseCase } from './usecases/listar-asistencias-comensal.usecase';

@Module({
  // AuthModule debe importarse aquí: @Auth() usa AuthGuard() de @nestjs/passport,
  // que requiere PassportModule disponible en este módulo (si se omite, Nest lanza
  // "please import PassportModule" y, peor, el guard puede dejar pasar peticiones).
  imports: [AuthModule],
  controllers: [ComensalesController],
  providers: [
    CrearComensalUseCase,
    ListarComensalesUseCase,
    ObtenerComensalUseCase,
    ActualizarComensalUseCase,
    EliminarComensalUseCase,
    SubirFotoComensalUseCase,
    SubirIneFrenteComensalUseCase,
    SubirIneReversoComensalUseCase,
    FirmarCartaUsoImagenUseCase,
    GenerarPdfExpedienteUseCase,
    ListarAsistenciasComensalUseCase,
  ],
})
export class ComensalesModule {}
