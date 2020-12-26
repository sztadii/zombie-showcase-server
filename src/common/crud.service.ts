import {
  Firestore,
  CollectionReference,
  DocumentData,
  FieldPath,
  WhereFilterOp
} from '@google-cloud/firestore'
import { v4 as uuid } from 'uuid'

type FindParam = {
  fieldPath: string | FieldPath
  opStr: WhereFilterOp
  value: any
}

export class CRUDService<E = any> {
  private firestore: Firestore
  private collection: CollectionReference<DocumentData>

  constructor(collectionName: string) {
    this.firestore = new Firestore()
    this.collection = this.firestore.collection(collectionName)
  }

  transformDocument(
    document: FirebaseFirestore.DocumentSnapshot<DocumentData>
  ) {
    const documentData = document.data() as E
    return {
      ...documentData,
      id: document.id,
      createdAt: document.createTime.toDate()
    }
  }

  async get(id: string): Promise<E> {
    const document = await this.collection.doc(id).get()

    if (!document.exists) return undefined

    return this.transformDocument(document)
  }

  async create(entity): Promise<E> {
    const { id = uuid() } = entity
    const elementId = id.toString()
    await this.collection.doc(elementId).set(entity)
    return this.get(elementId)
  }

  async update(id: string, entity): Promise<E> {
    await this.collection.doc(id).update(entity)
    return this.get(id)
  }

  async createMany(entities = []): Promise<void> {
    const allEntitiesPromise = entities.map((entity) => this.create(entity))
    await Promise.all(allEntitiesPromise)
  }

  // TODO Make params array
  async find(param?: FindParam): Promise<E[]> {
    const documents = param
      ? await this.collection
          .where(param.fieldPath, param.opStr, param.value)
          .get()
      : await this.collection.get()

    return documents.docs.map((document) => {
      return this.transformDocument(document)
    })
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete()
  }

  async deleteAll(): Promise<void> {
    const batch = this.firestore.batch()

    const allDocuments = await this.collection.listDocuments()

    allDocuments.map((document) => {
      batch.delete(document)
    })

    await batch.commit()
  }
}
