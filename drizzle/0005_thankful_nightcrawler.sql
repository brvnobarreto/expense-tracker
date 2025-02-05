CREATE TABLE "user_messages" (
	"user_id" text PRIMARY KEY NOT NULL,
	"create_ts" timestamp DEFAULT now() NOT NULL,
	"message" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "date" DROP DEFAULT;