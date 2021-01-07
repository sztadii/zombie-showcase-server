import { Injectable } from '@nestjs/common'
import { CRUDService } from '../../common/crud.service'
import { ZombieDTO } from '../models/zombies.model'

@Injectable()
export class ZombiesService extends CRUDService<ZombieDTO> {
  constructor() {
    super('zombies')
  }
}
