import { Controller, Post, Body, Get, Patch } from '@nestjs/common';
import { VendingMachineService } from './vending-machine.service';
import { BuyProductDto } from '@/vending-machine/dto/buy-product.dto';
import { CoinInventory } from '@/vending-machine/interfaces/coin-inventory.interface';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoinInventoryDto } from '@/vending-machine/dto/coin-inventory.dto';
import { BuyProductResponseDto } from '@/vending-machine/dto/buy-product-response.dto';
import { ConfigureMachineDto } from '@/vending-machine/dto/configure-machine.dto';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Role } from '@/shared/enums/roles';

@Controller('vending-machine')
@ApiTags('Vending Machine')
export class VendingMachineController {
  constructor(private readonly vendingMachineService: VendingMachineService) {}

  @Get('coin-inventory')
  @ApiOkResponse({ type: CoinInventoryDto })
  @ApiOperation({ summary: 'Get coin inventory. Requires maintenance role.' })
  @Roles(Role.MAINTENANCE)
  getCoinInventory(): CoinInventoryDto[] {
    return this.vendingMachineService.getCoinInventory();
  }

  @Post('configure')
  @ApiOkResponse({ type: String, isArray: true })
  @ApiOperation({
    summary: 'Configure accepted coins. Requires maintenance role.',
  })
  @Roles(Role.MAINTENANCE)
  configure(@Body() configureMachineDto: ConfigureMachineDto) {
    return this.vendingMachineService.configure(configureMachineDto.coins);
  }

  @Patch('coin-inventory')
  @ApiOkResponse({ type: CoinInventoryDto, isArray: true })
  @ApiOperation({
    summary: 'Update coin inventory. Requires maintenance role.',
  })
  @Roles(Role.MAINTENANCE)
  updateCoinInventory(@Body() coinInventoryDto: CoinInventoryDto[]) {
    return this.vendingMachineService.updateCoinInventory(coinInventoryDto);
  }

  @Post('buy')
  @ApiOkResponse({ type: BuyProductResponseDto })
  @ApiOperation({ summary: 'Buy a product' })
  buyProduct(@Body() buyProductDto: BuyProductDto) {
    const coins: CoinInventory = buyProductDto.coins.reduce(
      (coinInventory, coin) => {
        if (coin.quantity > 0) {
          coinInventory[coin.coinValue] = coin.quantity;
        }
        return coinInventory;
      },
      {},
    );

    return this.vendingMachineService.buyProduct(
      buyProductDto.productSlot,
      coins,
    );
  }
}
