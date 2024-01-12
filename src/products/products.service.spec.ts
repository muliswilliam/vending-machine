import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { UpdateProductDto } from '@/products/dto/update-product.dto';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a product', () => {
    const createProductDto: CreateProductDto = {
      name: 'Fanta',
      price: 30,
      quantity: 10,
    };
    const product = service.create(createProductDto);
    expect(product).toEqual(createProductDto);
  });

  it('should find all products', () => {
    const products = service.findAll();
    expect(products).toBeInstanceOf(Object);
  });

  it('should find one product', () => {
    const product = { name: 'Fanta', price: 30, quantity: 10 };
    service.create(product);
    const expectedProduct = service.findOne(1);
    expect(product).toEqual(expectedProduct);
  });

  it('should update a product', () => {
    const initialProduct = { name: 'Coke', price: 25, quantity: 10 };
    service.create(initialProduct);
    const updatedProductDto: UpdateProductDto = {
      ...initialProduct,
      quantity: 20,
    };
    const product = service.update(1, updatedProductDto);
    expect(product).toEqual(updatedProductDto);
  });

  it('should remove a product', () => {
    const product = { name: 'Fanta', price: 30, quantity: 10 };
    service.create(product);
    const expectedProduct = service.remove(1);
    expect(product).toEqual(expectedProduct);
    expect(service.findOne(1)).toBeUndefined();
  });

  it('should not update a product if the product does not exist', () => {
    const updatedProductDto: UpdateProductDto = {
      name: 'Coke',
      price: 25,
      quantity: 20,
    };
    expect(() => service.update(1, updatedProductDto)).toThrow();
  });

  it('should not remove a product if the product does not exist', () => {
    expect(() => service.remove(1)).toThrow();
  });

  it('should not find a product if the product does not exist', () => {
    const product = service.findOne(1);
    expect(product).toBeUndefined();
  });
});
