import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const model = google("gemini-2.0-flash-lite-preview-02-05");

export async function geminiParse(data: string) {
	const prompt = `# Task
Convert the input HTML to clean markdown format.

# Processing
- Don't change or remove words, just convert or keep it still.
- Don't yield anything else then the converted markdown itself.
- Ignore hyperlinks which points at non-global urls, such as "/here.png" "./here.html"

# IMPORTANT
DONT INCLUDE "\`\`\`" AT THE START OR END. YOU WILL BE FIRED!!!! JUST OUTPUT THE MARKDOWN ITSELF, NOT THE CODEBLOCK. The data is as follows: ${data}`;

	const response = await generateText({ model, prompt });
	return response.text;
}
