CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plays" (
	"account_id" text NOT NULL,
	"game_day" text NOT NULL,
	"puzzle" text NOT NULL,
	"guesses" jsonb NOT NULL,
	"evaluations" jsonb NOT NULL,
	"status" text NOT NULL,
	"hard_mode" boolean NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plays_account_id_game_day_pk" PRIMARY KEY("account_id","game_day")
);
--> statement-breakpoint
ALTER TABLE "plays" ADD CONSTRAINT "plays_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;