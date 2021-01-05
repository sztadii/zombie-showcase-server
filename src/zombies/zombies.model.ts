import { MinLength, IsString, IsOptional } from 'class-validator'

export class ZombieDTO {
  @IsOptional()
  @IsString()
  id: string

  @IsString()
  @MinLength(10)
  name: string
}
