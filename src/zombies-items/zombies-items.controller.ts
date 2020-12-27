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
    const requestedCurrencies = await this.currencyRatesService.findByCurrencyCodes(
      ['USD', 'EUR']
    )
    const itemsSum = zombieItems.reduce((sum, current) => {
      return sum + current.item.price
    }, 0)

    const itemsSumInDifferentCurrencies = requestedCurrencies
      .map((currency) => {
        const sumValue = (itemsSum / currency.bid).toFixed(2)
        return {
          code: currency.code,
          sumValue: Number(sumValue)
        }
      })
      .sort((a, b) => a.code.localeCompare(b.code))

    return itemsSumInDifferentCurrencies
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
