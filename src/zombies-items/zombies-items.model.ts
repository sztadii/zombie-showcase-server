import { IsString } from 'class-validator'

export class ZombieItemDTO {
  @IsString()
  itemId: string

  @IsString()
  userId: string
}

export class Item {
  price: number
  name: string
  id: string
  createdAt: Date
}

export class CurrencyRate {
  currency: string
  ask: number
  bid: number
  code: string
  id: string
  createdAt: Date
}
