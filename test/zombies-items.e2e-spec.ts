import * as request from 'supertest'
import { cleanDatabase, getServer } from './test-utils'

describe('zombies-items', () => {
  let server: request.SuperTest<request.Test>

  beforeEach(async () => {
    await cleanDatabase()
    server = await getServer()
  })

  it('POST /external will fetch all external resources', async () => {
    const itemsBeforePrefetch = await server.get('/external/items')
    const currencyRatesBeforePrefetch = await server.get('/external/rates')

    const response = await server.post('/external')

    const itemsAfterPrefetch = await server.get('/external/items')
    const currencyRatesAfterPrefetch = await server.get('/external/rates')

    expect(response.status).toBe(201)

    expect(itemsBeforePrefetch.body.length === 0).toBeTruthy()
    expect(currencyRatesBeforePrefetch.body.length === 0).toBeTruthy()

    expect(itemsAfterPrefetch.body.length > 0).toBeTruthy()
    expect(currencyRatesAfterPrefetch.body.length > 0).toBeTruthy()
  })

  it('GET /external/items return empty list of when items collection is empty', async () => {
    const response = await server.get('/external/items')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it('POST /external/items create new item document', async () => {
    const response = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('price', 100)
    expect(response.body).toHaveProperty('name', 'Chocolate')
  })

  it('POST /external/items throw validation error', async () => {
    const missingPriceResponse = await server.post('/external/items').send({
      name: 'Chocolate'
    })

    const wrongTypeResponse = await server.post('/external/items').send({
      name: 'Chocolate',
      price: 'xxxx'
    })

    expect(missingPriceResponse.status).toBe(400)
    expect(wrongTypeResponse.status).toBe(400)
  })

  it('GET /external/rates return empty list of when rates collection is empty', async () => {
    const response = await server.get('/external/rates')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it('POST /external/rates create new currency rate document', async () => {
    const response = await server.post('/external/rates').send({
      currency: 'Dollar',
      ask: 3.8,
      bid: 3.65,
      code: 'USD'
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('currency', 'Dollar')
    expect(response.body).toHaveProperty('code', 'USD')
    expect(response.body).toHaveProperty('bid', 3.65)
    expect(response.body).toHaveProperty('ask', 3.8)
  })

  it('POST /external/rates throw validation error', async () => {
    const emptyDataResponse = await server.post('/external/rates').send({})

    const missingDataResponse = await server.post('/external/rates').send({
      currency: 'Dollar',
      code: 'USD'
    })

    const wrongTypeResponse = await server.post('/external/rates').send({
      currency: 'Dollar',
      ask: 'xxx',
      bid: 'xxx',
      code: 'USD'
    })

    expect(emptyDataResponse.status).toBe(400)
    expect(missingDataResponse.status).toBe(400)
    expect(wrongTypeResponse.status).toBe(400)
  })

  it('GET /zombies-items return empty list of when zombies collection is empty', async () => {
    const response = await server.get('/zombies-items')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it('GET /zombies-items return list of when zombies collection is filled', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const newZombieItem = { userId: '1qaz2wx', itemId: itemResponse.body.id }
    await server.post('/zombies-items').send(newZombieItem)

    const response = await server.get('/zombies-items')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
  })

  it('GET /zombies-items return list with all available and pre-fetched properties', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Drink'
    })

    const itemId = itemResponse.body.id
    const newZombieItem = { userId: '1qaz2wx', itemId }
    await server.post('/zombies-items').send(newZombieItem)

    const response = await server.get('/zombies-items')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toHaveProperty('userId', '1qaz2wx')
    expect(response.body[0]).toHaveProperty('itemId', itemId)
    expect(response.body[0]).toHaveProperty('item')
    expect(response.body[0].item).toHaveProperty('name', 'Drink')
  })

  it('GET /zombies-items return items list for particular user', async () => {
    const chocoResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const iphoneResponse = await server.post('/external/items').send({
      price: 5000,
      name: 'Iphone'
    })

    const chocoZombieItem = {
      userId: 'user-with-choco-id',
      itemId: chocoResponse.body.id
    }
    const iphoneZombieItem = {
      userId: 'user-with-phone-id',
      itemId: iphoneResponse.body.id
    }
    await server.post('/zombies-items').send(chocoZombieItem)
    await server.post('/zombies-items').send(iphoneZombieItem)

    const response = await server.get(
      '/zombies-items?userId=user-with-phone-id'
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toHaveProperty('userId', 'user-with-phone-id')
    expect(response.body[0].item).toHaveProperty('name', 'Iphone')
    expect(response.body[0].item).toHaveProperty('price', 5000)
  })

  it('GET /zombies-items do not throw an error when items list is empty for particular user', async () => {
    const response = await server.get(
      '/zombies-items?userId=user-with-phone-id'
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it('GET /zombies-items/:id return zombie', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const newZombieItem = { userId: '1qaz2wx', itemId: itemResponse.body.id }
    const postResponse = await server.post('/zombies-items').send(newZombieItem)

    const createdZombieItemId = postResponse.body.id

    const response = await server.get(`/zombies-items/${createdZombieItemId}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('userId', newZombieItem.userId)
    expect(response.body).toHaveProperty('createdAt')
  })

  it('GET /zombies/:id throw an error when id is wrong', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })
    const newZombieItem = { userId: '2wsx3edc', itemId: itemResponse.body.id }
    await server.post('/zombies-items').send(newZombieItem)

    const response = await server.get(`/zombies-items/wrong-id`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Zombie item not found')
  })

  it('GET /zombies-items/:userId/price-sum return price sum of items in few different currencies', async () => {
    const chocoItem = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const iphoneItem = await server.post('/external/items').send({
      price: 1000,
      name: 'Iphone'
    })

    await server.post('/external/rates').send({
      id: 'USD',
      currency: 'Dollar',
      ask: 10.5,
      bid: 10.1,
      code: 'USD'
    })

    await server.post('/external/rates').send({
      id: 'EUR',
      currency: 'Euro',
      ask: 20.5,
      bid: 20.1,
      code: 'EUR'
    })

    await server
      .post('/zombies-items')
      .send({ userId: 'user-1-id', itemId: chocoItem.body.id })

    await server
      .post('/zombies-items')
      .send({ userId: 'user-1-id', itemId: iphoneItem.body.id })

    await server
      .post('/zombies-items')
      .send({ userId: 'user-2-id', itemId: iphoneItem.body.id })

    const firstUserItemsSum = await server.get(
      '/zombies-items/user-1-id/price-sum'
    )

    expect(firstUserItemsSum.status).toBe(200)
    expect(firstUserItemsSum.body).toEqual([
      {
        code: 'EUR',
        sumValue: 54.73
      },
      {
        code: 'USD',
        sumValue: 108.91
      }
    ])
  })

  it('POST /zombies-items create new zombie-item document', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const newZombieItem = { userId: '2wsx3edc', itemId: itemResponse.body.id }
    const postResponse = await server.post('/zombies-items').send(newZombieItem)

    const getResponse = await server.get('/zombies-items')

    expect(postResponse.status).toBe(201)
    expect(postResponse.body).toHaveProperty('userId', newZombieItem.userId)
    expect(postResponse.body).toHaveProperty('itemId', newZombieItem.itemId)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).toHaveProperty('userId', newZombieItem.userId)
    expect(getResponse.body[0]).toHaveProperty('itemId', newZombieItem.itemId)
    expect(getResponse.body[0]).toHaveProperty('createdAt')
  })

  it('POST /zombies-items create new zombie-item document and do not save useless properties sent by client', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const newZombieItem = {
      userId: '2wsx3edc',
      itemId: itemResponse.body.id,
      uselessProperty: 'useless value'
    }
    const postResponse = await server.post('/zombies-items').send(newZombieItem)

    const getResponse = await server.get('/zombies-items')

    expect(postResponse.status).toBe(201)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).toHaveProperty('userId', newZombieItem.userId)
    expect(getResponse.body[0]).toHaveProperty('itemId', newZombieItem.itemId)
    expect(getResponse.body[0]).toHaveProperty('createdAt')
    expect(getResponse.body[0]).not.toHaveProperty('uselessProperty')
  })

  it('POST /zombies-items throw an validation error during zombie item creation', async () => {
    const emptyObjectResponse = await server.post('/zombies-items').send({})
    const wrongPropertyResponse = await server
      .post('/zombies-items')
      .send({ wrongProperty: 'Wrong element' })
    const wrongItemId = await server
      .post('/zombies-items')
      .send({ itemId: 'wring-id', userId: 'user-id' })

    expect(emptyObjectResponse.status).toBe(400)
    expect(wrongPropertyResponse.status).toBe(400)
    expect(wrongItemId.status).toBe(404)
  })

  it('DELETE /zombies-items delete all zombies', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const newZombieItem = { userId: '2wsx3edc', itemId: itemResponse.body.id }
    await server.post('/zombies-items').send(newZombieItem)

    const beforeDeleteGetResponse = await server.get('/zombies-items')
    const deleteResponse = await server.delete(`/zombies-items`)
    const afterDeleteGetResponse = await server.get('/zombies-items')

    expect(deleteResponse.status).toBe(200)
    expect(beforeDeleteGetResponse.body).toHaveLength(1)
    expect(afterDeleteGetResponse.body).toHaveLength(0)
  })

  it('DELETE /zombies-items/:id allows to delete the zombie item', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const newZombieItem = { userId: '2wsx3edc', itemId: itemResponse.body.id }
    const postResponse = await server.post('/zombies-items').send(newZombieItem)

    const createdZombieId = postResponse.body.id

    const beforeDeleteGetResponse = await server.get('/zombies-items')

    const deleteResponse = await server.delete(
      `/zombies-items/${createdZombieId}`
    )

    const afterDeleteGetResponse = await server.get('/zombies-items')

    expect(deleteResponse.status).toBe(200)
    expect(beforeDeleteGetResponse.body).toHaveLength(1)
    expect(afterDeleteGetResponse.body).toHaveLength(0)
  })

  it('DELETE /zombies-items/:id throw an error when id is wrong', async () => {
    const itemResponse = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    const newZombieItem = { userId: '2wsx3edc', itemId: itemResponse.body.id }
    await server.post('/zombies-items').send(newZombieItem)

    const beforeDeleteGetResponse = await server.get('/zombies-items')

    const deleteResponse = await server.delete(`/zombies-items/wrong-id`)

    const afterDeleteGetResponse = await server.get('/zombies-items')

    expect(deleteResponse.status).toBe(404)
    expect(beforeDeleteGetResponse.body).toHaveLength(1)
    expect(afterDeleteGetResponse.body).toHaveLength(1)
  })
})
