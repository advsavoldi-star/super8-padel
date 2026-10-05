import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const tournaments=sqliteTable('tournaments',{
  id:text('id').primaryKey(),
  data:text('data').notNull(),
  revision:integer('revision').notNull().default(1),
  createdAt:text('created_at').notNull(),
  updatedAt:text('updated_at').notNull(),
},t=>[index('idx_tournaments_created_at').on(t.createdAt)]);
