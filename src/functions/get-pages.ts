import * as cheerio from "cheerio";
import { URL } from "url";

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";

async function fetchHTML(url: string): Promise<string> {
	const response = await fetch(url, {
		headers: {
			"User-Agent": USER_AGENT,
		},
	});
	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
	}
	return await response.text();
}

function extractInternalLinks(baseUrl: string, html: string): string[] {
	const $ = cheerio.load(html);
	const links: string[] = [];
	const base = new URL(baseUrl);

	$("a[href]").each((_, element) => {
		const href = $(element).attr("href");
		if (href && !href.includes("#")) {
			const url = new URL(href, base);
			if (url.origin === base.origin) {
				links.push(url.href);
			}
		}
	});

	return Array.from(new Set(links));
}

export async function scrapeSite(
	url: string,
	visited = new Set<string>(),
): Promise<string[]> {
	if (visited.has(url)) return Array.from(visited);
	visited.add(url);

	try {
		const html = await fetchHTML(url);
		console.log(`Downloaded: ${url}`);
		const links = extractInternalLinks(url, html);

		for (const link of links) {
			if (!visited.has(link)) {
				await scrapeSite(link, visited);
			}
		}
	} catch (error: any) {
		console.error(`Error fetching ${url}:`, error.message);
	}

	return Array.from(visited);
}
