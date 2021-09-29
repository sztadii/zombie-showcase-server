import { getServer } from './test-utils'

describe('app', () => {
  it('GET / return welcome message', async (done) => {
    const server = await getServer()
    const response = await server.get('/')

    expect(response.status).toBe(200)
    expect(response.text).toBe('Welcome to zombie-showcase-server')
    done()
  })
})
