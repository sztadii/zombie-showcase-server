import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import axios from 'axios'
import { CRUDService } from '../common/crud.service'
import { Item } from './zombies-items.model'

@Injectable()
export class ItemsService extends CRUDService<Item> {
  constructor() {
    super('items')
    this.fetchAndUpdateItems()
  }

  @Cron('* 0 0 * * *')
  private async fetchAndUpdateItems() {
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
