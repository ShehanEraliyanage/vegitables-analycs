import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create products table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" SERIAL NOT NULL,
        "api_id" INTEGER NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "type" VARCHAR(50) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_api_id" UNIQUE ("api_id"),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    // Create indexes for products
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_type" ON "products" ("type")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_products_api_id" ON "products" ("api_id")
    `);

    // Create prices table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prices" (
        "id" SERIAL NOT NULL,
        "api_id" INTEGER NOT NULL,
        "date" DATE NOT NULL,
        "min_price" DECIMAL(10,2) NOT NULL,
        "max_price" DECIMAL(10,2) NOT NULL,
        "product_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_prices_api_id_date" UNIQUE ("api_id", "date"),
        CONSTRAINT "PK_prices" PRIMARY KEY ("id")
      )
    `);

    // Create foreign key
    await queryRunner.query(`
      ALTER TABLE "prices" 
      ADD CONSTRAINT "FK_prices_product_id" 
      FOREIGN KEY ("product_id") 
      REFERENCES "products"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);

    // Create indexes for prices
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prices_date" ON "prices" ("date")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prices_product_id" ON "prices" ("product_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prices_date_product" ON "prices" ("date", "product_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_prices_api_id" ON "prices" ("api_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prices_api_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prices_date_product"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prices_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_prices_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_api_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_products_type"`);

    // Drop foreign key
    await queryRunner.query(`ALTER TABLE "prices" DROP CONSTRAINT IF EXISTS "FK_prices_product_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "prices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "products"`);
  }
}

