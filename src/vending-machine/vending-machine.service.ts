import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { CoinInventoryDto } from '@/vending-machine/dto/coin-inventory.dto';
import { CoinInventory } from '@/vending-machine/interfaces/coin-inventory.interface';
import { VendingMachineErrors } from './enums/vending-machine-errors';
import { BuyProductResponseDto } from '@/vending-machine/dto/buy-product-response.dto';
import { defaultProducts } from '../data/default-products';
import { ACCEPTED_COINS, defaultCoinInventory } from '../data/default-coins';

@Injectable()
export class VendingMachineService {
  // Coin inventory to keep track of available coins
  private coinInventory: CoinInventory = {};

  // Array to store the types of coins accepted
  // Can be configured with the configure method
  private acceptedCoins: number[] = [];

  constructor(private productsService: ProductsService) {}

  async onModuleInit() {
    // Load the coin inventory with some coins, 100 of each type
    // Can be configured with the updateCoinInventory method
    // This is just for testing purposes and can be removed
    this.acceptedCoins = ACCEPTED_COINS;
    this.coinInventory = defaultCoinInventory;
    defaultProducts.forEach((product) => {
      this.productsService.create(product);
    });
  }

  /**
   * Configures the accepted coins
   * @param acceptedCoins The accepted coins
   * @returns {void}
   */
  public configure(acceptedCoins: number[]): number[] {
    this.acceptedCoins = acceptedCoins;

    return acceptedCoins;
  }

  /**
   * Method to get the coin inventory
   * @returns {CoinInventoryDto[]} Returns the coin inventory
   */
  public getCoinInventory(): CoinInventoryDto[] {
    const coinInventoryDto: CoinInventoryDto[] = Object.keys(
      this.coinInventory,
    ).map((coin) => ({
      coinValue: parseFloat(coin),
      quantity: this.coinInventory[coin],
    }));

    return coinInventoryDto;
  }

  /**
   * Gets the accepted coins
   * @returns {number[]} Returns the accepted coins
   */
  public getAcceptedCoins(): number[] {
    return this.acceptedCoins;
  }

  /**
   * Gets the available amount
   * @returns {number} Returns the available amount
   */
  public getAvailableAmount(): number {
    return Object.keys(this.coinInventory).reduce(
      (total, coin) => total + parseInt(coin) * this.coinInventory[coin],
      0,
    );
  }

  /**
   * Buys a product
   * @param productSlot The product slot
   * @param coinsInserted The coins inserted
   * @returns {CoinInventory} Returns the change if the product was bought successfully
   * example result: { success: true, change: { 5: 1 } }
   */
  public buyProduct(
    productSlot: number,
    coinsInserted: CoinInventory,
  ): BuyProductResponseDto {
    // check if the coins inserted are accepted
    const invalidCoins = Object.keys(coinsInserted).filter(
      (coin) => !this.acceptedCoins.includes(parseFloat(coin)),
    );
    if (invalidCoins.length > 0) {
      // Return the coins inserted if the coins are not accepted
      return {
        success: false,
        change: coinsInserted,
        reason: VendingMachineErrors.CoinsNotAccepted,
      };
    }

    const product = this.productsService.findOne(productSlot);

    // Check if the product is available
    if (!product || product.quantity <= 0) {
      // Return the coins inserted if the product is not available
      return {
        success: false,
        change: coinsInserted,
        reason: VendingMachineErrors.ProductNotFound,
      };
    }

    const totalPrice = product.price;
    const totalAmountInserted = this.calculateAmount(coinsInserted);
    if (totalAmountInserted < totalPrice) {
      // Return the coins inserted if the amount is not enough
      return {
        success: false,
        change: coinsInserted,
        reason: VendingMachineErrors.InsufficientMoneyInserted,
      };
    }

    const changeAmount = totalAmountInserted - totalPrice;
    const availableAmount = this.getAvailableAmount();
    if (changeAmount > availableAmount) {
      // Return the coins inserted if there is not enough change
      return {
        success: false,
        change: coinsInserted,
        reason: VendingMachineErrors.InsufficientChange,
      };
    }

    const change = this.calculateChange(changeAmount);
    if (change === null) {
      // Return the coins inserted if there is not enough change
      return {
        success: false,
        change: coinsInserted,
        reason: VendingMachineErrors.InsufficientCoinsToReturnChange,
      };
    }

    // Update inventory and return change
    this.productsService.update(productSlot, {
      quantity: product.quantity - 1,
    });
    this.updateMachineCoinInventory(coinsInserted, change);

    return { success: true, change, product: { ...product, quantity: 1 } };
  }

  /**
   * Updates the coin inventory
   * @param coinInventoryDto A list of coins with their quantity
   * @returns {CoinInventoryDto[]} Returns the updated coin inventory
   */
  public updateCoinInventory(
    coinInventoryDto: CoinInventoryDto[],
  ): CoinInventoryDto[] {
    const coinInventory: CoinInventory = coinInventoryDto.reduce(
      (coinInventory, coin) => {
        coinInventory[coin.coinValue] = coin.quantity;
        return coinInventory;
      },
      {},
    );

    Object.keys(coinInventory).forEach((coin) => {
      if (!this.acceptedCoins.includes(parseFloat(coin))) {
        throw new Error(`Coin ${coin} is not accepted`);
      }
      this.coinInventory[coin] = coinInventory[coin];
    });

    return this.getCoinInventory();
  }

  /**
   * Calculates the change to return
   * Uses a greedy algorithm to calculate the change
   * @param amount The amount to calculate the change for
   * @returns {CoinInventory | null} Returns the change or null if there is not enough change
   */
  private calculateChange(amount: number): CoinInventory | null {
    const result: CoinInventory = {};

    for (let i = this.acceptedCoins.length - 1; i >= 0; i--) {
      const coin = this.acceptedCoins[i];
      const coinCount = Math.floor(amount / coin);

      if (coinCount > 0 && this.coinInventory[coin] >= coinCount) {
        result[coin] = coinCount;
        amount -= coin * coinCount;
      }
    }

    return amount === 0 ? result : null;
  }

  /**
   * Calculates the amount of coins
   * @param coins The coins to calculate the amount for
   * @returns {number} Returns the amount of coins
   */
  private calculateAmount(coins: CoinInventory): number {
    return Object.keys(coins).reduce(
      (total, coin) => total + parseInt(coin) * coins[coin],
      0,
    );
  }

  /**
   * Updates the machine coin inventory
   * @param coinsInserted The coins inserted
   * @param change The change returned
   * @returns {void}
   */
  private updateMachineCoinInventory(
    coinsInserted: CoinInventory,
    change: CoinInventory,
  ): void {
    // Increment the coin inventory with the coins inserted
    for (const coin in coinsInserted) {
      this.coinInventory[coin] =
        (this.coinInventory[coin] || 0) + coinsInserted[coin];
    }

    // Decrement the coin inventory with the change returned
    for (const coin in change) {
      this.coinInventory[coin] -= change[coin];
    }
  }
}
