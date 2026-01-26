import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroceryList } from '../../common/entities/grocery-list.entity';
import { GroceryListItem } from '../../common/entities/grocery-list-item.entity';
import { PriceService } from '../price/price.service';
import { ProductService } from '../product/product.service';

const ORGANIC_PREMIUM = 1.35; // 35% uplift when no organic data

export interface PriceForProductResult {
  pricePerKg: number;
  isAnalysed: boolean;
}

export interface CreateGroceryListDto {
  name: string;
  items: {
    productId: number;
    isOrganic: boolean;
    quantityKg: number;
    pricePerKg: number;
    isAnalysed: boolean;
  }[];
}

@Injectable()
export class GroceryListService {
  constructor(
    @InjectRepository(GroceryList)
    private groceryListRepository: Repository<GroceryList>,
    @InjectRepository(GroceryListItem)
    private itemRepository: Repository<GroceryListItem>,
    private priceService: PriceService,
    private productService: ProductService,
  ) {}

  async getPriceForProduct(
    productId: number,
    isOrganic: boolean,
  ): Promise<PriceForProductResult> {
    const product = await this.productService.findOne(productId);
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const lastPrice = await this.priceService.getLastPriceForProduct(productId);
    if (!lastPrice) {
      throw new NotFoundException(
        `No price data found for product ${product.name}`,
      );
    }

    const minP = Number(lastPrice.minPrice);
    const maxP = Number(lastPrice.maxPrice);
    const nonOrganicPricePerKg = (minP + maxP) / 2;

    if (!isOrganic) {
      return {
        pricePerKg: Math.round(nonOrganicPricePerKg * 100) / 100,
        isAnalysed: false,
      };
    }

    const nameLower = product.name.toLowerCase();
    if (nameLower.includes('organic')) {
      return {
        pricePerKg: Math.round(nonOrganicPricePerKg * 100) / 100,
        isAnalysed: false,
      };
    }

    const organicPricePerKg = nonOrganicPricePerKg * ORGANIC_PREMIUM;
    return {
      pricePerKg: Math.round(organicPricePerKg * 100) / 100,
      isAnalysed: true,
    };
  }

  async create(dto: CreateGroceryListDto): Promise<GroceryList> {
    const list = this.groceryListRepository.create({ name: dto.name });
    const saved = await this.groceryListRepository.save(list);

    for (const it of dto.items) {
      const item = this.itemRepository.create({
        groceryListId: saved.id,
        productId: it.productId,
        isOrganic: it.isOrganic,
        quantityKg: it.quantityKg,
        pricePerKg: it.pricePerKg,
        isAnalysed: it.isAnalysed,
      });
      await this.itemRepository.save(item);
    }

    return this.findOne(saved.id);
  }

  async findAll(): Promise<
    { id: number; name: string; createdAt: Date; itemCount: number }[]
  > {
    const lists = await this.groceryListRepository.find({
      order: { updatedAt: 'DESC' },
      relations: ['items'],
    });

    return lists.map((l) => ({
      id: l.id,
      name: l.name,
      createdAt: l.createdAt,
      itemCount: l.items?.length ?? 0,
    }));
  }

  async findOne(id: number): Promise<GroceryList> {
    const list = await this.groceryListRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
    if (!list) {
      throw new NotFoundException(`Grocery list ${id} not found`);
    }
    return list;
  }

  async update(
    id: number,
    dto: Partial<CreateGroceryListDto>,
  ): Promise<GroceryList> {
    const list = await this.groceryListRepository.findOne({ where: { id } });
    if (!list) {
      throw new NotFoundException(`Grocery list ${id} not found`);
    }

    if (dto.name != null) {
      list.name = dto.name;
      await this.groceryListRepository.save(list);
    }

    if (dto.items != null) {
      await this.itemRepository.delete({ groceryListId: id });
      for (const it of dto.items) {
        const item = this.itemRepository.create({
          groceryListId: id,
          productId: it.productId,
          isOrganic: it.isOrganic,
          quantityKg: it.quantityKg,
          pricePerKg: it.pricePerKg,
          isAnalysed: it.isAnalysed,
        });
        await this.itemRepository.save(item);
      }
    }

    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const result = await this.groceryListRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Grocery list ${id} not found`);
    }
  }
}
