import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from '../../common/entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(type?: string): Promise<Product[]> {
    if (type) {
      return this.productRepository.find({ where: { type } });
    }
    return this.productRepository.find();
  }

  async searchByName(q: string, limit = 20): Promise<Product[]> {
    if (!q || q.trim().length < 2) {
      return [];
    }
    return this.productRepository.find({
      where: { name: ILike(`%${q.trim()}%`) },
      take: limit,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({ where: { id } });
  }

  async findByApiId(apiId: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { apiId } });
  }

  async createOrUpdate(
    apiId: number,
    name: string,
    type: string,
  ): Promise<Product> {
    let product = await this.findByApiId(apiId);
    if (product) {
      product.name = name;
      product.type = type;
      return this.productRepository.save(product);
    }
    product = this.productRepository.create({ apiId, name, type });
    return this.productRepository.save(product);
  }
}

