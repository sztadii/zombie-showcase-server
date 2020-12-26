import { Injectable } from '@nestjs/common'
import { CRUDService } from '../../common/crud.service'
import { ZombieDocument } from '../zombies.model'

@Injectable()
export class ZombiesService extends CRUDService<ZombieDocument> {
  constructor() {
    super('zombies')
  }
}
