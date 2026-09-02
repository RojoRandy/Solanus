import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsuariosController } from './usuarios.controller';
import { CrearUsuarioUseCase } from './usecases/crear-usuario.usecase';
import { ListarUsuariosUseCase } from './usecases/listar-usuarios.usecase';
import { ActualizarUsuarioUseCase } from './usecases/actualizar-usuario.usecase';
import { EliminarUsuarioUseCase } from './usecases/eliminar-usuario.usecase';

@Module({
  imports: [AuthModule],
  controllers: [UsuariosController],
  providers: [
    CrearUsuarioUseCase,
    ListarUsuariosUseCase,
    ActualizarUsuarioUseCase,
    EliminarUsuarioUseCase,
  ],
})
export class UsuariosModule {}
