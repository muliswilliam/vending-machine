import { Module } from '@nestjs/common';
import { VendingMachineService } from './vending-machine.service';
import { VendingMachineController } from './vending-machine.controller';
import { ProductsModule } from '@/products/products.module';

@Module({
  controllers: [VendingMachineController],
  providers: [VendingMachineService],
  imports: [ProductsModule],
})
export class VendingMachineModule {}
