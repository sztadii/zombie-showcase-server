import { Body, Controller, Get, Post } from '@nestjs/common'
import { ItemDTO, CurrencyRateDTO } from '../models/zombies-items.model'
import { ItemsService } from '../services/items.service'
import { CurrencyRatesService } from '../services/currency-rates.service'

@Controller('external')
export class ExternalController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly currencyRatesService: CurrencyRatesService
  ) {}

  // This endpoint will be trigger by GCP cloud scheduler everyday at 00:00 UTC
  @Post()
  async fetchAllExternalElements() {
    await this.itemsService.fetchAndUpdateItems()
    await this.currencyRatesService.fetchAndUpdateCurrencyRates()
  }

  @Get('items')
  findItems() {
    return this.itemsService.find()
  }

  @Post('items')
  createItem(@Body() item: ItemDTO) {
    return this.itemsService.create(item)
  }

  @Get('rates')
  findCurrencyRates() {
    return this.currencyRatesService.find()
  }

  @Post('rates')
  createCurrencyRate(@Body() currencyRate: CurrencyRateDTO) {
    return this.currencyRatesService.create(currencyRate)
  }
}
