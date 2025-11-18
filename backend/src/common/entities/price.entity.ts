import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('prices')
@Unique(['apiId', 'date'])
@Index(['date'])
@Index(['productId'])
@Index(['date', 'productId'])
export class Price {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'api_id' })
  apiId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'min_price' })
  minPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'max_price' })
  maxPrice: number;

  @Column({ name: 'product_id' })
  productId: number;

  @ManyToOne(() => Product, (product) => product.prices)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

