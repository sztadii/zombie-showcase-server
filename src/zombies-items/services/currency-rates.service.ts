import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import axios from 'axios'
import { CRUDService } from '../../common/crud.service'
import { CurrencyRateDocument } from '../zombies-items.model'
import { isTestEnv } from '../../common/is-test-env'

@Injectable()
export class CurrencyRatesService extends CRUDService<CurrencyRateDocument> {
  constructor() {
    super('currency-rates')

    if (!isTestEnv()) {
      this.fetchAndUpdateCurrencyRates()
    }
  }

  // TODO Please test the cron functionality
  @Cron('* 0 0 * * *')
  private async fetchAndUpdateCurrencyRates() {
    console.log('fetchAndUpdateCurrencyRates start')

    try {
      const exchangeResponse = await axios(
        'http://api.nbp.pl/api/exchangerates/tables/C'
      )
      const { rates } = exchangeResponse.data[0]

      await this.deleteAll()
      await this.createMany(rates)
    } catch (e) {
      console.error(e.message)
    }
  }
}
