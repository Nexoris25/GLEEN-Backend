import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { MailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
dotenv.config();

// Determine template directory dynamically (works in dev and dist)
const templatesPath = existsSync(join(__dirname, 'templates'))
  ? join(__dirname, 'templates')               // dev
  : join(__dirname, '../../src/email/templates'); // after build in dist

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME || '30d' },
    }),
    MailerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        transport: {
          host: process.env.EMAIL_HOST ?? config.get('EMAIL_HOST'),
          port: Number(process.env.EMAIL_PORT ?? config.get('EMAIL_PORT')),
          secure: (process.env.EMAIL_SECURE ?? config.get('EMAIL_SECURE')) === 'true',
          auth: {
            user: process.env.EMAIL_USER ?? config.get('EMAIL_USER'),
            pass: process.env.EMAIL_PASSWORD ?? config.get('EMAIL_PASSWORD'),
          },
        },
        tls: {
          rejectUnauthorized: false,
        },
        defaults: {
          from: '"GLEEN EduTech" <charles.edozie@nexoristech.com>',
        },
        template: {
          dir: templatesPath,
          adapter: new HandlebarsAdapter(),
          options: { strict: true },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}



