import { cleanDatabase, getServer, Server } from './test-utils'
import * as nock from 'nock'
import { ZombieDTO } from '../src/zombies/models/zombies.model'
import {
  ItemDTO,
  ZombieItemDTO
} from '../src/zombies/models/zombies-items.model'

describe('zombies-items', () => {
  let server: Server

  beforeAll(async () => {
    server = await getServer()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  async function createZombie(zombie?: Partial<ZombieDTO>): Promise<ZombieDTO> {
    const newZombie = { name: 'Random zombie name', ...(zombie || {}) }
    const postResponse = await server.post('/zombies').send(newZombie)
    return postResponse.body
  }

  async function createItem(item?: Partial<ItemDTO>): Promise<ItemDTO> {
    const newItem = {
      price: 100,
      name: 'Random item name',
      ...(item || {})
    }
    const itemResponse = await server.post('/external/items').send(newItem)
    return itemResponse.body
  }

  async function createZombieItem(
    zombieItem?: Partial<ZombieItemDTO>
  ): Promise<ZombieItemDTO> {
    const zombieItemResponse = await server
      .post(`/zombies/${zombieItem.userId}/items`)
      .send(zombieItem)
    return zombieItemResponse.body
  }

  it('POST /external will fetch and save all external resources', async () => {
    nock('http://api.nbp.pl')
      .get('/api/exchangerates/tables/C')
      .reply(200, [
        {
          rates: [
            {
              currency: 'Dollar',
              ask: 1,
              bid: 1,
              code: 'USD'
            }
          ]
        }
      ])

    nock('https://zombie-items-api.herokuapp.com')
      .get('/api/items')
      .reply(200, {
        items: [
          {
            id: '1',
            price: 100,
            name: 'Chocolate'
          }
        ]
      })

    const itemsBeforePrefetch = await server.get('/external/items')
    const currencyRatesBeforePrefetch = await server.get('/external/rates')
    const response = await server.post('/external')
    const itemsAfterPrefetch = await server.get('/external/items')
    const currencyRatesAfterPrefetch = await server.get('/external/rates')

    expect(response.status).toBe(201)

    expect(itemsBeforePrefetch.body).toHaveLength(0)
    expect(currencyRatesBeforePrefetch.body).toHaveLength(0)

    expect(itemsAfterPrefetch.body).toHaveLength(1)
    expect(currencyRatesAfterPrefetch.body).toHaveLength(1)

    expect(itemsAfterPrefetch.body[0]).toHaveProperty('name', 'Chocolate')
    expect(currencyRatesAfterPrefetch.body[0]).toHaveProperty(
      'currency',
      'Dollar'
    )
  })

  it('GET /external/items return status 200 when list has been send without any issues', async () => {
    const response = await server.get('/external/items')
    expect(response.status).toBe(200)
  })

  it('GET /external/items return empty list when items collection is empty', async () => {
    const response = await server.get('/external/items')
    expect(response.body).toHaveLength(0)
  })

  it('POST /external/items return status 201 when item has been created without any issues', async () => {
    const response = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    expect(response.status).toBe(201)
  })

  it('POST /external/items create and return new item', async () => {
    const response = await server.post('/external/items').send({
      price: 100,
      name: 'Chocolate'
    })

    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('price', 100)
    expect(response.body).toHaveProperty('name', 'Chocolate')
  })

  it('POST /external/items throw an error when request body has missing property', async () => {
    const missingPriceResponse = await server.post('/external/items').send({
      name: 'Chocolate'
    })

    expect(missingPriceResponse.status).toBe(400)
  })

  it('POST /external/items throw an error when the request body property has wrong type', async () => {
    const wrongTypeResponse = await server.post('/external/items').send({
      name: 'Chocolate',
      price: 'xxxx'
    })

    expect(wrongTypeResponse.status).toBe(400)
  })

  it('GET /external/rates return empty list when rates collection is empty', async () => {
    const response = await server.get('/external/rates')
    expect(response.body).toHaveLength(0)
  })

  it('POST /external/rates create and return a new currency rate', async () => {
    const response = await server.post('/external/rates').send({
      currency: 'Dollar',
      ask: 3.8,
      bid: 3.65,
      code: 'USD'
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body).toHaveProperty('currency', 'Dollar')
    expect(response.body).toHaveProperty('code', 'USD')
    expect(response.body).toHaveProperty('bid', 3.65)
    expect(response.body).toHaveProperty('ask', 3.8)
  })

  it('POST /external/rates throw an error when request body has missing property', async () => {
    const missingDataResponse = await server.post('/external/rates').send({
      currency: 'Dollar',
      code: 'USD'
    })
    expect(missingDataResponse.status).toBe(400)
  })

  it('POST /external/rates throw an error when request body has empty object', async () => {
    const emptyDataResponse = await server.post('/external/rates').send({})

    expect(emptyDataResponse.status).toBe(400)
  })

  it('POST /external/rates throw an error when request body object property has wrong type', async () => {
    const wrongTypeResponse = await server.post('/external/rates').send({
      currency: 'Dollar',
      ask: 'xxx',
      bid: 'xxx',
      code: 'USD'
    })
    expect(wrongTypeResponse.status).toBe(400)
  })

  it('GET /zombies/:userId/items return items list for particular user', async () => {
    const chocoItem = await createItem({
      price: 100,
      name: 'Chocolate'
    })
    const zombieWithChoco = await createZombie({ id: 'user-with-choco-id' })

    const iphoneItem = await createItem({
      price: 5000,
      name: 'Iphone'
    })
    const zombieWithPhone = await createZombie({ id: 'user-with-phone-id' })

    const chocoZombieItem = {
      userId: zombieWithChoco.id,
      itemId: chocoItem.id
    }
    const iphoneZombieItem = {
      userId: zombieWithPhone.id,
      itemId: iphoneItem.id
    }
    await createZombieItem(chocoZombieItem)
    await createZombieItem(iphoneZombieItem)

    const response = await server.get('/zombies/user-with-phone-id/items')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0]).toHaveProperty('userId', 'user-with-phone-id')
    expect(response.body[0].item).toHaveProperty('name', 'Iphone')
    expect(response.body[0].item).toHaveProperty('price', 5000)
  })

  it('GET /zombies/:userId/items return empty list when user do not have items', async () => {
    const zombie = await createZombie()

    const response = await server.get(`/zombies/${zombie.id}/items`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it('GET /zombies/:userId/items/:id return zombie item', async () => {
    const item = await createItem({
      price: 100,
      name: 'Chocolate'
    })
    const zombie = await createZombie()

    const newZombieItem = { userId: zombie.id, itemId: item.id }
    const zombieItem = await createZombieItem(newZombieItem)

    const createdZombieItemId = zombieItem.id

    const response = await server.get(
      `/zombies/${zombie.id}/items/${createdZombieItemId}`
    )

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('userId', newZombieItem.userId)
    expect(response.body).toHaveProperty('createdAt')
    expect(response.body).toHaveProperty('item')
    expect(response.body.item).toHaveProperty('name', 'Chocolate')
    expect(response.body.item).toHaveProperty('price', 100)
  })

  it('GET /zombies/:userId/items/:id throw an error when id is wrong', async () => {
    const item = await createItem({
      price: 100,
      name: 'Chocolate'
    })
    const zombie = await createZombie()
    const newZombieItem = { userId: zombie.id, itemId: item.id }
    await createZombieItem(newZombieItem)

    const response = await server.get(`/zombies/${zombie.id}/items/wrong-id`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Zombie item not found')
  })

  it('GET /zombies/:userId/items/price-sum return price sum of items in few different currencies', async () => {
    const chocoItem = await createItem({
      price: 100,
      name: 'Chocolate'
    })

    const iphoneItem = await createItem({
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

    const zombie1 = await createZombie({ id: 'user-1-id' })
    const zombie2 = await createZombie({ id: 'user-2-id' })

    await createZombieItem({ userId: zombie1.id, itemId: chocoItem.id })
    await createZombieItem({ userId: zombie1.id, itemId: iphoneItem.id })
    await createZombieItem({ userId: zombie2.id, itemId: iphoneItem.id })

    const firstUserItemsSum = await server.get(
      '/zombies/user-1-id/items/price-sum'
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

  it('POST /zombies/:userId/items create and return new zombie-item', async () => {
    const item = await createItem({
      price: 100,
      name: 'Chocolate'
    })
    const zombie = await createZombie()

    const newZombieItem = { userId: zombie.id, itemId: item.id }
    const postResponse = await server
      .post(`/zombies/${zombie.id}/items`)
      .send(newZombieItem)

    const getResponse = await server.get(`/zombies/${zombie.id}/items`)

    expect(postResponse.status).toBe(201)
    expect(postResponse.body).toHaveProperty('userId', newZombieItem.userId)
    expect(postResponse.body).toHaveProperty('itemId', newZombieItem.itemId)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).toHaveProperty('id')
    expect(getResponse.body[0]).toHaveProperty('userId', newZombieItem.userId)
    expect(getResponse.body[0]).toHaveProperty('itemId', newZombieItem.itemId)
    expect(getResponse.body[0]).toHaveProperty('item', item)
    expect(getResponse.body[0]).toHaveProperty('createdAt')
  })

  it('POST /zombies/:userId/items ignore useless properties send by client during creation', async () => {
    const item = await createItem({
      price: 100,
      name: 'Chocolate'
    })
    const zombie = await createZombie()

    const newZombieItem = {
      userId: zombie.id,
      itemId: item.id,
      uselessProperty: 'useless value'
    }
    await server.post(`/zombies/${zombie.id}/items`).send(newZombieItem)
    const getResponse = await server.get(`/zombies/${zombie.id}/items`)

    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).not.toHaveProperty('uselessProperty')
  })

  it('POST /zombies/:userId/items throw an validation error during zombie item creation', async () => {
    const zombie = await createZombie()
    const item = await createItem()

    const emptyObjectResponse = await server
      .post(`/zombies/${zombie.id}/items`)
      .send({})

    const wrongPropertyResponse = await server
      .post(`/zombies/${zombie.id}/items`)
      .send({ wrongProperty: 'Wrong element' })

    const wrongItemId = await server
      .post(`/zombies/${zombie.id}/items`)
      .send({ itemId: 'wring-id', userId: zombie.id })

    const wrongUserId = await server
      .post(`/zombies/${zombie.id}/items`)
      .send({ itemId: item.id, userId: 'wrong-id' })

    expect(emptyObjectResponse.status).toBe(400)
    expect(wrongPropertyResponse.status).toBe(400)
    expect(wrongItemId.status).toBe(404)
    expect(wrongUserId.status).toBe(404)
  })

  it('POST /zombies/:userId/items throw an error if we want to add new item for zombie who has already 5 items', async () => {
    const zombie = await createZombie()

    for (let i = 0; i < 5; i++) {
      const item = await createItem()

      await createZombieItem({ itemId: item.id, userId: zombie.id })
    }

    const notAllowedItem = await createItem()

    const notAllowedZombieItem = await server
      .post(`/zombies/${zombie.id}/items`)
      .send({ itemId: notAllowedItem.id, userId: zombie.id })

    expect(notAllowedZombieItem.status).toBe(400)
    expect(notAllowedZombieItem.body.message).toBe(
      'Zombie can not have more than 5 items'
    )
  })

  it('DELETE /zombies/:userid/items/:id allows to delete the zombie item', async () => {
    const item = await createItem({
      price: 100,
      name: 'Chocolate'
    })
    const zombie = await createZombie()

    const newZombieItem = { userId: zombie.id, itemId: item.id }

    // To be sure that we are going to remove only one element we need at least 2 items in the DB
    await createZombieItem(newZombieItem)
    const zombieItem = await createZombieItem(newZombieItem)

    const createdZombieId = zombieItem.id

    const beforeDeleteGetResponse = await server.get(
      `/zombies/${zombie.id}/items`
    )

    const deleteResponse = await server.delete(
      `/zombies/${zombie.id}/items/${createdZombieId}`
    )

    const afterDeleteGetResponse = await server.get(
      `/zombies/${zombie.id}/items`
    )

    expect(deleteResponse.status).toBe(200)
    expect(beforeDeleteGetResponse.body).toHaveLength(2)
    expect(afterDeleteGetResponse.body).toHaveLength(1)
  })

  it('DELETE /zombies/:userId/items/:id throw an error when id is wrong', async () => {
    const item = await createItem({
      price: 100,
      name: 'Chocolate'
    })
    const zombie = await createZombie()

    await createZombieItem({ userId: zombie.id, itemId: item.id })

    const beforeDeleteGetResponse = await server.get(
      `/zombies/${zombie.id}/items`
    )

    const deleteResponse = await server.delete('/zombies/wrong-id/items')

    const afterDeleteGetResponse = await server.get(
      `/zombies/${zombie.id}/items`
    )

    expect(deleteResponse.status).toBe(404)
    expect(beforeDeleteGetResponse.body).toHaveLength(1)
    expect(afterDeleteGetResponse.body).toHaveLength(1)
  })
})
