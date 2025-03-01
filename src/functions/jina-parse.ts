export async function JinaParse(url: string, apiKey: string): Promise<string> {
    const apiUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch ${url} from Jina Reader API: ${response.statusText}`);
    }

    return await response.text();
}