import { MinLength, IsString } from 'class-validator'

export class ZombieDTO {
  @IsString()
  @MinLength(10)
  name: string
}

export class ZombieDocument extends ZombieDTO {
  createdAt: Date
}
