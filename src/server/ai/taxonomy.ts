import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { config } from '../../shared/schemas.js';

const TaxonomySchema = z.object({
  labels: z.array(z.string()).describe('List of short, 1-2 word tags for the note.'),
});

export async function suggestLabels(
  noteContent: string,
  noteTitle: string = '',
  existingTags: string[] = []
): Promise<string[]> {
  if (!config.AI_ENABLED) return [];

  // Truncate massive notes to protect context window (~20k chars is plenty for taxonomy)
  const maxContentLength = 20000;
  const contentToAnalyze = noteContent.length > maxContentLength
    ? noteContent.substring(0, maxContentLength)
    : noteContent;

  // Tag Pre-filtering (Keyword matching)
  // Build a candidate list of existing tags that actually appear in the note content
  const contentLower = contentToAnalyze.toLowerCase();
  const candidateTags = existingTags.filter(tag => contentLower.includes(tag.toLowerCase()));

  const promptContext = candidateTags.length > 0
    ? `\n\nConsider using these existing tags if appropriate: ${candidateTags.join(', ')}`
    : '';

  const controller = new AbortController();
  // Target P95 < 2.5s for fast categorization, but give 10s for free tier cold starts
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const { object } = await generateObject({
      model: google(config.TAXONOMY_MODEL),
      schema: TaxonomySchema,
      prompt: `Analyze the following note and suggest 1-5 highly relevant, short (1-2 words), lowercased labels that categorize its topics. Do not invent obscure labels; prefer common terms.${promptContext}\n\nTitle: ${noteTitle}\n\nContent: ${contentToAnalyze}`,
      abortSignal: controller.signal,
      maxRetries: 0, // Fast-fail on 429s (quota exceeded) rather than hanging for 10s
    });
    return object.labels;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('[Taxonomy AI] Request timed out after 10s');
      return [];
    }
    console.error('[Taxonomy AI] Failed to generate labels:', error);
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
