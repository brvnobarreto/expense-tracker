import { pgTable, serial, numeric, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const expenses = pgTable("expenses", {
	id: serial().primaryKey().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	name: text().notNull(),
});
