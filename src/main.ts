import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ResourceSerialization } from './interceptor';
import { AllHttpExceptionsFilter } from './exception';
import { TimeoutInterceptor } from './interceptor/timeout.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const prefix = configService.get<string>('API_PREFIX') ?? 'api';
  app.setGlobalPrefix(prefix);
  app.enableCors({
    origin: '*',
    methods: [
      'GET',
      'POST',
      'PATCH',
      'PUT',
      'DELETE',
      'OPTIONS',
      'HEAD',
      'TRACE',
      'CONNECT',
    ],
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Requested-With',
      'x-lang',
    ],
  });

  // Set up Swagger
  const config = new DocumentBuilder()
    .addServer('', 'Local')
    .addServer(
      configService.get<string>('SEVER_DEV_URL') as string,
      'Development',
    )
    .setTitle('FOOTBALL-MATCHES')
    .setDescription('The FOOTBALL-MATCHES API')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    extraModels: [],
  });
  SwaggerModule.setup('/documentation', app, document);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ResourceSerialization());
  app.useGlobalInterceptors(new TimeoutInterceptor());

  app.useGlobalFilters(new AllHttpExceptionsFilter(app.get(HttpAdapterHost)));

  await app.listen(process.env.PORT ?? 3000);

  console.table({
    service: 'FOOTBALL-MATCHES',
    url: (await app.getUrl()) + '/' + prefix + '/{version}',
    documentation: (await app.getUrl()) + '/documentation',
  });
}
bootstrap();
