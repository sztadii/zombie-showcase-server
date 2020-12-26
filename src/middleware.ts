import { INestApplication, ValidationPipe } from '@nestjs/common'

export function runMiddleware(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false
    })
  )
}
