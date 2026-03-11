import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.enableCors({
  //   origin: process.env.FRONTEND_URL,
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [process.env.FRONTEND_URL, /\.vercel\.app$/];
      if (
        !origin ||
        allowed.some((o) =>
          typeof o === 'string' ? o === origin : o!.test(origin),
        )
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
