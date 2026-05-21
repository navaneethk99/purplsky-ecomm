import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "variants" ADD COLUMN "on_sale" boolean DEFAULT false;
  ALTER TABLE "variants" ADD COLUMN "original_price_in_u_s_d" numeric;
  ALTER TABLE "variants" ADD COLUMN "original_price_in_i_n_r" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_on_sale" boolean DEFAULT false;
  ALTER TABLE "_variants_v" ADD COLUMN "version_original_price_in_u_s_d" numeric;
  ALTER TABLE "_variants_v" ADD COLUMN "version_original_price_in_i_n_r" numeric;
  ALTER TABLE "products" ADD COLUMN "on_sale" boolean DEFAULT false;
  ALTER TABLE "products" ADD COLUMN "original_price_in_u_s_d" numeric;
  ALTER TABLE "products" ADD COLUMN "original_price_in_i_n_r" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_on_sale" boolean DEFAULT false;
  ALTER TABLE "_products_v" ADD COLUMN "version_original_price_in_u_s_d" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_original_price_in_i_n_r" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "variants" DROP COLUMN "on_sale";
  ALTER TABLE "variants" DROP COLUMN "original_price_in_u_s_d";
  ALTER TABLE "variants" DROP COLUMN "original_price_in_i_n_r";
  ALTER TABLE "_variants_v" DROP COLUMN "version_on_sale";
  ALTER TABLE "_variants_v" DROP COLUMN "version_original_price_in_u_s_d";
  ALTER TABLE "_variants_v" DROP COLUMN "version_original_price_in_i_n_r";
  ALTER TABLE "products" DROP COLUMN "on_sale";
  ALTER TABLE "products" DROP COLUMN "original_price_in_u_s_d";
  ALTER TABLE "products" DROP COLUMN "original_price_in_i_n_r";
  ALTER TABLE "_products_v" DROP COLUMN "version_on_sale";
  ALTER TABLE "_products_v" DROP COLUMN "version_original_price_in_u_s_d";
  ALTER TABLE "_products_v" DROP COLUMN "version_original_price_in_i_n_r";`)
}
