import { pgTable, serial, text, numeric, timestamp, varchar } from "drizzle-orm/pg-core";

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  date: varchar("date", { length: 255 }).notNull(),
  userId: varchar("userId", { length: 255 }).notNull(), // Verifique se esta coluna existe com esse nome
});

export const balance = pgTable("balance", {
  id: serial("id").primaryKey(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  userId: varchar("userId").notNull(),  // Alterado para text (string)
});

export const UserMessages = pgTable('user_messages', {
  user_id: text('user_id').primaryKey().notNull(),
  createTs: timestamp('create_ts').defaultNow().notNull(),
  message: text('message').notNull(),
});
