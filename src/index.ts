import { scrapeSite } from "./functions/get-pages";
import { JinaParse } from "./functions/jina-parse";
import { preprocessPages } from "./functions/preprocess-pages";
import { geminiParse } from "./functions/gemini-parse";

/**
 * Compiles parsed text from all internal links of a given base URL.
 *
 * @param {string} baseUrl - The base URL to start scraping from.
 * @param {string} apiKey - The API key for the Jina Reader API.
 * @returns {Promise<string>} - A promise that resolves to the compiled text.
 * @throws Will throw an error if there is an issue with fetching or parsing the URLs.
 */
export async function compile(
	baseUrl: string,
	apiKey: string,
): Promise<string> {
	try {
		const urls = await scrapeSite(baseUrl);

		const parsedTexts: string[] = [];

		for (const url of urls) {
			try {
				const text = await JinaParse(url, apiKey);
				parsedTexts.push(text);
			} catch (error: any) {
				console.error(`Error parsing ${url}:`, error.message);
			}
		}

		return parsedTexts.join("\n\n");
	} catch (error: any) {
		console.error(`Error compiling parsed text:`, error.message);
		throw error;
	}
}

/**
 * Compiles parsed text from all internal links of a given base URL using Gemini.
 *
 * @param {string} baseURL - The base URL to start scraping from.
 * @returns {Promise<string>} - A promise that resolves to the compiled text.
 * @throws Will throw an error if there is an issue with fetching or parsing the URLs.
 * @requires Google AI Studio API key set as GOOGLE_GENERATIVE_AI_API_KEY environment variable.
 */
export async function geminiCompile(baseURL: string): Promise<string> {
	try {
		const processedPages = await preprocessPages(baseURL);
		const parsedTexts: string[] = [];

		for (const [url, html] of processedPages) {
			try {
				const text = await geminiParse(html);
				parsedTexts.push(text);
			} catch (error: any) {
				console.error(`Error parsing ${url}:`, error.message);
			}
		}

		return parsedTexts.join("\n\n");
	} catch (error: any) {
		console.error(`Error compiling parsed text:`, error.message);
		throw error;
	}
}
