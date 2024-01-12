import { CoinInventory } from '@/vending-machine/interfaces/coin-inventory.interface';

export const ACCEPTED_COINS = [0.5, 1, 5, 10, 20, 40];

// Set up coin inventory with some coins, 100 of each type
export const defaultCoinInventory: CoinInventory = ACCEPTED_COINS.reduce(
  (coinInventory, coin) => {
    coinInventory[coin] = 100;
    return coinInventory;
  },
  {},
);
