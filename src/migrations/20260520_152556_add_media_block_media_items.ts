import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "pages_blocks_media_block_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );

  CREATE TABLE IF NOT EXISTS "_pages_v_blocks_media_block_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "products_blocks_media_block_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );

  CREATE TABLE IF NOT EXISTS "_products_v_blocks_media_block_media_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );

  DO $$ BEGIN
   ALTER TABLE "pages_blocks_media_block_media_items" ADD CONSTRAINT "pages_blocks_media_block_media_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_media_block_media_items" ADD CONSTRAINT "pages_blocks_media_block_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_media_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_media_block_media_items" ADD CONSTRAINT "_pages_v_blocks_media_block_media_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_media_block_media_items" ADD CONSTRAINT "_pages_v_blocks_media_block_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_media_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "products_blocks_media_block_media_items" ADD CONSTRAINT "products_blocks_media_block_media_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "products_blocks_media_block_media_items" ADD CONSTRAINT "products_blocks_media_block_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_blocks_media_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "_products_v_blocks_media_block_media_items" ADD CONSTRAINT "_products_v_blocks_media_block_media_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "_products_v_blocks_media_block_media_items" ADD CONSTRAINT "_products_v_blocks_media_block_media_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v_blocks_media_block"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;

  CREATE INDEX IF NOT EXISTS "pages_blocks_media_block_media_items_order_idx" ON "pages_blocks_media_block_media_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "pages_blocks_media_block_media_items_parent_id_idx" ON "pages_blocks_media_block_media_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "pages_blocks_media_block_media_items_image_idx" ON "pages_blocks_media_block_media_items" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_media_block_media_items_order_idx" ON "_pages_v_blocks_media_block_media_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_media_block_media_items_parent_id_idx" ON "_pages_v_blocks_media_block_media_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_media_block_media_items_image_idx" ON "_pages_v_blocks_media_block_media_items" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "products_blocks_media_block_media_items_order_idx" ON "products_blocks_media_block_media_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "products_blocks_media_block_media_items_parent_id_idx" ON "products_blocks_media_block_media_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "products_blocks_media_block_media_items_image_idx" ON "products_blocks_media_block_media_items" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_products_v_blocks_media_block_media_items_order_idx" ON "_products_v_blocks_media_block_media_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_products_v_blocks_media_block_media_items_parent_id_idx" ON "_products_v_blocks_media_block_media_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_products_v_blocks_media_block_media_items_image_idx" ON "_products_v_blocks_media_block_media_items" USING btree ("image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "pages_blocks_media_block_media_items" CASCADE;
  DROP TABLE IF EXISTS "_pages_v_blocks_media_block_media_items" CASCADE;
  DROP TABLE IF EXISTS "products_blocks_media_block_media_items" CASCADE;
  DROP TABLE IF EXISTS "_products_v_blocks_media_block_media_items" CASCADE;`)
}
