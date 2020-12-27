import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { CRUDService } from '../../common/crud.service'
import {
  CurrencyRateDTO,
  ExchangeRateServiceResponse
} from '../zombies-items.model'

@Injectable()
export class CurrencyRatesService extends CRUDService<CurrencyRateDTO> {
  constructor() {
    super('currency-rates')
  }

  async fetchAndUpdateCurrencyRates() {
    console.log('fetchAndUpdateCurrencyRates start')

    try {
      const exchangeResponse = await axios.get<ExchangeRateServiceResponse>(
        'http://api.nbp.pl/api/exchangerates/tables/C'
      )
      const { rates } = exchangeResponse.data[0]
      const ratesWithIds = rates.map((rate) => {
        return {
          ...rate,
          id: rate.code
        }
      })

      await this.deleteAll()
      await this.createMany(ratesWithIds)
    } catch (e) {
      console.error(e.message)
    }
  }
}
