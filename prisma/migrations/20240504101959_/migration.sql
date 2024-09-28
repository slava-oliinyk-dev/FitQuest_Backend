/*
  Warnings:

  - You are about to drop the column `createOn` on the `OrderModel` table. All the data in the column will be lost.
  - Added the required column `paymentMethod` to the `OrderModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `OrderModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `OrderModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderModel" DROP COLUMN "createOn",
ADD COLUMN     "addressId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "shippedOn" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "house" TEXT,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "courierService" TEXT NOT NULL,
    "postOfficeBranch" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemModel" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "cartItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" DOUBLE PRECISION NOT NULL,
    "discountAtPurchase" DOUBLE PRECISION,

    CONSTRAINT "OrderItemModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemModel_cartItemId_key" ON "OrderItemModel"("cartItemId");

-- AddForeignKey
ALTER TABLE "OrderModel" ADD CONSTRAINT "OrderModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderModel" ADD CONSTRAINT "OrderModel_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModel" ADD CONSTRAINT "OrderItemModel_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "OrderModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemModel" ADD CONSTRAINT "OrderItemModel_cartItemId_fkey" FOREIGN KEY ("cartItemId") REFERENCES "CartItemModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
