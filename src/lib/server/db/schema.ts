import { pgTable, serial, text, integer, timestamp, uuid} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: uuid('id').defaultRandom().primaryKey(),	
	loginID: text('login_id').notNull().unique(),
	password: text('password').notNull(),	
	name: text("name").notNull(),
	createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
});

export const session = pgTable('session', {
	id: text("id").primaryKey(),
	userID: uuid('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
