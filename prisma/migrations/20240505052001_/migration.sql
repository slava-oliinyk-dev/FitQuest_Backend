/*
  Warnings:

  - Added the required column `userId` to the `AddressModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddressModel" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "AddressModel" ADD CONSTRAINT "AddressModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
