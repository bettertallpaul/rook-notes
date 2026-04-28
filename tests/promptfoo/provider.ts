import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { config } from '../../src/shared/schemas.js';
import { z } from 'zod';

const TaxonomySchema = z.object({
  labels: z.array(z.string()).describe('List of short, 1-2 word tags for the note.'),
});

export default class TaxonomyProvider {
  id() {
    return 'custom-taxonomy-provider';
  }

  async callApi(prompt: string, context: any) {
    try {
      const noteContent = context.vars.note;
      
      // Use the prompt from the YAML if it contains the {{note}} placeholder, 
      // otherwise fallback to a default prompt structure.
      const finalPrompt = prompt.includes('{{note}}') 
        ? prompt.replace('{{note}}', noteContent)
        : `${prompt}\n\nNote Content: ${noteContent}`;

      const { object } = await generateObject({
        model: google(config.TAXONOMY_MODEL),
        schema: TaxonomySchema,
        prompt: finalPrompt,
      });

      console.log(`[Provider] Generated for "${noteContent.substring(0, 20)}...":`, JSON.stringify(object));

      return {
        output: JSON.stringify(object),
      };
    } catch (err: any) {
      console.error('[Provider] Error:', err);
      return {
        error: err.message,
      };
    }
  }
}
