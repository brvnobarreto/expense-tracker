CREATE TABLE "balance" (
	"id" serial PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "date" SET DATA TYPE date;