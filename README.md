# @mikandev/ssg-parser

A utility package for scraping and processing website content, with AI-powered text extraction and preprocessing capabilities.

## Installation

```bash
npm install @mikandev/ssg-parser
```

## Features

- Website scraping and content extraction
- Advanced text cleaning and preprocessing
- Script tag removal from HTML content
- AI-powered text parsing with Gemini or Jina
- Conversion of HTML content to clean markdown

## Usage

### Basic Compilation with Jina

```typescript
import { compile } from '@mikandev/ssg-parser';

async function main() {
  const baseUrl = 'https://example.com';
  const jinaApiKey = 'YOUR_JINA_API_KEY';
  
  try {
    const compiledText = await compile(baseUrl, jinaApiKey);
    console.log(compiledText);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### Using Gemini for Compilation

```typescript
import { geminiCompile } from '@mikandev/ssg-parser';

async function main() {
  // Requires GOOGLE_GENERATIVE_AI_API_KEY environment variable
  const baseUrl = 'https://example.com';
  
  try {
    const compiledText = await geminiCompile(baseUrl);
    console.log(compiledText);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### Preprocessing Pages

```typescript
import { preprocessPages } from '@mikandev/ssg-parser';

async function main() {
  const baseUrl = 'https://example.com';
  
  try {
    const processedPages = await preprocessPages(baseUrl);
    
    for (const [url, html] of processedPages) {
      console.log(`Processed ${url}, content length: ${html.length}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## API Reference

### `compile(baseUrl: string, apiKey: string): Promise<string>`

Compiles parsed text from all internal links of a given base URL using Jina.

- `baseUrl`: The starting URL to scrape
- `apiKey`: API key for the Jina Reader API

Returns a promise that resolves to the compiled text.

### `geminiCompile(baseUrl: string): Promise<string>`

Compiles parsed text from all internal links of a given base URL using Gemini.

- `baseUrl`: The starting URL to scrape
- Requires Google AI Studio API key set as `GOOGLE_GENERATIVE_AI_API_KEY` environment variable

Returns a promise that resolves to the compiled text.

### `preprocessPages(url: string, processedPages?, visited?): Promise<Map<string, string>>`

Scrapes a site and preprocesses pages by removing script tags and cleaning text.

- `url`: The starting URL to scrape
- `processedPages`: Optional Map to store URL to processed HTML content
- `visited`: Optional Set of already visited URLs

Returns a promise resolving to a map of URLs to processed HTML content.

## License

See the repository for license information.

## Repository

[GitHub Repository](https://github.com/mikndotdev/ssg-parser)