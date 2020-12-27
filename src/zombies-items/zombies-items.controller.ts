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
import { ZombiesItemsService } from './services/zombies-items.service'
import { ZombieItemDTO } from './zombies-items.model'
import { ItemsService } from './services/items.service'
import { CurrencyRatesService } from './services/currency-rates.service'

@Controller('zombies-items')
export class ZombiesItemsController {
  constructor(
    private readonly zombiesItemsService: ZombiesItemsService,
    private readonly itemsService: ItemsService,
    private readonly currencyRatesService: CurrencyRatesService
  ) {}

  @Get()
  async findAllZombiesItems(@Query('userId') userId: string) {
    const userZombieItems = await this.zombiesItemsService.find(
      userId
        ? {
            fieldPath: 'userId',
            opStr: '==',
            value: userId
          }
        : undefined
    )

    // Because we will have max 5 userZombieItems then performance will be ok
    const userZombieItemsWithPrefetchedItem = await Promise.all(
      userZombieItems.map(async (zombieItem) => {
        const item = await this.itemsService.get(zombieItem.itemId)
        return {
          ...zombieItem,
          item
        }
      })
    )

    return userZombieItemsWithPrefetchedItem
  }

  @Get(':id')
  async getZombieItem(@Param('id') id: string) {
    const zombieItem = await this.zombiesItemsService.get(id)

    if (!zombieItem) {
      throw new HttpException('Zombie item not found', HttpStatus.NOT_FOUND)
    }

    const item = await this.itemsService.get(zombieItem.itemId)

    return {
      ...zombieItem,
      item
    }
  }

  @Get(':userId/price-sum')
  async getZombieItemsPriceSum(@Param('userId') userId: string) {
    const currentZombieItems = await this.findAllZombiesItems(userId)
    const requestedCurrencies = await Promise.all([
      this.currencyRatesService.get('USD'),
      this.currencyRatesService.get('EUR')
    ])

    const itemsPriceSumInPln = currentZombieItems.reduce((sum, current) => {
      return sum + current.item.price
    }, 0)

    const itemsPriceSumInDifferentCurrencies = requestedCurrencies
      .map((currency) => {
        const sumValue = (itemsPriceSumInPln / currency.bid).toFixed(2)
        return {
          code: currency.code,
          sumValue: Number(sumValue)
        }
      })
      .sort((a, b) => a.code.localeCompare(b.code))

    return itemsPriceSumInDifferentCurrencies
  }

  @Post()
  async createZombieItem(@Body() zombieItem: ZombieItemDTO) {
    const item = await this.itemsService.get(zombieItem.itemId)

    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND)
    }

    // TODO Please throw NOT_FOUND error if user not exists

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
