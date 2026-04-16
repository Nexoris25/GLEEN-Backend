import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication<any>) => {
  const options = new DocumentBuilder()
    .setTitle('Nexoris Gleen Backend API')
    .setDescription(
      `Nexoris Gleen Backend API

---
(Your long description unchanged)
---`,
    )
    .setVersion('1.0')

    // 🔒 JWT Bearer Authentication (LOCK ICON)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'bearer', // 👈 IMPORTANT NAME
    )

    .build();

  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // ✅ keeps token on refresh
    },
  });

  // Export Swagger JSON (for Postman)
  app
    .getHttpAdapter()
    .getInstance()
    .get('/api-json', (req, res) => {
      res.json(document);
    });
};
