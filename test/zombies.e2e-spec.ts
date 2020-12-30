import { cleanDatabase, getServer, Server } from './test-utils'

describe('zombies', () => {
  let server: Server

  beforeAll(async () => {
    server = await getServer()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  it('GET /zombies return an empty list of zombies when zombies collection is empty', async () => {
    const response = await server.get('/zombies')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(0)
  })

  it('GET /zombies return an list of zombies when zombies collection is filled', async () => {
    const newZombie = { name: 'Tonny "Iron Man" Stark' }
    await server.post('/zombies').send(newZombie)

    const getResponse = await server.get('/zombies')

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).toHaveProperty('name', newZombie.name)
    expect(getResponse.body[0]).toHaveProperty('createdAt')
  })

  it('GET /zombies/:id return single zombie', async () => {
    const newZombie = { name: 'Tonny "Iron Man" Stark' }
    const postResponse = await server.post('/zombies').send(newZombie)

    const createdZombieId = postResponse.body.id

    const response = await server.get(`/zombies/${createdZombieId}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('name', newZombie.name)
    expect(response.body).toHaveProperty('createdAt')
  })

  it('GET /zombies/:id throw an error when id is wrong', async () => {
    await server.post('/zombies').send({ name: 'Iron Man' })

    const response = await server.get(`/zombies/wrong-id`)

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('message', 'Zombie not found')
  })

  it('POST /zombies create new zombie', async () => {
    const newZombie = { name: 'Capitan America' }
    const postResponse = await server.post('/zombies').send(newZombie)

    const getResponse = await server.get('/zombies')

    expect(postResponse.status).toBe(201)
    expect(postResponse.body).toHaveProperty('name', newZombie.name)

    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).toHaveProperty('name', newZombie.name)
    expect(getResponse.body[0]).toHaveProperty('createdAt')
  })

  it('POST /zombies create new zombie and skip useless properties send by client', async () => {
    const newZombie = { name: 'Capitan America', wrongProperty: 'wrong value' }
    const postResponse = await server.post('/zombies').send(newZombie)

    const getResponse = await server.get('/zombies')

    expect(postResponse.status).toBe(201)
    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveLength(1)
    expect(getResponse.body[0]).not.toHaveProperty('wrongProperty')
  })

  it('POST /zombies throw an validation error during zombie creation', async () => {
    const emptyObjectResponse = await server.post('/zombies').send({})
    const wrongPropertyResponse = await server
      .post('/zombies')
      .send({ firstName: 'Capitan America' })

    expect(emptyObjectResponse.status).toBe(400)
    expect(emptyObjectResponse.body).toHaveProperty('message')

    expect(wrongPropertyResponse.status).toBe(400)
    expect(wrongPropertyResponse.body).toHaveProperty('message')
  })

  it('PATCH /zombies/:id allow to update the zombie', async () => {
    const newZombie = { name: 'Tonny "Iron Man" Stark' }
    const updatedZombie = { name: 'Tonny "Iron Man" Stark updated' }

    const postResponse = await server.post('/zombies').send(newZombie)
    const createdZombieId = postResponse.body.id

    const patchResponse = await server
      .patch(`/zombies/${createdZombieId}`)
      .send(updatedZombie)

    const getResponse = await server.get(`/zombies/${createdZombieId}`)

    expect(patchResponse.status).toBe(200)
    expect(patchResponse.body).toHaveProperty('name', updatedZombie.name)
    expect(getResponse.status).toBe(200)
    expect(getResponse.body).toHaveProperty('name', updatedZombie.name)
  })

  it('PATCH /zombies/:id throw an error when id is wrong', async () => {
    const oldZombie = { name: 'Tonny "Iron Man" Stark' }
    const newZombie = { name: 'Tonny "Iron Man" Stark updated' }

    const postResponse = await server.post('/zombies').send(oldZombie)
    const createdZombieId = postResponse.body.id

    const patchResponse = await server
      .patch(`/zombies/wrong-id`)
      .send(newZombie)

    const getResponse = await server.get(`/zombies/${createdZombieId}`)

    expect(patchResponse.status).toBe(404)
    expect(getResponse.body).toHaveProperty('name', oldZombie.name)
  })

  it('DELETE /zombies/:id allows to delete a zombie', async () => {
    const newZombie = { name: 'Tonny "Iron Man" Stark updated' }

    // To be sure that we are going to remove only one element we need at least 2 zombies in the DB
    await server.post('/zombies').send(newZombie)
    const postResponse = await server.post('/zombies').send(newZombie)
    const createdZombieId = postResponse.body.id

    const beforeDeleteGetResponse = await server.get('/zombies')

    const deleteResponse = await server.delete(`/zombies/${createdZombieId}`)

    const afterDeleteGetResponse = await server.get('/zombies')

    expect(deleteResponse.status).toBe(200)
    expect(beforeDeleteGetResponse.body).toHaveLength(2)
    expect(afterDeleteGetResponse.body).toHaveLength(1)
  })

  it('DELETE /zombies delete all zombies', async () => {
    await server.post('/zombies').send({ name: 'Tonny "Iron Man" Stark' })
    await server.post('/zombies').send({ name: 'Thor "The Kind of Asgard"' })

    const beforeDeleteGetResponse = await server.get('/zombies')
    const deleteResponse = await server.delete(`/zombies`)
    const afterDeleteGetResponse = await server.get('/zombies')

    expect(deleteResponse.status).toBe(200)
    expect(beforeDeleteGetResponse.body).toHaveLength(2)
    expect(afterDeleteGetResponse.body).toHaveLength(0)
  })

  it('DELETE /zombies/:id throw an error when id is wrong', async () => {
    await server.post('/zombies').send({ name: 'Tonny "Iron Man" Stark' })
    await server.post('/zombies').send({ name: 'Thor "The Kind of Asgard"' })

    const beforeDeleteGetResponse = await server.get('/zombies')
    const deleteResponse = await server.delete(`/zombies/wrong-id`)
    const afterDeleteGetResponse = await server.get('/zombies')

    expect(deleteResponse.status).toBe(404)
    expect(beforeDeleteGetResponse.body).toHaveLength(2)
    expect(afterDeleteGetResponse.body).toHaveLength(2)
  })
})
