import { IsString } from 'class-validator'

export class ZombieItemDTO {
  @IsString()
  itemId: string

  @IsString()
  userId: string
}
