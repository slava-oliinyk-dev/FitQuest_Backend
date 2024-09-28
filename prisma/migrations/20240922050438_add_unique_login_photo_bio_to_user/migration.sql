/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkoutProgram" DROP CONSTRAINT "WorkoutProgram_userId_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "UserModel" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "uniqueLogin" TEXT NOT NULL,
    "photo" TEXT,
    "bio" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "UserModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_email_key" ON "UserModel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_uniqueLogin_key" ON "UserModel"("uniqueLogin");

-- AddForeignKey
ALTER TABLE "WorkoutProgram" ADD CONSTRAINT "WorkoutProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
