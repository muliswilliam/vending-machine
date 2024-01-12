import { ApiProperty } from '@nestjs/swagger';
import { CoinInventoryDto } from '@/vending-machine/dto/coin-inventory.dto';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BuyProductDto {
  @ApiProperty({ type: Number, description: 'Product slot' })
  @IsNumber()
  @IsPositive()
  productSlot: number;

  @ApiProperty({
    type: CoinInventoryDto,
    isArray: true,
    description: 'Amount of coins of different types',
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CoinInventoryDto)
  coins: CoinInventoryDto[];
}
