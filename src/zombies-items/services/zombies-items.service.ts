import { Injectable } from '@nestjs/common'
import { CRUDService } from '../../common/crud.service'
import { ZombieItemDTO } from '../zombies-items.model'

@Injectable()
export class ZombiesItemsService extends CRUDService<ZombieItemDTO> {
  constructor() {
    super('zombies-items')
  }
}
