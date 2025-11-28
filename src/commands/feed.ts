import { getUserById, getUserByName } from "../lib/db/queries/users";
import { createFeed, getFeedByUrl, getFeeds, getNextFeedToFecth, markFeedFetched } from "../lib/db/queries/feed";
import { Feed, NewPosts, User } from "../lib/db/schema";
import { createFeedFollows, deleteFeedFollow, getFeedFollowsForUser } from "../lib/db/queries/feedFollows";
import { parseDuration } from "../lib/time";
import { fetchFeed } from "../lib/api/feed";
import { createPost, getPostsForUser } from "../lib/db/queries/posts";

function printFeed(user: User, feed: Feed) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
}

export async function handlerAgg(cmdName: string, ...args: string[]) {
    if (args.length != 1) {
        throw new Error(`usage: ${cmdName} <time_between_reqs>`);
    }

    const timeArg = args[0];
    const timeBetweenRequests = parseDuration(timeArg);
    if (!timeBetweenRequests) {
        throw new Error(
            `invalid duration: ${timeArg} - use format 1h 30m 15s or 3500ms`
        );
    }

    console.log(`Collection feeds every ${timeArg}...`);

    scrapeFeeds().catch(handleError);

    const interval = setInterval(() => {
        scrapeFeeds().catch(handleError);
    }, timeBetweenRequests);

    await new Promise<void>((resolve) => {
        process.on('SIGINT', () => {
            console.log("Shutting down feed aggregator");
            clearInterval(interval);
            resolve();
        })
    });
}

async function scrapeFeeds() {
    const feed = await getNextFeedToFecth();
    if (!feed) {
        console.log("No feeds to fetch.");
        return;
    }

    console.log("Found a feed to fetch!");
    scrapeFeed(feed);
}

async function scrapeFeed(feed: Feed) {
    await markFeedFetched(feed.id);

    const feedData = await fetchFeed(feed.url);

    for (let item of feedData.channel.item) {
        console.log(`Found post: %s`, item.title);

        const now = new Date();

        await createPost({
            url: item.link,
            feedId: feed.id,
            title: item.title,
            createdAt: now,
            updatedAt: now,
            description: item.description,
            publishedAt: new Date(item.pubDate),
        } satisfies NewPosts);
    }
    console.log(
        `Feed ${feed.name} collected, ${feedData.channel.item.length} posts found`,
    );
}

function handleError(err: unknown) {
  console.error(
    `Error scraping feeds: ${err instanceof Error ? err.message : err}`,
  );
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

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]) {
    if (args.length != 2) {
        throw new Error(`usage: ${cmdName} <feed_name> <url>`);
    }

    const feedName = args[0];
    const url = args[1];

    const feed = await createFeed(feedName, url, user.id);
    if (!feed) {
        throw new Error(`Failed to create feed`);
    }

    const feedFollow = await createFeedFollows(user.id, feed.id);
    if (!feedFollow) {
        throw new Error(`Failed to create feedFollow`);
    }

    printFeed(user, feed);
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length != 1) {
        throw new Error(`usage ${cmdName} <url>`);
    }

    const feedUrl = args[0];
    const feed = await getFeedByUrl(feedUrl)
    if (!feed) {
        throw new Error(`Feed ${feedUrl} not found`);
    }

    const feedFollow = await createFeedFollows(user.id, feed.id);
    printFeedFollow(feedFollow);
}

export async function handlerUnfollow(cmdName: string, user: User, ...args: string[]) {
    if (args.length != 1) {
        throw new Error(`usage ${cmdName} <url>`);
    }

    const feedUrl = args[0];
    const feed = await getFeedByUrl(feedUrl);
    if (!feed) {
        throw new Error(`Feed ${feedUrl} not found`);
    }

    const unfollow = await deleteFeedFollow(user.id, feed.id);
    console.log(`Unfollowed ${feed.name} at ${feed.url}`);
}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]) {
    const feeds = await getFeedFollowsForUser(user.id);
    if (feeds.length == 0) {
        console.log(`Feeds not found for user: ${user.name}`);
        return;
    }

    console.log(`====== Feeds ======`)
    for (const feed of feeds) {
        printFeedFollow(feed);
        console.log(`==================================`);
    }
}

export async function handlerBrowse(cmdName: string, user: User, ...args: string[]) {
    let limit = 2;
    if (args.length == 1) {
        let specifiedLimit = parseInt(args[0]);
        if (specifiedLimit) {
            limit = specifiedLimit;
        } else {
            throw new Error(`usage: ${cmdName} [limit]`);
        }
    }

    const posts = await getPostsForUser(user.id, limit);
    console.log(`Found ${posts.length} posts for user ${user.name}`);
    for (let post of posts) {
        console.log(`${post.publishedAt} from ${post.feedName}`);
        console.log(`--- ${post.title} ---`);
        console.log(`    ${post.description}`);
        console.log(`Link: ${post.url}`);
        console.log(`=====================================`);
    }
}


function printFeedFollow(feedFollow: any) {
  console.log(`* ID:            ${feedFollow.id}`);
  console.log(`* Created:       ${feedFollow.createdAt}`);
  console.log(`* Updated:       ${feedFollow.updatedAt}`);
  console.log(`* name:          ${feedFollow.userName}`);
  console.log(`* Feed:          ${feedFollow.feedName}`);
  console.log(`* Feed url:      ${feedFollow.feedUrl}`);
}
