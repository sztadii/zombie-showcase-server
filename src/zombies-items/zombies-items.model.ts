import { IsString, IsNumber } from 'class-validator'

export class ZombieItemDTO {
  @IsString()
  itemId: string

  @IsString()
  userId: string
}

export class ItemDTO {
  @IsNumber()
  price: number

  @IsString()
  name: string
}

export class CurrencyRateDTO {
  @IsString()
  currency: string

  @IsNumber()
  ask: number

  @IsNumber()
  bid: number

  @IsString()
  code: string
}
