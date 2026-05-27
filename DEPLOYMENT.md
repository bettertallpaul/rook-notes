# Production Deployment Guide

This document outlines the architecture, local verification process, and step-by-step instructions to deploy the **rook-notes** React SPA to Google Cloud Run.

---

## 1. Production Architecture Overview

To ensure high performance, security, and low operational overhead, the production build transitions the application from a Node/Vite development server to a highly optimized, containerized static asset server.

### Multi-Stage Build Pipeline
The container build (defined in the `Dockerfile`) is split into two distinct stages:
1. **Builder Stage (`node:24-bookworm-slim`)**:
   - Standardizes the Node.js runtime to match active development patterns.
   - Enables `corepack pnpm` and uses local pnpm caching mounts to speed up dependency installs.
   - Installs production and development dependencies, runs TypeScript validation, and compiles the React application using Vite into static HTML, JS, and CSS bundles under `/app/dist`.
2. **Runner Stage (`nginx:alpine`)**:
   - Discards all Node.js and build-tool overhead, leaving a lean Nginx Alpine container.
   - Copies only the compiled static asset bundles into the Nginx public directory (`/usr/share/nginx/html`).
   - Uses Nginx's template system under `/etc/nginx/templates/` to inject environment variables dynamically at container startup.

### Dynamic Port and API Routing
In a cloud environment like Google Cloud Run, the container port is dynamically assigned at startup via the `${PORT}` environment variable. Additionally, backend service endpoints change across local and staging/production boundaries.
- **Dynamic Port Binding**: The Nginx configuration template dynamically binds the server to `${PORT}` when the container boots.
- **API Proxying**: All requests on the `/api` prefix are dynamically proxied downstream to the endpoint specified in the `${API_URL}` environment variable.
- **Preserved Nginx Variables**: Using `NGINX_ENVSUBST_FILTER="^(PORT|API_URL)$"`, the Nginx entrypoint only substitutes the dynamic environment variables, preserving built-in Nginx variables (like `$uri`, `$host`, `$http_upgrade`) required for proper routing and fallback.
- **SPA Routing**: The `try_files $uri $uri/ /index.html` block ensures that any client-side route requests are served the main `index.html` file, letting React handle routing natively.

---

## 2. Local Production Verification

Before pushing changes to GitHub and initiating a production deployment, always validate the production build container locally using OrbStack or standard Docker.

### The Automated Verification Pipeline
The simplest way to run a full end-to-end verification is using the unified `prod-verify` target:
```bash
make prod-verify
```
This single target will:
1. Stop and clean up any existing local production container instances.
2. Build the production Docker image (`rook-notes:prod`) from scratch.
3. Start the container in the background, mapping host port `8080` to the container port, and configured to route `/api` to the backend dev service running at `http://host.docker.internal:3001`.
4. Poll the endpoint using `curl` to verify Nginx is actively and correctly serving the frontend.
5. Tear down the local container cleanly once verification is complete.

### Step-by-Step Manual Local Testing
If you want to manually test the production build locally:

1. **Build the production container image**:
   ```bash
   make prod-build
   ```
2. **Run the container**:
   ```bash
   make prod-run
   ```
3. **Verify locally in your browser**:
   Navigate to [http://localhost:8080](http://localhost:8080).
4. **Clean up container resources**:
   ```bash
   make prod-clean
   ```

## 3. Preparing the Production Branch (First-Time Setup)

Because active development takes place on the `dev` branch, your newly created production files (`Dockerfile`, `nginx.conf.template`, and `DEPLOYMENT.md`) currently only exist on `dev`. Google Cloud Run triggers are designed to build from your production branch (`main`). Therefore, you must push your `dev` changes to GitHub and merge them into `main` **before** connecting the repository in the Google Cloud Console.

### Option A: Open a Pull Request on GitHub (Recommended)
1. Commit and push all your current local `dev` branch changes to GitHub:
   - **IDE GUI Method**: Go to the **Source Control View** (`Ctrl+Shift+G`), enter a commit message, click the **Commit** checkmark, then click **Sync Changes** (or **Publish Branch** if it's the first push).
   - **CLI Method**: Run:
     ```bash
     git add .
     git commit -m "feat: implement production-grade two-stage build"
     git push origin dev
     ```
2. Navigate to your GitHub repository in your web browser.
3. Click **Compare & pull request** (or open a new Pull Request), configure the source as `dev` and target as `main`, click **Create pull request**, and then click **Merge pull request** after reviewing.

### Option B: Local Command Line Merge
If you prefer to perform the merge locally using the command line and push directly to `main`:
1. Commit all outstanding changes on your `dev` branch.
2. Checkout and update your local `main` branch:
   ```bash
   git checkout main
   git pull origin main
   ```
3. Merge the `dev` branch into `main` and push:
   ```bash
   git merge dev
   git push origin main
   ```
4. Switch back to your development branch to continue working:
   ```bash
   git checkout dev
   ```

Once your `main` branch contains these production deployment files, proceed with the console setup below.

---

## 4. Step-by-Step Google Cloud Run Console Setup

Follow these console instructions to connect your GitHub repository and deploy the frontend service to Google Cloud Run.

> [!TIP]
> **How to Stay in the Perpetual Free Tier:**
> * **CPU & Billing**: Under *CPU allocation and pricing*, select **Request-based** (CPU only allocated during request processing).
> * **Scaling**: Set **Minimum instances** to `0` so the container spins down when idle (always-on instances will consume your free hours).
> * **Resources**: Set memory to `512 MiB` and CPU to `1 vCPU` under the Container Resources tab.
> * **Region**: Choose a Tier 1 region close to you (e.g. `us-east1` South Carolina) to optimize latency and free egress data bounds.

### Step 1: Connect the GitHub Repository
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Open the **Cloud Run** service page and click **Create Service**.
3. Under *Source*, select **Deploy revision from a source repository** and click **Set up with Cloud Build**.
4. Select your **Repository Provider** (GitHub) and authenticate.
5. Select the `rook-notes` repository from your list and click **Next**.

### Step 2: Configure the Build Trigger
1. Under *Branch*, set the build trigger to run on the `main` branch (or your preferred release branch).
2. Under *Build Type*, select **Dockerfile**.
3. Set the *Source directory* to `/` (the root directory) and make sure the *Dockerfile* path points to `Dockerfile` (not `Dockerfile.dev`).
4. Click **Save** to complete the Cloud Build trigger setup.

### Step 3: Configure Container and Environment Variable Settings
1. In the **Create Service** form, specify your service name (e.g., `rook-notes-frontend`) and select a region close to you (e.g., `us-east1` for South Carolina, which is a low-cost Tier 1 region).
2. Under **CPU allocation and pricing**, select **Request-based** (CPU is only allocated during request processing) to stay within the perpetual monthly Free Tier.
3. Scroll down to **Container, Networking, Security** settings:
   - **Scaling**: Set **Minimum instances** to `0` (essential for scale-to-zero when idle) and **Maximum instances** to `10` or less.
   - **Container tab (Resources)**: Set **CPU** to `1` (or lower) and **Memory** to `512 MiB` (Nginx is extremely lightweight and requires minimal overhead).
   - **Container Port**: Set the container port matching your target port (defaults to `80`, but Cloud Run automatically injects this into `${PORT}`).
   - **Environment Variables**: Add an environment variable specifying your live API backend service url:
     - **Name**: `API_URL`
     - **Value**: The full HTTP/HTTPS URL of your active API backend (e.g., `https://api.rook-notes.example.com`).
4. Under *Authentication*, select **Allow unauthenticated invocations** to make the React SPA publicly accessible.
5. Click **Create** to launch the build and deployment process.

---

## 5. Live Production Verification

Once Cloud Run finishes building and deploying the container, verify its operations:

1. **Frontpage Verification**:
   - Access the generated live HTTPS URL (e.g., `https://rook-notes-frontend-xxxxxx.a.run.app`) in a web browser.
   - Verify that the page loads instantly and all assets (fonts, icons, stylesheets) are served correctly.
2. **API Communication Validation**:
   - Open your browser's Developer Tools (`F12` -> Network tab).
   - Perform a data action (e.g., listing, creating, or editing a note).
   - Ensure requests sent to `/api/*` succeed with `200 OK` (or appropriate status codes) and are correctly forwarded and resolved by the downstream backend API.

---

## 6. Live Google Cloud Run Verification (User Step)

1. Follow the step-by-step console instructions in `DEPLOYMENT.md` to connect the GitHub repository and deploy the service on Google Cloud Run.
2. Navigate to the generated live HTTPS URL in your web browser and confirm the React SPA loads correctly.
3. Verify that network requests to the `/api` route succeed and interact correctly with the backend API.

---

## 7. Operational Gotchas

- **In-Memory State Reset**: Google Cloud Run services automatically scale down to zero instances when idle. When a new instance is spun up to handle an incoming request, any in-memory state or session caches (if not backed by a database like Redis/Postgres) will be completely reset. Ensure all critical note data is synchronized with the persistent backend API database.
- **Headless PNPM parameters**: The production build uses `--frozen-lockfile` to guarantee package parity. If you update `package.json` dependencies, always make sure to run `pnpm install` locally to update `pnpm-lock.yaml` and commit the lockfile to your branch before pushing to production.

