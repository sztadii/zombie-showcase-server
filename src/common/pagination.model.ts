import { IsString, IsOptional } from 'class-validator'

// TODO Transform limit and skip to number
export class PaginationDTO {
  @IsOptional()
  @IsString()
  limit?: string

  @IsOptional()
  @IsString()
  skip?: string

  @IsOptional()
  @IsString()
  orderBy?: string
}
