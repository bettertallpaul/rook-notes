## TODOS
1. **Fix `make test` execution:** Add a `"test"` script to `package.json` so that the `make test` command successfully executes tests inside the container instead of failing with a missing script error.
2. **Expand AI Evaluations:** Determine if the taxonomy evaluations need more test cases (beyond the current two synthetic cases in `dataset.json`) to thoroughly benchmark tag suggestions.
3. **Integrate `make test-ai`:** Include a specific `test-ai` target in the `Makefile` and decide whether to keep LLM evaluations separate from standard core application testing (`make test`).