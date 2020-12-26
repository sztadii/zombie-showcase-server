import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { cleanDatabase } from './test-utils'

describe('zombies-items', () => {
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

  it('GET /zombies-items return empty list of when zombies collection is empty', async () => {
    const response = await getServer().get('/zombies-items')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it('GET /zombies-items/:id return zombie', async () => {
    const newZombieItem = { userId: '1qaz2wx', itemId: '1qaz2wx' }
    const postResponse = await getServer()
      .post('/zombies-items')
      .send(newZombieItem)

    const createdZombieItemId = postResponse.body.id

    const response = await getServer().get(
      `/zombies-items/${createdZombieItemId}`
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('userId', newZombieItem.userId)
    expect(response.body).toHaveProperty('createdAt')
  })

  it('GET /zombies/:id throw an error when id is wrong', async () => {
    const newZombieItem = { userId: '2wsx3edc', itemId: '2wsx3edc' }
    const postResponse = await getServer()
      .post('/zombies-items')
      .send(newZombieItem)

    const response = await getServer().get(`/zombies-items/wrong-id`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Zombie item not found')
  })

  it('POST /zombies-items create new zombie-item document', async () => {
    const newZombieItem = { userId: '2wsx3edc', itemId: '2wsx3edc' }
    const postResponse = await getServer()
      .post('/zombies-items')
      .send(newZombieItem)

    const getResponse = await getServer().get('/zombies-items')

    expect(postResponse.status).toBe(201)
    expect(postResponse.body).toHaveProperty('userId', newZombieItem.userId)
    expect(postResponse.body).toHaveProperty('itemId', newZombieItem.itemId)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).toHaveProperty('userId', newZombieItem.userId)
    expect(getResponse.body[0]).toHaveProperty('itemId', newZombieItem.itemId)
    expect(getResponse.body[0]).toHaveProperty('createdAt')
  })

  it('POST /zombies-items throw an validation error during zombie item creation', async () => {
    const emptyObjectResponse = await getServer()
      .post('/zombies-items')
      .send({})
    const wrongPropertyResponse = await getServer()
      .post('/zombies-items')
      .send({ wrongProperty: 'Wrong element' })

    expect(emptyObjectResponse.status).toBe(400)
    expect(wrongPropertyResponse.status).toBe(400)
  })

  it('DELETE /zombies-items/:id allows to delete the zombie item', async () => {
    const newZombieItem = { userId: '2wsx3edc', itemId: '2wsx3edc' }
    const postResponse = await getServer()
      .post('/zombies-items')
      .send(newZombieItem)

    const createdZombieId = postResponse.body.id

    const beforeDeleteGetResponse = await getServer().get('/zombies-items')

    const deleteResponse = await getServer().delete(
      `/zombies-items/${createdZombieId}`
    )

    const afterDeleteGetResponse = await getServer().get('/zombies-items')

    expect(deleteResponse.status).toBe(200)
    expect(beforeDeleteGetResponse.body).toHaveLength(1)
    expect(afterDeleteGetResponse.body).toHaveLength(0)
  })

  it('DELETE /zombies-items delete all zombies', async () => {
    const newZombieItem = { userId: '2wsx3edc', itemId: '2wsx3edc' }
    await getServer().post('/zombies-items').send(newZombieItem)

    const beforeDeleteGetResponse = await getServer().get('/zombies-items')
    const deleteResponse = await getServer().delete(`/zombies-items`)
    const afterDeleteGetResponse = await getServer().get('/zombies-items')

    expect(deleteResponse.status).toBe(200)
    expect(beforeDeleteGetResponse.body).toHaveLength(1)
    expect(afterDeleteGetResponse.body).toHaveLength(0)
  })
})
