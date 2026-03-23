import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile app, Postman)
      if (!origin) return callback(null, true);
      
      if (frontendUrl && origin === frontendUrl) return callback(null, true);
      if (origin === 'http://localhost:3000') return callback(null, true);
      if (origin === 'http://localhost:3001') return callback(null, true);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-client-type'],
  });

  const httpAdapter = app.getHttpAdapter();
  const expressInstance = httpAdapter.getInstance();
  expressInstance.get(
    '/',
    (_req: unknown, res: { json: (body: object) => void }) =>
      res.json({ ok: true, message: 'API is up' }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
