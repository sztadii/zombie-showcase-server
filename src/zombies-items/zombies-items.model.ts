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

export class ItemDocument {
  price: number
  name: string
  id: string
  createdAt: Date
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

export class CurrencyRateDocument {
  currency: string
  ask: number
  bid: number
  code: string
  id: string
  createdAt: Date
}
