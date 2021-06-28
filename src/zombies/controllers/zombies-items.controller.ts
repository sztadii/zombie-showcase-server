import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post
} from '@nestjs/common'
import { ZombiesItemsService } from '../services/zombies-items.service'
import { ZombieItemDTO } from '../models/zombies-items.model'
import { ItemsService } from '../services/items.service'
import { CurrencyRatesService } from '../services/currency-rates.service'
import { ZombiesService } from '../services/zombies.service'

@Controller('zombies/:userId/items')
export class ZombiesItemsController {
  constructor(
    private readonly zombiesItemsService: ZombiesItemsService,
    private readonly itemsService: ItemsService,
    private readonly currencyRatesService: CurrencyRatesService,
    private readonly zombiesService: ZombiesService
  ) {}

  @Get()
  async findAllZombiesItems(@Param('userId') userId: string) {
    const userZombieItems = await this.zombiesItemsService.find({
      queryParams: [
        {
          fieldPath: 'userId',
          opStr: '==',
          value: userId
        }
      ]
    })

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

  @Get('price-sum')
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

  @Post()
  async createZombieItem(@Body() zombieItem: ZombieItemDTO) {
    const item = await this.itemsService.get(zombieItem.itemId)

    if (!item) {
      throw new HttpException('Item not found', HttpStatus.NOT_FOUND)
    }

    const zombie = await this.zombiesService.get(zombieItem.userId)

    if (!zombie) {
      throw new HttpException('Zombie not found', HttpStatus.NOT_FOUND)
    }

    const currentZombieItems = await this.findAllZombiesItems(zombieItem.userId)

    const maxAllowedItemsForZombie = 5
    const canCreateNewZombieItem =
      currentZombieItems.length < maxAllowedItemsForZombie

    if (!canCreateNewZombieItem) {
      const errorMessage = `Zombie can not have more than ${maxAllowedItemsForZombie} items`
      throw new HttpException(errorMessage, HttpStatus.BAD_REQUEST)
    }

    return this.zombiesItemsService.create(zombieItem)
  }

  @Delete(':id')
  async deleteZombieItem(@Param('id') id: string) {
    await this.getZombieItem(id)
    return this.zombiesItemsService.delete(id)
  }
}
