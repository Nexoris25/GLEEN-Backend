import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';
import { setupSwagger } from './swagger';
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  NestInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript'; // Import Sequelize
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from 'body-parser';
import { UserIdInterceptor } from './auth/GuardsDecorMiddleware/userId-interceptor.middleware';
import { JwtService } from '@nestjs/jwt';
import { UserIdMiddleware } from './auth/GuardsDecorMiddleware/user-id.middleware';
import { useContainer } from 'class-validator'; // ← must import from 'class-validator'
import { map } from 'rxjs/operators';

dotenv.config();

class HttpStatusSyncInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const res = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data: unknown) => {
        if (
          data &&
          typeof data === 'object' &&
          'error' in data &&
          typeof (data as { error?: unknown }).error === 'string'
        ) {
          try {
            const parsed = JSON.parse((data as { error: string }).error);
            const details =
              parsed &&
              typeof parsed === 'object' &&
              'details' in parsed &&
              (parsed as { details?: unknown }).details &&
              typeof (parsed as { details?: unknown }).details === 'object'
                ? (parsed as { details: any }).details
                : null;

            const statusCode =
              details &&
              typeof details === 'object' &&
              'statusCode' in details &&
              typeof (details as { statusCode?: unknown }).statusCode ===
                'number'
                ? (details as { statusCode: number }).statusCode
                : null;

            if (details && statusCode && Number.isFinite(statusCode)) {
              throw new HttpException(details, statusCode);
            }
          } catch (err) {
            if (err instanceof HttpException) {
              throw err;
            }
          }
        }

        if (
          res &&
          !res.headersSent &&
          data &&
          typeof data === 'object' &&
          ('status' in data || 'statusCode' in data)
        ) {
          const status =
            (data as { status?: unknown; statusCode?: unknown }).status ??
            (data as { statusCode?: unknown }).statusCode;
          if (typeof status === 'number' && Number.isFinite(status)) {
            res.status(status);
          }
        }
        return data;
      }),
    );
  }
}

async function bootstrap() {
  // In bootstrap() — place this right after NestFactory.create(...)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'fatal', 'debug', 'verbose'],
    rawBody: true, // ← Add this line (NestJS 9+ style)
  });
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';
  const jwtService = new JwtService({ secret: secretKey });
  const userIdMiddleware = new UserIdMiddleware(jwtService);
  app.use((req: Request, res: Response, next: NextFunction) =>
    userIdMiddleware.use(req, res, next),
  );
  app.useGlobalInterceptors(new UserIdInterceptor(jwtService));
  app.useGlobalInterceptors(new HttpStatusSyncInterceptor());

  // Enable CORS
  app.enableCors({
    origin: '*', // Replace '' with specific origins in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Forwarded-For', // Include X-Forwarded-For
  });

  // Enable global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

  app.useStaticAssets(join(__dirname, '..', 'uploads')); // Serve static files

  // Security with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Adjust as per requirements
    }),
  );

  app.set('trust proxy', 1); // Adjust based on your proxy setup

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // Setup Swagger
  setupSwagger(app);

  // Synchronize Sequelize models
  const sequelize = app.get(Sequelize);
  try {
    // Adjust force carefully and Please be careful as it can cause the loss of data
    await sequelize.sync({ alter: false }); // Adjust force carefully
    console.log('Database synchronization completed successfully.');
  } catch (error) {
    console.error('Error during database synchronization:', error);
  } finally {
    console.log('App listening on PORT', process.env.PORT || 3000);
  }

  await app.listen(process.env.PORT || 3000);
  console.log('APP LISTENING');
}
void bootstrap();
