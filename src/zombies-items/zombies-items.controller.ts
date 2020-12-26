import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query
} from '@nestjs/common'
import { ZombiesItemsService } from './zombies-items.service'
import {
  ZombieItemDTO,
  ItemDTO,
  ItemDocument,
  CurrencyRateDTO,
  CurrencyRateDocument
} from './zombies-items.model'
import { ItemsService } from './items.service'
import { CurrencyRatesService } from './currency-rates.service'

@Controller('zombies-items')
export class ZombiesItemsController {
  constructor(
    private readonly zombiesItemsService: ZombiesItemsService,
    private readonly itemsService: ItemsService,
    private readonly currencyRatesService: CurrencyRatesService
  ) {}

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

  @Get()
  async findAllZombiesItems(@Query('userId') userId: string) {
    // TODO Validate if user exists

    const allItems = await this.itemsService.find()
    const allZombieItems = await this.zombiesItemsService.find(
      userId
        ? {
            fieldPath: 'userId',
            opStr: '==',
            value: userId
          }
        : undefined
    )
    return allZombieItems.map((zombieItem) => {
      const item = allItems.find((item) => item.id === zombieItem.itemId)
      return {
        ...zombieItem,
        item
      }
    })
  }

  @Get(':id')
  async getZombieItem(@Param('id') id: string) {
    const zombieItem = await this.zombiesItemsService.get(id)

    if (!zombieItem) {
      throw new HttpException('Zombie item not found', HttpStatus.NOT_FOUND)
    }

    const item = await this.itemsService.get(zombieItem.itemId)

    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND)
    }

    return {
      ...zombieItem,
      item
    }
  }

  @Get(':userId/sum')
  async getItemsSum(@Param('userId') userId: string) {
    const zombieItems = await this.findAllZombiesItems(userId)

    // TODO Filter by code in service
    const allCurrencyRates = await this.currencyRatesService.find()

    const requestedCurrenciesCodes = ['USD', 'EUR']
    const requestedCurrencies = allCurrencyRates.filter((currencyRate) =>
      requestedCurrenciesCodes.includes(currencyRate.code)
    )
    const itemsSum = zombieItems.reduce((sum, current) => {
      return sum + current.item.price
    }, 0)

    const itemsSumInDifferentCurrencies = requestedCurrencies.map(
      (currency) => {
        const sumValue = (itemsSum / currency.bid).toFixed(2)
        return {
          code: currency.code,
          sumValue: Number(sumValue)
        }
      }
    )

    return itemsSumInDifferentCurrencies.sort((a, b) =>
      a.code.localeCompare(b.code)
    )
  }

  @Post()
  async createZombieItem(@Body() zombieItem: ZombieItemDTO) {
    const item = await this.itemsService.get(zombieItem.itemId)

    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND)
    }

    return this.zombiesItemsService.create(zombieItem)
  }

  @Delete()
  deleteAllZombiesItems() {
    return this.zombiesItemsService.deleteAll()
  }

  @Delete(':id')
  async deleteZombieItem(@Param('id') id: string) {
    await this.getZombieItem(id)
    return this.zombiesItemsService.delete(id)
  }
}
