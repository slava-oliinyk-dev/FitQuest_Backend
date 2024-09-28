/*
  Warnings:

  - You are about to drop the column `role` on the `UserModel` table. All the data in the column will be lost.
  - Added the required column `description` to the `ProductModel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `ProductModel` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderModel" ADD COLUMN     "createOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ProductModel" ADD COLUMN     "addedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "img" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "rating" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "UserModel" DROP COLUMN "role";
