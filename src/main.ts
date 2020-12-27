import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { runMiddleware } from './middleware'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT

  runMiddleware(app)

  await app.listen(port)

  console.log(`App is running at http://localhost:${port}`)
}

bootstrap()
