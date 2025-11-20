import { XMLParser } from "fast-xml-parser";

type RSSFeed = {
    channel: {
        title: string;
        link: string;
        description: string;
        item: RSSItem[];
    };
};

type RSSItem = {
    title: string;
    link: string;
    description: string;
    pubDate: string;
}

export async function fetchFeed(feedUrl: string) {
    const response = await fetch(feedUrl, {
        headers: {
            'User-Agent': "gator",
            accept: "application/rss+xml"
        }
    });

    if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.text();
    return parseFeed(data);
}

function parseFeed(data: string) {
    const xmlParser = new XMLParser();
    const parsedData = xmlParser.parse(data);

    return extractMetadata(parsedData);
}

function extractMetadata(parsedData: any): RSSFeed {
    if (!parsedData || typeof parsedData != "object") {
        throw new Error('Invalid xml');
    }

    if (!parsedData.rss || typeof parsedData.rss != "object") {
        throw new Error('Missing or invalid rss');
    }

    const { rss } = parsedData;

    if (!rss.channel || typeof rss.channel != "object") {
        throw new Error('Missing or invalid channel');
    }

    const { channel } = rss;
    if (!channel.title || typeof channel.title != "string") {
        throw new Error('Missing or invalid title');
    }

    if (!channel.link || typeof channel.link != "string") {
        throw new Error('Missing or invalid link');
    }

    if (!channel.description || typeof channel.description != "string") {
        throw new Error('Missing or invalid description');
    }

    let rssItems: RSSItem[] = [];

    if (channel.item && Array.isArray(channel.item)) {
        rssItems = channel.item.map((item: any) => validateItem(item))
    }

    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: rssItems
        }
    } as RSSFeed;
}

function validateItem(item: any): RSSItem | undefined {
    if (
        !item ||
        !item.title || typeof item.title != "string" ||
        !item.link || typeof item.link  != "string" ||
        !item.description || typeof item.description  != "string" ||
        !item.pubDate || typeof item.pubDate  != "string"
    ) {
        return;
    }

    return {
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: item.pubDate
    } as RSSItem
}
