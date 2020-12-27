import { Body, Controller, Get, Post } from '@nestjs/common'
import {
  ItemDTO,
  ItemDocument,
  CurrencyRateDTO,
  CurrencyRateDocument
} from './zombies-items.model'
import { ItemsService } from './services/items.service'
import { CurrencyRatesService } from './services/currency-rates.service'

@Controller('external')
export class ExternalController {
  constructor(
    private readonly itemsService: ItemsService,
    private readonly currencyRatesService: CurrencyRatesService
  ) {}

  // This endpoint will be trigger by GCP cloud scheduler
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
  createItems(@Body() item: ItemDTO): Promise<ItemDocument> {
    return this.itemsService.create(item)
  }

  @Get('rates')
  findRates() {
    return this.currencyRatesService.find()
  }

  @Post('rates')
  createCurrencyRate(
    @Body() currencyRate: CurrencyRateDTO
  ): Promise<CurrencyRateDocument> {
    return this.currencyRatesService.create(currencyRate)
  }
}
