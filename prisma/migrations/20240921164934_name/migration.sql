/*
  Warnings:

  - You are about to drop the `AddressModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CartItemModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CartModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItemModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddressModel" DROP CONSTRAINT "AddressModel_userId_fkey";

-- DropForeignKey
ALTER TABLE "CartItemModel" DROP CONSTRAINT "CartItemModel_cartId_fkey";

-- DropForeignKey
ALTER TABLE "CartItemModel" DROP CONSTRAINT "CartItemModel_productId_fkey";

-- DropForeignKey
ALTER TABLE "CartModel" DROP CONSTRAINT "CartModel_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemModel" DROP CONSTRAINT "OrderItemModel_cartItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemModel" DROP CONSTRAINT "OrderItemModel_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderModel" DROP CONSTRAINT "OrderModel_addressId_fkey";

-- DropForeignKey
ALTER TABLE "OrderModel" DROP CONSTRAINT "OrderModel_userId_fkey";

-- DropTable
DROP TABLE "AddressModel";

-- DropTable
DROP TABLE "CartItemModel";

-- DropTable
DROP TABLE "CartModel";

-- DropTable
DROP TABLE "OrderItemModel";

-- DropTable
DROP TABLE "OrderModel";

-- DropTable
DROP TABLE "ProductModel";

-- DropTable
DROP TABLE "UserModel";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uniqueLogin" TEXT NOT NULL,
    "photo" TEXT,
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutProgram" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "WorkoutProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutDay" (
    "id" SERIAL NOT NULL,
    "dayName" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,
    "workoutProgramId" INTEGER NOT NULL,

    CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "restTime" INTEGER,
    "note" TEXT,
    "progressMark" TEXT,
    "workoutDayId" INTEGER NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_uniqueLogin_key" ON "User"("uniqueLogin");

-- AddForeignKey
ALTER TABLE "WorkoutProgram" ADD CONSTRAINT "WorkoutProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutDay" ADD CONSTRAINT "WorkoutDay_workoutProgramId_fkey" FOREIGN KEY ("workoutProgramId") REFERENCES "WorkoutProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
