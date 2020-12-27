import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { getInitApp } from './test-utils'

describe('app', () => {
  let app: INestApplication

  beforeEach(async () => {
    app = await getInitApp()
  })

  it('GET / return welcome message', async () => {
    const response = await request(app.getHttpServer()).get('/')

    expect(response.status).toBe(200)
    expect(response.text).toBe('Welcome to zombie-showcase-server')
  })
})
