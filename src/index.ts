import { scrapeSite } from './functions/get-pages.ts';
import { JinaParse } from './functions/jina-parse.ts';
import { promises as fs } from 'node:fs';
import path from 'node:path';

async function compileParsedText(baseUrl: string, apiKey: string, outputFilePath: string) {
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

        const compiledText = parsedTexts.join('\n\n');

        await fs.writeFile(outputFilePath, compiledText, 'utf-8');
        console.log(`Compiled text saved to ${outputFilePath}`);
    } catch (error: any) {
        console.error(`Error compiling parsed text:`, error.message);
    }
}

// Example usage
const baseUrl = 'https://docs.mikn.dev';
const apiKey = process.env.JINA_API_KEY as string;
const outputFilePath = path.join(__dirname, 'compiled-text.txt');

compileParsedText(baseUrl, apiKey, outputFilePath);