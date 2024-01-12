import { Product } from '@/products/entities/product.entity';
import { VendingMachineErrors } from '@/vending-machine/enums/vending-machine-errors';
import { CoinInventory } from '@/vending-machine/interfaces/coin-inventory.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BuyProductResponseDto {
  @ApiProperty({
    type: Boolean,
    description: 'True if the purchase was successful',
  })
  success: boolean;

  @ApiPropertyOptional({
    type: 'object',
    description: 'Change returned',
  })
  change?: CoinInventory;

  @ApiPropertyOptional({
    type: Product,
    description: 'Product bought',
  })
  product?: Product;

  @ApiPropertyOptional({
    enum: VendingMachineErrors,
    description: 'Error message',
  })
  reason?: VendingMachineErrors;
}
