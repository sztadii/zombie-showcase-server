import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { cleanDatabase } from './test-utils'

describe('zombies', () => {
  let app: INestApplication

  beforeEach(async () => {
    await cleanDatabase()

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true
      })
    )
    await app.init()
  })

  function getServer() {
    return request(app.getHttpServer())
  }

  it('GET /zombies return empty list of when zombies collection is empty', async () => {
    const response = await getServer().get('/zombies')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })
})
