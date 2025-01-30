import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  amount: integer("amount").notNull(),
});
