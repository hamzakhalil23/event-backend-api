-- Drop existing foreign key constraints on my_list
ALTER TABLE "my_list" DROP CONSTRAINT IF EXISTS "my_list_userId_fkey";
ALTER TABLE "my_list" DROP CONSTRAINT IF EXISTS "my_list_sessionId_fkey";

-- Re-add with ON DELETE CASCADE
ALTER TABLE "my_list" ADD CONSTRAINT "my_list_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "my_list" ADD CONSTRAINT "my_list_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
