interface LLMService {
  name: string;
  url: string;
  selector: string;
}

export const LLM_SERVICES: LLMService[] = [
  {
    name: 'ChatGPT',
    url: 'https://chatgpt.com',
    selector: 'prompt-textarea'
  },
  {
    name: 'Google Gemini',
    url: 'https://gemini.google.com',
    selector: 'textarea[aria-label="Chat input"]'
  }
];

export function getLLMServiceForUrl(url: string): LLMService | undefined {
  return LLM_SERVICES.find(service => url.includes(service.url));
} 