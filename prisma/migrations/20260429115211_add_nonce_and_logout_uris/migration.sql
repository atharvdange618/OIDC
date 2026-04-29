/*
  Warnings:

  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "AuthCode" ADD COLUMN     "nonce" TEXT;

-- AlterTable
ALTER TABLE "OAuthClient" ADD COLUMN     "postLogoutRedirectUris" JSONB;

-- DropTable
DROP TABLE "session";
