import { getUserById, getUserByName } from "../lib/db/queries/users";
import { readConfig } from "../config";
import { fetchFeed } from "../lib/api/feed";
import { createFeed, getFeedByUrl, getFeeds } from "../lib/db/queries/feed";
import { Feed, User } from "../lib/db/schema";
import { createFeedFollows } from "../lib/db/queries/feedFollows";

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

export async function handlerFeeds(cmdName: string, ...args: string[]) {
    const feeds = await getFeeds();

    if (feeds.length == 0) {
        console.log(`No feeds found.`);
        return;
    }

    console.log(`====== Feeds ======`)
    for (const feed of feeds) {
        const user = await getUserById(feed.userId);
        if (!user) {
            throw new Error(`Failed to find user for feed ${feed.id}`);
        }

        printFeed(user, feed);
        console.log(`==================================`);
    }
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

export async function handlerFollow(cmdName: string, ...args: string[]) {
    if (args.length != 1) {
        throw new Error(`usage ${cmdName} <url>`);
    }
    const url = args[0];

    const config = readConfig()
    const user = await getUserByName(config.currentUserName);

    if (!user) {
        throw new Error(`User ${user} not found`);
    }

    const feed = await getFeedByUrl(url)

    if (!feed) {
        throw new Error(`Feed ${url} not found`);
    }

    const feedFollow = await createFeedFollows(user.id, feed.id);
    printFeedFollow(feedFollow);
}


function printFeedFollow(feedFollow: any) {
  console.log(`* ID:            ${feedFollow.id}`);
  console.log(`* Created:       ${feedFollow.createdAt}`);
  console.log(`* Updated:       ${feedFollow.updatedAt}`);
  console.log(`* name:          ${feedFollow.userName}`);
  console.log(`* URL:           ${feedFollow.feedName}`);
}
