import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Price } from '../../common/entities/price.entity';
import { ProductService } from '../product/product.service';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private productService: ProductService,
  ) {}

  async findAll(
    startDate?: Date,
    endDate?: Date,
    productId?: number,
    limit = 20,
    offset = 0,
  ) {
    const where: FindOptionsWhere<Price> = {};
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = Between(startDate, new Date());
    }
    if (productId) {
      where.productId = productId;
    }

    const [data, total] = await this.priceRepository.findAndCount({
      where,
      relations: ['product'],
      order: { date: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      data,
      meta: {
        total,
        limit,
        offset,
      },
    };
  }

  async findOne(id: number): Promise<Price> {
    return this.priceRepository.findOne({
      where: { id },
      relations: ['product'],
    });
  }

  async create(
    apiId: number,
    date: Date,
    minPrice: number,
    maxPrice: number,
    productId: number,
  ): Promise<Price> {
    const price = this.priceRepository.create({
      apiId,
      date,
      minPrice,
      maxPrice,
      productId,
    });
    return this.priceRepository.save(price);
  }

  async findByApiIdAndDate(apiId: number, date: Date): Promise<Price | null> {
    return this.priceRepository.findOne({
      where: { apiId, date },
    });
  }

  async getPricesByDateRange(
    startDate: Date,
    endDate: Date,
    productId?: number,
  ): Promise<Price[]> {
    const where: FindOptionsWhere<Price> = {
      date: Between(startDate, endDate),
    };
    if (productId) {
      where.productId = productId;
    }
    return this.priceRepository.find({
      where,
      relations: ['product'],
      order: { date: 'ASC' },
    });
  }

  async checkDateExists(date: Date): Promise<boolean> {
    const count = await this.priceRepository.count({
      where: { date },
    });
    return count > 0;
  }
}

