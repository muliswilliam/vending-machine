import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { ProductsService } from '@/products/products.service';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { UpdateProductDto } from '@/products/dto/update-product.dto';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Product } from '@/products/entities/product.entity';
import { Roles } from '@/shared/decorators/roles.decorator';
import { Role } from '@/shared/enums/roles';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiCreatedResponse({ type: Product })
  @ApiOperation({ summary: 'Create a product. Requires maintenance role' })
  @Roles(Role.MAINTENANCE)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOkResponse({
    type: Object,
    description: 'All products and their slots in the vending machine',
  })
  @ApiOperation({ summary: 'Get all products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':productSlot')
  @ApiOkResponse({ type: Product })
  @ApiOperation({
    summary: 'Get the product in a given slot in the vending machine.',
  })
  findOne(@Param('productSlot') productSlot: string) {
    const product = this.productsService.findOne(+productSlot);
    if (!product) {
      throw new NotFoundException(`Product in slot ${productSlot} not found`);
    }

    return product;
  }

  @Patch(':productSlot')
  @ApiOkResponse({ type: Product })
  @ApiOperation({
    summary:
      'Update a product(price, quantity or name) in a given slot in the vending machine. Requires maintenance role',
  })
  @Roles(Role.MAINTENANCE)
  update(
    @Param('productSlot') productSlot: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(+productSlot, updateProductDto);
  }

  @Delete(':productSlot')
  @ApiOkResponse({ type: Product })
  @Roles(Role.MAINTENANCE)
  @ApiOperation({
    summary:
      'Remove a product given its slot in the vending machine. Requires maintenance role',
  })
  remove(@Param('productSlot') productSlot: string) {
    return this.productsService.remove(+productSlot);
  }
}
