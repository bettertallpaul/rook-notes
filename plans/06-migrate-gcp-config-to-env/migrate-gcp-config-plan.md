# Migration Plan - Migrate GCP Deployment Configuration to .env

Migrate the hardcoded/default GCP deployment configuration variables (`GCP_PROJECT` and `GCP_REGION`) from the `Makefile` to the root `.env` file, and load them dynamically in the `Makefile` while preserving the ability to override them at runtime via the CLI.

## Proposed Changes

### Rook Notes Project Root

#### [NEW] [.env.example](file:///Users/paulbernier/Developer/workspace/code/rook-notes/.env.example)
Create a `.env.example` template to serve as a guide for setting up local environment variables.

```ini
# Core Configuration
GOOGLE_API_KEY=your-api-key-here
AI_PROVIDER=google
TAXONOMY_MODEL=gemini-2.5-flash-lite
AI_ENABLED=true
VITE_GROWTHBOOK_CLIENT_KEY=your-client-key-here

# GCP Deployment Configuration
GCP_PROJECT=your-gcp-project-here
GCP_REGION=your-gcp-region-here
```

#### [MODIFY] [.env](file:///Users/paulbernier/Developer/workspace/code/rook-notes/.env)
Add the GCP deployment configuration keys to the existing `.env` file:

```diff
# .env
GOOGLE_API_KEY=your-api-key-here
AI_PROVIDER=google
TAXONOMY_MODEL=gemini-2.5-flash-lite
#TAXONOMY_MODEL=gemini-2.5-flash
AI_ENABLED=true
VITE_GROWTHBOOK_CLIENT_KEY=sdk-KnUyuLGu4isyeWe
+
+ # GCP Deployment Configuration
+ GCP_PROJECT=your-gcp-project-here
+ GCP_REGION=your-gcp-region-here
```

#### [MODIFY] [Makefile](file:///Users/paulbernier/Developer/workspace/code/rook-notes/Makefile)
Modify the `Makefile` to import and export `.env` variables if `.env` exists. Keep `?=` defaults for robustness.

```diff
+ # Load environment variables from .env if it exists
+ ifneq (,$(wildcard .env))
+     include .env
+     export $(shell sed 's/=.*//' .env)
+ endif
+ 
# ==========================================
# --- GCP DEPLOYMENT CONFIGURATION ---
# ==========================================
GCP_PROJECT ?=
GCP_REGION ?=
REGISTRY ?= $(GCP_REGION)-docker.pkg.dev/$(GCP_PROJECT)/rook-notes
```

#### [MODIFY] [README.md](file:///Users/paulbernier/Developer/workspace/code/rook-notes/README.md)
Update the `.env` example configuration instructions in the README.md to use `GOOGLE_API_KEY` instead of `GOOGLE_GENERATIVE_AI_API_KEY` (matching the actual `.env` file structure) and add the GCP variables.

```diff
 1. **Configure Environment**
    Create a `.env` file in the project root with the following keys:
    ```env
-   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
+   GOOGLE_API_KEY=your_api_key_here
    TAXONOMY_MODEL=gemini-2.5-flash-lite
+
+   # GCP Deployment Configuration
+   GCP_PROJECT=your_gcp_project_here
+   GCP_REGION=your_gcp_region_here
    ```
```

---

## Verification Plan

### Manual Verification
1. Verify the `Makefile` successfully imports the values from `.env` by running:
   ```bash
   make prod-urls
   ```
   and verifying it outputs URLs associated with your configured GCP project and region.
2. Verify CLI overrides still work properly by running:
   ```bash
   make prod-urls GCP_PROJECT=your-gcp-project-here GCP_REGION=your-gcp-region-here
   ```
   and verifying it outputs references to `your-gcp-project-here` in `your-gcp-region-here`.
