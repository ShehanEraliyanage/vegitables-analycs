import { MigrationInterface, QueryRunner } from 'typeorm';

export class GroceryListSchema1737922800000 implements MigrationInterface {
  name = 'GroceryListSchema1737922800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "grocery_lists" (
        "id" SERIAL NOT NULL,
        "name" VARCHAR(255) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grocery_lists" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "grocery_list_items" (
        "id" SERIAL NOT NULL,
        "grocery_list_id" INTEGER NOT NULL,
        "product_id" INTEGER NOT NULL,
        "is_organic" BOOLEAN NOT NULL DEFAULT false,
        "quantity_kg" DECIMAL(10,3) NOT NULL,
        "price_per_kg" DECIMAL(10,2) NOT NULL,
        "is_analysed" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grocery_list_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "grocery_list_items"
      ADD CONSTRAINT "FK_grocery_list_items_grocery_list_id"
      FOREIGN KEY ("grocery_list_id")
      REFERENCES "grocery_lists"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "grocery_list_items"
      ADD CONSTRAINT "FK_grocery_list_items_product_id"
      FOREIGN KEY ("product_id")
      REFERENCES "products"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_grocery_list_items_grocery_list_id"
      ON "grocery_list_items" ("grocery_list_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_grocery_list_items_product_id"
      ON "grocery_list_items" ("product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_grocery_list_items_product_id"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_grocery_list_items_grocery_list_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grocery_list_items" DROP CONSTRAINT IF EXISTS "FK_grocery_list_items_product_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "grocery_list_items" DROP CONSTRAINT IF EXISTS "FK_grocery_list_items_grocery_list_id"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "grocery_list_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grocery_lists"`);
  }
}
