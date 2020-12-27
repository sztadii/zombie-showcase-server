import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import axios from 'axios'
import { CRUDService } from '../../common/crud.service'
import { ItemDocument } from '../zombies-items.model'
import { isTestEnv } from '../../common/is-test-env'

// If we are considering serverless architecture then maybe better choice will be do not use cron as a service
// We can trigger it by http and keep it state less as possible
// Let's refactor it later

@Injectable()
export class ItemsService extends CRUDService<ItemDocument> {
  constructor() {
    super('items')

    if (!isTestEnv()) {
      this.fetchAndUpdateItems()
    }
  }

  // TODO Please test the cron functionality
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
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
