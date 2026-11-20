export type DomainOption = 'AI' | 'IoT' | 'Web' | 'Cybersecurity' | 'Other';

export type AiProvider = 'gemini' | 'openai';

export interface LiveAiConfig {
  enabled: boolean;
  provider: AiProvider;
  apiKey: string;
}

export interface ResearchOutput {
  titles: [string, string, string];
  abstract: string;
  wordCount: number;
  keywords: [string, string, string, string, string];
  objectives: [string, string, string];
  futureEnhancements: [string, string, string];
  domainLabel: string;
  sourceIdea: string;
  generationMode: 'built-in' | 'gemini' | 'openai';
}

export interface SampleIdea {
  id: string;
  label: string;
  domain: DomainOption;
  text: string;
}
