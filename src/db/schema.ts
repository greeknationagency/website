import { pgTable, serial, text, varchar, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  school: varchar('school', { length: 255 }),
  affiliation: varchar('affiliation', { length: 255 }), // fraternity/sorority + chapter
  role: varchar('role', { length: 100 }), // President, Vice President, etc.
  isAmbassador: boolean('is_ambassador').default(false),
  isAdmin: boolean('is_admin').default(false),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const artists = pgTable('artists', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  genre: varchar('genre', { length: 100 }), // EDM, Hip Hop, Comedy, Country
  imageUrl: text('image_url'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  artistId: integer('artist_id').references(() => artists.id),
  eventDate: timestamp('event_date'),
  location: varchar('location', { length: 255 }),
  budget: varchar('budget', { length: 100 }),
  notes: text('notes'),
  status: varchar('status', { length: 50 }).default('pending'), // pending, accepted, rejected
  createdAt: timestamp('created_at').defaultNow(),
});

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }), // photo, video, reel
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: varchar('title', { length: 255 }),
  artistId: integer('artist_id').references(() => artists.id),
  school: varchar('school', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  location: varchar('location', { length: 255 }),
  imageUrl: text('image_url'),
  ticketLink: text('ticket_link'),
  createdAt: timestamp('created_at').defaultNow(),
});
