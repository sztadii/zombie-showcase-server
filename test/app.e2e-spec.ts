import * as request from 'supertest'
import { getServer } from './test-utils'

describe('app', () => {
  let server: request.SuperTest<request.Test>

  beforeEach(async () => {
    server = await getServer()
  })

  it('GET / return welcome message', async (done) => {
    const response = await server.get('/')

    expect(response.status).toBe(200)
    expect(response.text).toBe('Welcome to zombie-showcase-server')
    done()
  })
})
