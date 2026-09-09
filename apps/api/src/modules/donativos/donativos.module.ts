import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DonativosController } from './donativos.controller';
import { RegistrarDonativoDineroUseCase } from './usecases/registrar-donativo-dinero.usecase';
import { ListarDonativosDineroUseCase } from './usecases/listar-donativos-dinero.usecase';
import { EliminarDonativoDineroUseCase } from './usecases/eliminar-donativo-dinero.usecase';

@Module({
  imports: [AuthModule],
  controllers: [DonativosController],
  providers: [
    RegistrarDonativoDineroUseCase,
    ListarDonativosDineroUseCase,
    EliminarDonativoDineroUseCase,
  ],
})
export class DonativosModule {}
