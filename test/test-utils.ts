import { Firestore } from '@google-cloud/firestore'
import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module'
import { runMiddleware } from '../src/middleware'
import * as request from 'supertest'

export async function cleanDatabase() {
  try {
    const firestore = new Firestore()
    const collections = await firestore.listCollections()

    await Promise.all(
      collections.map(async (collection) => {
        const batch = firestore.batch()
        const allDocuments = await collection.listDocuments()
        allDocuments.forEach((document) => {
          batch.delete(document)
        })
        await batch.commit()
      })
    )
  } catch (e) {
    throw new Error('Not able to clean database')
  }
}

export async function getServer() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule]
  }).compile()

  const app = moduleFixture.createNestApplication()

  runMiddleware(app)

  await app.init()

  return request(app.getHttpServer())
}
