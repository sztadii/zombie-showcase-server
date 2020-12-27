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
import { ZombiesService } from './services/zombies.service'
import { ZombieDTO } from './zombies.model'

@Controller('zombies')
export class ZombiesController {
  constructor(private readonly zombiesService: ZombiesService) {}

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
  deleteAllZombies() {
    return this.zombiesService.deleteAll()
  }

  @Delete(':id')
  async deleteZombie(@Param('id') id: string) {
    await this.getZombie(id)

    return this.zombiesService.delete(id)
  }
}
