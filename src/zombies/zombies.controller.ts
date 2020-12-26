import { Controller, Get } from '@nestjs/common'
import { ZombiesService } from './zombies.service'
import { ZombieDocument } from './zombies.model'

@Controller('zombies')
export class ZombiesController {
  constructor(private readonly zombiesService: ZombiesService) {}

  @Get()
  findAllZombies(): Promise<ZombieDocument[]> {
    return this.zombiesService.find()
  }
}
