/*
  Warnings:

  - A unique constraint covering the columns `[localityId, slug]` on the table `sub_localities` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `sub_localities_localityId_slug_key` ON `sub_localities`(`localityId`, `slug`);
