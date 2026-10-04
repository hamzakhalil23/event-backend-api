-- CreateTable
CREATE TABLE "_AnnouncementsToTent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AnnouncementsToTent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AnnouncementsToTent_B_index" ON "_AnnouncementsToTent"("B");

-- AddForeignKey
ALTER TABLE "_AnnouncementsToTent" ADD CONSTRAINT "_AnnouncementsToTent_A_fkey" FOREIGN KEY ("A") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AnnouncementsToTent" ADD CONSTRAINT "_AnnouncementsToTent_B_fkey" FOREIGN KEY ("B") REFERENCES "tents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
