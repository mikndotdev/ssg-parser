import * as cheerio from "cheerio";
import { URL } from "url";

const USER_AGENT =
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3";

/**
 * Fetches HTML content from the given URL.
 *
 * @param {string} url - The URL to fetch HTML from.
 * @returns {Promise<string>} - The HTML content as a string.
 * @throws Will throw an error if the fetch fails.
 */
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

/**
 * Removes all script tags from HTML content.
 *
 * @param {string} html - The HTML content to process.
 * @returns {string} - HTML content with script tags removed.
 */
function removeScriptTags(html: string): string {
	const $ = cheerio.load(html);
	$("script").remove();
	return $.html();
}

/**
 * Cleans text by normalizing characters, removing unwanted content, and formatting.
 *
 * @param {string} text - The text to clean.
 * @returns {string} - The cleaned text.
 */
function cleanText(text: string): string {
	// Decode HTML entities that might remain
	text = text
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ");

	// Replace common typographic characters
	const replacements: Record<string, string> = {
		'"': '"',
		"–": "-",
		"—": "-", // En-dash, em-dash
		"…": "...", // Ellipsis
		"\u200b": "", // Zero-width space
		"\xa0": " ", // Non-breaking space
	};

	for (const [old, newChar] of Object.entries(replacements)) {
		text = text.replace(new RegExp(old, "g"), newChar);
	}

	// Remove email addresses
	text = text.replace(/\S+@\S+\.\S+/g, "");

	// Remove URLs
	text = text.replace(/https?:\/\/\S+/g, "");
	text = text.replace(/www\.\S+/g, "");

	// Remove social media handles
	text = text.replace(/@\w+/g, "");
	text = text.replace(/#\w+/g, "");

	// Remove phone numbers (common formats)
	text = text.replace(/\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, "");

	// Remove form fields placeholders
	text = text.replace(
		/(?:enter|your|type)(?:\s+)(?:email|name|address|phone|message|here)/gi,
		"",
	);

	// Normalize ellipses
	text = text.replace(/\.{2,}/g, "...");

	// Remove control characters
	text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

	// Handle paragraph breaks properly
	text = text.replace(/\n{2,}/g, "\n\n");

	// Remove common boilerplate phrases
	const boilerplate = [
		"all rights reserved",
		"terms and conditions",
		"privacy policy",
		"cookie policy",
		"copyright ©",
		"powered by",
		"subscribe to our newsletter",
		"subscribe now",
		"sign up for",
		"follow us on",
		"contact us",
		"sitemap",
		"back to top",
		"read more",
		"click here",
		"learn more",
		"cookies are used",
		"we use cookies",
	];

	for (const phrase of boilerplate) {
		text = text.replace(new RegExp(phrase, "gi"), "");
	}

	// Remove extra whitespaces
	text = text.replace(/\s+/g, " ");

	// Final whitespace cleanup
	text = text.trim();

	return text;
}

/**
 * Extracts internal links from the given HTML content.
 *
 * @param {string} baseUrl - The base URL used to resolve relative links.
 * @param {string} html - The HTML content to extract links from.
 * @returns {string[]} - An array of unique internal links.
 */
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

/**
 * Preprocesses HTML content by removing scripts and cleaning text.
 *
 * @param {string} html - The HTML content to process.
 * @returns {string} - The processed HTML content.
 */
function preprocessHTML(html: string): string {
	const $ = cheerio.load(html);

	// Remove script tags
	$("script").remove();

	// Clean text in various elements
	$("body")
		.find("p, h1, h2, h3, h4, h5, h6, span, div, li, td, th")
		.each((_, element) => {
			const text = $(element).text();
			const cleanedText = cleanText(text);
			$(element).text(cleanedText);
		});

	return $.html();
}

/**
 * Scrapes a site starting from the given URL, preprocesses pages by removing script tags and cleaning text.
 *
 * @param {string} url - The starting URL to scrape.
 * @param {Map<string, string>} processedPages - Map to store URL to processed HTML content.
 * @param {Set<string>} visited - Set of already visited URLs.
 * @returns {Promise<Map<string, string>>} - A promise resolving to a map of URLs to processed HTML content.
 */
export async function preprocessPages(
	url: string,
	processedPages = new Map<string, string>(),
	visited = new Set<string>(),
): Promise<Map<string, string>> {
	if (visited.has(url)) return processedPages;
	visited.add(url);

	try {
		const html = await fetchHTML(url);
		console.log(`Downloaded: ${url}`);

		// Preprocess the page
		const processedHtml = preprocessHTML(html);
		processedPages.set(url, processedHtml);

		const links = extractInternalLinks(url, html);

		for (const link of links) {
			if (!visited.has(link)) {
				await preprocessPages(link, processedPages, visited);
			}
		}
	} catch (error: any) {
		console.error(`Error fetching ${url}:`, error.message);
	}

	return processedPages;
}
