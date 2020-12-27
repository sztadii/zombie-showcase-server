import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { CRUDService } from '../../common/crud.service'
import { ItemDTO } from '../zombies-items.model'

@Injectable()
export class ItemsService extends CRUDService<ItemDTO> {
  constructor() {
    super('items')
  }

  async fetchAndUpdateItems() {
    console.log('fetchAndUpdateItems start')

    try {
      const itemsResponse = await axios(
        'https://zombie-items-api.herokuapp.com/api/items'
      )
      const { items } = itemsResponse.data

      await this.deleteAll()
      await this.createMany(items)
    } catch (e) {
      console.error(e.message)
    }
  }
}
