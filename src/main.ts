import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ROLE_HEADER } from '@/shared/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes for versioning
  app.setGlobalPrefix('v1');

  // Add validation pipe to validate incoming requests
  app.useGlobalPipes(new ValidationPipe());

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Vending machine API')
    .setDescription('Vending machine API methods and types')
    .setVersion('1.0')
    .addGlobalParameters({
      name: ROLE_HEADER,
      description: 'User role: MAINTENANCE or USER(optional)',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
