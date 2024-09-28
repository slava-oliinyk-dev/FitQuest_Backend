/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `OrderModel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AddressModel" ADD COLUMN     "paymentMethod" TEXT;

-- AlterTable
ALTER TABLE "OrderModel" DROP COLUMN "paymentMethod";
