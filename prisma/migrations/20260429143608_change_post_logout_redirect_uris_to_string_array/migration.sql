/*
  Warnings:

  - The `postLogoutRedirectUris` column on the `OAuthClient` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "OAuthClient" DROP COLUMN "postLogoutRedirectUris",
ADD COLUMN     "postLogoutRedirectUris" TEXT[];
