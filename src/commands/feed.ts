import { getUserByName } from "../lib/db/queries/users";
import { readConfig } from "../config";
import { fetchFeed } from "../lib/api/feed";
import { createFeed } from "../lib/db/queries/feed";
import { Feed, User } from "../lib/db/schema";

function printFeed(user: User, feed: Feed) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    const url = "https://www.wagslane.dev/index.xml";
    const feed = await fetchFeed(url);
    console.log(JSON.stringify(feed, null, 2));
}

export async function handlerAddFeed(cmdName: string, ...args: string[]) {
    if (args.length != 2) {
        throw new Error(`usage: ${cmdName} <feed_name> <url>`);
    }
    const config = readConfig()
    const user = await getUserByName(config.currentUserName);

    if (!user) {
        throw new Error(`User ${user} not found`);
    }

    const feedName = args[0];
    const url = args[1];

    const feed = await createFeed(feedName, url, user.id);
    if (!feed) {
        throw new Error(`Failed to create feed`);
    }

    printFeed(user, feed);
}
