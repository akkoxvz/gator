ALTER TABLE "feed" RENAME TO "feeds";--> statement-breakpoint
ALTER TABLE "feeds" DROP CONSTRAINT "feed_url_unique";--> statement-breakpoint
ALTER TABLE "feeds" DROP CONSTRAINT "feed_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feeds" ADD CONSTRAINT "feeds_url_unique" UNIQUE("url");