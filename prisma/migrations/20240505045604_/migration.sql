/*
  Warnings:

  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OrderModel" DROP CONSTRAINT "OrderModel_addressId_fkey";

-- DropTable
DROP TABLE "Address";

-- CreateTable
CREATE TABLE "AddressModel" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "courierService" TEXT NOT NULL,
    "postOfficeBranch" TEXT,
    "house" TEXT,
    "street" TEXT,

    CONSTRAINT "AddressModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderModel" ADD CONSTRAINT "OrderModel_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "AddressModel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
