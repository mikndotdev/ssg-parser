import { scrapeSite } from './functions/get-pages';
import { JinaParse } from './functions/jina-parse';

/**
 * Compiles parsed text from all internal links of a given base URL.
 *
 * @param {string} baseUrl - The base URL to start scraping from.
 * @param {string} apiKey - The API key for the Jina Reader API.
 * @returns {Promise<string>} - A promise that resolves to the compiled text.
 * @throws Will throw an error if there is an issue with fetching or parsing the URLs.
 */
export async function compile(baseUrl: string, apiKey: string): Promise<string> {
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

        return parsedTexts.join('\n\n');
    } catch (error: any) {
        console.error(`Error compiling parsed text:`, error.message);
        throw error;
    }
}