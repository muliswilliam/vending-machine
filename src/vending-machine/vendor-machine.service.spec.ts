import { Test, TestingModule } from '@nestjs/testing';
import { VendingMachineService } from './vending-machine.service';
import { ProductsService } from '../products/products.service';
import { VendingMachineErrors } from './enums/vending-machine-errors';
import { defaultProducts } from '../data/default-products';

describe('VendingMachineService', () => {
  let service: VendingMachineService;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VendingMachineService, ProductsService],
    }).compile();

    service = module.get<VendingMachineService>(VendingMachineService);
    productsService = module.get<ProductsService>(ProductsService);
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get coin inventory', () => {
    const coinInventory = service.getCoinInventory();
    expect(coinInventory).toBeInstanceOf(Array);
  });

  it('should get available amount', () => {
    const availableAmount = service.getAvailableAmount();
    expect(typeof availableAmount).toBe('number');
  });

  describe('configure', () => {
    it('should configure accepted coins', () => {
      const acceptedCoins = [0.5, 1, 5, 10, 20, 40];
      const result = service.configure(acceptedCoins);

      expect(result).toEqual(acceptedCoins);
    });
  });

  describe('buyProduct', () => {
    it('should buy a product', () => {
      const productId = 1;
      const insertedMoney = {
        1: 30,
      };
      const product = defaultProducts[0];
      const result = service.buyProduct(productId, insertedMoney);

      expect(result.product).toEqual({ ...product, quantity: 1 });
      expect(result.change).toEqual({ 5: 1 });
    });

    it('should not buy a product if the inserted money is not enough', () => {
      const productSlot = 1;
      const insertedMoney = {
        1: 20,
      };
      const result = service.buyProduct(productSlot, insertedMoney);

      expect(result.success).toBe(false);
      expect(result.product).toBeUndefined();
      expect(result.change).toEqual(insertedMoney);
      expect(result.reason).toBe(
        VendingMachineErrors.InsufficientMoneyInserted,
      );
    });

    it('should not buy a product if the product is not available', () => {
      const productId = 1;
      const insertedMoney = {
        1: 30,
      };

      productsService.remove(productId);
      service.updateCoinInventory([{ coinValue: 5, quantity: 100 }]);
      const result = service.buyProduct(productId, insertedMoney);
      expect(result.success).toBe(false);
      expect(result.product).toBeUndefined();
      expect(result.change).toEqual(insertedMoney);
      expect(result.reason).toBe(VendingMachineErrors.ProductNotFound);
    });

    it('should not buy a product if there is no change', () => {
      const productId = 1;
      const insertedMoney = {
        1: 30,
      };
      const acceptedCoins = service.getAcceptedCoins();

      // Update coin inventory to have no change
      service.updateCoinInventory(
        acceptedCoins.map((coin) => ({ coinValue: coin, quantity: 0 })),
      );

      const result = service.buyProduct(productId, insertedMoney);
      expect(result.success).toBe(false);
      expect(result.product).toBeUndefined();
      expect(result.change).toEqual(insertedMoney);
      expect(result.reason).toBe(VendingMachineErrors.InsufficientChange);
    });

    it('should not buy a product if there is not enough change to return', () => {
      const productId = 1;
      const insertedMoney = {
        1: 30,
      };

      // Update coin inventory to have enough amount but not enough coins to return change
      service.updateCoinInventory([
        { coinValue: 0.5, quantity: 0 },
        { coinValue: 1, quantity: 0 },
        { coinValue: 5, quantity: 0 },
        { coinValue: 10, quantity: 0 },
        { coinValue: 20, quantity: 0 },
        { coinValue: 40, quantity: 1 },
      ]);

      const result = service.buyProduct(productId, insertedMoney);
      expect(result.success).toBe(false);
      expect(result.product).toBeUndefined();
      expect(result.change).toEqual(insertedMoney);
      expect(result.reason).toBe(
        VendingMachineErrors.InsufficientCoinsToReturnChange,
      );
    });

    it('should not buy a product if the coins are not accepted', () => {
      const productId = 1;
      const insertedMoney = {
        0.1: 30,
      };
      const result = service.buyProduct(productId, insertedMoney);

      expect(result.success).toBe(false);
      expect(result.product).toBeUndefined();
      expect(result.change).toEqual(insertedMoney);
      expect(result.reason).toBe(VendingMachineErrors.CoinsNotAccepted);
    });
  });
});
