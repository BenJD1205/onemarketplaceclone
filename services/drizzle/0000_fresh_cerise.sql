CREATE TYPE "public"."account_role" AS ENUM('FREELANCER', 'CLIENT');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" text NOT NULL,
	"email" text NOT NULL,
	"role" "account_role" DEFAULT 'CLIENT' NOT NULL,
	"identity_verified" boolean DEFAULT false,
	"payment_method_verified" boolean DEFAULT false,
	"is_onboarding_complete" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "client_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"role" text NOT NULL,
	"company_name" text NOT NULL,
	"company_website" text NOT NULL,
	"company_size" text NOT NULL,
	"company_description" text NOT NULL,
	"industry" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
