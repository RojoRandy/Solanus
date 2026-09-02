import { DocumentBuilder } from '@nestjs/swagger';

export const config = new DocumentBuilder()
  .setTitle('Comedor Solanus API')
  .setDescription(
    'API del sistema de gestión interna del Comedor Comunitario Beato Solanus Casey (Amigos de los Capuchinos ABP)',
  )
  .setVersion('1.0')
  .addBearerAuth()
  .build();

export const swaggerSetupOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
};
