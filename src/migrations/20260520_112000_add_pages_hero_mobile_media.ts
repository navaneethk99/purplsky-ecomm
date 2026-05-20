import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "hero_mobile_media_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_hero_mobile_media_id" integer;
  DO $$ BEGIN
   ALTER TABLE "pages" ADD CONSTRAINT "pages_hero_mobile_media_id_media_id_fk" FOREIGN KEY ("hero_mobile_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  DO $$ BEGIN
   ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_hero_mobile_media_id_media_id_fk" FOREIGN KEY ("version_hero_mobile_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  CREATE INDEX IF NOT EXISTS "pages_hero_hero_mobile_media_idx" ON "pages" USING btree ("hero_mobile_media_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_version_hero_version_hero_mobile_media_idx" ON "_pages_v" USING btree ("version_hero_mobile_media_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "pages_hero_hero_mobile_media_idx";
  DROP INDEX IF EXISTS "_pages_v_version_hero_version_hero_mobile_media_idx";
  ALTER TABLE "pages" DROP CONSTRAINT IF EXISTS "pages_hero_mobile_media_id_media_id_fk";
  ALTER TABLE "_pages_v" DROP CONSTRAINT IF EXISTS "_pages_v_version_hero_mobile_media_id_media_id_fk";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "hero_mobile_media_id";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_hero_mobile_media_id";`)
}
