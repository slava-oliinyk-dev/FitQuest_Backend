/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `EmailConfirmation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmailConfirmation_userId_key" ON "EmailConfirmation"("userId");
