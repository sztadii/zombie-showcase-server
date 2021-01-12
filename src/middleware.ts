import { INestApplication, ValidationPipe } from '@nestjs/common'

export function runMiddleware(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      whitelist: true,
      forbidNonWhitelisted: false
    })
  )
}
