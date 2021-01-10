import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  HttpException,
  HttpStatus
} from '@nestjs/common'
import { ZombiesService } from '../services/zombies.service'
import { ZombieDTO } from '../models/zombies.model'
import { ZombiesItemsService } from '../services/zombies-items.service'

@Controller('zombies')
export class ZombiesController {
  constructor(
    private readonly zombiesService: ZombiesService,
    private readonly zombiesItemsService: ZombiesItemsService
  ) {}

  @Get()
  findAllZombies() {
    return this.zombiesService.find()
  }

  @Get(':id')
  async getZombie(@Param('id') id: string) {
    const zombie = await this.zombiesService.get(id)

    if (!zombie) {
      throw new HttpException('Zombie not found', HttpStatus.NOT_FOUND)
    }

    return zombie
  }

  @Post()
  createZombie(@Body() zombie: ZombieDTO) {
    return this.zombiesService.create(zombie)
  }

  @Patch(':id')
  async updateZombie(@Param('id') id: string, @Body() zombie: ZombieDTO) {
    await this.getZombie(id)

    return this.zombiesService.update(id, zombie)
  }

  @Delete()
  async deleteAllZombies() {
    return Promise.all([
      this.zombiesItemsService.deleteAll(),
      this.zombiesService.deleteAll()
    ])
  }

  @Delete(':id')
  async deleteZombie(@Param('id') id: string) {
    await this.getZombie(id)

    const userZombieItems = await this.zombiesItemsService.find([
      {
        fieldPath: 'userId',
        opStr: '==',
        value: id
      }
    ])

    await Promise.all(
      userZombieItems.map((zombieItem) =>
        this.zombiesItemsService.delete(zombieItem.id)
      )
    )

    return this.zombiesService.delete(id)
  }
}
