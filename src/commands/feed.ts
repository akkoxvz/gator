import { fetchFeed } from "../lib/api/feed";

export async function handlerAgg(cmdName: string, ...args: string[]) {
    const url = "https://www.wagslane.dev/index.xml";
    const feed = await fetchFeed(url);
    console.log(JSON.stringify(feed, null, 2));
}