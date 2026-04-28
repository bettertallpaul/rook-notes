import { suggestLabels } from '../src/server/ai/taxonomy.js';

async function run() {
  process.env.AI_PROVIDER = 'google';
  console.log("Testing Vercel AI SDK with Google Provider...");
  try {
    const note = "Just learned about Docker compose and how it mounts volumes. It's so much easier than running manual docker run commands with -v everywhere. Still need to figure out networking though.";
    // const labels = await suggestLabels(note, "Docker learnings");
    const labels = await suggestLabels(
      note,
      "Docker learnings",
      ["volumes", "unrelated-tag"] // <-- Simulating your database's existing tags
    );

    console.log("Success! Generated labels:", labels);
  } catch (err: any) {
    console.error("Error:", err);
  }
}

run();
