import { Module } from '@nestjs/common';
import { VendingMachineModule } from '@/vending-machine/vending-machine.module';
import { ProductsModule } from '@/products/products.module';
import { RolesGuard } from '@/shared/guards/roles.guard';

@Module({
  imports: [VendingMachineModule, ProductsModule],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
