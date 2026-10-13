import { pgTable, uuid, text, pgEnum, boolean, timestamp } from "drizzle-orm/pg-core";

export const accountRole = pgEnum("account_role", ["FREELANCER", "CLIENT"]);

export const accounts = pgTable("accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    auth_id: text("auth_id").notNull(),
    email: text("email").notNull(),
    role: accountRole("role").default("CLIENT").notNull(),
    identity_verified: boolean("identity_verified").default(false),
    payment_method_verified: boolean("payment_method_verified").default(false),
    is_onboarding_complete: boolean("is_onboarding_complete").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const client_metadata = pgTable("client_metadata", {
    id: uuid("id").defaultRandom().primaryKey(),
    account_id: uuid("account_id").notNull(),
    role: text("role").notNull(),
    company_name: text("company_name").notNull(),
    company_website: text("company_website").notNull(),
    company_size: text("company_size").notNull(),
    company_description: text("company_description").notNull(),
    industry: text("industry").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});