/*
  Warnings:

  - Added the required column `updatedAt` to the `my_list` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "my_list" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
