-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "UserModel" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "uniqueLogin" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "photo" TEXT,
    "bio" TEXT,

    CONSTRAINT "UserModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutProgramModel" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutProgramModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutDayModel" (
    "id" SERIAL NOT NULL,
    "dayName" TEXT NOT NULL,
    "muscle" TEXT NOT NULL,
    "workoutProgramId" INTEGER NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkoutDayModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseModel" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "repetitions" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "restTime" INTEGER,
    "note" TEXT,
    "progressMark" TEXT,
    "workoutDayId" INTEGER NOT NULL,

    CONSTRAINT "ExerciseModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailConfirmation" (
    "confirmationCode" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EmailConfirmation_pkey" PRIMARY KEY ("confirmationCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_email_key" ON "UserModel"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserModel_uniqueLogin_key" ON "UserModel"("uniqueLogin");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutProgramModel_id_userId_key" ON "WorkoutProgramModel"("id", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDayModel_id_workoutProgramId_key" ON "WorkoutDayModel"("id", "workoutProgramId");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseModel_id_workoutDayId_key" ON "ExerciseModel"("id", "workoutDayId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailConfirmation_userId_key" ON "EmailConfirmation"("userId");

-- AddForeignKey
ALTER TABLE "WorkoutProgramModel" ADD CONSTRAINT "WorkoutProgramModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutDayModel" ADD CONSTRAINT "WorkoutDayModel_workoutProgramId_fkey" FOREIGN KEY ("workoutProgramId") REFERENCES "WorkoutProgramModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseModel" ADD CONSTRAINT "ExerciseModel_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDayModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailConfirmation" ADD CONSTRAINT "EmailConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
