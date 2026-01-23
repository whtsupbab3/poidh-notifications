import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { NotificationEventPayload } from './utils/types';

export const notifications = pgTable('Notifications', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  event: text('event').notNull(),
  data: jsonb('data').$type<NotificationEventPayload['data']>().notNull(),
  send_at: timestamp('send_at'),
});
