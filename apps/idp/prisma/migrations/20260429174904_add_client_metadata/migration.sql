-- AlterTable
ALTER TABLE "OAuthClient" ADD COLUMN     "developerId" TEXT,
ADD COLUMN     "logoUrl" TEXT;

-- AddForeignKey
ALTER TABLE "OAuthClient" ADD CONSTRAINT "OAuthClient_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
