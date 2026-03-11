import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      const allowed = [process.env.FRONTEND_URL, /\.vercel\.app$/];
      const isAllowed =
        !origin ||
        allowed.some((o) =>
          typeof o === 'string' ? o === origin : o!.test(origin),
        );
      if (isAllowed) {
        callback(null, origin || true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
