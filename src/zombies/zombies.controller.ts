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
import { ZombieDTO, ZombieDocument } from './zombies.model'

@Controller('zombies')
export class ZombiesController {
  constructor(private readonly zombiesService: ZombiesService) {}

  @Get()
  findAllZombies(): Promise<ZombieDocument[]> {
    return this.zombiesService.find()
  }

  @Get(':id')
  async getZombie(@Param('id') id: string): Promise<ZombieDocument> {
    const zombie = await this.zombiesService.get(id)

    if (!zombie) {
      throw new HttpException('Zombie not found', HttpStatus.NOT_FOUND)
    }

    return zombie
  }

  @Post()
  createZombie(@Body() zombie: ZombieDTO): Promise<ZombieDocument> {
    return this.zombiesService.create(zombie)
  }

  @Patch(':id')
  async updateZombie(
    @Param('id') id: string,
    @Body() zombie: ZombieDTO
  ): Promise<ZombieDocument> {
    await this.getZombie(id)

    return this.zombiesService.update(id, zombie)
  }

  @Delete()
  deleteAllZombies(): Promise<void> {
    return this.zombiesService.deleteAll()
  }

  @Delete(':id')
  async deleteZombie(@Param('id') id: string): Promise<void> {
    await this.getZombie(id)

    return this.zombiesService.delete(id)
  }
}
