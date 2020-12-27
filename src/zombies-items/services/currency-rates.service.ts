import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { CRUDService } from '../../common/crud.service'
import { CurrencyRateDocument } from '../zombies-items.model'

@Injectable()
export class CurrencyRatesService extends CRUDService<CurrencyRateDocument> {
  constructor() {
    super('currency-rates')
  }

  async fetchAndUpdateCurrencyRates() {
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
