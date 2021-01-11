import {
  Firestore,
  CollectionReference,
  DocumentData,
  FieldPath,
  WhereFilterOp
} from '@google-cloud/firestore'
import { v4 as uuid } from 'uuid'

type FindParam = {
  /**
   * Field path for example userId
   * */
  fieldPath: string | FieldPath
  /**
   * Filter conditions in a `Query.where()` clause are specified using the
   * strings '<', '<=', '==', '!=', '>=', '>', 'array-contains', 'in', 'not-in',
   * and 'array-contains-any'.
   */
  opStr: WhereFilterOp
  value: any
}

export class CRUDDocument {
  id: string
  createdAt: Date
}

export class CRUDService<T, E = T & CRUDDocument> {
  private readonly firestore: Firestore
  private readonly collection: CollectionReference<DocumentData>

  constructor(collectionName: string) {
    this.firestore = new Firestore()
    this.collection = this.firestore.collection(collectionName)
  }

  private transformDocument(
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

  async find(param?: FindParam[]): Promise<E[]> {
    const query = param
      ? param.reduce((query, param) => {
          return query.where(param.fieldPath, param.opStr, param.value)
        }, this.collection)
      : this.collection

    const documents = await query.get()

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
