import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { UpdateProductDto } from '@/products/dto/update-product.dto';
import { Product } from '@/products/entities/product.entity';

@Injectable()
export class ProductsService {
  // Map to store products
  private products: Map<number, Product> = new Map();

  /**
   * Creates a product
   * @param createProductDto The product to create
   * @returns {Product} Returns the created product
   */
  public create(createProductDto: CreateProductDto) {
    if (!this.isProductNameUnique(createProductDto.name)) {
      throw new HttpException(
        `Product name: ${createProductDto.name} is not unique`,
        400,
      );
    }
    const productSlot = this.products.size + 1;
    this.products.set(productSlot, createProductDto);
    return this.products.get(productSlot);
  }

  /**
   * Finds all products
   * @returns {Object} Returns all products
   */
  public findAll() {
    return Object.fromEntries(this.products);
  }

  /**
   * Finds a product by id
   * @param id The id of the product to find
   * @returns {Product} Returns the found product
   */
  public findOne(id: number): Product | undefined {
    return this.products.get(id);
  }

  /**
   * Updates a product
   * @param id The id of the product to update
   * @param updateProductDto The product to update
   * throws {NotFoundException} Throws an error if the product is not found
   * @returns {Product} Returns the updated product
   */
  public update(id: number, updateProductDto: UpdateProductDto) {
    const product = this.products.get(id);

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    // check if the name field is present and if the name has changed
    if (
      updateProductDto.name &&
      updateProductDto.name.toLowerCase() !== product.name.toLowerCase()
    ) {
      // Check if the product name is unique
      if (!this.isProductNameUnique(updateProductDto.name)) {
        throw new HttpException(
          `Product name: ${updateProductDto.name} is not unique`,
          400,
        );
      }
    }

    const updatedProduct = { ...product, ...updateProductDto };
    this.products.set(id, updatedProduct);

    return updatedProduct;
  }

  /**
   * Removes a product
   * @param id The id of the product to remove
   * throws {NotFoundException} Throws an error if the product is not found
   * @returns {Product} Returns the removed product
   */
  public remove(id: number) {
    const product = this.products.get(id);

    if (!product) {
      throw new NotFoundException(`Product with id: ${id} not found`);
    }

    this.products.delete(id);
    return product;
  }

  /**
   * Checks if a product name is unique
   * In a real world application, this would be done in the database
   * @param name product name to check
   * @returns {boolean} Returns true if the product name is unique
   */
  private isProductNameUnique(name: string): boolean {
    return [...this.products.values()].every(
      (product) => product.name.toLowerCase() !== name.toLowerCase(),
    );
  }
}
