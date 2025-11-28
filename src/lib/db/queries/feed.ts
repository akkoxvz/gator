import { eq, sql } from "drizzle-orm";
import { db } from "..";
import { feeds } from "../schema";
import { firstOrUndefined } from "./utils";

export async function createFeed(name: string, url: string, userId: string) {
    const [result] = await db
        .insert(feeds)
        .values({ 
            name: name,
            url: url,
            userId: userId
        })
        .returning();

    return result;
}

export async function getFeeds() {
    const result = await db.select().from(feeds)
    return result;
}

export async function getFeedByUrl(url: string) {
    const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
    return result;
}

export async function markFeedFetched(feedId: string) {
    const result = await db
        .update(feeds)
        .set({
            lastFetchedAt: new Date(),
        })
        .where(eq(feeds.id, feedId))
        .returning();
    return firstOrUndefined(result);
}

export async function getNextFeedToFecth() {
    const result = await db
        .select()
        .from(feeds)
        .orderBy(sql`${feeds.lastFetchedAt} desc nulls first`)
        .limit(1);
    return firstOrUndefined(result);
}