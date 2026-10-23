-- This is an empty migration.

ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_display_name_min_check"
CHECK (LENGTH(TRIM("display_name")) >= 3);