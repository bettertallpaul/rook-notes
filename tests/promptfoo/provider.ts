import { suggestLabels } from '../../src/server/ai/taxonomy';

export default async function callApi(prompt: string, context: any) {
  try {
    const labels = await suggestLabels(context.vars.note, "Test Title", []);
    return {
      output: JSON.stringify({ labels }),
    };
  } catch (err: any) {
    return {
      error: err.message,
    };
  }
}
