import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroceryList } from './grocery-list.entity';
import { Product } from './product.entity';

@Entity('grocery_list_items')
export class GroceryListItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'grocery_list_id' })
  groceryListId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'is_organic', default: false })
  isOrganic: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 3, name: 'quantity_kg' })
  quantityKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'price_per_kg' })
  pricePerKg: number;

  @Column({ name: 'is_analysed', default: false })
  isAnalysed: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => GroceryList, (list) => list.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'grocery_list_id' })
  groceryList: GroceryList;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
