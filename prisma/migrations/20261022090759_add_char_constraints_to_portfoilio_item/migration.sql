/*
  Warnings:

  - You are about to alter the column `title` on the `portfolio_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `description` on the `portfolio_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1000)`.
  - You are about to alter the column `custom_type` on the `portfolio_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `external_url` on the `portfolio_items` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.

*/
-- AlterTable
ALTER TABLE "portfolio_items" ALTER COLUMN "title" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "description" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "custom_type" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "external_url" SET DATA TYPE VARCHAR(2048);



ALTER TABLE "portfolio_items"
ADD CONSTRAINT "portfolio_items_title_min_check"
CHECK (LENGTH(TRIM("title")) >= 3);

ALTER TABLE "portfolio_items"
DROP CONSTRAINT "portfolio_items_custom_type_check";

ALTER TABLE "portfolio_items"
ADD CONSTRAINT "portfolio_items_custom_type_check"
CHECK (
    ("type" = 'OTHER' AND "custom_type" IS NOT NULL AND LENGTH(TRIM("custom_type")) >= 3) OR
    ("type" <> 'OTHER' AND "custom_type" IS NULL)
);


ALTER TABLE "portfolio_items"
ADD CONSTRAINT "portfolio_items_external_url_min_check"
CHECK(
  "external_url" IS NULL OR
  LENGTH(TRIM("external_url")) > 0
);

