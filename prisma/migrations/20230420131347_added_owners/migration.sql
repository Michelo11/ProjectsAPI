/*
  Warnings:

  - Added the required column `ownerId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Project` ADD COLUMN `ownerId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Review` ADD COLUMN `ownerId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Owner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Owner_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Owner`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
