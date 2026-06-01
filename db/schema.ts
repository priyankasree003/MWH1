import { pgTable, serial, text, varchar, real, integer, timestamp } from 'drizzle-orm/pg-core';

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  sentiment: varchar('sentiment', { length: 20 }),
  score: real('score'),
  emotions: text('emotions'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const moodEntries = pgTable('mood_entries', {
  id: serial('id').primaryKey(),
  mood_score: integer('mood_score').notNull(),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  session_id: varchar('session_id', { length: 64 }).notNull(),
  role: varchar('role', { length: 10 }).notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});
