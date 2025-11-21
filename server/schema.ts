import { pgTable, text, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
});
