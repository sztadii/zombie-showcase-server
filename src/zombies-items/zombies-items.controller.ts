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
import { ZombiesItemsService } from './zombies-items.service'
import { ZombieItemDTO } from './zombies-items.model'
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

  @Get('rates')
  findRates() {
    return this.currencyRatesService.find()
  }

  @Get()
  async findAllZombiesItems() {
    return this.zombiesItemsService.find()
  }

  @Get(':id')
  async getZombieItem(@Param('id') id: string) {
    const zombieItem = await this.zombiesItemsService.get(id)

    if (!zombieItem) {
      throw new HttpException('Zombie item not found', HttpStatus.NOT_FOUND)
    }

    return zombieItem
  }

  @Post()
  async createZombieItem(@Body() zombieItem: ZombieItemDTO) {
    // TODO Validate if user and items exists
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
