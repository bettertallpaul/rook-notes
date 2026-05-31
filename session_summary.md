# Next Steps

Ready for Cloud Deployment (User Steps)
The codebase is fully primed for live cloud hosting! Follow the step-by-step instructions now documented in DEPLOYMENT.md to:

1. Deploy the Express API (Dockerfile.api build target) on Google Cloud Run.
2. Deploy the Stateless MCP Server (Dockerfile.mcp build target) pointing to the API's live HTTPS URL.
3. Deploy the Frontend client (Dockerfile.app build target) pointing to the API's live HTTPS URL.