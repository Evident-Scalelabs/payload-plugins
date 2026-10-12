import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ALTER COLUMN "prefix" SET DEFAULT 'dev';
  ALTER TABLE "comments" ALTER COLUMN "author_id" DROP NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ALTER COLUMN "prefix" SET DEFAULT '';
  ALTER TABLE "comments" ALTER COLUMN "author_id" SET NOT NULL;`)
}
