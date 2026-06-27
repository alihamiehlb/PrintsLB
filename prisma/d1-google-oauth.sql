-- Run once on an existing D1 database before enabling Google OAuth.
-- Fresh databases already get this column from prisma/d1-schema.sql.
ALTER TABLE "users" ADD COLUMN "emailVerified" INTEGER;
