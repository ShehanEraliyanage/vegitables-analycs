import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Product } from '../common/entities/product.entity';
import { Price } from '../common/entities/price.entity';
import { GroceryList } from '../common/entities/grocery-list.entity';
import { GroceryListItem } from '../common/entities/grocery-list-item.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'vegetables_analytics',
  entities: [Product, Price, GroceryList, GroceryListItem],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, // Always false for migrations
  logging: true,
});

