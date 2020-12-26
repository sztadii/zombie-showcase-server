import { Firestore } from '@google-cloud/firestore'

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
