#!/usr/bin/env bash
# Seed the Rook API with sample notes
set -euo pipefail

API="${API_BASE_URL:-http://localhost:3001}"

post() {
  local data="$1"
  local response
  response=$(curl -s -w "%{http_code}" -X POST "$API/api/notes" \
    -H "Content-Type: application/json" \
    -d "$data")
  
  local len=${#response}
  local status=""
  local body=""
  if [ "$len" -ge 3 ]; then
    status="${response:$((len-3)):3}"
    body="${response:0:$((len-3))}"
  fi
  
  if [ "$status" -ne 201 ]; then
    echo "Error: Failed to create note (HTTP $status)"
    echo "Response: $body"
    exit 1
  fi
}

echo "Seeding notes to $API ..."

post '{
  "title": "Welcome to Rook",
  "content": "# Welcome!\n\nRook is a simple note-taking app. Use markdown to format your notes.\n\n- **Bold**, *italic*, and `code`\n- Lists, headings, and blockquotes\n- Labels to organize your thoughts",
  "labels": ["getting-started", "docs"]
}'

post '{
  "title": "Meeting Notes — Sprint Planning",
  "content": "## Sprint 24 Planning\n\n### Goals\n- Finish auth migration\n- Ship search improvements\n- Fix mobile nav bug\n\n### Action items\n1. @alice — auth token rotation\n2. @bob — search indexing\n3. @carol — responsive sidebar",
  "labels": ["meetings", "sprint"]
}'

post '{
  "title": "Docker Cheat Sheet",
  "content": "## Useful commands\n\n```bash\ndocker compose up -d --build\ndocker compose logs -f api\ndocker compose exec app bash\ndocker system prune -a\n```\n\n## Volumes\n- Named volumes persist across rebuilds\n- Bind mounts reflect host changes instantly",
  "labels": ["devops", "reference"]
}'

post '{
  "title": "Book Notes: Designing Data-Intensive Applications",
  "content": "## Key takeaways\n\n- Replication vs partitioning trade-offs\n- LSM-trees vs B-trees for storage engines\n- Exactly-once semantics are hard — prefer idempotency\n- Stream processing is batch processing done continuously\n\n> \"The limits of my language mean the limits of my world.\"",
  "labels": ["books", "engineering"]
}'

post '{
  "title": "Recipe: Sourdough Bread",
  "content": "## Ingredients\n- 500g bread flour\n- 350g water\n- 100g starter\n- 10g salt\n\n## Steps\n1. Mix flour + water, autolyse 30 min\n2. Add starter + salt, fold 4x over 2 hours\n3. Bulk ferment 4-6 hours\n4. Shape, cold retard overnight\n5. Bake at 250°C in Dutch oven, 20 min lid on, 25 min lid off",
  "labels": ["cooking", "personal"]
}'

post '{
  "title": "API Design Principles",
  "content": "## REST conventions\n- Use nouns for resources, verbs via HTTP methods\n- Plural resource names: `/api/notes`, not `/api/note`\n- Use query params for filtering: `?q=search`\n- Return proper status codes: 201 for created, 404 for missing\n\n## Versioning\n- URL prefix (`/v1/`) or Accept header\n- Avoid breaking changes — add fields, never remove",
  "labels": ["engineering", "reference"]
}'

echo "Done — 6 sample notes created."
